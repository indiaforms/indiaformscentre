const CACHE_NAME = "ifc-pwa-cache-v1";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
});

// A simple fetch handler that network-falls-back to cache, or just network first.
self.addEventListener("fetch", (event) => {
  // We can add actual caching strategies here if needed.
  // For basic PWA installation requirements, simply listening to fetch is enough.
});
