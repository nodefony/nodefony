importScripts('https://storage.googleapis.com/workbox-cdn/releases/3.0.0/workbox-sw.js');

workbox.setConfig({
  debug: true
});
workbox.core.setLogLevel(workbox.core.LOG_LEVELS.debug);


//let PRECACHE = 'precache-nodefony';

// the rest below handles the installing and caching
this.addEventListener('install', (event) => {
  console.log('[Service Worker] Install', event);
});
this.addEventListener('fetch', function (event) {
  console.log('[Service Worker] Fetch', event);
});


// NOTIFICATIONS
this.addEventListener('push', (event) => {
  console.log('[Service Worker] Push', event);
  const title = 'Get Started With Workbox ';
  const options = {
    body: event.data.text()
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

this.addEventListener('message', function (message) {
  console.log('[Service Worker] Message', message);
});

this.addEventListener('activate', function (event) {
  console.log('[ServiceWorker] Activate', event);
  /*event.waitUntil(
    caches.keys().then(function (keyList) {
      return Promise.all(keyList.map(function (key) {
        if (key !== PRECACHE) {
          console.log('[ServiceWorker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );*/
});