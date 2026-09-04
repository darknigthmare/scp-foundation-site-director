import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)), process.argv.includes("--dist") ? "dist" : "dist");
const portArg = process.argv.find((arg) => arg.startsWith("--port="));
const port = Number(portArg?.split("=")[1] ?? process.env.PORT ?? 4173);
const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".md": "text/markdown; charset=utf-8"
};

createServer((request, response) => {
  const method = request.method ?? "GET";
  if (method !== "GET" && method !== "HEAD") {
    response.writeHead(405, { "Content-Type": "text/plain; charset=utf-8", "Allow": "GET, HEAD", "Cache-Control": "no-store" });
    response.end("Méthode non autorisée.");
    return;
  }
  let rawPath;
  try {
    rawPath = decodeURIComponent(new URL(request.url ?? "/", "http://127.0.0.1").pathname);
  } catch {
    response.writeHead(400, { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" });
    response.end("URL invalide.");
    return;
  }
  if (rawPath.includes("\0")) {
    response.writeHead(400, { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" });
    response.end("Chemin invalide.");
    return;
  }
  const relativePath = rawPath === "/" ? "index.html" : rawPath.replace(/^[/\\]+/, "");
  let filePath = resolve(root, relativePath);
  const rootPrefix = root.endsWith(sep) ? root : `${root}${sep}`;
  if (filePath !== root && !filePath.startsWith(rootPrefix)) {
    response.writeHead(400, { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" });
    response.end("Chemin invalide.");
    return;
  }
  if (existsSync(filePath) && statSync(filePath).isDirectory()) filePath = join(filePath, "index.html");
  if (!existsSync(filePath) || !statSync(filePath).isFile()) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" });
    response.end("Fichier introuvable.");
    return;
  }
  const extension = extname(filePath);
  const size = statSync(filePath).size;
  response.writeHead(200, {
    "Content-Type": mime[extension] ?? "application/octet-stream",
    "Content-Length": size,
    "Cache-Control": "no-cache",
    "X-Content-Type-Options": "nosniff"
  });
  if (method === "HEAD") response.end();
  else createReadStream(filePath).pipe(response);
}).listen(port, "127.0.0.1", () => {
  console.log(`SCP Site Director: http://127.0.0.1:${port}`);
});
