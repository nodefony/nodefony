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



module.exports = function () {

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
          navigator.serviceWorker.register('/workboxBundle/dist/workers/service-worker.js')
            .then(registration => {
              if (registration) {
                /*if (registration.active) {
                  registration.pushManager.subscribe({
                    userVisibleOnly: true
                  });
                }*/
                if (window.nodefony) {
                  window.nodefony.monitoringWorkbox(registration);
                }
              }
              return registration;
            }).catch(registrationError => {
              console.log('SW registration failed: ', registrationError);
            });
        });
      }
    }
  }

  return new workbox();
}();