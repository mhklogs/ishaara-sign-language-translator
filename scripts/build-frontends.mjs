import { execSync } from "node:child_process";
import { existsSync } from "node:fs";

const ENTRIES = [
  "landing",
  "workspace",
  "kiosk",
  "meeting",
  "modelstudio",
  "extensionpreview",
];

const failed = [];
for (const entry of ENTRIES) {
  const html = `src/frontends/${entry}/index.html`;
  if (!existsSync(html)) {
    console.warn(`[skip] ${entry}: ${html} not found`);
    continue;
  }
  console.log(`\n── Building frontend: ${entry} ─────────────────`);
  try {
    execSync("npx vite build --config scripts/vite.frontend.config.ts", {
      env: { ...process.env, VITE_FRONTEND_ENTRY: entry },
      stdio: "inherit",
      cwd: process.cwd(),
    });
  } catch (err) {
    failed.push(entry);
    console.error(`✗ ${entry} failed`);
  }
}

console.log("\n──────────────────────────────────────────");
if (failed.length) {
  console.error(`✗ Failed: ${failed.join(", ")}`);
  process.exit(1);
}
console.log("✓ All frontends built into /frontends/<name>/index.html");