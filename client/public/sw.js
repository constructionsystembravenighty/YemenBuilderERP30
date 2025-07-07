/**
 * Advanced Service Worker for Construction Management PWA
 * Features: Offline-first caching, background sync, push notifications, periodic sync
 */

const CACHE_NAME = 'construction-mgmt-v1.3.0';
const DYNAMIC_CACHE = 'construction-dynamic-v1.3.0';
const API_CACHE = 'construction-api-v1.3.0';

// Essential files to cache for offline functionality
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.svg',
  '/icon-512.svg',
  '/icon-maskable-192.svg',
  '/icon-maskable-512.svg',
  '/favicon.ico'
];

// Additional assets to discover and cache dynamically
const ASSET_PATTERNS = [
  /\/assets\/.*\.js$/,
  /\/assets\/.*\.css$/,
  /@vite\/client$/,
  /\/src\/.*$/,
  /\/node_modules\/.*$/
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
        
        // Cache essential static assets
        const cachePromises = STATIC_ASSETS.map(async (url) => {
          try {
            await cache.add(url);
            console.log(`SW: Cached ${url}`);
          } catch (error) {
            console.warn(`SW: Failed to cache ${url}:`, error);
          }
        });
        
        await Promise.allSettled(cachePromises);
        
        // Pre-cache the main HTML page which will trigger loading of JS/CSS bundles
        try {
          const response = await fetch('/');
          const html = await response.text();
          
          // Extract asset URLs from the HTML
          const assetUrls = [];
          const scriptMatches = html.match(/<script[^>]+src="([^"]+)"/g);
          const linkMatches = html.match(/<link[^>]+href="([^"]+)"/g);
          
          if (scriptMatches) {
            scriptMatches.forEach(match => {
              const src = match.match(/src="([^"]+)"/)[1];
              if (src && !src.startsWith('http')) {
                assetUrls.push(src);
              }
            });
          }
          
          if (linkMatches) {
            linkMatches.forEach(match => {
              const href = match.match(/href="([^"]+)"/)[1];
              if (href && !href.startsWith('http') && (href.includes('.css') || href.includes('.js'))) {
                assetUrls.push(href);
              }
            });
          }
          
          // Cache discovered assets
          const assetCachePromises = assetUrls.map(async (url) => {
            try {
              await cache.add(url);
              console.log(`SW: Cached asset ${url}`);
            } catch (error) {
              console.warn(`SW: Failed to cache asset ${url}:`, error);
            }
          });
          
          await Promise.allSettled(assetCachePromises);
          
        } catch (error) {
          console.warn('SW: Failed to discover and cache assets:', error);
        }
        
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
  
  // Special handling for Vite development server
  if (url.pathname.startsWith('/@vite/') || url.pathname.startsWith('/src/')) {
    event.respondWith(
      (async () => {
        try {
          const networkResponse = await fetch(request);
          return networkResponse;
        } catch (error) {
          // In development mode, return empty response for Vite assets
          return new Response('// Development asset offline', {
            status: 503,
            headers: { 'Content-Type': 'application/javascript' }
          });
        }
      })()
    );
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
    // Signal to client that data should come from IndexedDB
    return new Response(JSON.stringify({
      data: [],
      offline: true,
      message: 'استخدم البيانات المحلية'
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'X-Offline-Mode': 'true'
      }
    });
  }
  
  if (url.pathname.includes('/dashboard/stats')) {
    return new Response(JSON.stringify({
      totalRevenue: 0,
      totalExpenses: 0,
      activeProjects: 0,
      totalEmployees: 0,
      equipmentCount: 0,
      offline: true,
      message: 'البيانات محفوظة محلياً - استخدم البيانات المحلية'
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'X-Offline-Mode': 'true'
      }
    });
  }
  
  if (url.pathname.includes('/users') || url.pathname.includes('/equipment') || 
      url.pathname.includes('/transactions') || url.pathname.includes('/warehouses') ||
      url.pathname.includes('/companies')) {
    return new Response(JSON.stringify({
      data: [],
      offline: true,
      message: 'استخدم البيانات المحلية'
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'X-Offline-Mode': 'true'
      }
    });
  }
  
  return new Response(JSON.stringify({ 
    error: 'Offline mode',
    offline: true,
    message: 'البيانات غير متوفرة في وضع عدم الاتصال'
  }), {
    status: 200,
    headers: { 
      'Content-Type': 'application/json',
      'X-Offline-Mode': 'true'
    }
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
         url.pathname.startsWith('/assets/') ||
         url.pathname.startsWith('/src/') ||
         url.pathname.startsWith('/@vite/') ||
         url.pathname.startsWith('/node_modules/') ||
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

// Enhanced PWA installation event handling
self.addEventListener('beforeinstallprompt', (event) => {
  console.log('SW: beforeinstallprompt event captured');
  // Inform the main thread that the prompt is available
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: 'INSTALL_PROMPT_AVAILABLE',
        timestamp: Date.now()
      });
    });
  });
});

// Handle app installation
self.addEventListener('appinstalled', (event) => {
  console.log('SW: App was installed successfully');
  // Notify all clients about successful installation
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: 'APP_INSTALLED',
        timestamp: Date.now()
      });
    });
  });
});

// Push notification handling with SVG icons
self.addEventListener('push', (event) => {
  console.log('SW: Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'إشعار جديد من منصة إدارة البناء',
    icon: '/icon-192.svg',
    badge: '/icon-192.svg',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '1'
    },
    actions: [
      {
        action: 'explore',
        title: 'عرض التفاصيل',
        icon: '/icon-192.svg'
      },
      {
        action: 'close',
        title: 'إغلاق',
        icon: '/icon-192.svg'
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