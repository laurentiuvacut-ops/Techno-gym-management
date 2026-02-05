// A minimal service worker to meet the PWA installability criteria.
// It includes a fetch handler, which is required by most browsers.

self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  // Instantly activate the new service worker
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  // Take control of all open pages as soon as the service worker is activated
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // This is the crucial part. The browser needs to see a fetch event
  // listener to consider the app installable.
  // This basic strategy just passes the request through to the network.
  event.respondWith(fetch(event.request));
});
