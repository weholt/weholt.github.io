import {
  compareArticles,
  getArticles,
  getGalleries,
  getPhotoCategories,
  getPhotos,
  getProfessional,
  getProjects
} from "./content";
import type { Article, Gallery, Photo, Project } from "../schemas/content";

export function tagToSlug(tag: string): string {
  return tag
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

export function tagMatchesSlug(tag: string, slug: string): boolean {
  return tagToSlug(tag) === slug.toLowerCase();
}

export type TagIndexEntry = {
  slug: string;
  label: string;
  count: number;
  articleCount: number;
  projectCount: number;
  galleryCount: number;
  photoCount: number;
};

type TagBucket = {
  label: string;
  articleIds: Set<string>;
  projectIds: Set<string>;
  galleryIds: Set<string>;
  photoIds: Set<string>;
};

function categoryLabelMap() {
  return new Map(getPhotoCategories().map((category) => [category.id, category.title.en]));
}

function collectTags() {
  const map = new Map<string, TagBucket>();
  const categoryLabels = categoryLabelMap();

  const register = (tag: string, preferredLabel?: string) => {
    const slug = tagToSlug(tag);
    if (!slug) return;

    const label = preferredLabel ?? categoryLabels.get(tag) ?? tag;
    let entry = map.get(slug);
    if (!entry) {
      entry = {
        label,
        articleIds: new Set(),
        projectIds: new Set(),
        galleryIds: new Set(),
        photoIds: new Set()
      };
      map.set(slug, entry);
      return;
    }

    if (preferredLabel || categoryLabels.has(tag)) {
      entry.label = label;
    }
  };

  const add = (tag: string, kind: keyof Omit<TagBucket, "label">, id: string, preferredLabel?: string) => {
    register(tag, preferredLabel);
    const slug = tagToSlug(tag);
    if (!slug) return;

    map.get(slug)?.[kind].add(id);
  };

  for (const article of getArticles()) {
    if (article.status !== "published") continue;
    for (const tag of article.tags) add(tag, "articleIds", article.id);
  }

  for (const project of getProjects()) {
    if (project.status === "draft") continue;
    for (const tag of project.tags) add(tag, "projectIds", project.id);
  }

  for (const gallery of getGalleries()) {
    for (const category of gallery.categories) add(category, "galleryIds", gallery.id);
  }

  for (const photo of getPhotos()) {
    for (const category of photo.categories) add(category, "photoIds", photo.id);
    for (const tag of photo.tags) add(tag, "photoIds", photo.id);
  }

  for (const category of getPhotoCategories()) {
    register(category.id, category.title.en);
  }

  for (const skill of getProfessional().expertise) {
    register(skill);
  }

  return map;
}

export function getTagIndex(): TagIndexEntry[] {
  return [...collectTags().entries()]
    .map(([slug, entry]) => ({
      slug,
      label: entry.label,
      articleCount: entry.articleIds.size,
      projectCount: entry.projectIds.size,
      galleryCount: entry.galleryIds.size,
      photoCount: entry.photoIds.size,
      count:
        entry.articleIds.size +
        entry.projectIds.size +
        entry.galleryIds.size +
        entry.photoIds.size
    }))
    .filter((entry) => entry.count > 0 || getPhotoCategories().some((category) => tagToSlug(category.id) === entry.slug))
    .sort((a, b) => a.label.localeCompare(b.label, "en"));
}

export function getAllTagSlugs(): string[] {
  return [...collectTags().keys()];
}

export function getLabelForTagSlug(slug: string): string {
  const entry = collectTags().get(slug.toLowerCase());
  if (entry) return entry.label;

  const category = getPhotoCategories().find((item) => tagToSlug(item.id) === slug.toLowerCase());
  if (category) return category.title.en;

  return slug.replace(/-/g, " ");
}

export function getArticlesByTagSlug(slug: string): Article[] {
  return getArticles()
    .filter((article) => article.status === "published" && article.tags.some((tag) => tagMatchesSlug(tag, slug)))
    .sort(compareArticles);
}

export function getProjectsByTagSlug(slug: string): Project[] {
  return getProjects()
    .filter((project) => project.status !== "draft" && project.tags.some((tag) => tagMatchesSlug(tag, slug)))
    .sort((a, b) => a.order - b.order);
}

export function getGalleriesByTagSlug(slug: string): Gallery[] {
  return getGalleries().filter((gallery) => gallery.categories.some((category) => tagMatchesSlug(category, slug)));
}

export function getPhotosByTagSlug(slug: string): Photo[] {
  return getPhotos().filter(
    (photo) =>
      photo.categories.some((category) => tagMatchesSlug(category, slug)) ||
      photo.tags.some((tag) => tagMatchesSlug(tag, slug))
  );
}

export function getPhotoCategoryLabels(): Record<string, import("../schemas/content").LocalizedString> {
  return Object.fromEntries(getPhotoCategories().map((category) => [category.id, category.title]));
}
