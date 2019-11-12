import Vue from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import store from './store'
import Loading from './components/lib/loading'
import CenterContainer from './components/lib/center-container'

Vue.component('loading', Loading)
Vue.component('center-container', CenterContainer)

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
