import Vue from 'vue';
import App from './App.vue';
import Router from './router/index.js';

new Vue({
  Router,
  render: h => h(App)
}).$mount('#app');