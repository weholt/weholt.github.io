import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { syncPhotoExif } from "./extract-photo-exif";
import { fixArticleLinks } from "../lib/article-links";

const root = process.cwd();
const archiveRoot = join(root, "archive", "medium");
const postsRoot = join(archiveRoot, "posts");
const articlesRoot = join(root, "src", "content", "articles");
const publicRoot = join(root, "public");

type ArchiveMetadata = {
  title: string;
  slug: string;
  postId: string;
  url: string;
  pubDate: string;
  categories: string[];
  isResponse?: boolean;
  wordCount?: number;
};

type ImportOverride = {
  id?: string;
  order?: number;
  featured?: boolean;
  status?: "published" | "draft";
  gallery?: {
    id: string;
    categories: string[];
    order: number;
  };
  photoCategories?: string[];
  skip?: boolean;
};

const OVERRIDES: Record<string, ImportOverride> = {
  "upgrading-postgresql-in-a-docker-deployment-7e0a1f3667e6": {
    id: "upgrading-postgresql-docker",
    featured: true
  },
  "thomas-python-true-e838dda4ada5": { id: "thomas-python-true", featured: true },
  "lofoten-with-visma-2022-a916bc19b7b7": {
    id: "lofoten-visma-2022",
    featured: true,
    gallery: { id: "lofoten-visma-2022", categories: ["travel", "landscape", "fujifilm"], order: 1 },
    photoCategories: ["travel", "landscape", "fujifilm"]
  },
  "starting-over-ce9e3fb6e09f": {
    id: "starting-over",
    featured: false,
    photoCategories: ["fujifilm", "portraits"]
  },
  "trip-to-crete-greece-summer-of-2022-cf8e44ef5784": {
    id: "trip-to-crete-2022",
    featured: true,
    gallery: { id: "trip-to-crete-2022", categories: ["travel", "fujifilm"], order: 2 },
    photoCategories: ["travel", "fujifilm"]
  },
  "optyx-faster-culling-with-fancy-ai-119b0762492e": {
    id: "optyx-faster-culling",
    featured: false,
    photoCategories: ["fujifilm"]
  },
  "tromsø-in-august-of-2021-dd4e8aa59312": {
    id: "tromso-august-2021",
    featured: true,
    gallery: { id: "tromso-august-2021", categories: ["travel", "landscape", "fujifilm"], order: 3 },
    photoCategories: ["travel", "landscape", "fujifilm"]
  },
  "troms%C3%B8-in-august-of-2021-dd4e8aa59312": {
    id: "tromso-august-2021",
    featured: true,
    gallery: { id: "tromso-august-2021", categories: ["travel", "landscape", "fujifilm"], order: 3 },
    photoCategories: ["travel", "landscape", "fujifilm"]
  },
  "capture-one-praise-some-critical-thoughts-one-year-later-4cc05fb33a62": {
    id: "capture-one-one-year-later",
    featured: false,
    photoCategories: ["fujifilm"]
  },
  "fujifilm-vintage-lenses-x-e3-helios-44m-cc0b826b7df": {
    id: "fujifilm-helios-44m",
    featured: false,
    photoCategories: ["fujifilm", "portraits"]
  },
  "capture-one-a-review-of-sorts-comparison-to-lightroom-976415459241": {
    id: "capture-one-vs-lightroom",
    featured: false,
    photoCategories: ["fujifilm"]
  },
  "my-photographic-journey-and-why-fujifilm-67155c2530d6": {
    id: "photographic-journey-fujifilm",
    featured: true,
    photoCategories: ["fujifilm"]
  },
  "fuji-film-simulations-why-shoot-jpegs-raw-cba3830d1a3c": {
    id: "fuji-film-simulations",
    featured: false,
    photoCategories: ["fujifilm"]
  },
  "fujinon-18-135mm-the-holiday-lens-d93c971158e3": {
    id: "fujinon-18-135mm",
    photoCategories: ["fujifilm"]
  },
  "nightshoots-with-x-t3-and-xf-56mm-f-1-2-cc1c867ca966": {
    id: "nightshoots-x-t3",
    photoCategories: ["fujifilm", "portraits"]
  },
  "lindesnes-lighthouse-armed-with-a-superzoom-and-difficult-24mm-5406c5750658": {
    id: "lindesnes-lighthouse",
    photoCategories: ["travel", "landscape", "fujifilm"]
  },
  "åkrehamn-at-karmøy-one-of-the-finest-beaches-in-norway-35a86f617b76": {
    id: "akrehamn-karmoy",
    photoCategories: ["travel", "landscape", "fujifilm"]
  },
  "i-want-to-ride-my-bicycle-i-want-to-ride-my-bike-bc81e4db290a": {
    id: "ride-my-bicycle",
    photoCategories: ["fujifilm"]
  },
  "now-do-the-same-thing-using-riotjs-7ab437880456": {
    id: "riotjs-tutorial",
    status: "draft"
  }
};

