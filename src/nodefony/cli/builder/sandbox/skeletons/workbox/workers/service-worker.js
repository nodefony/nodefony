import "workbox-sw";
import {
  registerRoute,
  setCatchHandler
} from 'workbox-routing';

import {
  NetworkOnly,
  CacheFirst,
  StaleWhileRevalidate
} from 'workbox-strategies';

import {
  precacheAndRoute
} from 'workbox-precaching';

import {
  ExpirationPlugin
} from 'workbox-expiration';

import {
  //cacheNames,
  setCacheNameDetails
} from 'workbox-core';

/**
 *  serviceWorker
 */
class serviceWorker {
  constructor(context) {
    this.context = context;
    this.worbox = this.context.workbox;
    /*if (!this.workbox) {
      throw new Error("Workbox didn't load");
    }*/
    this.initEvents();
  }

  initEvents() {
    // the rest below handles the installing and caching
    this.context.addEventListener('install', (event) => {
      console.log('[Service Worker] Install', event);
      this.initWorkbox();
    });

    this.context.addEventListener('activate', (event) => {
      console.log('[ServiceWorker] Activate', event);
      //this.context.skipWaiting();
    });
  }

  initWorkbox() {
    if (this.workbox) {
      this.workbox.setConfig({
        debug: true
      });
    }
    this.initCache();
  }

  initCache() {
    setCacheNameDetails({
      prefix: '{{shortName}}',
      suffix: 'bundle',
      precache: '-precache',
      runtime: '-runtime'
    });
    let PRECACHE_URLS = [
        {% if bundleName == "app" %}`/`{%else%}`/{{shortName}}`{%endif%},
        '/{{bundleName}}/favicon.ico',
        '/{{bundleName}}/manifest.json'
      ];
    // webpack assets cache
    if (this.context.__precacheManifest) {
      this.precache = this.context.__precacheManifest.concat(PRECACHE_URLS);
    } else {
      this.precache = PRECACHE_URLS;
    }

    precacheAndRoute(this.precache);

    this.pageHandler = new StaleWhileRevalidate({
      cacheName: 'pages-cache',
      plugins: [
        new ExpirationPlugin({
          maxEntries: 50,
        })
      ]
    });
    this.jsHandler = new CacheFirst({
      cacheName: 'javascript-cache',
    });

    this.cssHandler = new CacheFirst({
      // Use a custom cache name
      cacheName: 'css-cache',
    });

    this.sockjsHandler = new NetworkOnly({
      cacheName: 'sockjs-cache',
    });

    this.imagesHandler = new CacheFirst({
      // Use a custom cache name
      cacheName: 'image-cache',
      plugins: [
        new ExpirationPlugin({
          // Cache only 20 images
          maxEntries: 20,
          // Cache for a maximum of a week
          maxAgeSeconds: 7 * 24 * 60 * 60,
        })
      ],
    });

    this.initRouting();
  }

  initRouting() {
    {% if bundleName == "app" %}
    registerRoute(/\/(.*)/, args => {
    {%else%}
    registerRoute(/(.*){{shortName}}/, args => {
    {%endif%}
      return this.pageHandler.handle(args)
        .then(response => {
          if (!response) {
            return caches.match('nodefony/offline');
          } else if (response.status === 404) {
            return caches.match('nodefony/404');
          }
          return response;
        });
    });

    registerRoute(/(.*)sockjs-node*/, args => {
      return this.sockjsHandler.handle(args);
    });

    registerRoute(new RegExp('.*\.js'), args => {
      return this.jsHandler.handle(args)
        .then(response => {
          if (!response) {
            return caches.match('nodefony/offline');
          } else if (response.status === 404) {
            return caches.match('nodefony/404');
          }
          return response;
        });
    });

    registerRoute(/.*\.css/, args => {
      return this.cssHandler.handle(args)
        .then(response => {
          if (!response) {
            return caches.match('nodefony/offline');
          } else if (response.status === 404) {
            return caches.match('nodefony/404');
          }
          return response;
        });
    });

    registerRoute(/.*\.(?:png|jpg|jpeg|svg|gif|ico)/, args => {
      return this.imagesHandler.handle(args)
        .then(response => {
          if (!response) {
            return caches.match('nodefony/offline');
          } else if (response.status === 404) {
            return caches.match('nodefony/404');
          }
          return response;
        });
    });

    /*setCatchHandler(({
      event
    }) => {
      switch (event.request.destination) {
      case 'document':
        return window.caches.match("/");
      case 'image':
        return window.caches.match("/");
      case 'font':
        return window.caches.match("/");
      default:
        // If we don't have a fallback, just return an error response.
        return Response.error();
      }
    });*/
  }
}

precacheAndRoute(self.__WB_MANIFEST);

const worker = new serviceWorker(self);
