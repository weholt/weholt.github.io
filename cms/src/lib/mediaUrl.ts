/** Public image path → CMS dev proxy URL (`/media/...` → `public/images/...`). */
export function mediaUrl(path: string): string {
  const normalized = path.replace(/^\/+/, "").replace(/^images\//, "");
  return `/media/${normalized}`;
}
