/*
 *
 *	ENTRY POINT WEBPACK DEMO BUNLDE
 *
 *
 *  Add your assets here with require  to an integration in webpack  bundle
 *
 *
 */
require("../css/workbox.css");

/*
 *	Class
 *
 *	Namespace workbox client side
 *
 */
class workbox {

  constructor() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/workbox-bundle/assets/service-worker.js', {
            scope: `/workbox`
          })
          .then(registration => {
            if (registration) {
              console.log(`Service Worker registered! Scope: ${registration.scope}`);
              if (window.nodefony) {
                window.nodefony.monitoringWorkbox(registration);
              }
            }
            return registration;
          }).catch(err => {
            console.error(`Service Worker registration failed: ${err}`);
          });
      });
    }
  }
}

export default new workbox();
