import { execSync } from "node:child_process";
import { existsSync, readdirSync, renameSync, rmSync, mkdirSync } from "node:fs";
import path from "node:path";

const ENTRIES = [
  "landing",
  "workspace",
  "kiosk",
  "meeting",
  "modelstudio",
  "extensionpreview",
];

const outArg = process.argv.find((a) => a.startsWith("--out="));
const outRoot = outArg ? outArg.split("=")[1] : process.env.VITE_FRONTEND_OUT || "frontends";

const failed = [];
for (const entry of ENTRIES) {
  const html = `src/frontends/${entry}/index.html`;
  if (!existsSync(html)) {
    console.warn(`[skip] ${entry}: ${html} not found`);
    continue;
  }
  console.log(`\n── Building frontend: ${entry} ─────────────────`);
  rmSync(path.join(outRoot, entry), { recursive: true, force: true });
  try {
    execSync("npx vite build --config scripts/vite.frontend.config.ts", {
      env: { ...process.env, VITE_FRONTEND_ENTRY: entry, VITE_FRONTEND_OUT: outRoot },
      stdio: "inherit",
      cwd: process.cwd(),
    });
  } catch (err) {
    failed.push(entry);
    console.error(`✗ ${entry} failed`);
    continue;
  }

  // Vite keeps the entry's folder chain (root=project). Flatten the output back
  // to <outDir>/index.html so the result is double-clickable as before.
  const relChain = path.join(outRoot, entry, "src", "frontends", entry);
  const direct = path.join(outRoot, entry);
  if (existsSync(relChain)) {
    mkdirSync(direct, { recursive: true });
    for (const file of readdirSync(relChain)) {
      renameSync(path.join(relChain, file), path.join(direct, file));
    }
    rmSync(path.join(outRoot, entry, "src"), { recursive: true, force: true });
    console.log(`  → flattened ${entry} output`);
  }
}

console.log("\n──────────────────────────────────────────");
if (failed.length) {
  console.error(`✗ Failed: ${failed.join(", ")}`);
  process.exit(1);
}
console.log(`✓ All frontends built into /${outRoot}/<name>/index.html`);