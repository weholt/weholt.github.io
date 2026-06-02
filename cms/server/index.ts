import { existsSync, writeFileSync } from "node:fs";
import { extname, join } from "node:path";
import { spawnSync } from "node:child_process";
import cors from "cors";
import express from "express";
import multer from "multer";
import {
  createSectionItem,
  deleteSectionItem,
  listSectionItems,
  readSectionItem,
  SECTIONS,
  writeSectionItem
} from "./content.js";
import { listAllImageFiles, listMedia, nextImageName, publicUrlFromPath, resolveUploadDir } from "./media.js";
import { siteRoot } from "./paths.js";
import { contentUrl, parseContentPath } from "./routes.js";

const app = express();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });
const port = Number(process.env.CMS_PORT || 3456);

app.use(cors());
app.use(express.json({ limit: "20mb" }));
app.use("/media", express.static(join(siteRoot, "public", "images")));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, siteRoot });
});

app.get("/api/sections", (_req, res) => {
  res.json(SECTIONS);
});

app.get("/api/content/*", (req, res) => {
  try {
    const { sectionId, itemId } = parseContentPath(contentUrl(req));
    if (itemId) {
      res.json(readSectionItem(sectionId, itemId));
      return;
    }
    const section = SECTIONS.find((item) => item.id === sectionId);
    if (section?.kind === "singleton" || section?.kind === "array") {
      res.json(readSectionItem(sectionId));
      return;
    }
    res.json(listSectionItems(sectionId));
  } catch (error) {
    res.status(404).json({ error: String(error) });
  }
});

app.put("/api/content/*", (req, res) => {
  try {
    const { sectionId, itemId } = parseContentPath(contentUrl(req));
    writeSectionItem(sectionId, req.body, itemId);
    res.json({ ok: true });
  } catch (error) {
    res.status(400).json({ error: String(error) });
  }
});

app.post("/api/content/*", (req, res) => {
  try {
    const { sectionId } = parseContentPath(contentUrl(req));
    const { id, data } = req.body as { id: string; data: unknown };
    if (!id) {
      res.status(400).json({ error: "Missing id" });
      return;
    }
    createSectionItem(sectionId, id, data);
    res.json({ ok: true, id });
  } catch (error) {
    res.status(400).json({ error: String(error) });
  }
});

app.delete("/api/content/*", (req, res) => {
  try {
    const { sectionId, itemId } = parseContentPath(contentUrl(req));
    if (!itemId) {
      res.status(400).json({ error: "Item id required" });
      return;
    }
    deleteSectionItem(sectionId, itemId);
    res.json({ ok: true });
  } catch (error) {
    res.status(400).json({ error: String(error) });
  }
});

app.get("/api/media", (req, res) => {
  try {
    const dir = typeof req.query.dir === "string" ? req.query.dir : "";
    res.json({ dir, entries: listMedia(dir) });
  } catch (error) {
    res.status(400).json({ error: String(error) });
  }
});

app.get("/api/media/all", (_req, res) => {
  res.json(listAllImageFiles());
});

app.post("/api/upload", upload.array("files"), (req, res) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files?.length) {
      res.status(400).json({ error: "No files uploaded" });
      return;
    }

    const dest = typeof req.body.dest === "string" ? req.body.dest : "";
    const autoName = req.body.autoName === "true" || req.body.autoName === true;
    const uploadDir = resolveUploadDir(dest);
    const uploaded: { name: string; path: string; url: string }[] = [];

    for (const file of files) {
      const ext = extname(file.originalname).toLowerCase() || ".jpg";
      const filename = autoName
        ? nextImageName(dest).replace(/\.jpg$/, ext === ".jpg" || ext === ".jpeg" ? ext : ext)
        : file.originalname.replace(/[^\w.\-]+/g, "-");
      writeFileSync(join(uploadDir, filename), file.buffer);
      const rel = join("images", dest, filename).replace(/\\/g, "/");
      uploaded.push({ name: filename, path: rel, url: publicUrlFromPath(rel) });
    }

    res.json({ uploaded });
  } catch (error) {
    res.status(400).json({ error: String(error) });
  }
});

app.post("/api/upload/gallery", upload.array("files"), (req, res) => {
  try {
    const files = req.files as Express.Multer.File[];
    const galleryId = typeof req.body.galleryId === "string" ? req.body.galleryId : "";
    if (!galleryId) {
      res.status(400).json({ error: "galleryId required" });
      return;
    }
    if (!files?.length) {
      res.status(400).json({ error: "No files uploaded" });
      return;
    }

    const dest = `medium/${galleryId}`;
    const uploadDir = resolveUploadDir(dest);
    const uploaded: { name: string; url: string; photoId: string }[] = [];

    for (const file of files) {
      const ext = extname(file.originalname).toLowerCase();
      const useExt = [".jpg", ".jpeg", ".png", ".webp", ".gif"].includes(ext) ? ext : ".jpg";
      const filename = nextImageName(dest).replace(/\.jpg$/, useExt);
      writeFileSync(join(uploadDir, filename), file.buffer);
      const number = filename.match(/(\d+)/)?.[1] || "001";
      const photoId = `${galleryId}-${number}`;
      const url = publicUrlFromPath(join("images", dest, filename));
      uploaded.push({ name: filename, url, photoId });
    }

    res.json({ uploaded, dest });
  } catch (error) {
    res.status(400).json({ error: String(error) });
  }
});

app.post("/api/validate", (_req, res) => {
  if (process.env.CMS_TEST_MODE === "1") {
    res.json({ ok: true, stdout: "Content validation passed.\n", stderr: "", exitCode: 0 });
    return;
  }
  const result = spawnSync("npm", ["run", "validate"], {
    cwd: siteRoot,
    shell: process.platform === "win32",
    encoding: "utf8"
  });
  res.json({
    ok: result.status === 0,
    stdout: result.stdout,
    stderr: result.stderr,
    exitCode: result.status ?? 1
  });
});

app.post("/api/generate", (_req, res) => {
  if (process.env.CMS_TEST_MODE === "1") {
    res.json({ ok: true, stdout: "Site generated (test mode).\n", stderr: "", exitCode: 0 });
    return;
  }
  const result = spawnSync("npm", ["run", "generate"], {
    cwd: siteRoot,
    shell: process.platform === "win32",
    encoding: "utf8"
  });
  res.json({
    ok: result.status === 0,
    stdout: result.stdout,
    stderr: result.stderr,
    exitCode: result.status ?? 1
  });
});

const clientDist = join(siteRoot, "cms", "dist");
if (existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get("*", (_req, res) => {
    res.sendFile(join(clientDist, "index.html"));
  });
}

app.listen(port, () => {
  if (!existsSync(join(siteRoot, "src", "content"))) {
    console.warn(`Warning: content directory not found at ${join(siteRoot, "src", "content")}`);
  }
  console.log(`CMS API listening on http://localhost:${port}`);
  console.log(`Site root: ${siteRoot}`);
});
