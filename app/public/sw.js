// Service worker offline-first.
//
// Estrategia por tipo de request:
//  - Navegaciones (HTML / app-shell): NETWORK-FIRST. Siempre intenta traer el
//    index.html fresco para que referencie los chunks con hash actuales. Evita el
//    "Failed to fetch dynamically imported module" cuando un deploy cambia los
//    hashes y el shell cacheado apuntaba a chunks que ya no existen.
//  - Assets con hash (/assets/*): CACHE-FIRST (contenido inmutable por su hash).
//  - Resto same-origin (icon, manifest, etc.): stale-while-revalidate.
//
// El nombre de caché lleva versión: al cambiarlo, el activate borra los viejos.
const CACHE = "viajes-v2";

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
  if (url.origin !== self.location.origin) return; // no cachear orígenes externos (APIs, etc.)

  // 1) Navegaciones → network-first (index.html siempre fresco).
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
          return res;
        })
        .catch(async () => {
          const cache = await caches.open(CACHE);
          return (await cache.match(req)) || (await cache.match("./")) || Response.error();
        }),
    );
    return;
  }

  // 2) Assets con hash → cache-first.
  if (url.pathname.includes("/assets/")) {
    event.respondWith(
      caches.open(CACHE).then(async (cache) => {
        const cached = await cache.match(req);
        if (cached) return cached;
        const res = await fetch(req);
        if (res && res.status === 200) cache.put(req, res.clone());
        return res;
      }),
    );
    return;
  }

  // 3) Resto same-origin → stale-while-revalidate.
  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const cached = await cache.match(req);
      const network = fetch(req)
        .then((res) => {
          if (res && res.status === 200 && res.type === "basic") cache.put(req, res.clone());
          return res;
        })
        .catch(() => cached);
      return cached || network;
    }),
  );
});
