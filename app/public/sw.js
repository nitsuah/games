// Minimal service worker that claims clients and provides basic offline installability
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', () => {
  // Claim clients so the service worker controls pages immediately after activation
  self.clients.claim();
});

// A simple fetch handler that falls back to network (keeps behavior minimal)
self.addEventListener('fetch', (event) => {
  // Do not intercept non-GET requests
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
