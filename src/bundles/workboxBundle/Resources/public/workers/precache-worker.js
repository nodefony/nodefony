// list the files you want cached by the service worker
let PRECACHE_URLS = [
  '/workbox',
  '/workboxBundle/images/nodefony-logo.png',
  '/workboxBundle/images/Workbox-Logo-Grey.svg'
];

// ROUTING
workbox.precaching.precacheAndRoute(PRECACHE_URLS);

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