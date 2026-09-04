import { readFileSync, existsSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const required = [
  "dist/index.html",
  "dist/styles.css",
  "dist/game.js",
  "dist/manifest.webmanifest",
  "dist/service-worker.js",
  "dist/icon-192.png",
  "dist/icon-512.png",
  "dist/ATTRIBUTION.md",
  "dist/LICENSE.md",
  "ATTRIBUTION.md",
  "LICENSE.md",
  "vercel.json",
  "docs/GAME_DESIGN_DOCUMENT.md",
  "docs/PROMPT_CODEX_CONTINUATION.md",
  "README.md"
];
let failed = false;
for (const relative of required) {
  const file = join(root, relative);
  if (!existsSync(file) || statSync(file).size < 20) {
    console.error(`Fichier manquant ou vide: ${relative}`);
    failed = true;
  }
}
const game = readFileSync(join(root, "dist/game.js"), "utf8");
const html = readFileSync(join(root, "dist/index.html"), "utf8");
const manifest = readFileSync(join(root, "dist/manifest.webmanifest"), "utf8");
const serviceWorker = readFileSync(join(root, "dist/service-worker.js"), "utf8");
const checks = [
  [game.includes("SCPGame"), "namespace compilé"],
  [game.includes("createNewGame"), "création de partie"],
  [game.includes("startCrisis"), "gestion de crise"],
  [game.includes("evaluateProcedureCompliance"), "procédures SCP"],
  [html.includes("game-canvas"), "canvas principal"],
  [html.includes("management-overlay"), "gestion multi-couches"],
  [html.includes("Attribution"), "crédits visibles"],
  [manifest.includes("icon-192.png") && manifest.includes("icon-512.png"), "icônes PWA PNG"],
  [serviceWorker.includes("ATTRIBUTION.md") && serviceWorker.includes("LICENSE.md"), "licence hors ligne"]
];
if (existsSync(join(root, "dist/game.js.map")) || game.includes("sourceMappingURL")) {
  console.error("Validation échouée: source map de production présente");
  failed = true;
}
for (const [ok, label] of checks) {
  if (!ok) {
    console.error(`Validation échouée: ${label}`);
    failed = true;
  }
}
if (failed) process.exit(1);
console.log("Validation structurelle réussie.");
