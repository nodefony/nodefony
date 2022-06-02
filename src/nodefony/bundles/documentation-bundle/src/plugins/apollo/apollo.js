import nodefony from 'nodefony-client'
import nodefonyClient from './nodefonyClient.js'
import nodefonyClientWS from './nodefonyClientWs.js'
import {
  createApolloProvider
} from '@vue/apollo-option'

class Apollo extends nodefony.Kernel {

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
    settings.version = "1.0.0";
    super(name, settings);
  }


  install(app, options) {
    this.store = options.store;
    this.router = options.router;
    this.vuetify = options.vuetify;
    this.i18n = options.i18n;
    this.nodefony = options.nodefony
    this.app = app;
    this.set("store", this.store);
    this.set("router", this.router);
    this.set("i18n", this.i18n);
    this.set("nodefony", this.nodefony);
    this.showBanner()
    app.provide('appolo', this)
    this.addNodefonyClient()
  }

  addNodefonyClient() {
    const nodefonyProvider = createApolloProvider({
      defaultClient: nodefonyClient,
    })
    this.app.use(nodefonyProvider)
    return nodefonyProvider
  }


  /*addNodefonyClientWss() {
    const url = `wss://${window.location.host}/api/ws/graphql`
    const link = nodefonyClientWS(url)
    this.checkQueryWs(link.client).catch(e=>{
      console.log(e, e.reason , e.code, e.message)
    })
  }

  checkQueryWs(client) {
    // query
    return new Promise((resolve, reject) => {
      let result;
      client.subscribe({
        query: '{ hello }',
      }, {
        next: (data) => (result = data),
        error: reject,
        complete: () => resolve(result),
      }, );


      console.log(result)
    });
  }*/


}




export default new Apollo("VUE-APPOLO-PLUGIN", process.env);