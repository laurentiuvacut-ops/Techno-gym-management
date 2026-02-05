// A minimal service worker to enable PWA installability.
// This service worker doesn't do any caching, it just passes requests through to the network.
self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});
