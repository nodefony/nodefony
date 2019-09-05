import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './registerServiceWorker'

import Monitor from './plugins/monitor'

Vue.config.productionTip = false

Vue.use(Monitor)

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
