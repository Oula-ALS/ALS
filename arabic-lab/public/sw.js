// Alsama Arabic Lab offline helper (service worker).
// - Pages: fresh from the internet when online; the saved copy when offline.
// - App files (/_next/static, images, icons): saved once, reused (their names change when they change).
// - "warm" message: saves every page listed in /offline-pages.json plus the files they need,
//   then removes old app files that no page uses any more.
// - API calls (/api/...) are never saved: they always need the internet.

const PAGES = "alsama-pages-v1";
const ASSETS = "alsama-assets-v1";
const KEEP = [PAGES, ASSETS];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(PAGES)
      .then((c) => c.addAll(["/offline", "/home"]))
      .catch(() => {})
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => !KEEP.includes(k)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

const isAsset = (url) =>
  url.pathname.startsWith("/_next/static/") ||
  url.pathname.startsWith("/_next/image") ||
  url.pathname.startsWith("/brand/") ||
  /^\/(icon|apple-icon)[^/]*\.png$/.test(url.pathname) ||
  url.pathname === "/manifest.webmanifest";

// Saved pages are keyed by path only, so "/home?x=1" and "/home" share one copy.
const pageKey = (url) => new Request(url.origin + url.pathname);

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith("/api/")) return;

  // Page data for in-app navigation. If it fails offline, Next.js falls back to a
  // full page load, which the "navigate" branch below answers from the saved pages.
  if (req.headers.get("RSC") === "1" || url.searchParams.has("_rsc")) return;

  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(PAGES).then((c) => c.put(pageKey(url), copy));
          }
          return res;
        })
        .catch(async () => {
          const cache = await caches.open(PAGES);
          return (await cache.match(pageKey(url))) || (await cache.match("/offline")) || Response.error();
        }),
    );
    return;
  }

  if (isAsset(url)) {
    event.respondWith(
      caches.open(ASSETS).then(async (cache) => {
        const hit = await cache.match(req);
        if (hit) return hit;
        const res = await fetch(req);
        if (res.ok) cache.put(req, res.clone());
        return res;
      }),
    );
  }
});

async function warm() {
  const list = await fetch("/offline-pages.json", { cache: "no-store" }).then((r) => r.json());
  const pages = await caches.open(PAGES);
  const assets = await caches.open(ASSETS);
  const used = new Set();

  for (const path of list.pages) {
    try {
      const res = await fetch(path, { cache: "no-store" });
      if (!res.ok) continue;
      const html = await res.clone().text();
      await pages.put(new Request(self.location.origin + path), res);
      for (const m of html.matchAll(/\/_next\/static\/[^"'\s)\\]+/g)) used.add(m[0]);
    } catch {
      return; // offline or interrupted: try again next time
    }
  }

  for (const path of used) {
    if (await assets.match(path)) continue;
    try {
      const res = await fetch(path);
      if (res.ok) await assets.put(path, res);
    } catch {
      return;
    }
  }

  // Remove app files from older versions that no current page uses.
  for (const req of await assets.keys()) {
    const p = new URL(req.url).pathname;
    if (p.startsWith("/_next/static/") && (p.endsWith(".js") || p.endsWith(".css")) && !used.has(p)) await assets.delete(req);
  }
}

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "warm") event.waitUntil(warm().catch(() => {}));
});
