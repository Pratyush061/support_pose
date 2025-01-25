const CACHE_NAME = 'v1';
const urlsToCache = [
  '/', // Cache root page
  '/index.html', // Cache the HTML
  '/static/js/bundle.js', // Cache your app's JavaScript
  '/static/js/main.chunk.js', // Add critical assets
  '/static/js/vendors~main.chunk.js',
  '/favicon.ico', // Cache favicon
  '/logo192.png', // Cache app logo
  '/model/model.json', // Cache TensorFlow.js model
  '/model/group1-shard1of1.bin', // Add binary shard files
  // Add additional shards here if applicable
];

// Install event: Cache specified files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Caching app shell and model files...');
      return cache.addAll(urlsToCache);
    })
  );
});

// Fetch event: Serve files from cache; fallback to network
self.addEventListener('fetch', (event) => {
  const url = event.request.url;

  // Cache-first strategy for model files
  if (url.includes('/model/')) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        return (
          cachedResponse ||
          fetch(event.request).then((networkResponse) => {
            return caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse.clone());
              return networkResponse;
            });
          })
        );
      })
    );
  } else {
    // Default behavior for other assets
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  }
});

// Activate event: Clean up old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            console.log(`Deleting old cache: ${cacheName}`);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
