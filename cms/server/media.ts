import { existsSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { extname, join, relative } from "node:path";
import { imagesRoot, publicRoot } from "./paths.js";

export type MediaEntry = {
  name: string;
  path: string;
  url: string;
  type: "file" | "directory";
  size?: number;
};

const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".avif"]);

export function listMedia(relativeDir = ""): MediaEntry[] {
  const safeDir = relativeDir.replace(/\\/g, "/").replace(/^\/+/, "").replace(/\.\./g, "");
  const absolute = join(imagesRoot, safeDir);
  if (!absolute.startsWith(imagesRoot)) throw new Error("Invalid directory");
  if (!existsSync(absolute)) mkdirSync(absolute, { recursive: true });

  return readdirSync(absolute)
    .map((name) => {
      const full = join(absolute, name);
      const rel = join("images", safeDir, name).replace(/\\/g, "/");
      const stats = statSync(full);
      if (stats.isDirectory()) {
        return { name, path: rel, url: "", type: "directory" as const };
      }
      return {
        name,
        path: rel,
        url: `/${rel}`,
        type: "file" as const,
        size: stats.size
      };
    })
    .sort((a, b) => {
      if (a.type !== b.type) return a.type === "directory" ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
}

export function nextImageName(dir: string, prefix = "image"): string {
  const absolute = join(imagesRoot, dir);
  if (!existsSync(absolute)) return `${prefix}-001.jpg`;
  const existing = readdirSync(absolute)
    .filter((name) => IMAGE_EXT.has(extname(name).toLowerCase()))
    .map((name) => {
      const match = name.match(/(\d+)/);
      return match ? Number(match[1]) : 0;
    });
  const next = existing.length ? Math.max(...existing) + 1 : 1;
  return `${prefix}-${String(next).padStart(3, "0")}.jpg`;
}

export function resolveUploadDir(relativeDir: string): string {
  const safeDir = relativeDir.replace(/\\/g, "/").replace(/^\/+/, "").replace(/\.\./g, "");
  const absolute = join(imagesRoot, safeDir);
  if (!absolute.startsWith(imagesRoot)) throw new Error("Invalid upload directory");
  mkdirSync(absolute, { recursive: true });
  return absolute;
}

export function publicUrlFromPath(relativePath: string): string {
  const normalized = relativePath.replace(/\\/g, "/").replace(/^\/+/, "");
  return `/${normalized.startsWith("images/") ? normalized : `images/${normalized}`}`;
}

export function listAllImageFiles(): string[] {
  const results: string[] = [];

  function walk(dir: string) {
    if (!existsSync(dir)) return;
    for (const name of readdirSync(dir)) {
      const full = join(dir, name);
      if (statSync(full).isDirectory()) walk(full);
      else if (IMAGE_EXT.has(extname(name).toLowerCase())) {
        results.push("/" + relative(publicRoot, full).replace(/\\/g, "/"));
      }
    }
  }

  walk(imagesRoot);
  return results.sort();
}
