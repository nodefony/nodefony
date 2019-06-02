/**
 *  serviceWorker
 */

class serviceWorker {
  constructor(context) {
    this.context = context;
    if (!workbox) {
      throw new Error("Workbox didn't load");
    }
    //this.initEvents();
  }

  initEvents() {
    // the rest below handles the installing and caching
    this.context.addEventListener('install', (event) => {
      console.log('[Service Worker] Install', event);
    });

    this.context.addEventListener('activate', (event) => {
      console.log('[ServiceWorker] Activate', event);
      //this.context.skipWaiting();
    });
  }

  initWorkbox() {
    workbox.setConfig({
      debug: true
    });
    this.initCache();
  }

  initCache() {
    workbox.core.setCacheNameDetails({
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

    workbox.precaching.precacheAndRoute(this.precache);

    this.pageHandler = new workbox.strategies.StaleWhileRevalidate({
      cacheName: 'pages-cache',
      plugins: [
        new workbox.expiration.Plugin({
          maxEntries: 50,
        })
      ]
    });
    this.jsHandler = new workbox.strategies.CacheFirst({
      cacheName: 'javascript-cache',
    });

    this.cssHandler = new workbox.strategies.CacheFirst({
      // Use a custom cache name
      cacheName: 'css-cache',
    });

    this.sockjsHandler = new workbox.strategies.NetworkOnly({
      cacheName: 'sockjs-cache',
    });

    this.imagesHandler = new workbox.strategies.CacheFirst({
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
    });

    this.initRouting();
  }

  initRouting() {
    {% if bundleName == "app" %}
    workbox.routing.registerRoute(/\/(.*)/, args => {
    {%else%}
    workbox.routing.registerRoute(/(.*){{shortName}}/, args => {
    {%endif%}
      return this.pageHandler.handle(args).then(response => {
        if (!response) {
          return caches.match('nodefony/offline');
        } else if (response.status === 404) {
          return caches.match('nodefony/404');
        }
        return response;
      });
    });

    workbox.routing.registerRoute(/(.*)sockjs-node*/, args => {
      return this.sockjsHandler.handle(args);
    });

    workbox.routing.registerRoute(new RegExp('.*\.js'), args => {
      return this.jsHandler.handle(args).then(response => {
        if (!response) {
          return caches.match('nodefony/offline');
        } else if (response.status === 404) {
          return caches.match('nodefony/404');
        }
        return response;
      });
    });

    workbox.routing.registerRoute(/.*\.css/, args => {
      return this.cssHandler.handle(args).then(response => {
        if (!response) {
          return caches.match('nodefony/offline');
        } else if (response.status === 404) {
          return caches.match('nodefony/404');
        }
        return response;
      });
    });

    workbox.routing.registerRoute(/.*\.(?:png|jpg|jpeg|svg|gif|ico)/, args => {
      return this.imagesHandler.handle(args).then(response => {
        if (!response) {
          return caches.match('nodefony/offline');
        } else if (response.status === 404) {
          return caches.match('nodefony/404');
        }
        return response;
      });
    });

    /*workbox.routing.setCatchHandler(({
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

const worker = new serviceWorker(this);
worker.initWorkbox();
