import nodefony from 'nodefony-client'
import media from "nodefony-client/src/medias/medias";
import qs from 'querystring'
media(nodefony);

import snackBar from './notify/snackbar';
import alert from './notify/alert';

class Nodefony extends nodefony.Kernel {
  constructor(name, settings) {
    if (typeof settings.VUE_APP_DEBUG === "string") {
      if (settings.VUE_APP_DEBUG === "false") {
        settings.VUE_APP_DEBUG = false;
      }
      if (settings.VUE_APP_DEBUG === "true") {
        settings.VUE_APP_DEBUG = true;
      }
    }
    settings.environment = settings.VUE_APP_NODE_ENV;
    settings.debug = settings.VUE_APP_DEBUG;
    settings.version = nodefony.version;
    super(name, settings);
    this.vueVersion = this.options.VUE_APP_VUE_VERSION;
    this.vuetifyVersion = this.options.VUE_APP_VUETIFY_VERSION;
    this.domain = this.options.VUE_APP_DOMAIN;
    this.api = new nodefony.Api(this.name, {
      baseUrl: "/api",
      storage: {
        type: "local"
      }
    });
    this.notifyTab = new Map();
  }

  queryString(data){
    return qs.stringify(data)
  }

  request(...args) {
    return this.api.http(...args)
      .then((result) => {
        if (result.error) {
          throw result.error;
        }
        return result;
      })
      .catch(async (e) => {
        if (e.response) {
          if (e.response.code === 401) {
            try {
              await this.store.dispatch("AUTH_LOGOUT");
            } catch (e) {
              this.log(e, "ERROR");
              throw e.response;
            } finally {
              this.router.push("home");
            }
          }
          throw e.response;
        } else {
          throw e;
        }
      });
  }

  // hooy plugins vue
  async install(Vue, options) {
    this.store = options.store;
    this.router = options.router;
    this.vuetify = options.vuetify;
    this.i18n = options.i18n;
    this.vue = Vue;
    Vue.prototype.$nodefony = this;
    Vue.prototype.log = (...args) => {
      return this.log(...args);
    };
    Vue.prototype.logger = (...args) => {
      return this.logger(...args);
    };
    Vue.prototype.notify = (...args) => {
      return this.notify(...args);
    };
    this.showBanner();
    //this.log(`Add Plugin nodefony : ${this.version}`, "INFO");
    this.log(`Nodefony Domain : ${this.domain}`);
    this.client = nodefony;
  }

  notify(pdu, options = {}, type = "snackBar", element = null) {
    let container = this.application.$el;
    if (element) {
      container = element;
    }
    if (!container) {
      container = document.body;
    }
    let ComponentClass = null;
    options = nodefony.extend( {
      top: true,
      absolute: false,
      right: true,
      timeout: 5000
    },options);
    switch (type) {
    case "alert":
      ComponentClass = this.vue.extend({
        mixins: [alert],
        parent: this.application
      });
      break;
    case "snackBar":
    default:

      ComponentClass = this.vue.extend({
        mixins: [snackBar],
        parent: this.application
      });
    }
    options.pdu = pdu;
    const component = new ComponentClass({
      data: {
        stacked: this.notifyTab.size
      },
      propsData: options
    });
    const uuid = this.client.generateId();
    this.notifyTab.set(uuid, this.notifyTab.size)
    component.$on("close", () => {
      this.notifyTab.delete(uuid);
      container.removeChild(component.$el);
      component.$destroy();
    });
    component.$mount();
    container.appendChild(component.$el);
    return component;
  }

  drawSpectrum(canvas, mystream, size, frequency = 60) {
    return new Promise((resolve, reject) => {
      try {
        const ctx = canvas.getContext('2d');
        const contextAudio = new(window.AudioContext || window.webkitAudioContext)();
        const analyser = contextAudio.createAnalyser();
        const width = canvas.width;
        const height = canvas.height;
        const draw = (bar_width = 10) => {
          ctx.clearRect(0, 0, width, height);
          const freqByteData = new Uint8Array(analyser.frequencyBinCount);
          analyser.getByteFrequencyData(freqByteData);
          const barCount = Math.round(width / bar_width);
          for (let i = 0; i < barCount; i++) {
            const magnitude = freqByteData[i];
            // some values need adjusting to fit on the canvas
            ctx.fillStyle = 'rgb(150,50,250)';
            ctx.fillRect(bar_width * i, height, bar_width - 2, -magnitude + 60);
          }
        }
        let audioNodes = null;
        const loadStream = (stream) => {
          audioNodes = contextAudio.createMediaStreamSource(stream);
          audioNodes.connect(analyser);
          //analyser.connect(contextAudio.destination);
        }
        if (mystream) {
          loadStream(mystream);
        }

        let interval = null;
        const start = (stream) => {
          if (stream) {
            audioNodes = null;
            loadStream(stream)
          }
          return interval = setInterval(() => {
            draw(size);
          }, frequency);
        };
        const stop = () => {
          clearInterval(interval);
          interval = null;
          clear();
        };
        const clear = () => {
          ctx.clearRect(0, 0, width, height);
        };
        interval = start();
        return resolve({
          stop: stop,
          start: start,
          clear: clear
        });
      } catch (e) {
        return reject(e);
      }
    });
  }
}
nodefony.kernel = new Nodefony("VUE", process.env);

export default nodefony.kernel;
