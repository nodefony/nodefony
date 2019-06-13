{% if addons.webpack %}
/*
 *
 *	ENTRY POINT
 *  WEBPACK bundle {{bundleName}}
 *  client side
 */
{% if addons.bootstrap %}
// javascript bootstrap library
import 'bootstrap';
// bootstrap scss framework
import '../scss/custom.scss';
{% else%}
import "../css/{{shortName}}.css";
{% endif%}
{% endif%}

/*
 *	Class Bundle App
 */
class {{shortName | capitalize }}  {
  constructor() {
{% if addons.workbox and  addons.webpack %}
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/{{bundleName}}/assets/service-worker.js', {
            scope: {% if bundleName == "app" %}`/`{%else%}`/{{shortName}}`{%endif%}
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
{% endif %}
  }
}

{% if addons.webpack %}
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
{% endif %}

export default new {{shortName | capitalize }}();
