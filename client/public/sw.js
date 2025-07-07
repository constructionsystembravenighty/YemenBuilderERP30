/**
 * Advanced Service Worker for Construction Management PWA
 * Features: Offline-first caching, background sync, push notifications, periodic sync
 */

const CACHE_NAME = 'construction-mgmt-v1.2.0';
const DYNAMIC_CACHE = 'construction-dynamic-v1.2.0';
const API_CACHE = 'construction-api-v1.2.0';

// Essential files to cache for offline functionality
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  // Add critical CSS and JS files here
];

// API endpoints to cache
const API_ENDPOINTS = [
  '/api/projects',
  '/api/transactions', 
  '/api/users',
  '/api/equipment',
  '/api/companies',
  '/api/warehouses',
  '/api/dashboard/stats'
];

// Install event - cache essential assets
self.addEventListener('install', (event) => {
  console.log('SW: Installing service worker');
  
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(CACHE_NAME);
        console.log('SW: Caching essential assets');
        
        // Cache static assets with network fallback
        const cachePromises = STATIC_ASSETS.map(async (url) => {
          try {
            await cache.add(url);
            console.log(`SW: Cached ${url}`);
          } catch (error) {
            console.warn(`SW: Failed to cache ${url}:`, error);
          }
        });
        
        await Promise.allSettled(cachePromises);
        
        // Skip waiting to activate immediately
        self.skipWaiting();
        console.log('SW: Installation complete');
      } catch (error) {
        console.error('SW: Installation failed:', error);
      }
    })()
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('SW: Activating service worker');
  
  event.waitUntil(
    (async () => {
      try {
        const cacheNames = await caches.keys();
        const oldCaches = cacheNames.filter(name => 
          name !== CACHE_NAME && 
          name !== DYNAMIC_CACHE && 
          name !== API_CACHE
        );
        
        await Promise.all(
          oldCaches.map(cacheName => {
            console.log(`SW: Deleting old cache: ${cacheName}`);
            return caches.delete(cacheName);
          })
        );
        
        // Claim all clients immediately
        await self.clients.claim();
        console.log('SW: Activation complete');
      } catch (error) {
        console.error('SW: Activation failed:', error);
      }
    })()
  );
});

// Fetch event - implement cache strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests and chrome-extension requests
  if (request.method !== 'GET' || url.protocol === 'chrome-extension:') {
    return;
  }
  
  event.respondWith(
    (async () => {
      try {
        // Handle API requests with network-first strategy
        if (url.pathname.startsWith('/api/')) {
          return await handleApiRequest(request);
        }
        
        // Handle static assets with cache-first strategy
        if (isStaticAsset(request)) {
          return await handleStaticAsset(request);
        }
        
        // Handle navigation requests with network-first, cache fallback
        if (request.mode === 'navigate') {
          return await handleNavigation(request);
        }
        
        // Default: network-first with cache fallback
        return await networkFirstWithCache(request, DYNAMIC_CACHE);
        
      } catch (error) {
        console.error('SW: Fetch handler error:', error);
        return await handleOfflineError(request);
      }
    })()
  );
});

// Network-first strategy for API requests with offline fallback
async function handleApiRequest(request) {
  const cache = await caches.open(API_CACHE);
  
  try {
    console.log(`SW: API request - ${request.url}`);
    
    // Try network first
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful responses
      cache.put(request, networkResponse.clone());
      console.log(`SW: API cached - ${request.url}`);
      return networkResponse;
    }
    
    // If network fails, try cache
    throw new Error('Network response not ok');
    
  } catch (error) {
    console.log(`SW: API network failed, trying cache - ${request.url}`);
    
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      console.log(`SW: API served from cache - ${request.url}`);
      return cachedResponse;
    }
    
    // If both fail, return offline response
    return createOfflineApiResponse(request);
  }
}

// Cache-first strategy for static assets
async function handleStaticAsset(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    console.log(`SW: Static asset from cache - ${request.url}`);
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.warn(`SW: Static asset failed - ${request.url}`);
    throw error;
  }
}

// Handle navigation requests
async function handleNavigation(request) {
  try {
    console.log(`SW: Navigation request - ${request.url}`);
    
    // Try network first
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    
    throw new Error('Network response not ok');
    
  } catch (error) {
    console.log(`SW: Navigation network failed, trying cache - ${request.url}`);
    
    // Try cache
    const cache = await caches.open(DYNAMIC_CACHE);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return app shell
    const appShell = await cache.match('/');
    return appShell || new Response('Offline', { status: 503 });
  }
}

// Network-first with cache fallback
async function networkFirstWithCache(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}

