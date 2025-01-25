const CACHE_NAME = 'v1';
const urlsToCache = [
  '/', // Cache root page
  '/index.html', // Cache the HTML
  '/static/js/bundle.js', // Cache your app's JavaScript
  '/static/js/main.chunk.js', // Add critical assets
  '/static/js/vendors~main.chunk.js',
  '/favicon.ico', // Cache favicon
  '/logo192.png', // Cache app logo
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
