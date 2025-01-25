self.addEventListener('install', (event) => {
    event.waitUntil(
      caches.open('static-v1').then((cache) => {
        return cache.addAll([
          '/',
          '/index.html',
          '/static/js/bundle.js',
          '/static/js/main.chunk.js',
          '/static/js/0.chunk.js',
          '/static/css/main.chunk.css',
          'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-core',
          'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-converter',
          'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-webgl',
          'https://cdn.jsdelivr.net/npm/@tensorflow-models/pose-detection'
        ]);
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