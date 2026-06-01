import { defineConfig } from "astro/config";

const site = process.env.PUBLIC_SITE_URL || "https://weholt.github.io";
const base = process.env.PUBLIC_BASE_PATH || "/";

export default defineConfig({
  site,
  base,
  outDir: "docs",
  output: "static",
  markdown: {
    shikiConfig: {
      theme: "github-dark"
    }
  }
});
