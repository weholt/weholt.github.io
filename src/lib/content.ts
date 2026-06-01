import {
  articleSchema,
  careerItemSchema,
  educationItemSchema,
  gallerySchema,
  heroSchema,
  photoCategorySchema,
  photoExifSchema,
  photoSchema,
  professionalSchema,
  profileSchema,
  projectSchema,
  settingsSchema,
  type Article,
  type CareerItem,
  type EducationItem,
  type Gallery,
  type Hero,
  type Photo,
  type PhotoCategory,
  type Professional,
  type Profile,
  type Project,
  type Settings
} from "../schemas/content";

type JsonModule<T> = T;

const profileRaw = import.meta.glob<JsonModule<unknown>>("../content/profile/main.json", { eager: true, import: "default" });
const heroRaw = import.meta.glob<JsonModule<unknown>>("../content/profile/hero.json", { eager: true, import: "default" });
const professionalRaw = import.meta.glob<JsonModule<unknown>>("../content/profile/professional.json", { eager: true, import: "default" });
const settingsRaw = import.meta.glob<JsonModule<unknown>>("../content/settings/site.json", { eager: true, import: "default" });
const careerRaw = import.meta.glob<JsonModule<unknown>>("../content/career/*.json", { eager: true, import: "default" });
const educationRaw = import.meta.glob<JsonModule<unknown>>("../content/education/*.json", { eager: true, import: "default" });
const projectsRaw = import.meta.glob<JsonModule<unknown>>("../content/projects/*.json", { eager: true, import: "default" });
const articleRaw = import.meta.glob<JsonModule<unknown>>("../content/articles/*/index.json", { eager: true, import: "default" });
const articleBodiesRaw = import.meta.glob<string>("../content/articles/*/body.*.md", { eager: true, import: "default", query: "?raw" });
const photoCategoriesRaw = import.meta.glob<JsonModule<unknown>>("../content/photography/categories.json", { eager: true, import: "default" });
const photosRaw = import.meta.glob<JsonModule<unknown>>("../content/photography/photos.json", { eager: true, import: "default" });
const galleriesRaw = import.meta.glob<JsonModule<unknown>>("../content/photography/galleries.json", { eager: true, import: "default" });
const exifIndexRaw = import.meta.glob<JsonModule<unknown>>("../content/photography/exif-index.json", {
  eager: true,
  import: "default"
});

function single<T>(records: Record<string, T>, label: string): T {
  const values = Object.values(records);
  if (values.length !== 1) throw new Error(`Expected exactly one ${label} file, found ${values.length}`);
  return values[0];
}

function parseArticleBodyPath(path: string): { id: string; lang: "en" | "no" } | null {
  const match = path.match(/articles\/([^/]+)\/body\.(en|no)\.md$/);
  if (!match) return null;
  return { id: match[1], lang: match[2] as "en" | "no" };
}

export function getProfile(): Profile {
  return profileSchema.parse(single(profileRaw, "profile"));
}

export function getHero(): Hero {
  return heroSchema.parse(single(heroRaw, "hero"));
}

export function getProfessional(): Professional {
  return professionalSchema.parse(single(professionalRaw, "professional"));
}

export function getSettings(): Settings {
  return settingsSchema.parse(single(settingsRaw, "settings"));
}

export function getCareer(): CareerItem[] {
  return Object.values(careerRaw).map((item) => careerItemSchema.parse(item)).sort((a, b) => a.order - b.order);
}

export function getEducation(): EducationItem[] {
  return Object.values(educationRaw).map((item) => educationItemSchema.parse(item)).sort((a, b) => a.order - b.order);
}

export function getProjects(): Project[] {
  return Object.values(projectsRaw).map((item) => projectSchema.parse(item)).sort((a, b) => a.order - b.order);
}

export function compareArticles(a: Article, b: Article) {
  if (a.status !== b.status) {
    if (a.status === "published") return -1;
    if (b.status === "published") return 1;
  }

  if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;

  if (a.pinned && b.pinned) {
    const aRank = a.pinOrder ?? a.order;
    const bRank = b.pinOrder ?? b.order;
    if (aRank !== bRank) return aRank - bRank;
    return b.date.localeCompare(a.date);
  }

  if (a.order !== b.order) return a.order - b.order;
  return b.date.localeCompare(a.date);
}

export function getArticles(): Article[] {
  return Object.values(articleRaw).map((item) => articleSchema.parse(item)).sort(compareArticles);
}

export function getArticleBodies(): Record<string, { en?: string; no?: string }> {
  const result: Record<string, { en?: string; no?: string }> = {};
  for (const [path, body] of Object.entries(articleBodiesRaw)) {
    const parsed = parseArticleBodyPath(path);
    if (!parsed) continue;
    result[parsed.id] ??= {};
    result[parsed.id][parsed.lang] = body;
  }
  return result;
}

function getArticleCoverImage(id: string): string | undefined {
  for (const item of Object.values(articleRaw)) {
    const article = articleSchema.parse(item);
    if (article.id === id) return article.coverImage;
  }
  return undefined;
}

export function stripDuplicateCoverImage(markdown: string, coverImage?: string): string {
  if (!coverImage) return markdown;

  const normalize = (path: string) => decodeURIComponent(path.replace(/^\/+/, "").split("?")[0]!);
  const cover = normalize(coverImage);
  const imagePattern = /!\[[^\]]*\]\(([^)]+)\)/;
  const match = markdown.match(imagePattern);
  if (!match || match.index === undefined) return markdown;
  if (normalize(match[1]!) !== cover) return markdown;

  const before = markdown.slice(0, match.index);
  const after = markdown.slice(match.index + match[0].length);
  return `${before}${after}`.replace(/\n{3,}/g, "\n\n").trimStart();
}

export function getArticleBody(id: string): { en: string; no: string } {
  const body = getArticleBodies()[id];
  const coverImage = getArticleCoverImage(id);
  return {
    en: stripDuplicateCoverImage(body?.en || "# Missing English body", coverImage),
    no: stripDuplicateCoverImage(body?.no || "# Mangler norsk tekst", coverImage)
  };
}

export function getPhotoCategories(): PhotoCategory[] {
  const raw = single(photoCategoriesRaw, "photo categories") as unknown[];
  return raw.map((item) => photoCategorySchema.parse(item));
}

export function getPhotos(): Photo[] {
  const raw = single(photosRaw, "photos") as unknown[];
  return raw.map((item) => photoSchema.parse(item));
}

export function getExifIndex(): Record<string, import("../schemas/content").PhotoExif> {
  const values = Object.values(exifIndexRaw);
  if (values.length === 0) return {};
  const raw = values[0] as Record<string, unknown>;
  const index: Record<string, import("../schemas/content").PhotoExif> = {};

  for (const [path, value] of Object.entries(raw)) {
    const parsed = photoExifSchema.safeParse(value);
    if (parsed.success) index[path] = parsed.data;
  }

  return index;
}

export function getGalleries(): Gallery[] {
  const raw = single(galleriesRaw, "galleries") as unknown[];
  return raw.map((item) => gallerySchema.parse(item)).sort((a, b) => a.order - b.order);
}

export function getSiteData() {
  return {
    profile: getProfile(),
    hero: getHero(),
    professional: getProfessional(),
    settings: getSettings(),
    career: getCareer(),
    education: getEducation(),
    projects: getProjects(),
    articles: getArticles(),
    photoCategories: getPhotoCategories(),
    photos: getPhotos(),
    galleries: getGalleries(),
    exifIndex: getExifIndex()
  };
}
