/*
 *
 *	ENTRY POINT
 *  WEBPACK bundle APP
 *  client side
 */

//import nodefony from "../../../src/nodefony";
// javascript bootstrap library
import 'bootstrap';

// bootstrap scss framework
import '../scss/custom.scss';

/*
 *	Class Bundle App
 */
class App  {
  constructor() {
    this.addEvents();
    if(process.env.NODE_ENV === "production" ){
      this.workbox();
    }
  }

  workbox(){
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/app/service-worker.js', {
            scope: "/app/"
          })
          .then(registration => {
            if (registration) {
              console.log(`Service Worker registered! Scope: ${registration.scope}`);
              if (window.debugbar) {
                window.debugbar.monitoringWorkbox(registration);
              }
            }
            return registration;
          }).catch(err => {
            console.error(`Service Worker registration failed: ${err}`);
          });
      });
    }
  }

  addEvents() {
    let selectorLang = global.document.getElementById("language");
    if (selectorLang) {
      selectorLang.addEventListener("change", (e) => {
        //window.location.href = "?lang=" + this.value;
        this.changeLang();
        e.preventDefault();
      });
    }
  }

  changeLang(query) {
    if (query) {
      return window.location.href = "?language=" + query;
    }
    let form = global.document.getElementById("formLang");
    if (form) {
      form.submit();
    }
  }
}

/*
 * HMR
 */
if (module.hot) {
  module.hot.accept((err) => {
    if (err) {
      console.error('Cannot apply HMR update.', err);
    }
  });
}

export default new App();
