import path from "path";
import { fileURLToPath } from "url";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { viteSingleFile } from "vite-plugin-singlefile";
import { defineConfig } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

const entry = process.env.VITE_FRONTEND_ENTRY || "";
const outRoot = process.env.VITE_FRONTEND_OUT || "frontends";
const entryDir = path.join(projectRoot, "src", "frontends", entry);
const outDir = path.join(projectRoot, outRoot, entry);

if (!entry) {
  throw new Error("VITE_FRONTEND_ENTRY is required");
}

export default defineConfig({
  // Root must be the whole project so Tailwind v4 scans the real component
  // sources (src/pages, src/components, ...). Pinning just this entry's HTML
  // keeps each build output to a single standalone page.
  root: projectRoot,
  publicDir: false,
  base: "./",
  plugins: [react(), tailwindcss(), viteSingleFile()],
  resolve: {
    alias: {
      "@": path.join(projectRoot, "src"),
    },
  },
  build: {
    outDir,
    emptyOutDir: true,
    target: "es2020",
    assetsInlineLimit: 100000000,
    cssCodeSplit: false,
    rollupOptions: {
      input: path.join(entryDir, "index.html"),
    },
  },
});