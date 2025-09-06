const CACHE_NAME = 'ipc-v1';
const urlsToCache = [
  '/',
  '/security',
  '/architecture-analysis', 
  '/submittals',
  '/projects',
  '/vba',
  '/_next/static/css/',
  '/_next/static/js/',
  '/_next/static/chunks/',
  '/api/system-metrics',
  '/api/security-events'
];

// Install service worker and cache resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching app shell');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// Activate service worker and clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Clearing old cache');
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache first, then network
self.addEventListener('fetch', event => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        if (response) {
          // For API calls, also fetch fresh data in background
          if (event.request.url.includes('/api/')) {
            fetch(event.request).then(networkResponse => {
              if (networkResponse.ok) {
                const responseClone = networkResponse.clone();
                caches.open(CACHE_NAME).then(cache => {
                  cache.put(event.request, responseClone);
                });
              }
            });
          }
          return response;
        }
        
        return fetch(event.request).then(networkResponse => {
          // Don't cache if not a good response
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
          }

          const responseToCache = networkResponse.clone();
          
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });

          return networkResponse;
        });
      }
    )
  );
});