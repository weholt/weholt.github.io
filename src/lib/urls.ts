export function withBase(path?: string): string {
  if (!path) return "";
  if (/^(https?:)?\/\//.test(path) || path.startsWith("mailto:")) return path;
  const base = import.meta.env.BASE_URL || "/";
  const cleanBase = base.endsWith("/") ? base.slice(0, -1) : base;
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${cleanBase}${cleanPath}` || "/";
}
