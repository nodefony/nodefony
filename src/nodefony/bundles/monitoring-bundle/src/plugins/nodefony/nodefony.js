import nodefony from 'nodefony-client';
import qs from 'querystring';
import moment from 'moment';
import 'moment/locale/fr';
//import media from "nodefony-client/src/medias/medias";
//media(nodefony);
import Logo from './images/nodefony-logo.png'

import {
  //defineComponent,
  createVNode,
  render
} from 'vue';

import snackBar from './notify/NsnackbarNotify';
import alert from './notify/NalertNotify';

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
    this.application = null;
    this.logo = Logo
  }

  showBanner() {
    this.logger(`${this.name}\n\n`,
      `\tVersion :\t\t\t ${this.version}\n`,
      `\tenvironment :\t\t ${this.environment}\n`,
      `\tnodefony-client :\t ${nodefony.version}\n`,
      `\tvue :\t\t\t\t ${this.vueVersion}\n`,
      `\tvuetify :\t\t\t ${this.vuetifyVersion}\n`,
      `\tdebug :\t\t\t\t`,
      this.debug,
      `\n\n\n`
    );
  }

  queryString(data) {
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
  async install(app, options) {
    this.store = options.store;
    this.router = options.router;
    this.vuetify = options.vuetify;
    this.i18n = options.i18n;
    this.app = app;
    this.moment = moment;
    this.showBanner();
    //this.log(`Add Plugin nodefony : ${this.version}`, "INFO");
    //this.log(`Nodefony Domain : ${this.domain}`);
    this.client = nodefony;
    app.config.globalProperties.log = (...args) => {
      return this.log(...args);
    };
    app.config.globalProperties.logger = (...args) => {
      return this.logger(...args);
    };
    app.config.globalProperties.notify = (...args) => {
      return this.notify(...args);
    };
    app.config.globalProperties.$moment = this.moment;
    app.provide('nodefony', this);
    app.provide('log', (...args) => {
      return this.log(...args);
    });
    app.provide('logger', (...args) => {
      return this.logger(...args);
    });
    app.provide('notify', (...args) => {
      return this.notify(...args);
    });
    app.provide('moment', this.moment);
  }


  notify(pdu, options = {}, type = "snackBar", element = null) {
    let vNode = null;
    let props = null;
    switch (type) {
      case 'snackBar':
        props = nodefony.extend({
          pdu,
          timeout: 10000
        }, options);
        vNode = createVNode(snackBar, props, this.app);
        break;
      case 'alert':
        props = nodefony.extend({
          pdu
        }, options);
        vNode = createVNode(alert, props, this.app);
        break;
    }
    //console.log(this.application.vnode.el, vNode)

    if (this.app && this.app._context) {
      vNode.appContext = this.app._context;
    }

    if (element) {
      render(vNode, element);
    } else {
      //render(vNode, this.application.vnode.el)
      element = document.body;
      render(vNode, element);
    }

    console.log(vNode.on, vNode.component.on, vNode.component.ctx.on, vNode.component.ctx, vNode);

    const destroy = () => {
      if (element) {
        render(null, element);
      }
      element = null;
      vNode = null;
    };
    const close = function(message) {
      if (message.uid === pdu.uid) {
        console.log("close pdu", pdu, close);
        destroy();
        this.removeListener("closeNotify", close);
      }
    };
    this.on("closeNotify", close);

    return vNode;

    /*const div = document.createElement("div");
    document.body.appendChild(div);

    const snack = defineComponent({
        extend:[snackBar]
    })
    console.log(snack)*/

    //options.props = {pdu}
    //const snackbarInstance = createApp(snackBar, options);
    //snackbarInstance.mount(div);

    //snackbarInstance.unmount(div);
    //document.body.removeChild(div);



    //let container = this.app.$el;
    //console.log(this.app.refs, defineComponent)
  }

  /*notify(pdu, options = {}, type = "snackBar", element = null) {
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
  }*/

}
nodefony.kernel = new Nodefony("VUE-NODEFONY-PLUGIN", process.env);

export default nodefony.kernel;
