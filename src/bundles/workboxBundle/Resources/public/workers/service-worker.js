workbox.setConfig({
  debug: true
});
workbox.core.setLogLevel(workbox.core.LOG_LEVELS.debug);

let PRECACHE_URLS = [
  '/workbox',
  '/workboxBundle/images/nodefony-logo.png',
  '/workboxBundle/images/Workbox-Logo-Grey.svg'
];
workbox.precaching.precacheAndRoute(self.__precacheManifest.concat(PRECACHE_URLS));

workbox.routing.registerRoute(
  new RegExp('.*\.js'),
  workbox.strategies.cacheFirst()
);

workbox.routing.registerRoute(
  // Cache CSS files
  /.*\.css/,
  // Use cache but update in the background ASAP
  workbox.strategies.staleWhileRevalidate({
    // Use a custom cache name
    cacheName: 'css-cache',
  })
);

workbox.routing.registerRoute(
  // Cache image files
  /.*\.(?:png|jpg|jpeg|svg|gif)/,
  // Use the cache if it's available
  workbox.strategies.cacheFirst({
    // Use a custom cache name
    cacheName: 'image-cache',
    plugins: [
      new workbox.expiration.Plugin({
        // Cache only 20 images
        maxEntries: 20,
        // Cache for a maximum of a week
        maxAgeSeconds: 7 * 24 * 60 * 60,
      })
    ],
  })
);

workbox.skipWaiting();
workbox.clientsClaim();

// the rest below handles the installing and caching
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Install', event);
});

self.addEventListener('activate', function (event) {
  console.log('[ServiceWorker] Activate', event);
  self.skipWaiting();
});

self.addEventListener('fetch', function (event) {
  console.log('[Service Worker] Fetch', event);
  event.respondWith(
    caches.match(event.request)
  );

});