const PHOTOGRAPHY_TAGS = new Set([
  "photography",
  "fujifilm",
  "travel",
  "landscape",
  "portraits",
  "photo",
  "camera",
  "x-t3",
  "x-e3",
  "capture-one"
]);

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, "utf8")) as T;
}

function writeJson(path: string, value: unknown) {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function slugToId(slug: string) {
  const decoded = decodeURIComponent(slug);
  return decoded
    .replace(/-[a-f0-9]{12}$/i, "")
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase()
    .slice(0, 48);
}

function parsePubDate(pubDate: string) {
  return new Date(pubDate).toISOString().slice(0, 10);
}

function extractSummary(text: string) {
  const paragraph = text
    .split(/\n\s*\n/)
    .map((part) => part.replace(/\s+/g, " ").trim())
    .find((part) => part.length > 40);

  const summary = paragraph || text.replace(/\s+/g, " ").trim();
  return summary.length > 220 ? `${summary.slice(0, 217).trim()}...` : summary;
}

function processMarkdown(markdown: string, articleId: string, coverImage?: string) {
  let body = markdown
    .replace(/^# .+\n+/, "")
    .replace(/!\[([^\]]*)\]\(images\//g, `![$1](/images/medium/${articleId}/`)
    .trim();

  if (coverImage) {
    body = body
      .replace(/^\s*!\[[^\]]*\]\(([^)]+)\)\s*\n+/, (match, src) =>
        src === coverImage || src.endsWith(coverImage.split("/").pop() || "") ? "" : match
      );
  }

  return fixArticleLinks(body);
}

function listImages(archiveDir: string) {
  const imagesDir = join(archiveDir, "images");
  if (!existsSync(imagesDir)) return [];
  return readdirSync(imagesDir)
    .filter((name) => /\.(jpe?g|png|gif|webp)$/i.test(name))
    .sort();
}

function copyImages(archiveDir: string, articleId: string) {
  const source = join(archiveDir, "images");
  const destination = join(publicRoot, "images", "medium", articleId);
  if (!existsSync(source)) return [];

  const files = listImages(archiveDir);
  mkdirSync(destination, { recursive: true });

  for (const filename of files) {
    const target = join(destination, filename);
    if (existsSync(target)) continue;
    copyFileSync(join(source, filename), target);
  }

  return files;
}

function resolveArchiveDir(slug: string) {
  const candidates = [
    join(postsRoot, slug),
    join(postsRoot, decodeURIComponent(slug)),
    join(postsRoot, encodeURIComponent(slug))
  ];

  for (const candidate of candidates) {
    if (existsSync(join(candidate, "metadata.json"))) return candidate;
  }

  return join(postsRoot, slug);
}

function localized(value: string) {
  return { en: value, no: value };
}

function discoverArchivePosts() {
  const indexPath = join(archiveRoot, "index.json");
  if (existsSync(indexPath)) {
    const index = readJson<{ posts?: ArchiveMetadata[] }>(indexPath);
    if (index.posts?.length) {
      return index.posts.filter((post) => !post.isResponse);
    }
  }

  if (!existsSync(postsRoot)) return [];

  return readdirSync(postsRoot)
    .map((slug) => {
      const metadataPath = join(postsRoot, slug, "metadata.json");
      if (!existsSync(metadataPath)) return null;
      const metadata = readJson<ArchiveMetadata>(metadataPath);
      return metadata.isResponse ? null : metadata;
    })
    .filter(Boolean) as ArchiveMetadata[];
}

function inferPhotoCategories(metadata: ArchiveMetadata) {
  const tags = metadata.categories.map((tag) => tag.toLowerCase());
  const matched = tags.filter((tag) => PHOTOGRAPHY_TAGS.has(tag));
  if (matched.length > 0) return [...new Set(matched)];
  if (tags.some((tag) => /photo|fuji|camera|travel|landscape|portrait/.test(tag))) {
    return tags.slice(0, 3);
  }
  return ["fujifilm"];
}

type ImportPost = {
  archiveSlug: string;
  id: string;
  order: number;
  featured: boolean;
  status: "published" | "draft";
  gallery?: ImportOverride["gallery"];
  photoCategories?: string[];
};

function buildImportPosts(archivePosts: ArchiveMetadata[]) {
  const sorted = [...archivePosts].sort(
    (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
  );

  return sorted.map((metadata, index) => {
    const override = OVERRIDES[metadata.slug] ?? OVERRIDES[decodeURIComponent(metadata.slug)] ?? {};
    if (override.skip) return null;

    const id = override.id ?? slugToId(metadata.slug);
    const archiveDir = resolveArchiveDir(metadata.slug);
    const hasPhotos = existsSync(join(archiveDir, "images")) && listImages(archiveDir).length > 0;

    return {
      archiveSlug: metadata.slug,
      id,
      order: override.order ?? index + 10,
      featured: override.featured ?? false,
      status: override.status ?? "published",
      gallery: override.gallery,
      photoCategories: override.photoCategories ?? (hasPhotos ? inferPhotoCategories(metadata) : undefined)
    } satisfies ImportPost;
  }).filter(Boolean) as ImportPost[];
}

function importArticle(post: ImportPost) {
  const archiveDir = resolveArchiveDir(post.archiveSlug);
  const metadata = readJson<ArchiveMetadata>(join(archiveDir, "metadata.json"));

  const markdown = readFileSync(join(archiveDir, "article.md"), "utf8");
  const plainText = readFileSync(join(archiveDir, "article.txt"), "utf8");
  const images = copyImages(archiveDir, post.id);
  const coverImage = images[0] ? `/images/medium/${post.id}/${images[0]}` : undefined;
  const body = processMarkdown(markdown, post.id, coverImage);
  const summary = extractSummary(plainText);

  const articleDir = join(articlesRoot, post.id);
  mkdirSync(articleDir, { recursive: true });

  const existingMetaPath = join(articleDir, "index.json");
  const existingMeta = existsSync(existingMetaPath)
    ? (readJson<{ pinned?: boolean; pinOrder?: number }>(existingMetaPath))
    : undefined;

  writeJson(join(articleDir, "index.json"), {
    id: post.id,
    order: post.order,
    title: localized(metadata.title),
    summary: localized(summary),
    date: parsePubDate(metadata.pubDate),
    coverImage,
    tags: metadata.categories.length > 0 ? metadata.categories : ["medium"],
    status: post.status,
    featured: post.featured,
    pinned: existingMeta?.pinned ?? false,
    ...(existingMeta?.pinOrder !== undefined ? { pinOrder: existingMeta.pinOrder } : {})
  });

  writeFileSync(join(articleDir, "body.en.md"), `${body}\n`, "utf8");
  writeFileSync(join(articleDir, "body.no.md"), `${body}\n`, "utf8");

  return { post, metadata, images, coverImage, summary };
}

function buildPhotosAndGalleries(results: ReturnType<typeof importArticle>[]) {
  const photos: Array<Record<string, unknown>> = [];
  const galleries: Array<Record<string, unknown>> = [];
  const featuredPick: string[] = [];

  for (const result of results) {
    const { post, metadata, images } = result;
    if (images.length === 0) continue;

    const categories = post.photoCategories || ["fujifilm"];
    const prefix = post.id;

    for (const [index, filename] of images.entries()) {
      const photoId = `${prefix}-${String(index + 1).padStart(3, "0")}`;
      const src = `/images/medium/${post.id}/${filename}`;
      const label = `${metadata.title} ${index + 1}`;

      photos.push({
        id: photoId,
        src,
        alt: localized(label),
        title: localized(label),
        caption: localized(`From "${metadata.title}"`),
        categories,
        camera: "Fujifilm",
        tags: metadata.categories.slice(0, 4)
      });

      if (post.gallery && index < 2) {
        featuredPick.push(photoId);
      }
    }

    if (post.gallery && images.length > 0) {
      galleries.push({
        id: post.gallery.id,
        order: post.gallery.order,
        title: localized(metadata.title),
        description: localized(result.summary),
        coverImage: `/images/medium/${post.id}/${images[0]}`,
        categories: post.gallery.categories,
        images: images.map((_, index) => `${prefix}-${String(index + 1).padStart(3, "0")}`)
      });
    }
  }

  const orderedPhotoIds = [...new Set([...featuredPick, ...photos.map((photo) => photo.id as string)])];
  const orderedPhotos = orderedPhotoIds
    .map((id) => photos.find((photo) => photo.id === id))
    .filter(Boolean) as Array<Record<string, unknown>>;

  return { photos: orderedPhotos, galleries };
}

async function main() {
  console.log("Importing Medium archive into site content...");

  const archivePosts = discoverArchivePosts();
  const posts = buildImportPosts(archivePosts);
  console.log(`Found ${posts.length} stories to import`);

  const results = posts.map((post) => {
    console.log(`  article: ${post.id} (${post.archiveSlug})`);
    return importArticle(post);
  });

  const { photos, galleries } = buildPhotosAndGalleries(results);
  writeJson(join(root, "src", "content", "photography", "photos.json"), photos);
  writeJson(join(root, "src", "content", "photography", "galleries.json"), galleries);

  console.log(`Imported ${results.length} articles, ${photos.length} photos, ${galleries.length} galleries.`);
  await syncPhotoExif();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
