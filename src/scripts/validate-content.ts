import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import {
  articleSchema,
  careerItemSchema,
  educationItemSchema,
  gallerySchema,
  heroSchema,
  photoCategorySchema,
  photoSchema,
  professionalSchema,
  profileSchema,
  projectSchema,
  settingsSchema
} from "../schemas/content";

const root = process.cwd();
const contentRoot = join(root, "src", "content");
const publicRoot = join(root, "public");
const errors: string[] = [];

function readJson(path: string): unknown {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    errors.push(`${relative(root, path)}: invalid JSON: ${String(error)}`);
    return null;
  }
}

function validate(path: string, schema: { safeParse: (value: unknown) => { success: boolean; error?: unknown } }) {
  const value = readJson(path);
  const result = schema.safeParse(value);
  if (!result.success) errors.push(`${relative(root, path)}: schema validation failed: ${String(result.error)}`);
  return value;
}

function files(dir: string, suffix = ".json"): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return files(path, suffix);
    return name.endsWith(suffix) ? [path] : [];
  });
}

function checkImagePath(path: unknown, context: string) {
  if (typeof path !== "string" || path.length === 0) return;
  if (/^https?:\/\//.test(path)) return;
  if (!path.startsWith("/images/")) {
    errors.push(`${context}: image path must start with /images/: ${path}`);
    return;
  }
  const absolute = join(publicRoot, path.replace(/^\//, ""));
  if (!existsSync(absolute)) errors.push(`${context}: image file does not exist: ${path}`);
}

const profile = validate(join(contentRoot, "profile", "main.json"), profileSchema) as any;
checkImagePath(profile?.portraitImage, "profile.portraitImage");
validate(join(contentRoot, "profile", "hero.json"), heroSchema);
validate(join(contentRoot, "profile", "professional.json"), professionalSchema);
validate(join(contentRoot, "settings", "site.json"), settingsSchema);

for (const path of files(join(contentRoot, "career"))) validate(path, careerItemSchema);
for (const path of files(join(contentRoot, "education"))) validate(path, educationItemSchema);
for (const path of files(join(contentRoot, "projects"))) {
  const project = validate(path, projectSchema) as any;
  checkImagePath(project?.image, `${relative(root, path)}.image`);
}
for (const path of files(join(contentRoot, "articles"))) {
  if (!path.endsWith("index.json")) continue;
  const article = validate(path, articleSchema) as any;
  checkImagePath(article?.coverImage, `${relative(root, path)}.coverImage`);
  const dir = path.replace(/index\.json$/, "");
  for (const lang of ["en", "no"]) {
    const bodyPath = join(dir, `body.${lang}.md`);
    if (!existsSync(bodyPath)) errors.push(`${relative(root, bodyPath)}: missing article body`);
  }
}
const categories = validate(join(contentRoot, "photography", "categories.json"), { safeParse: (value: unknown) => {
  if (!Array.isArray(value)) return { success: false, error: "Expected array" };
  for (const item of value) {
    const result = photoCategorySchema.safeParse(item);
    if (!result.success) return result;
  }
  return { success: true };
}}) as any[];
const categoryIds = new Set((categories || []).map((category: any) => category.id));
const photos = validate(join(contentRoot, "photography", "photos.json"), { safeParse: (value: unknown) => {
  if (!Array.isArray(value)) return { success: false, error: "Expected array" };
  for (const item of value) {
    const result = photoSchema.safeParse(item);
    if (!result.success) return result;
  }
  return { success: true };
}}) as any[];
for (const photo of photos || []) {
  checkImagePath(photo?.src, `photo ${photo?.id}.src`);
  for (const category of photo?.categories || []) {
    if (!categoryIds.has(category)) errors.push(`photo ${photo?.id}: unknown category ${category}`);
  }
}
const photoIds = new Set((photos || []).map((photo: any) => photo.id));
const galleries = validate(join(contentRoot, "photography", "galleries.json"), { safeParse: (value: unknown) => {
  if (!Array.isArray(value)) return { success: false, error: "Expected array" };
  for (const item of value) {
    const result = gallerySchema.safeParse(item);
    if (!result.success) return result;
  }
  return { success: true };
}}) as any[];
for (const gallery of galleries || []) {
  checkImagePath(gallery?.coverImage, `gallery ${gallery?.id}.coverImage`);
  for (const photoId of gallery?.images || []) {
    if (!photoIds.has(photoId)) errors.push(`gallery ${gallery?.id}: unknown photo id ${photoId}`);
  }
}

if (errors.length > 0) {
  console.error("Content validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("Content validation passed.");
