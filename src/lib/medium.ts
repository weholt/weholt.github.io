const MEDIUM_DOMAIN = "https://weholt.medium.com";
const SITEMAP_URL = `${MEDIUM_DOMAIN}/sitemap/sitemap.xml`;
const FEED_URL = "https://medium.com/feed/@weholt";

const FETCH_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
  "Accept-Encoding": "gzip, deflate, br"
};

type MediumMarkup = {
  type: string;
  start: number;
  end: number;
  href?: string | null;
};

type MediumParagraph = {
  __typename?: string;
  type: string;
  text?: string;
  href?: string | null;
  markups?: MediumMarkup[];
  metadata?: { __ref?: string } | null;
  codeBlockMetadata?: { mode?: string } | null;
};

type MediumPost = {
  id: string;
  title?: string;
  uniqueSlug?: string;
  mediumUrl?: string;
  canonicalUrl?: string;
  latestPublishedAt?: number;
  firstPublishedAt?: number;
  isPublished?: boolean;
  isShortform?: boolean;
  wordCount?: number;
  inResponseToPostResult?: unknown;
  inResponseToEntityType?: string | null;
  tags?: Array<{ __ref?: string }>;
  previewImage?: { __ref?: string };
  [key: string]: unknown;
};

export type MediumDiscoveredPost = {
  url: string;
  slug: string;
  postId: string;
  lastmod?: string;
  priority?: number;
  source: "sitemap" | "rss";
};

export type MediumDownloadedPost = {
  url: string;
  slug: string;
  postId: string;
  title: string;
  publishedAt: string;
  updatedAt: string;
  creator: string;
  categories: string[];
  tags: string[];
  isResponse: boolean;
  wordCount: number;
  html: string;
  markdown: string;
  text: string;
  imageUrls: string[];
};

