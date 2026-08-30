import { execFileSync } from "node:child_process";
import { copyFileSync, cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });

const localTsc = join(root, "node_modules", "typescript", "bin", "tsc");
if (existsSync(localTsc)) {
  execFileSync(process.execPath, [localTsc, "-p", join(root, "tsconfig.json")], {
    cwd: root,
    stdio: "inherit"
  });
} else {
  execFileSync("tsc", ["-p", join(root, "tsconfig.json")], {
    cwd: root,
    stdio: "inherit",
    shell: process.platform === "win32"
  });
}

copyFileSync(join(root, "index.html"), join(dist, "index.html"));
copyFileSync(join(root, "styles.css"), join(dist, "styles.css"));
cpSync(join(root, "public"), dist, { recursive: true });
console.log(`Build créé dans ${dist}`);
