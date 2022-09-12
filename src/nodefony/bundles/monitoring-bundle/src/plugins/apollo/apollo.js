import nodefony from 'nodefony-client'
import nodefonyClient from './nodefonyClient.js'
import nodefonyClientWS from './nodefonyClientWs.js'
import {
  createApolloProvider
} from '@vue/apollo-option'
import {
  ApolloClient,
} from '@apollo/client/core'

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
    app.provide('appolo', this)
    this.client = nodefonyClient(this.nodefony);
    this.provider = this.addProvider()
    this.app.use(this.provider)
    this.showBanner()
  }

  showBanner() {
    this.logger(`${this.name}\n\n`,
      `\tVersion :\t\t\t ${this.client.version}\n`,
      `\n\n\n`
    );
  }

  addProvider() {
    return createApolloProvider({
      defaultClient: this.client,
      defaultOptions: {
        // apollo options applied to all queries in components
        $query: {
          //loadingKey: 'loading',
          fetchPolicy: 'cache-and-network',
        }
      }
    })
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
