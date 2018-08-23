import Vue from 'vue';
import Router from 'vue-router';
import Home from '../components/home.vue'; // this is the import line to add
import hello from '../components/hello.vue'; // this is the import line to add
Vue.use(Router);

// 2. Define some routes
// Each route should map to a component. The "component" can
// either be an actual component constructor created via
// `Vue.extend()`, or just a component options object.
// We'll talk about nested routes later.
const routes = [{
    path: '/',
    name: "home",
    component: Home
  },
  {
    path: '/hello',
    name: "hello",
    component: hello
  }
];


export default new Router({
  routes, // short for `routes: routes`
  mode: 'history',
  base: "/api/vue"
});