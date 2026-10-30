const CACHE = "scp-site-director-v1.0.0-r14";
const ASSETS = ["./", "./index.html", "./styles.css", "./game.js", "./manifest.webmanifest", "./icon.svg", "./icon-192.png", "./icon-512.png", "./ATTRIBUTION.md", "./LICENSE.md"];
self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});
self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))));
  self.clients.claim();
});
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const request = event.request;
  if (request.mode === "navigate") {
    event.respondWith(fetch(request).then(async (response) => {
      if (response.ok) {
        const cache = await caches.open(CACHE);
        await cache.put("./index.html", response.clone());
      }
      return response;
    }).catch(() => caches.match("./index.html")));
    return;
  }
  const refresh = fetch(request).then(async (response) => {
    if (response.ok) {
      const cache = await caches.open(CACHE);
      await cache.put(request, response.clone());
    }
    return response;
  });
  event.waitUntil(refresh.then(() => undefined).catch(() => undefined));
  event.respondWith(caches.match(request).then((cached) => cached || refresh));
});

