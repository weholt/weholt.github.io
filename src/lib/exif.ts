import exifr from "exifr";
import { existsSync } from "node:fs";
import { join } from "node:path";

export type PhotoExif = {
  make?: string;
  model?: string;
  lens?: string;
  focalLength?: string;
  shutterSpeed?: string;
  aperture?: string;
  iso?: string;
};

export function formatShutterSpeed(exposureTime?: number) {
  if (!exposureTime || exposureTime <= 0) return undefined;
  if (exposureTime >= 1) {
    const rounded = Math.round(exposureTime * 10) / 10;
    return `${rounded}s`;
  }
  return `1/${Math.round(1 / exposureTime)}s`;
}

export function formatAperture(fNumber?: number) {
  if (!fNumber || fNumber <= 0) return undefined;
  const value = Number(fNumber.toFixed(1)).toString();
  return `f/${value}`;
}

export function formatIso(iso?: number) {
  if (!iso || iso <= 0) return undefined;
  return `ISO ${Math.round(iso)}`;
}

export function formatFocalLength(focalLength?: number) {
  if (!focalLength || focalLength <= 0) return undefined;
  return `${Math.round(focalLength)}mm`;
}

function cleanText(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed || undefined;
}

export function normalizeExif(raw: Record<string, unknown> | null | undefined): PhotoExif | undefined {
  if (!raw) return undefined;

  const make = cleanText(typeof raw.Make === "string" ? raw.Make : undefined);
  const model = cleanText(typeof raw.Model === "string" ? raw.Model : undefined);
  const lens = cleanText(typeof raw.LensModel === "string" ? raw.LensModel : undefined);
  const shutterSpeed = formatShutterSpeed(typeof raw.ExposureTime === "number" ? raw.ExposureTime : undefined);
  const aperture = formatAperture(typeof raw.FNumber === "number" ? raw.FNumber : undefined);
  const isoValue =
    typeof raw.ISO === "number"
      ? raw.ISO
      : typeof raw.ISOSpeedRatings === "number"
        ? raw.ISOSpeedRatings
        : undefined;
  const iso = formatIso(isoValue);
  const focalLength = formatFocalLength(typeof raw.FocalLength === "number" ? raw.FocalLength : undefined);

  const exif: PhotoExif = {
    make,
    model,
    lens,
    focalLength,
    shutterSpeed,
    aperture,
    iso
  };

  return hasDisplayableExif(exif) ? exif : undefined;
}

export function hasDisplayableExif(exif?: PhotoExif) {
  if (!exif) return false;
  return Boolean(
    exif.make ||
      exif.model ||
      exif.lens ||
      exif.shutterSpeed ||
      exif.aperture ||
      exif.iso
  );
}

export function cameraLabel(exif: PhotoExif) {
  const parts = [exif.make, exif.model].filter(Boolean);
  return parts.length > 0 ? parts.join(" ") : undefined;
}

export function exifItems(exif: PhotoExif) {
  const items: string[] = [];
  const camera = cameraLabel(exif);
  if (camera) items.push(camera);
  if (exif.lens) items.push(exif.lens);
  else if (exif.focalLength) items.push(exif.focalLength);
  if (exif.shutterSpeed) items.push(exif.shutterSpeed);
  if (exif.aperture) items.push(exif.aperture);
  if (exif.iso) items.push(exif.iso);
  return items;
}

export function exifSummary(exif: PhotoExif) {
  return exifItems(exif).join(" · ");
}

export async function extractExifFromFile(filePath: string): Promise<PhotoExif | undefined> {
  if (!existsSync(filePath)) return undefined;

  try {
    const raw = await exifr.parse(filePath, {
      pick: ["Make", "Model", "LensModel", "FocalLength", "FNumber", "ExposureTime", "ISO", "ISOSpeedRatings"]
    });
    return normalizeExif(raw as Record<string, unknown>);
  } catch {
    return undefined;
  }
}

export function publicPathToFile(publicPath: string, publicRoot = join(process.cwd(), "public")) {
  const normalized = publicPath.split("?")[0]!.replace(/^\/+/, "");
  return join(publicRoot, normalized);
}

export function injectExifIntoHtml(html: string, lookup: (src: string) => PhotoExif | undefined) {
  return html.replace(/<p>\s*(<img[^>]+>)\s*<\/p>/gi, (_, imgTag: string) => wrapImageWithExif(imgTag, lookup));
}

function exifHtmlForImageTag(imgTag: string, lookup: (src: string) => PhotoExif | undefined) {
  const src = imgTag.match(/\ssrc="([^"]+)"/i)?.[1];
  if (!src) return "";
  const exif = lookup(src);
  if (!hasDisplayableExif(exif)) return "";
  return renderExifFigcaption(exif!);
}

function wrapImageWithExif(imgTag: string, lookup: (src: string) => PhotoExif | undefined) {
  const exifHtml = exifHtmlForImageTag(imgTag, lookup);
  if (!exifHtml) return imgTag;
  return `<figure class="figure-with-exif">${imgTag}${exifHtml}</figure>`;
}

export function renderExifFigcaption(exif: PhotoExif) {
  const items = exifItems(exif);
  if (items.length === 0) return "";

  return `<figcaption class="photo-exif">${items
    .map((item) => `<span class="photo-exif-item">${escapeHtml(item)}</span>`)
    .join('<span class="photo-exif-sep" aria-hidden="true">·</span>')}</figcaption>`;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
