import type { Request } from "express";
import { SECTIONS } from "./content.js";

export function parseContentPath(urlPath: string): { sectionId: string; itemId?: string } {
  const relative = urlPath.replace(/^\/api\/content\/?/, "").replace(/^\//, "");
  if (!relative) throw new Error("Missing content path");

  const ordered = [...SECTIONS].sort((a, b) => b.id.length - a.id.length);
  for (const section of ordered) {
    if (relative === section.id) return { sectionId: section.id };
    if (relative.startsWith(`${section.id}/`)) {
      return { sectionId: section.id, itemId: relative.slice(section.id.length + 1) };
    }
  }

  throw new Error(`Unknown content path: ${relative}`);
}

export function contentUrl(req: Request): string {
  return req.originalUrl.split("?")[0] ?? req.path;
}
