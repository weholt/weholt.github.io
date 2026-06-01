type UnsplashSize = {
  width?: number;
  height?: number;
};

export const UNSPLASH_POOLS = {
  portrait: [
    "photo-1507003211169-0a1dd7228f2d",
    "photo-1500648767791-00dcc994a43e",
    "photo-1472099645785-5658abf4ff4e",
    "photo-1519085360753-af0119f7cbe7"
  ],
  tech: [
    "photo-1555066931-4365d14bab8c",
    "photo-1461749680682-v046622bf237",
    "photo-1517694712202-14dd9538aa97",
    "photo-1515879218367-8466d910aaa4",
    "photo-1555949963-aa79dcee981c",
    "photo-1504639725590-34d0984388bd"
  ],
  writing: [
    "photo-1456324502049-c0538ddeb145",
    "photo-1486312338219-ce68d2c6f44d",
    "photo-1434030216411-0b793f4b4173",
    "photo-1516321318423-f06f85e504b3"
  ],
  landscape: [
    "photo-1506905925346-21bda4d32df4",
    "photo-1470071459604-3b02001aa4fc",
    "photo-1464822759023-fed622ff2c3b",
    "photo-1501785888041-af3bef278a2e"
  ],
  street: [
    "photo-1449824913920-b849167578b9",
    "photo-1514565131-fce080095864",
    "photo-1512453979798-5ea266f8880c",
    "photo-1480714378408-67cf0d13bc1b"
  ],
  travel: [
    "photo-1469474968028-56623f02e42e",
    "photo-1488646953464-85b44f962271",
    "photo-1526772662000-3f88f10405ff",
    "photo-1500530855697-b586d89ba3fe"
  ],
  general: [
    "photo-1492691527719-9d1e07e534b4",
    "photo-1516035069371-29a1b244cc32",
    "photo-1519681393784-d120267933ba",
    "photo-1502920917128-1aa500764cbd"
  ]
} as const;

export type UnsplashPool = keyof typeof UNSPLASH_POOLS;

export function unsplashUrl(photoId: string, size: UnsplashSize = { width: 1200 }): string {
  const params = new URLSearchParams({
    auto: "format",
    fit: "crop",
    q: "80"
  });
  if (size.width) params.set("w", String(size.width));
  if (size.height) params.set("h", String(size.height));
  return `https://images.unsplash.com/${photoId}?${params}`;
}

export function pickRandom<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)]!;
}

export function pickUniqueRandom(items: readonly string[], count: number): string[] {
  const shuffled = [...items].sort(() => Math.random() - 0.5);
  const picks: string[] = [];
  while (picks.length < count) {
    if (shuffled.length === 0) shuffled.push(...items);
    picks.push(shuffled.pop()!);
  }
  return picks;
}

export function poolForPhotoCategories(categories: string[]): UnsplashPool {
  if (categories.includes("portraits")) return "portrait";
  if (categories.includes("landscape")) return "landscape";
  if (categories.includes("street")) return "street";
  if (categories.includes("travel")) return "travel";
  return "general";
}

/** Full-bleed theme backgrounds (Unsplash). Used by photo-themes.css — keep IDs in sync. */
export const THEME_BACKGROUND_IDS = {
  "alpine-gallery": "photo-1506905925346-21bda4d32df4",
  "golden-hour": "photo-1500530855697-b586d89ba3fe",
  "urban-frame": "photo-1449824913920-b849167578b9",
  "darkroom-print": "photo-1516035069371-29a1b244cc32",
  "lightbox-frost": "photo-1492691527719-9d1e07e534b4",
  "portfolio-split": "photo-1519681393784-d120267933ba"
} as const;

export function themeBackgroundUrl(themeId: keyof typeof THEME_BACKGROUND_IDS, width = 2400): string {
  return unsplashUrl(THEME_BACKGROUND_IDS[themeId], { width });
}
