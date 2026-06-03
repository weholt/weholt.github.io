#!/usr/bin/env node
/**
 * Install dependencies for the Astro site and the local CMS.
 *
 * Usage (from repo root):
 *   node scripts/setup.mjs
 *   node scripts/setup.mjs --e2e
 *   npm run setup
 */
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const scriptsDir = dirname(fileURLToPath(import.meta.url));
const root = dirname(scriptsDir);
const cmsDir = join(root, "cms");

const args = new Set(process.argv.slice(2));
const withE2e = args.has("--e2e");
const skipRoot = args.has("--skip-root");
const skipCms = args.has("--skip-cms");

function requireCommand(name) {
  const check = spawnSync(name, ["--version"], { encoding: "utf8", shell: process.platform === "win32" });
  if (check.status !== 0) {
    console.error(`\n✗ "${name}" is required but was not found on PATH.\n`);
    process.exit(1);
  }
  const version = (check.stdout || check.stderr || "").trim().split("\n")[0];
  console.log(`  ${name}: ${version}`);
}

function npmInstall(label, cwd) {
  console.log(`\n▶ ${label}`);
  if (!existsSync(join(cwd, "package.json"))) {
    console.error(`✗ Missing package.json in ${cwd}`);
    process.exit(1);
  }
  const result = spawnSync("npm", ["install"], {
    cwd,
    stdio: "inherit",
    shell: process.platform === "win32"
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function printNextSteps() {
  console.log(`
✓ Setup complete.

Site (Astro):
  npm run dev          # http://localhost:4321
  npm run validate     # check content JSON/markdown
  npm run build        # production build

CMS (content editor):
  npm run cms          # UI http://localhost:5174  API http://localhost:3456
  cd cms && npm run dev

Optional:
  cd cms && npm run test:e2e     # CMS browser tests (after: npm run setup:e2e)
  npm run generate               # build static site into docs/ for GitHub Pages
`);
}

console.log("Weholt.org — project setup\n");
console.log("Checking tools…");
requireCommand("node");
requireCommand("npm");

if (!skipRoot) {
  npmInstall("Installing site dependencies (repo root)", root);
}

if (!skipCms) {
  if (!existsSync(cmsDir)) {
    console.error(`✗ CMS folder not found: ${cmsDir}`);
    process.exit(1);
  }
  npmInstall("Installing CMS dependencies (cms/)", cmsDir);
}

if (withE2e) {
  console.log("\n▶ Installing Playwright browser for CMS e2e tests");
  const e2e = spawnSync("npx", ["@playwright/cli", "install-browser", "chromium"], {
    cwd: cmsDir,
    stdio: "inherit",
    shell: process.platform === "win32"
  });
  if (e2e.status !== 0) {
    process.exit(e2e.status ?? 1);
  }
}

printNextSteps();
