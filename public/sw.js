const CACHE_NAME = 'ipc-v2-enhanced';
const STATIC_CACHE = 'ipc-static-v2';
const DYNAMIC_CACHE = 'ipc-dynamic-v2';
const API_CACHE = 'ipc-api-v2';

const urlsToCache = [
  '/',
  '/security',
  '/architecture-analysis', 
  '/submittals',
  '/projects',
  '/vba',
  '/notifications',
  '/dashboard',
  '/_next/static/css/',
  '/_next/static/js/',
  '/_next/static/chunks/',
  '/manifest.json',
  '/favicon.ico'
];

const apiEndpoints = [
  '/api/system-metrics',
  '/api/security-events',
  '/api/performance-metrics',
  '/api/vba-projects',
  '/api/projects',
  '/api/notifications'
];

const CACHE_STRATEGIES = {
  NETWORK_FIRST: 'network-first',
  CACHE_FIRST: 'cache-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
  NETWORK_ONLY: 'network-only',
  CACHE_ONLY: 'cache-only'
};

// IndexedDB utilities for offline data
const IDB_NAME = 'ipc-offline-db';
const IDB_VERSION = 1;
const STORES = {
  PROJECTS: 'projects',
  VBA_PROJECTS: 'vba_projects',
  NOTIFICATIONS: 'notifications',
  OFFLINE_ACTIONS: 'offline_actions',
  METRICS: 'metrics'
};

// Initialize IndexedDB
function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(IDB_NAME, IDB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      Object.values(STORES).forEach(storeName => {
        if (!db.objectStoreNames.contains(storeName)) {
          const store = db.createObjectStore(storeName, { keyPath: 'id', autoIncrement: true });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          if (storeName === STORES.OFFLINE_ACTIONS) {
            store.createIndex('status', 'status', { unique: false });
          }
        }
      });
    };
  });
}

// Install service worker and cache resources
self.addEventListener('install', event => {
  console.log('Service Worker: Installing enhanced version v2');
  event.waitUntil(
    Promise.all([
      // Initialize IndexedDB
      initDB(),
      // Cache static resources
      caches.open(STATIC_CACHE).then(cache => {
        console.log('Service Worker: Caching static resources');
        return cache.addAll(urlsToCache);
      }),
      // Pre-cache API endpoints
      caches.open(API_CACHE).then(cache => {
        console.log('Service Worker: Pre-caching API endpoints');
        return Promise.allSettled(
          apiEndpoints.map(endpoint => 
            fetch(endpoint).then(response => {
              if (response.ok) {
                cache.put(endpoint, response.clone());
              }
            }).catch(err => console.log(`Failed to pre-cache ${endpoint}:`, err))
          )
        );
      })
    ])
  );
  self.skipWaiting();
});

// Activate service worker and clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker: Activating enhanced version v2');
  const currentCaches = [STATIC_CACHE, DYNAMIC_CACHE, API_CACHE];
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (!currentCaches.includes(cacheName)) {
              console.log('Service Worker: Clearing old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Initialize background sync
      self.registration.sync.register('sync-offline-actions')
    ])
  );
  self.clients.claim();
});

// Enhanced fetch handler with multiple caching strategies
self.addEventListener('fetch', event => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  const url = new URL(event.request.url);
  
  // Determine caching strategy based on request type
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(event.request));
  } else if (url.pathname.includes('/_next/static/')) {
    event.respondWith(handleStaticAssets(event.request));
  } else if (url.pathname.match(/\.(png|jpg|jpeg|svg|gif|webp|ico)$/)) {
    event.respondWith(handleImages(event.request));
  } else {
    event.respondWith(handleNavigation(event.request));
  }
});

