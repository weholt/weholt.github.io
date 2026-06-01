import { createWriteStream, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";
import { fixArticleLinks } from "../lib/article-links";

const WAYBACK_SNAPSHOT = "20201201235517";
const SOURCE_PATH = "/2019/10/31/malaga-the-summer-of-2019/";
const ARTICLE_ID = "malaga-summer-2019";
const ARCHIVE_SLUG = "malaga-the-summer-of-2019";

function decodeHtml(value: string) {
  return value
    .replace(/&#8211;/g, "–")
    .replace(/&#8217;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function extractEntryContent(html: string) {
  const marker = '<div class="post-content entry-content">';
  const start = html.indexOf(marker);
  if (start === -1) throw new Error("Could not find WordPress entry content");

  let index = start + marker.length;
  let depth = 1;

  while (index < html.length && depth > 0) {
    const nextOpen = html.indexOf("<div", index);
    const nextClose = html.indexOf("</div>", index);
    if (nextClose === -1) break;

    if (nextOpen !== -1 && nextOpen < nextClose) {
      depth += 1;
      index = nextOpen + 4;
    } else {
      depth -= 1;
      index = nextClose + 6;
      if (depth === 0) return html.slice(start + marker.length, nextClose);
    }
  }

  throw new Error("Could not parse entry content boundaries");
}

function normalizeUploadPath(path: string) {
  return path.replace(/-\d+x\d+(?=\.[a-z0-9]+$)/i, "");
}

function waybackImageUrl(uploadPath: string) {
  const clean = uploadPath.replace(/^\/+/, "");
  return `https://web.archive.org/web/${WAYBACK_SNAPSHOT}im_/http://weholt.org/${clean}`;
}

function stripTags(value: string) {
  return decodeHtml(value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
}

function htmlToMarkdown(html: string, imageMap: Map<string, string>) {
  let body = html;
  body = body.replace(/<!--[\s\S]*?-->/g, "");
  body = body.replace(/<script[\s\S]*?<\/script>/gi, "");

  body = body.replace(/<figure[^>]*>[\s\S]*?<img[^>]+src=["']([^"']+)["'][^>]*>[\s\S]*?(?:<figcaption[^>]*>([\s\S]*?)<\/figcaption>)?[\s\S]*?<\/figure>/gi, (_, src, caption) => {
    const local = imageMap.get(src);
    if (!local) return "";
    const alt = caption ? stripTags(caption) : "";
    return `\n\n![${alt}](${local})${alt ? `\n\n*${alt}*` : ""}\n\n`;
  });

  body = body.replace(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi, (_, src) => {
    const local = imageMap.get(src);
    return local ? `\n\n![](${local})\n\n` : "";
  });

  body = body.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, (_, text) => `\n\n## ${stripTags(text)}\n\n`);
  body = body.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, (_, text) => `\n\n### ${stripTags(text)}\n\n`);
  body = body.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, (_, text) => {
    const plain = stripTags(text.replace(/<br\s*\/?>/gi, "\n"));
    return plain ? `\n\n${plain}\n\n` : "";
  });

  body = body.replace(/<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, (_, href, text) => {
    const label = stripTags(text);
    if (/photographic-journey-and-why-fujifilm/i.test(href)) {
      return `[${label}](/articles/photographic-journey-fujifilm/)`;
    }
    if (/weholt\.org/i.test(href)) return label;
    return `[${label}](${href})`;
  });

  body = body.replace(/<[^>]+>/g, "");
  return decodeHtml(body).replace(/\n{3,}/g, "\n\n").trim();
}

function resolveDownloadUrl(src: string) {
  if (/web\.archive\.org/i.test(src)) return src;

  const uploadMatch = src.match(/wp-content\/uploads\/[^"'?]+\.(?:jpe?g|png)/i);
  if (!uploadMatch) throw new Error(`No upload path in ${src}`);

  return waybackImageUrl(uploadMatch[0]!);
}

async function downloadImage(src: string, destination: string) {
  const candidates = [resolveDownloadUrl(src)];

  const uploadMatch = src.match(/wp-content\/uploads\/[^"'?]+\.(?:jpe?g|png)/i);
  if (uploadMatch) {
    const normalized = normalizeUploadPath(uploadMatch[0]!);
    const fullSize = waybackImageUrl(normalized);
    if (!candidates.includes(fullSize)) candidates.push(fullSize);
  }

  for (const url of candidates) {
    const response = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; WeholtArchive/1.0)" }
    });
    if (response.ok && response.body) {
      await pipeline(Readable.fromWeb(response.body as never), createWriteStream(destination));
      return;
    }
  }

  throw new Error(`HTTP 404 for ${candidates[0]}`);
}

async function main() {
  const root = process.cwd();
  const archiveDir = join(root, "archive", "medium", "posts", ARCHIVE_SLUG);
  const imagesDir = join(archiveDir, "images");
  mkdirSync(imagesDir, { recursive: true });

  const cachedHtmlPath = join(root, "archive", "medium", "_malaga-wayback.html");
  const html = existsSync(cachedHtmlPath)
    ? readFileSync(cachedHtmlPath, "utf8")
    : await fetch(`https://web.archive.org/web/${WAYBACK_SNAPSHOT}/http://weholt.org${SOURCE_PATH}`).then((r) => r.text());

  const titleMatch = html.match(/<h1 class="post-title">([\s\S]*?)<\/h1>/i);
  const title = titleMatch ? stripTags(titleMatch[1]!) : "Malaga – The Summer of 2019";
  const contentHtml = extractEntryContent(html);

  const uploadToLocal = new Map<string, string>();
  const imageMap = new Map<string, string>();
  let imageIndex = 0;

  for (const match of contentHtml.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)) {
    const src = match[1]!;
    const uploadMatch = src.match(/wp-content\/uploads\/[^"'?]+\.(?:jpe?g|png)/i);
    if (!uploadMatch) continue;

    const normalized = normalizeUploadPath(uploadMatch[0]!);
    let localPath = uploadToLocal.get(normalized);

    if (!localPath) {
      imageIndex += 1;
      const filename = `image-${String(imageIndex).padStart(3, "0")}${basename(normalized).match(/\.[a-z0-9]+$/i)?.[0] || ".jpg"}`;
      localPath = `images/${filename}`;
      uploadToLocal.set(normalized, localPath);

      const destination = join(imagesDir, filename);
      if (!existsSync(destination)) {
        console.log(`  downloading ${filename}`);
        await downloadImage(src, destination);
      }
    }

    imageMap.set(src, localPath);
  }

  const markdown = htmlToMarkdown(contentHtml, imageMap);
  const metadata = {
    title,
    slug: ARCHIVE_SLUG,
    postId: "malaga2019",
    url: `https://web.archive.org/web/${WAYBACK_SNAPSHOT}/http://weholt.org${SOURCE_PATH}`,
    source: "wayback",
    pubDate: "2019-10-31T12:00:00.000Z",
    updated: "2019-10-31T12:00:00.000Z",
    creator: "Thomas Weholt",
    categories: ["travel", "fujifilm", "street-photography"],
    tags: ["malaga", "spain", "fujifilm", "travel"],
    isResponse: false,
    wordCount: markdown.split(/\s+/).length,
    imageCount: imageIndex,
    failedImageCount: 0,
    failedImages: []
  };

  writeFileSync(join(archiveDir, "metadata.json"), `${JSON.stringify(metadata, null, 2)}\n`, "utf8");
  writeFileSync(join(archiveDir, "article.md"), `# ${title}\n\n${markdown}\n`, "utf8");
  writeFileSync(join(archiveDir, "article.txt"), stripTags(markdown), "utf8");

  const articleDir = join(root, "src", "content", "articles", ARTICLE_ID);
  mkdirSync(articleDir, { recursive: true });

  const publicImagesDir = join(root, "public", "images", "medium", ARTICLE_ID);
  mkdirSync(publicImagesDir, { recursive: true });

  for (const filename of readdirSync(imagesDir)) {
    const source = join(imagesDir, filename);
    const target = join(publicImagesDir, filename);
    if (!existsSync(target)) {
      writeFileSync(target, readFileSync(source));
    }
  }

  let body = markdown.replace(/!\[([^\]]*)\]\(images\//g, `![$1](/images/medium/${ARTICLE_ID}/`);
  body = fixArticleLinks(body);

  writeFileSync(
    join(articleDir, "index.json"),
    `${JSON.stringify(
      {
        id: ARTICLE_ID,
        order: 27,
        title: { en: title, no: title },
        summary: {
          en: "Photos from our vacation in Malaga in 2019, mostly shot with the Fujifilm X100s and X-T30.",
          no: "Photos from our vacation in Malaga in 2019, mostly shot with the Fujifilm X100s and X-T30."
        },
        date: "2019-10-31",
        coverImage: imageIndex > 0 ? `/images/medium/${ARTICLE_ID}/image-001.jpg` : undefined,
        tags: ["travel", "fujifilm", "malaga", "street-photography"],
        status: "published",
        featured: false
      },
      null,
      2
    )}\n`,
    "utf8"
  );
  writeFileSync(join(articleDir, "body.en.md"), `${body}\n`, "utf8");
  writeFileSync(join(articleDir, "body.no.md"), `${body}\n`, "utf8");

  console.log(`Imported ${title} with ${imageIndex} images to /articles/${ARTICLE_ID}/`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
