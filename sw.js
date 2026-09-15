// ============================================================
// Service Worker - प्रभु दयाल कुमावत (ग्राम पंचायत खेड़ीराम) Campaign PWA
// Handles offline caching so the site loads fast and works
// even on weak/no internet connection in the village.
// ============================================================

const CACHE_NAME = "kherdiram-sarpanch-cache-v5";

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

  // Don't cache jsDelivr requests (activities data/images) — index.html already
  // has its own freshness-check logic (fetch + updatedAt comparison) for this
  // data, and letting the service worker cache-first it too would silently
  // re-serve stale activity data even after a successful update check.
  if (request.url.includes("jsdelivr.net")) return;

  const isHTML = request.mode === "navigate" ||
    (request.headers.get("accept") || "").includes("text/html");

  if (isHTML) {
    // Network-first: always try to fetch the latest page. If that fails
    // (genuinely offline), fall back to the exact cached page, then to
    // cached index.html, then to a dedicated offline page — and if truly
    // nothing has ever been cached on this device, a minimal inline page
    // as an absolute last resort, so respondWith() never receives
    // "undefined" (which the browser shows as its own native error page
    // instead of anything we control).
    event.respondWith(
      fetch(request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          return response;
        })
        .catch(async () => {
          const exact = await caches.match(request);
          if (exact) return exact;
          const home = await caches.match("./index.html");
          if (home) return home;
          const offline = await caches.match(OFFLINE_URL);
          if (offline) return offline;
          return new Response(
            '<!DOCTYPE html><html lang="hi"><head><meta charset="UTF-8">' +
            '<meta name="viewport" content="width=device-width, initial-scale=1.0">' +
            '<title>ऑफ़लाइन</title></head>' +
            '<body style="margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;' +
            'text-align:center;padding:24px;font-family:Arial,sans-serif;background:#8C1523;color:#fff;">' +
            '<div><h1 style="font-size:1.3rem;">आप अभी इंटरनेट से जुड़े नहीं हैं</h1>' +
            '<p style="color:rgba(255,255,255,0.75);">कृपया इंटरनेट से जुड़कर एक बार साइट खोलें, ' +
            'ताकि यह आगे से बिना इंटरनेट भी खुल सके।</p>' +
            '<button onclick="location.reload()" style="margin-top:10px;padding:12px 28px;border:none;' +
            'border-radius:999px;background:linear-gradient(90deg,#E08E1E,#F5B94A);color:#fff;' +
            'font-weight:700;font-size:1rem;">फिर से कोशिश करें</button></div></body></html>',
            { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } }
          );
        })
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
        }).catch(() => cached || new Response("", { status: 504, statusText: "Offline" }));
      })
    );
  }
});