import path from "path";
import { fileURLToPath } from "url";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { viteSingleFile } from "vite-plugin-singlefile";
import { defineConfig } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

const entry = process.env.VITE_FRONTEND_ENTRY || "";
const entryDir = path.join(projectRoot, "src", "frontends", entry);
const outDir = path.join(projectRoot, "frontends", entry);

if (!entry) {
  throw new Error("VITE_FRONTEND_ENTRY is required");
}

export default defineConfig({
  root: entryDir,
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
  },
});