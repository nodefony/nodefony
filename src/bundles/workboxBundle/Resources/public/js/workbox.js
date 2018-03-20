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
      this.name = workbox;
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
          this.serviceWorker = navigator.serviceWorker.register('workboxBundle/dist/workers/service-worker.js').then(registration => {
            console.log('SW registered: ', registration);
          }).catch(registrationError => {
            console.log('SW registration failed: ', registrationError);
          });
        });
      }
    }
  }

  return new workbox();
}();