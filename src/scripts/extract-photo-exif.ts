import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { extractExifFromFile, hasDisplayableExif, publicPathToFile, type PhotoExif } from "../lib/exif";

const root = process.cwd();
const publicRoot = join(root, "public");
const photosPath = join(root, "src", "content", "photography", "photos.json");
const exifIndexPath = join(root, "src", "content", "photography", "exif-index.json");

function walkImages(dir: string, files: string[] = []) {
  if (!existsSync(dir)) return files;

  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    const stats = statSync(path);
    if (stats.isDirectory()) walkImages(path, files);
    else if (/\.(jpe?g|webp)$/i.test(name)) files.push(path);
  }

  return files;
}

function toPublicPath(filePath: string) {
  return `/${relative(publicRoot, filePath).replace(/\\/g, "/")}`;
}

async function buildExifIndex() {
  const index: Record<string, PhotoExif> = {};
  const files = walkImages(publicRoot);
  let extracted = 0;

  for (const filePath of files) {
    const exif = await extractExifFromFile(filePath);
    if (!hasDisplayableExif(exif)) continue;
    index[toPublicPath(filePath)] = exif!;
    extracted += 1;
  }

  return { index, scanned: files.length, extracted };
}

function updatePhotosJson(index: Record<string, PhotoExif>) {
  if (!existsSync(photosPath)) return 0;

  const photos = JSON.parse(readFileSync(photosPath, "utf8")) as Array<Record<string, unknown>>;
  let updated = 0;

  for (const photo of photos) {
    const src = typeof photo.src === "string" ? photo.src : "";
    const exif = index[src];
    if (!exif) continue;
    photo.exif = exif;
    updated += 1;
  }

  writeFileSync(photosPath, `${JSON.stringify(photos, null, 2)}\n`, "utf8");
  return updated;
}

async function syncPhotoExif() {
  console.log("Extracting EXIF data from public images...");
  const { index, scanned, extracted } = await buildExifIndex();

  writeFileSync(exifIndexPath, `${JSON.stringify(index, null, 2)}\n`, "utf8");
  const photosUpdated = updatePhotosJson(index);

  console.log(`Scanned ${scanned} images`);
  console.log(`Found EXIF for ${extracted} images`);
  console.log(`Updated ${photosUpdated} entries in photos.json`);

  if (extracted === 0) {
    console.warn(
      "No camera EXIF found. Medium-hosted images usually strip make/model/exposure metadata; locally uploaded originals will work."
    );
  }

  return { scanned, extracted, photosUpdated };
}

export { syncPhotoExif };

async function main() {
  await syncPhotoExif();
  console.log(`Wrote ${exifIndexPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