export function postIdFromSlug(slug: string) {
  const decoded = decodeURIComponent(slug);
  return decoded.match(/([a-f0-9]{12})$/i)?.[1] ?? decoded;
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchSitemapPosts(): Promise<MediumDiscoveredPost[]> {
  const response = await fetch(SITEMAP_URL, { headers: FETCH_HEADERS });
  if (!response.ok) throw new Error(`Sitemap request failed: ${response.status}`);

  const xml = await response.text();
  const entries = new Map<string, MediumDiscoveredPost>();

  for (const block of xml.match(/<url>[\s\S]*?<\/url>/g) ?? []) {
    const loc = block.match(/<loc>([^<]+)<\/loc>/)?.[1];
    const priority = parseFloat(block.match(/<priority>([^<]+)<\/priority>/)?.[1] || "0");
    const lastmod = block.match(/<lastmod>([^<]+)<\/lastmod>/)?.[1];
    if (!loc) continue;

    const path = decodeURIComponent(new URL(loc).pathname.replace(/^\/|\/$/g, ""));
    if (!path || path === "about") continue;

    const postId = postIdFromSlug(path);
    if (!/^[a-f0-9]{12}$/i.test(postId)) continue;

    const existing = entries.get(postId);
    if (!existing || (priority || 0) > (existing.priority || 0)) {
      entries.set(postId, {
        url: loc.split("?")[0]!,
        slug: path,
        postId,
        lastmod,
        priority,
        source: "sitemap"
      });
    }
  }

  return [...entries.values()].sort((a, b) => (b.lastmod || "").localeCompare(a.lastmod || ""));
}

export async function fetchRssPosts(): Promise<MediumDiscoveredPost[]> {
  const response = await fetch(FEED_URL, { headers: FETCH_HEADERS });
  if (!response.ok) throw new Error(`Feed request failed: ${response.status}`);

  const xml = await response.text();
  const posts: MediumDiscoveredPost[] = [];

  for (const block of xml.match(/<item>[\s\S]*?<\/item>/g) ?? []) {
    const link = block.match(/<link>([^<]+)<\/link>/)?.[1]?.split("?")[0];
    if (!link) continue;
    const path = decodeURIComponent(new URL(link).pathname.replace(/^\/|\/$/g, ""));
    const postId = postIdFromSlug(path);
    posts.push({ url: link, slug: path, postId, source: "rss" });
  }

  return posts;
}

export async function discoverMediumPosts() {
  const [sitemapPosts, rssPosts] = await Promise.all([fetchSitemapPosts(), fetchRssPosts()]);
  const merged = new Map<string, MediumDiscoveredPost>();

  for (const post of sitemapPosts) merged.set(post.postId, post);
  for (const post of rssPosts) {
    merged.set(post.postId, merged.get(post.postId) ?? post);
  }

  return [...merged.values()].sort((a, b) => (b.lastmod || "").localeCompare(a.lastmod || ""));
}

export function extractApolloState(html: string): Record<string, unknown> | null {
  const marker = "window.__APOLLO_STATE__ = ";
  const start = html.indexOf(marker);
  if (start === -1) return null;

  let index = start + marker.length;
  while (html[index] !== "{") index += 1;

  let depth = 0;
  for (let cursor = index; cursor < html.length; cursor += 1) {
    const char = html[cursor];
    if (char === "{") depth += 1;
    else if (char === "}") {
      depth -= 1;
      if (depth === 0) {
        return JSON.parse(html.slice(index, cursor + 1)) as Record<string, unknown>;
      }
    }
  }

  return null;
}

function resolveRef<T extends Record<string, unknown>>(state: Record<string, unknown>, ref?: { __ref?: string } | null) {
  if (!ref?.__ref) return null;
  return state[ref.__ref] as T | null;
}

function mediumImageUrl(imageId: string, width = 1600) {
  const clean = imageId.replace(/^\//, "");
  if (clean.startsWith("http")) return clean;
  if (clean.includes("miro.medium.com")) return clean;
  return `https://miro.medium.com/v2/resize:fit:${width}/${encodeURIComponent(clean)}`;
}

function applyMarkups(text: string, markups: MediumMarkup[] = []) {
  if (!text || markups.length === 0) return text;

  const ordered = [...markups].sort((a, b) => b.start - a.start);
  let result = text;
  for (const markup of ordered) {
    const before = result.slice(0, markup.start);
    const inner = result.slice(markup.start, markup.end);
    const after = result.slice(markup.end);
    let wrapped = inner;

    if (markup.type === "STRONG") wrapped = `**${inner}**`;
    else if (markup.type === "EM") wrapped = `*${inner}*`;
    else if (markup.type === "CODE") wrapped = `\`${inner}\``;
    else if (markup.type === "A" && markup.href) wrapped = `[${inner}](${markup.href})`;

    result = `${before}${wrapped}${after}`;
  }
  return result;
}

function paragraphToMarkdown(state: Record<string, unknown>, paragraph: MediumParagraph, imageUrls: string[]) {
  const text = applyMarkups(paragraph.text || "", paragraph.markups || []);

  switch (paragraph.type) {
    case "H1":
      return `# ${text}\n\n`;
    case "H2":
      return `## ${text}\n\n`;
    case "H3":
      return `### ${text}\n\n`;
    case "H4":
      return `#### ${text}\n\n`;
    case "ULI":
      return `- ${text}\n`;
    case "OLI":
      return `1. ${text}\n`;
    case "BQ":
      return `> ${text}\n\n`;
    case "PQ":
      return `> ${text}\n\n`;
    case "PRE":
    case "CODE":
      return `\`\`\`\n${paragraph.text || ""}\n\`\`\`\n\n`;
    case "IMG": {
      const imageMeta = resolveRef<{ id?: string; alt?: string | null }>(state, paragraph.metadata);
      const imageId = imageMeta?.id;
      if (!imageId) return "";
      const url = mediumImageUrl(imageId);
      imageUrls.push(url);
      return `![${imageMeta?.alt || ""}](${url})\n\n`;
    }
    case "IFRAME":
      return paragraph.href ? `<${paragraph.href}>\n\n` : "";
    case "MIXTAPE_EMBED":
      return paragraph.href ? `[${paragraph.href}](${paragraph.href})\n\n` : "";
    default:
      return text ? `${text}\n\n` : "";
  }
}

function getPostContentKey(post: MediumPost) {
  return Object.keys(post).find((key) => key.startsWith("content("));
}

function getBodyModel(state: Record<string, unknown>, post: MediumPost) {
  const contentKey = getPostContentKey(post);
  if (!contentKey) return null;
  const content = post[contentKey] as { bodyModel?: { paragraphs?: Array<{ __ref?: string }> } };
  return content?.bodyModel ?? null;
}

function getPostFromState(state: Record<string, unknown>, postId: string) {
  return state[`Post:${postId}`] as MediumPost | undefined;
}

function isoDateFromMs(value?: number) {
  if (!value) return "";
  return new Date(value).toISOString();
}

function dateOnlyFromMs(value?: number) {
  const iso = isoDateFromMs(value);
  return iso ? iso.slice(0, 10) : "";
}

export function parseMediumHtml(html: string, postId: string): MediumDownloadedPost | null {
  const state = extractApolloState(html);
  if (!state) return null;

  const post = getPostFromState(state, postId);
  if (!post?.title) return null;

  const bodyModel = getBodyModel(state, post);
  if (!bodyModel?.paragraphs?.length) return null;

  const imageUrls: string[] = [];
  let markdown = "";

  for (const ref of bodyModel.paragraphs) {
    const paragraph = resolveRef<MediumParagraph>(state, ref);
    if (!paragraph) continue;
    markdown += paragraphToMarkdown(state, paragraph, imageUrls);
  }

  markdown = markdown.replace(/\n{3,}/g, "\n\n").trim();

  const tags = (post.tags || [])
    .map((tag) => resolveRef<{ id?: string; normalizedTagSlug?: string; displayTitle?: string }>(state, tag))
    .filter(Boolean)
    .map((tag) => tag!.normalizedTagSlug || tag!.displayTitle || tag!.id || "")
    .filter(Boolean);

  const previewImage = resolveRef<{ id?: string }>(state, post.previewImage);
  if (previewImage?.id) {
    const coverUrl = mediumImageUrl(previewImage.id);
    if (!imageUrls.includes(coverUrl)) imageUrls.unshift(coverUrl);
  }

  const text = markdown
    .replace(/!\[[^\]]*\]\([^)]+\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[#>*`_-]/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  const htmlBody = markdown
    .split(/\n\n+/)
    .map((block) => {
      if (block.startsWith("![")) {
        const match = block.match(/!\[([^\]]*)\]\(([^)]+)\)/);
        return match ? `<figure><img alt="${match[1] || ""}" src="${match[2]}" /></figure>` : `<p>${block}</p>`;
      }
      if (block.startsWith("### ")) return `<h3>${block.slice(4)}</h3>`;
      if (block.startsWith("## ")) return `<h2>${block.slice(3)}</h2>`;
      if (block.startsWith("# ")) return `<h1>${block.slice(2)}</h1>`;
      if (block.startsWith("```")) return `<pre><code>${block.replace(/```/g, "").trim()}</code></pre>`;
      if (block.startsWith("- ")) return `<ul>${block.split("\n").map((line) => `<li>${line.slice(2)}</li>`).join("")}</ul>`;
      return `<p>${block}</p>`;
    })
    .join("\n");

  const creator = (resolveRef<{ name?: string }>(state, (post.creator as { __ref?: string }) || null)?.name ||
    "Thomas Weholt") as string;

  return {
    url: post.mediumUrl || `${MEDIUM_DOMAIN}/${post.uniqueSlug || postId}`,
    slug: post.uniqueSlug || postId,
    postId,
    title: post.title,
    publishedAt: isoDateFromMs(post.firstPublishedAt || post.latestPublishedAt),
    updatedAt: isoDateFromMs(post.latestPublishedAt || post.firstPublishedAt),
    creator,
    categories: tags,
    tags,
    isResponse: Boolean(post.inResponseToPostResult || post.inResponseToEntityType),
    wordCount: post.wordCount || 0,
    html: htmlBody,
    markdown,
    text,
    imageUrls: [...new Set(imageUrls)]
  };
}

export async function fetchMediumPostHtml(url: string, retries = 4) {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt < retries; attempt += 1) {
    try {
      const response = await fetch(url, { headers: FETCH_HEADERS });
      if (response.status === 429 || response.status === 403) {
        await sleep(1500 * (attempt + 1));
        throw new Error(`HTTP ${response.status}`);
      }
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const html = await response.text();
      if (html.includes("Just a moment...") || html.includes("Enable JavaScript and cookies")) {
        await sleep(2000 * (attempt + 1));
        throw new Error("Cloudflare challenge page");
      }
      if (!html.includes("window.__APOLLO_STATE__")) {
        throw new Error("Missing Apollo state");
      }

      await sleep(800);
      return html;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      await sleep(1200 * (attempt + 1));
    }
  }

  throw lastError ?? new Error(`Failed to fetch ${url}`);
}

export function isLikelyCommentSlug(slug: string) {
  const decoded = decodeURIComponent(slug).toLowerCase();
  const commentPatterns = [
    /^nice-article-/,
    /^great-article-/,
    /^very-nice-article-/,
    /^yes-there-are-/,
    /^ever-tried-npm-/,
    /^how-can-you-say-/,
    /^i-was-going-in-the-same-direction-/,
    /^i-do-believe-/,
    /^id-like-to-see-an-article-on-/
  ];
  return commentPatterns.some((pattern) => pattern.test(decoded));
}

export { dateOnlyFromMs, mediumImageUrl, SITEMAP_URL, FEED_URL, MEDIUM_DOMAIN };
