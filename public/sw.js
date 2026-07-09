// public/sw.js
const CACHE_NAME = 'sasl-v1-cache';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/src/main.tsx',
  '/models/sasl_transformer_quantized.tflite', // The core 500-sign baseline model layer
  '/animations/hello.glb',
  '/animations/thank_you.glb'
];

// Installation phase: Lock static asset bundles in memory cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activation phase: Clean outdated historical schemas
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      );
    })
  );
  self.clients.claim();
});

// Intercept routing streams: Cache-first validation strategy for fast execution
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse; // Instantly return resource from cache if offline
      }
      return fetch(event.request).then((networkResponse) => {
        // Cache newly discovered network files dynamically
        if (event.request.method === 'GET' && networkResponse.status === 200) {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        }
        return networkResponse;
      });
    }).catch(() => {
      // Fallback routing logic if connection fails completely
    })
  );
});
