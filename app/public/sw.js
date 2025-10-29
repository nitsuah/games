// Minimal service worker to satisfy Lighthouse service-worker audit
self.addEventListener('install', () => {
  // activate immediately
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
    fetch(event.request).catch(() => {
      // If cache match fails, return a valid Response to prevent TypeError
      return caches.match(event.request).then((response) => {
        if (response) {
          return response;
        }
        // Return a valid 404 Response instead of undefined
        return new Response('Not found', { 
          status: 404, 
          statusText: 'Not Found',
          headers: new Headers({
            'Content-Type': 'text/plain'
          })
        });
      });
    })
  );
});
