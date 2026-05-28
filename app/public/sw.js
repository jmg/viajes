// Service worker offline-first sencillo. Cachea el app shell y los assets
// con estrategia stale-while-revalidate. Las llamadas a otros orígenes
// (ej: api.anthropic.com) nunca se cachean.
const CACHE = "viajes-v1";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // no cachear APIs externas

  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const cached = await cache.match(req);
      const network = fetch(req)
        .then((res) => {
          if (res && res.status === 200 && res.type === "basic") {
            cache.put(req, res.clone());
          }
          return res;
        })
        .catch(async () => {
          if (cached) return cached;
          if (req.mode === "navigate") {
            const shell = await cache.match("./");
            if (shell) return shell;
          }
          throw new Error("offline");
        });
      return cached || network;
    }),
  );
});
