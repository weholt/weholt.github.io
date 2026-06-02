import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync
} from "node:fs";
import { join } from "node:path";
import { contentRoot } from "./paths.js";

export type SectionKind = "singleton" | "collection" | "array" | "article";

export type SectionMeta = {
  id: string;
  label: string;
  kind: SectionKind;
  path: string;
};

export const SECTIONS: SectionMeta[] = [
  { id: "profile/main", label: "Profile", kind: "singleton", path: "profile/main.json" },
  { id: "profile/hero", label: "Home hero", kind: "singleton", path: "profile/hero.json" },
  { id: "profile/professional", label: "Professional", kind: "singleton", path: "profile/professional.json" },
  { id: "settings/site", label: "Site settings", kind: "singleton", path: "settings/site.json" },
  { id: "career", label: "Career", kind: "collection", path: "career" },
  { id: "education", label: "Education", kind: "collection", path: "education" },
  { id: "projects", label: "Projects", kind: "collection", path: "projects" },
  { id: "articles", label: "Articles", kind: "article", path: "articles" },
  { id: "photography/categories", label: "Photo categories", kind: "array", path: "photography/categories.json" },
  { id: "photography/photos", label: "Photos", kind: "array", path: "photography/photos.json" },
  { id: "photography/galleries", label: "Galleries", kind: "array", path: "photography/galleries.json" }
];

function sectionById(id: string): SectionMeta {
  const section = SECTIONS.find((item) => item.id === id);
  if (!section) throw new Error(`Unknown section: ${id}`);
  return section;
}

function absContentPath(relativePath: string): string {
  return join(contentRoot, relativePath);
}

function writeJson(path: string, value: unknown) {
  mkdirSync(join(path, ".."), { recursive: true });
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, "utf8"));
}

export function listSectionItems(sectionId: string): { id: string; label?: string }[] {
  const section = sectionById(sectionId);

  if (section.kind === "singleton" || section.kind === "array") {
    return [{ id: section.id }];
  }

  if (section.kind === "collection") {
    const dir = absContentPath(section.path);
    if (!existsSync(dir)) return [];
    return readdirSync(dir)
      .filter((name) => name.endsWith(".json"))
      .map((name) => {
        const id = name.replace(/\.json$/, "");
        try {
          const data = readJson(join(dir, name)) as { title?: { en?: string }; role?: { en?: string }; company?: string };
          const label = data.title?.en || data.role?.en || data.company || id;
          return { id, label };
        } catch {
          return { id };
        }
      })
      .sort((a, b) => a.id.localeCompare(b.id));
  }

  if (section.kind === "article") {
    const dir = absContentPath(section.path);
    if (!existsSync(dir)) return [];
    return readdirSync(dir)
      .filter((name) => statSync(join(dir, name)).isDirectory())
      .map((id) => {
        try {
          const meta = readJson(join(dir, id, "index.json")) as { title?: { en?: string }; date?: string; status?: string };
          return { id, label: meta.title?.en || id, date: meta.date, status: meta.status };
        } catch {
          return { id };
        }
      })
      .sort((a, b) => (b as { date?: string }).date?.localeCompare((a as { date?: string }).date || "") || a.id.localeCompare(b.id));
  }

  return [];
}

export function readSectionItem(sectionId: string, itemId?: string): unknown {
  const section = sectionById(sectionId);

  if (section.kind === "singleton" || section.kind === "array") {
    return readJson(absContentPath(section.path));
  }

  if (section.kind === "collection") {
    if (!itemId) throw new Error("Item id required");
    return readJson(absContentPath(join(section.path, `${itemId}.json`)));
  }

  if (section.kind === "article") {
    if (!itemId) throw new Error("Item id required");
    const dir = absContentPath(join(section.path, itemId));
    return {
      meta: readJson(join(dir, "index.json")),
      bodyEn: readFileSync(join(dir, "body.en.md"), "utf8"),
      bodyNo: readFileSync(join(dir, "body.no.md"), "utf8")
    };
  }

  throw new Error(`Unsupported section kind: ${section.kind}`);
}

export function writeSectionItem(sectionId: string, value: unknown, itemId?: string) {
  const section = sectionById(sectionId);

  if (section.kind === "singleton" || section.kind === "array") {
    writeJson(absContentPath(section.path), value);
    return;
  }

  if (section.kind === "collection") {
    if (!itemId) throw new Error("Item id required");
    const data = value as { id?: string };
    const id = data.id || itemId;
    writeJson(absContentPath(join(section.path, `${id}.json`)), value);
    return;
  }

  if (section.kind === "article") {
    if (!itemId) throw new Error("Item id required");
    const payload = value as { meta: unknown; bodyEn: string; bodyNo: string };
    const dir = absContentPath(join(section.path, itemId));
    mkdirSync(dir, { recursive: true });
    writeJson(join(dir, "index.json"), payload.meta);
    writeFileSync(join(dir, "body.en.md"), payload.bodyEn, "utf8");
    writeFileSync(join(dir, "body.no.md"), payload.bodyNo, "utf8");
    return;
  }

  throw new Error(`Unsupported section kind: ${section.kind}`);
}

export function createSectionItem(sectionId: string, itemId: string, value: unknown) {
  const section = sectionById(sectionId);

  if (section.kind === "collection") {
    const path = absContentPath(join(section.path, `${itemId}.json`));
    if (existsSync(path)) throw new Error(`Item already exists: ${itemId}`);
    writeSectionItem(sectionId, value, itemId);
    return;
  }

  if (section.kind === "article") {
    const dir = absContentPath(join(section.path, itemId));
    if (existsSync(dir)) throw new Error(`Article already exists: ${itemId}`);
    const payload = value as { meta: unknown; bodyEn: string; bodyNo: string };
    writeSectionItem(sectionId, payload, itemId);
    return;
  }

  throw new Error(`Section ${sectionId} does not support create`);
}

export function deleteSectionItem(sectionId: string, itemId: string) {
  const section = sectionById(sectionId);

  if (section.kind === "collection") {
    rmSync(absContentPath(join(section.path, `${itemId}.json`)));
    return;
  }

  if (section.kind === "article") {
    rmSync(absContentPath(join(section.path, itemId)), { recursive: true, force: true });
    return;
  }

  throw new Error(`Section ${sectionId} does not support delete`);
}
