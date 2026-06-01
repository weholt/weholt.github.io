import { createWriteStream, existsSync, readFileSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";
import {
  discoverMediumPosts,
  fetchMediumPostHtml,
  fetchRssPosts,
  FEED_URL,
  isLikelyCommentSlug,
  MEDIUM_DOMAIN,
  parseMediumHtml,
  SITEMAP_URL,
  sleep
} from "../lib/medium";

const OUTPUT_ROOT = join(process.cwd(), "archive", "medium");

function imageExtension(url: string) {
  const clean = url.split("?")[0]!;
  const ext = clean.match(/\.(jpe?g|png|gif|webp)$/i)?.[1]?.toLowerCase();
  return ext ? `.${ext}` : ".jpg";
}

async function downloadFile(url: string, destination: string) {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt < 4; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          Referer: "https://medium.com/"
        }
      });

      if (response.status === 429 || response.status === 403) {
        await sleep(1500 * (attempt + 1));
        lastError = new Error(`HTTP ${response.status}`);
        continue;
      }

      if (!response.ok || !response.body) {
        throw new Error(`HTTP ${response.status}`);
      }

      await pipeline(Readable.fromWeb(response.body as never), createWriteStream(destination));
      await sleep(250);
      return;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      await sleep(1000 * (attempt + 1));
    }
  }

  throw lastError ?? new Error(`Failed to download ${url}`);
}

async function fetchCachedText(url: string, cachePath: string) {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept: "application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8"
      }
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const text = await response.text();
    await writeFile(cachePath, text, "utf8");
    return text;
  } catch (error) {
    if (existsSync(cachePath)) {
      console.warn(`Fetch failed (${error instanceof Error ? error.message : error}); using cached ${cachePath}`);
      return readFileSync(cachePath, "utf8");
    }
    throw error;
  }
}

async function savePost(
  slug: string,
  postId: string,
  url: string,
  source: "sitemap" | "rss",
  priority?: number
) {
  const articleDir = join(OUTPUT_ROOT, "posts", slug);
  const imagesDir = join(articleDir, "images");
  await mkdir(imagesDir, { recursive: true });

  const html = await fetchMediumPostHtml(url);
  const parsed = parseMediumHtml(html, postId);
  if (!parsed) throw new Error("Could not parse Apollo state");

  const imageMap = new Map<string, string>();
  const failedImages: string[] = [];

  for (const [index, imageUrl] of parsed.imageUrls.entries()) {
    const filename = `image-${String(index + 1).padStart(3, "0")}${imageExtension(imageUrl)}`;
    const localPath = join(imagesDir, filename);
    const relativePath = `images/${filename}`;

    try {
      if (existsSync(localPath)) {
        imageMap.set(imageUrl, relativePath);
        continue;
      }
      await downloadFile(imageUrl, localPath);
      imageMap.set(imageUrl, relativePath);
      console.log(`  saved ${relativePath}`);
    } catch (error) {
      failedImages.push(imageUrl);
      console.warn(`  skipped image ${imageUrl}: ${error instanceof Error ? error.message : error}`);
    }
  }

  let localHtml = parsed.html;
  let localMarkdown = parsed.markdown;
  for (const [remote, local] of imageMap) {
    localHtml = localHtml.split(remote).join(local);
    localMarkdown = localMarkdown.split(remote).join(local);
  }

  const metadata = {
    title: parsed.title,
    slug,
    postId,
    url,
    source,
    priority,
    pubDate: parsed.publishedAt,
    updated: parsed.updatedAt,
    creator: parsed.creator,
    categories: parsed.categories,
    tags: parsed.tags,
    isResponse: parsed.isResponse || isLikelyCommentSlug(slug),
    wordCount: parsed.wordCount,
    imageCount: imageMap.size,
    failedImageCount: failedImages.length,
    failedImages
  };

  await writeFile(join(articleDir, "metadata.json"), `${JSON.stringify(metadata, null, 2)}\n`, "utf8");
  await writeFile(join(articleDir, "article.html"), localHtml, "utf8");
  await writeFile(join(articleDir, "article.md"), `# ${parsed.title}\n\n${localMarkdown}\n`, "utf8");
  await writeFile(join(articleDir, "article.txt"), parsed.text, "utf8");

  return metadata;
}

async function main() {
  console.log("Discovering Medium posts from sitemap + RSS...");
  await mkdir(OUTPUT_ROOT, { recursive: true });

  const [posts, feedXml, sitemapXml] = await Promise.all([
    discoverMediumPosts(),
    fetchCachedText(FEED_URL, join(OUTPUT_ROOT, "feed.xml")),
    fetchCachedText(SITEMAP_URL, join(OUTPUT_ROOT, "sitemap.xml"))
  ]);

  console.log(`Found ${posts.length} unique posts (${posts.filter((p) => p.source === "sitemap").length} sitemap, ${(await fetchRssPosts()).length} RSS)`);

  const saved = [];
  const failed: Array<{ slug: string; url: string; error: string }> = [];

  for (const post of posts) {
    const metadataPath = join(OUTPUT_ROOT, "posts", post.slug, "metadata.json");
    if (existsSync(metadataPath)) {
      console.log(`Skipping (already archived): ${post.slug}`);
      saved.push(JSON.parse(readFileSync(metadataPath, "utf8")));
      continue;
    }

    console.log(`Downloading: ${post.url}`);
    try {
      saved.push(await savePost(post.slug, post.postId, post.url, post.source, post.priority));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`  failed: ${message}`);
      failed.push({ slug: post.slug, url: post.url, error: message });
    }
  }

  const stories = saved.filter((entry) => !entry.isResponse);
  const responses = saved.filter((entry) => entry.isResponse);

  const index = {
    source: MEDIUM_DOMAIN,
    feedUrl: FEED_URL,
    sitemapUrl: SITEMAP_URL,
    downloadedAt: new Date().toISOString(),
    postCount: saved.length,
    storyCount: stories.length,
    responseCount: responses.length,
    failedCount: failed.length,
    posts: saved,
    failed
  };

  await writeFile(join(OUTPUT_ROOT, "index.json"), `${JSON.stringify(index, null, 2)}\n`, "utf8");
  await writeFile(
    join(OUTPUT_ROOT, "README.md"),
    `# Medium archive: weholt.medium.com

Downloaded from sitemap + RSS on ${index.downloadedAt}.

## Contents

- \`sitemap.xml\` — Medium sitemap
- \`feed.xml\` — RSS feed (10 most recent)
- \`index.json\` — full post index
- \`posts/<slug>/\` — one folder per post

## Stories (${stories.length})

${stories.map((post) => `- [${post.title}](${post.url}) → \`posts/${post.slug}/\``).join("\n")}

${responses.length > 0 ? `\n## Comment responses (${responses.length})\n\n${responses.map((post) => `- ${post.title} → \`posts/${post.slug}/\``).join("\n")}\n` : ""}
${failed.length > 0 ? `\n## Failed downloads (${failed.length})\n\n${failed.map((entry) => `- ${entry.url}: ${entry.error}`).join("\n")}\n` : ""}
`,
    "utf8"
  );

  console.log(`\nArchive saved to ${OUTPUT_ROOT}`);
  console.log(`${stories.length} stories, ${responses.length} responses, ${failed.length} failed`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
