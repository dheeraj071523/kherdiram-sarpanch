// ============================================================
// Service Worker - प्रभु दयाल कुमावत (ग्राम पंचायत खेड़ीराम) Campaign PWA
// Handles offline caching so the site loads fast and works
// even on weak/no internet connection in the village.
// ============================================================

const CACHE_NAME = "kherdiram-sarpanch-cache-v4";

// Bump CACHE_NAME (e.g. -v5) whenever you update files, so users
// automatically get the fresh version instead of a stale cached copy.
// NOTE: this mainly matters for images/icons. The pages themselves are
// fetched network-first below, so they self-update on every online visit
// regardless of this version number — see index.html's registration code
// for the piece that forces the browser to check for a new sw.js quickly
// instead of waiting for its normal ~24 hour update-check throttle.

const OFFLINE_URL = "./offline.html";

const PRECACHE_URLS = [
  "./",
  "./index.html",
  "./about.html",
  "./news-updates.html",
  "./contact.html",
  "./privacy-policy.html",
  "./disclaimer.html",
  "./terms-and-conditions.html",
  "./offline.html",
  "./manifest.json",
  "./candidate-photo.jpg",
  "./candidate-logo.png",
  "./icon-192.png",
  "./icon-512.png"
];
// NOTE: admin-activities.html and manifest-admin.json are intentionally
// NOT in this list — there's no benefit to pre-loading the admin tool for
// every regular visitor, so it only gets cached if/when someone actually opens it.

// ---------- INSTALL: pre-cache core files ----------
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS).catch((err) => {
        // Don't fail install if an optional asset (e.g. photo not uploaded yet) is missing
        console.warn("Precache warning:", err);
      }))
      .then(() => self.skipWaiting())
  );
});

// ---------- ACTIVATE: clean up old caches, take control immediately ----------
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// ---------- FETCH: network-first for HTML, cache-first for assets ----------
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Only handle GET requests
  if (request.method !== "GET") return;

  // Don't cache calls to the Google Apps Script backend (form submissions)
  if (request.url.includes("script.google.com")) return;

  const isHTML = request.mode === "navigate" ||
    (request.headers.get("accept") || "").includes("text/html");

  if (isHTML) {
    // Network-first: always try to fetch the latest page. If that fails
    // (genuinely offline), fall back to the exact cached page, then to
    // cached index.html, and only as an absolute last resort — if nothing
    // at all has ever been cached on this device — a dedicated offline page.
    event.respondWith(
      fetch(request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          return response;
        })
        .catch(() =>
          caches.match(request)
            .then((cached) => cached || caches.match("./index.html"))
            .then((cached) => cached || caches.match(OFFLINE_URL))
        )
    );
  } else {
    // Cache-first for images, fonts, CSS, JS, etc. — fast repeat loads
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          return response;
        }).catch(() => cached);
      })
    );
  }
});