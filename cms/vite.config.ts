import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

function spaFallback(): Plugin {
  return {
    name: "spa-fallback",
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        const url = req.url?.split("?")[0] ?? "";
        if (
          url.startsWith("/api") ||
          url.startsWith("/media/") ||
          url.startsWith("/@") ||
          url.startsWith("/src") ||
          url.startsWith("/node_modules") ||
          /\.[a-z0-9]+$/i.test(url)
        ) {
          next();
          return;
        }
        if (url !== "/" && url !== "/index.html") {
          req.url = "/";
        }
        next();
      });
    }
  };
}

export default defineConfig({
  appType: "spa",
  plugins: [react(), spaFallback()],
  server: {
    port: Number(process.env.CMS_UI_PORT || 5174),
    strictPort: !!process.env.CMS_UI_PORT,
    proxy: {
      "/api": `http://localhost:${process.env.CMS_PORT || 3456}`,
      "/media": `http://localhost:${process.env.CMS_PORT || 3456}`
    }
  },
  build: {
    outDir: "dist"
  }
});
