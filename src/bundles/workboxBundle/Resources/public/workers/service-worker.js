workbox.skipWaiting();
workbox.clientsClaim();

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