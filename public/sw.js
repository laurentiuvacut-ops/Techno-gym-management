const CACHE_NAME = 'technogym-cache-v1';

// On install, cache the core assets.
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  // No pre-caching, will cache on fetch.
});

// On activate, clean up old caches.
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// On fetch, use a cache-first strategy.
self.addEventListener('fetch', (event) => {
  // Ignore non-GET requests.
  if (event.request.method !== 'GET') {
    return;
  }
  
  // For navigation requests, use network-first to get the latest page.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(event.request);
      })
    );
    return;
  }

  // For all other static assets, use cache-first.
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response; // Return from cache.
      }

      // Not in cache, so fetch from network.
      return fetch(event.request).then((response) => {
        // Check for a valid response.
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // Clone the response and add it to the cache.
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return response;
      });
    })
  );
});
