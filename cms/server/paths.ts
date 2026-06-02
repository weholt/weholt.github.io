import { join } from "node:path";
import { fileURLToPath } from "node:url";

const cmsDir = fileURLToPath(new URL("..", import.meta.url));
export const siteRoot = process.env.CMS_SITE_ROOT
  ? join(process.env.CMS_SITE_ROOT)
  : join(cmsDir, "..");
export const contentRoot = join(siteRoot, "src", "content");
export const publicRoot = join(siteRoot, "public");
export const imagesRoot = join(publicRoot, "images");
