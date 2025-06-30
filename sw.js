const CACHE_NAME = 'invoice-maker-cache-v1';
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/index.css',
  '/manifest.json'
];

// Install event: cache the application shell
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(URLS_TO_CACHE);
      })
  );
});

// Activate event: clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event: serve cached content when offline, with a network-first strategy for navigation.
self.addEventListener('fetch', event => {
  const { request } = event;

  // Always go to the network for Supabase API calls and Razorpay script
  if (
    request.url.includes('/supabase.co/') || 
    request.url.includes('/brandsscaler.com/') ||
    request.url.includes('checkout.razorpay.com')
  ) {
    event.respondWith(fetch(request));
    return;
  }

  // For navigation requests, try network first, then cache.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => {
        // If network fails, serve the main index.html from cache.
        // This allows the single-page app to load and handle routing.
        return caches.match('/index.html');
      })
    );
    return;
  }

  // For all other requests (CSS, JS, fonts, images), use a cache-first strategy.
  event.respondWith(
    caches.match(request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }

      // If not in cache, fetch from network, cache it, and then return it.
      return fetch(request).then(networkResponse => {
        // Check for a valid response to cache.
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(request, responseToCache);
            });
        }
        return networkResponse;
      });
    })
  );
});