// Network-first strategy for API calls with offline fallback
async function handleApiRequest(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful API responses
      const cache = await caches.open(API_CACHE);
      cache.put(request, networkResponse.clone());
      
      // Store data in IndexedDB for offline access
      if (request.method === 'GET') {
        storeDataOffline(request.url, await networkResponse.clone().json());
      }
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Network failed, trying cache for:', request.url);
    
    // Try cache first
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Try IndexedDB for critical data
    const offlineData = await getOfflineData(request.url);
    if (offlineData) {
      return new Response(JSON.stringify(offlineData), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Return offline fallback
    return new Response(JSON.stringify({ 
      error: 'Offline', 
      message: 'This data is not available offline',
      offline: true 
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Cache-first strategy for static assets
async function handleStaticAssets(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  const networkResponse = await fetch(request);
  if (networkResponse.ok) {
    const cache = await caches.open(STATIC_CACHE);
    cache.put(request, networkResponse.clone());
  }
  
  return networkResponse;
}

// Stale-while-revalidate for images
async function handleImages(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cachedResponse = await cache.match(request);
  
  // Return cached version immediately if available
  const fetchPromise = fetch(request).then(networkResponse => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => cachedResponse);
  
  return cachedResponse || fetchPromise;
}

// Network-first with offline page fallback for navigation
async function handleNavigation(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page for navigation requests
    return caches.match('/') || new Response('Offline', { status: 503 });
  }
}

// IndexedDB helper functions
async function storeDataOffline(url, data) {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORES.METRICS], 'readwrite');
    const store = transaction.objectStore(STORES.METRICS);
    
    await store.put({
      url,
      data,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Failed to store offline data:', error);
  }
}

async function getOfflineData(url) {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORES.METRICS], 'readonly');
    const store = transaction.objectStore(STORES.METRICS);
    const index = store.index('timestamp');
    
    return new Promise((resolve) => {
      const request = store.get(url);
      request.onsuccess = () => {
        resolve(request.result?.data);
      };
      request.onerror = () => resolve(null);
    });
  } catch (error) {
    console.error('Failed to get offline data:', error);
    return null;
  }
}

// Background Sync for offline actions
self.addEventListener('sync', event => {
  if (event.tag === 'sync-offline-actions') {
    event.waitUntil(syncOfflineActions());
  }
});

async function syncOfflineActions() {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORES.OFFLINE_ACTIONS], 'readwrite');
    const store = transaction.objectStore(STORES.OFFLINE_ACTIONS);
    const index = store.index('status');
    
    return new Promise((resolve) => {
      const request = index.getAll('pending');
      request.onsuccess = async () => {
        const pendingActions = request.result;
        
        for (const action of pendingActions) {
          try {
            const response = await fetch(action.url, {
              method: action.method,
              headers: action.headers,
              body: action.body
            });
            
            if (response.ok) {
              // Mark as completed
              action.status = 'completed';
              action.completedAt = Date.now();
              store.put(action);
              
              // Notify client of successful sync
              self.clients.matchAll().then(clients => {
                clients.forEach(client => {
                  client.postMessage({
                    type: 'SYNC_SUCCESS',
                    action: action
                  });
                });
              });
            }
          } catch (error) {
            console.error('Failed to sync action:', error);
            action.retryCount = (action.retryCount || 0) + 1;
            if (action.retryCount >= 3) {
              action.status = 'failed';
            }
            store.put(action);
          }
        }
        resolve();
      };
    });
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Push notification handler
self.addEventListener('push', event => {
  const options = {
    body: event.data?.text() || 'New notification from IPC System',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    data: event.data?.json() || {},
    actions: [
      {
        action: 'view',
        title: 'View',
        icon: '/icons/view.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/icons/dismiss.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('IPC System', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow(event.notification.data.url || '/')
    );
  }
});

// Performance monitoring
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'PERFORMANCE_METRICS') {
    // Store performance data for analytics
    storeDataOffline('/performance-metrics', {
      metrics: event.data.metrics,
      timestamp: Date.now(),
      userAgent: navigator.userAgent
    });
  }
});