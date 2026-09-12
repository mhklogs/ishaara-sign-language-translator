import { fileURLToPath } from "url";
import path from "path";
import { cpSync, mkdirSync, existsSync } from "fs";
import type { Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = __dirname;
const SRC = path.resolve(__dirname, "../src");
const DIST = path.join(ROOT, "dist");

const STATIC_FILES = ["manifest.json", "player.html", "player.css", "content.js", "background.js"];

function copyStatic(): Plugin {
  return {
    name: "ishaara-extension-copy-static",
    closeBundle() {
      mkdirSync(DIST, { recursive: true });
      for (const file of STATIC_FILES) {
        const from = path.join(ROOT, file);
        if (!existsSync(from)) continue;
        cpSync(from, path.join(DIST, file));
      }
      const icons = path.join(ROOT, "icons");
      if (existsSync(icons)) cpSync(icons, path.join(DIST, "icons"), { recursive: true });
    },
  };
}

export default defineConfig({
  root: ROOT,
  plugins: [react(), copyStatic()],
  resolve: {
    alias: {
      "@": SRC,
    },
  },
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    minify: "esbuild",
    sourcemap: false,
    target: "es2020",
    lib: false,
    rollupOptions: {
      input: path.join(ROOT, "player.tsx"),
      output: {
        format: "iife",
        entryFileNames: () => "player.js",
        assetFileNames: () => "player.css",
      },
    },
  },
});