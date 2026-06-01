import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  poolForPhotoCategories,
  pickRandom,
  pickUniqueRandom,
  unsplashUrl,
  UNSPLASH_POOLS
} from "../lib/unsplash";

const root = process.cwd();
const contentRoot = join(root, "src", "content");

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, "utf8")) as T;
}

function writeJson(path: string, value: unknown) {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

for (const file of ["serpentarium-core.json", "atomic-framework.json", "airgun-performance-index.json"]) {
  const path = join(contentRoot, "projects", file);
  const project = readJson<Record<string, unknown>>(path);
  project.image = unsplashUrl(pickRandom(UNSPLASH_POOLS.tech), { width: 1200, height: 750 });
  writeJson(path, project);
}

for (const id of ["ambivalent-ai-relationship", "atomic-framework"]) {
  const path = join(contentRoot, "articles", id, "index.json");
  const article = readJson<Record<string, unknown>>(path);
  article.coverImage = unsplashUrl(pickRandom(UNSPLASH_POOLS.writing), { width: 1400, height: 800 });
  writeJson(path, article);
}

const photosPath = join(contentRoot, "photography", "photos.json");
const photos = readJson<Array<Record<string, unknown>>>(photosPath);
for (const photo of photos) {
  const categories = (photo.categories as string[]) || [];
  const pool = poolForPhotoCategories(categories);
  photo.src = unsplashUrl(pickRandom(UNSPLASH_POOLS[pool]), { width: 1000, height: 750 });
}
writeJson(photosPath, photos);

const galleriesPath = join(contentRoot, "photography", "galleries.json");
const galleries = readJson<Array<Record<string, unknown>>>(galleriesPath);
const galleryCovers = pickUniqueRandom(
  [...UNSPLASH_POOLS.general, ...UNSPLASH_POOLS.landscape, ...UNSPLASH_POOLS.travel],
  galleries.length
);
galleries.forEach((gallery, index) => {
  gallery.coverImage = unsplashUrl(galleryCovers[index]!, { width: 1200, height: 800 });
});
writeJson(galleriesPath, galleries);

console.log("Assigned random Unsplash images to projects, articles, and photography content.");