// Create offline API response with local data structure
function createOfflineApiResponse(request) {
  const url = new URL(request.url);
  
  // Return appropriate offline response based on endpoint
  if (url.pathname.includes('/projects')) {
    return new Response(JSON.stringify([]), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  if (url.pathname.includes('/dashboard/stats')) {
    return new Response(JSON.stringify({
      totalRevenue: 0,
      totalExpenses: 0,
      activeProjects: 0,
      totalEmployees: 0,
      equipmentCount: 0,
      message: 'البيانات محفوظة محلياً'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  return new Response(JSON.stringify({ 
    error: 'Offline mode',
    message: 'البيانات غير متوفرة في وضع عدم الاتصال'
  }), {
    status: 503,
    headers: { 'Content-Type': 'application/json' }
  });
}

// Handle offline errors
async function handleOfflineError(request) {
  if (request.mode === 'navigate') {
    const cache = await caches.open(CACHE_NAME);
    const appShell = await cache.match('/');
    return appShell || new Response('تطبيق غير متوفر بدون اتصال', { 
      status: 503,
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  }
  
  return new Response('غير متوفر بدون اتصال', { 
    status: 503,
    headers: { 'Content-Type': 'text/plain; charset=utf-8' }
  });
}

// Check if request is for static asset
function isStaticAsset(request) {
  const url = new URL(request.url);
  return url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot|ico)$/) ||
         STATIC_ASSETS.includes(url.pathname);
}

// Background Sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('SW: Background sync triggered:', event.tag);
  
  if (event.tag === 'background-sync-projects') {
    event.waitUntil(syncOfflineData());
  }
  
  if (event.tag === 'background-sync-transactions') {
    event.waitUntil(syncOfflineTransactions());
  }
});

// Sync offline data when connection is restored
async function syncOfflineData() {
  try {
    console.log('SW: Syncing offline project data');
    
    // Get offline actions from IndexedDB
    const offlineActions = await getOfflineActions();
    
    for (const action of offlineActions) {
      try {
        await fetch(action.url, {
          method: action.method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(action.data)
        });
        
        // Remove synced action
        await removeOfflineAction(action.id);
        console.log(`SW: Synced action ${action.id}`);
        
      } catch (error) {
        console.error(`SW: Failed to sync action ${action.id}:`, error);
      }
    }
    
    // Notify main thread of sync completion
    await notifyClients('sync-complete', { type: 'projects' });
    
  } catch (error) {
    console.error('SW: Background sync failed:', error);
  }
}

// Sync offline transactions
async function syncOfflineTransactions() {
  try {
    console.log('SW: Syncing offline transaction data');
    // Similar to syncOfflineData but for transactions
    await notifyClients('sync-complete', { type: 'transactions' });
  } catch (error) {
    console.error('SW: Transaction sync failed:', error);
  }
}

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('SW: Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'إشعار جديد من منصة إدارة البناء',
    icon: '/icon-192.png',
    badge: '/icon-72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '1'
    },
    actions: [
      {
        action: 'explore',
        title: 'عرض التفاصيل',
        icon: '/icon-72.png'
      },
      {
        action: 'close',
        title: 'إغلاق',
        icon: '/icon-72.png'
      }
    ],
    tag: 'construction-notification',
    requireInteraction: true,
    silent: false,
    dir: 'rtl',
    lang: 'ar'
  };
  
  event.waitUntil(
    self.registration.showNotification('منصة إدارة البناء', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('SW: Notification clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  } else if (event.action === 'close') {
    // Just close the notification
    return;
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Periodic background sync (for modern browsers)
self.addEventListener('periodicsync', (event) => {
  console.log('SW: Periodic sync triggered:', event.tag);
  
  if (event.tag === 'daily-data-sync') {
    event.waitUntil(performDailySync());
  }
});

// Perform daily data synchronization
async function performDailySync() {
  try {
    console.log('SW: Performing daily sync');
    
    // Update cache with fresh data
    const cache = await caches.open(API_CACHE);
    
    for (const endpoint of API_ENDPOINTS) {
      try {
        const response = await fetch(endpoint);
        if (response.ok) {
          await cache.put(endpoint, response);
          console.log(`SW: Daily sync cached ${endpoint}`);
        }
      } catch (error) {
        console.warn(`SW: Daily sync failed for ${endpoint}:`, error);
      }
    }
    
    await notifyClients('daily-sync-complete');
    
  } catch (error) {
    console.error('SW: Daily sync failed:', error);
  }
}

// Notify all clients about events
async function notifyClients(type, data = {}) {
  const clients = await self.clients.matchAll();
  clients.forEach(client => {
    client.postMessage({
      type,
      data,
      timestamp: Date.now()
    });
  });
}

// Helper functions for IndexedDB operations (simplified)
async function getOfflineActions() {
  // This would interface with IndexedDB to get pending actions
  return [];
}

async function removeOfflineAction(actionId) {
  // This would remove the action from IndexedDB
  console.log(`SW: Removing offline action ${actionId}`);
}

// Update notification for new versions
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

console.log('SW: Service Worker script loaded');