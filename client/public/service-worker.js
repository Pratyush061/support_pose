const CACHE_NAME = 'pose-detection-v2'; // Update cache name for versioning
const urlsToCache = [
  '/', // Cache root page
  '/index.html', // Cache the HTML
  '/static/js/bundle.js', // Cache your app's JavaScript
  '/static/js/main.chunk.js', // Add critical assets
  '/static/js/vendors~main.chunk.js',
  '/favicon.ico', // Cache favicon
  '/logo192.png', // Cache app logo
];

// Pre-cache critical assets during the installation phase
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Precaching app shell...');
      return cache.addAll(urlsToCache);
    })
  );
});

// Stale-while-revalidate strategy for model files
self.addEventListener('fetch', (event) => {
  const url = event.request.url;

  // Apply special handling for model files
  if (url.includes('/model/')) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request)
          .then((networkResponse) => {
            return caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse.clone());
              console.log(`Model file updated: ${event.request.url}`);
              return networkResponse;
            });
          })
          .catch((error) => {
            console.error(`Network fetch failed for ${event.request.url}:`, error);
            return cachedResponse; // Fallback to cache if network fails
          });

        return cachedResponse || fetchPromise; // Serve cached first, then update
      })
    );
  } else {
    // Default cache-first strategy for other assets
    event.respondWith(
      caches.match(event.request).then((response) => {
        return (
          response ||
          fetch(event.request)
            .then((networkResponse) => {
              console.log(`Caching new resource: ${event.request.url}`);
              return caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, networkResponse.clone());
                return networkResponse;
              });
            })
            .catch((error) => {
              console.error(`Fetch failed for ${event.request.url}:`, error);
              throw error;
            })
        );
      })
    );
  }
});

// Activate event to clean up old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME]; // Whitelist current cache version
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
