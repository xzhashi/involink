const STATIC_CACHE_NAME = 'static-assets-v2';
const DYNAMIC_CACHE_NAME = 'dynamic-content-v2';
const APP_SHELL_FILES = [
  '/',
  '/index.html',
  '/index.css',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Install event: cache the application shell
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then(cache => {
      console.log('Service Worker: Pre-caching App Shell');
      return cache.addAll(APP_SHELL_FILES);
    })
  );
});

// Activate event: clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [STATIC_CACHE_NAME, DYNAMIC_CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheWhitelist.includes(cacheName)) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// --- FETCH EVENT STRATEGIES ---

// Strategy: Stale-While-Revalidate
// Ideal for JS, CSS files. Serve from cache for speed, then update in the background.
const staleWhileRevalidate = async (request) => {
  const cache = await caches.open(DYNAMIC_CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  const fetchPromise = fetch(request).then(networkResponse => {
    // Check for a valid response to cache
    if (networkResponse && networkResponse.status === 200) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  });

  return cachedResponse || fetchPromise;
};

// Strategy: Cache First
// Ideal for fonts, images. Serve from cache immediately if available.
const cacheFirst = async (request) => {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
        return cachedResponse;
    }
    try {
        const networkResponse = await fetch(request);
        // Check for a valid response to cache
        if (networkResponse && networkResponse.status === 200) {
          const cache = await caches.open(DYNAMIC_CACHE_NAME);
          cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        console.error('Service Worker: Fetch failed for cache-first strategy:', error);
        // Optionally, return a fallback asset, e.g., an offline image placeholder
    }
};

// Strategy: Network First
// Ideal for the main HTML document. Always try to get the freshest version.
const networkFirst = async (request) => {
    try {
        const networkResponse = await fetch(request);
        // Optional: Update cache with the new response
        const cache = await caches.open(DYNAMIC_CACHE_NAME);
        if (networkResponse && networkResponse.status === 200) {
          cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        console.log('Service Worker: Network fetch failed, falling back to cache.');
        const cachedResponse = await caches.match(request);
        // If it's a navigation request and even the specific URL isn't cached,
        // fall back to the main index.html for SPA routing.
        return cachedResponse || await caches.match('/index.html');
    }
};


self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // --- ROUTING LOGIC ---

  // 1. API calls - Network Only
  if (url.origin.includes('supabase.co') || url.origin.includes('brandsscaler.com') || url.origin.includes('razorpay.com') || url.origin.includes('ipapi.co')) {
    // Do not respond here, let the browser handle it.
    return;
  }
  
  // 2. Navigation requests - Network First
  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request));
    return;
  }
  
  // 3. JS and CSS files - Stale-While-Revalidate
  if (request.destination === 'script' || request.destination === 'style' || url.pathname.endsWith('.css') || url.pathname.endsWith('.tsx') || url.pathname.endsWith('.js')) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }
  
  // 4. Images and fonts - Cache First
  if (request.destination === 'image' || request.destination === 'font') {
    event.respondWith(cacheFirst(request));
    return;
  }

  // 5. Default handler for anything else (e.g., manifest.json) - Cache First
  event.respondWith(cacheFirst(request));
});
