import {
  createRouter,
  createWebHistory
} from 'vue-router'
import Store from '@/store';
import HomeView from '@/views/Home.vue'
import Readme from '@/views//nodefony/Readme.vue'
import Login from '@/views/Login.vue';
import Swagger from '@/views/documentation/Swagger.vue'
import Graphigl from '@/views/documentation/Graphigl.vue'
import Reveal from '@/views/presentations/slides/reveal.vue'
import Bundles from '@/views/bundles/Bundle.vue'
import Connectors from '@/views/databases/Connector.vue'
import DashboardMonitoring from '@/views/monitoring/Dashboard.vue'

const ifAuthenticated = (to, from, next) => {
  if (Store.getters.isAuthenticated) {
    let redirect = window.sessionStorage.getItem("redirect")
    if (redirect && !from.name && to.name === "Home") {
      let res = JSON.parse(redirect);
      window.sessionStorage.removeItem("redirect")
      return next({
        name: res.routeName,
        params: res.params
      });
    }
    return next();
  }
  //next('Login');
  document.location = `/doc/login`;
};


const allReadyLogin = (to, from, next) => {
  if (Store.getters.isAuthenticated) {
    return next('Home');
  }
  return next();
};


const routes = [
  {
    path: '/',
    redirect: {
      name: 'Home'
    }
  }, {
    path: '/home',
    name: 'Home',
    component: HomeView,
    beforeEnter: ifAuthenticated
  }, {
    path: '/login',
    name: 'Login',
    component: Login,
    beforeEnter: allReadyLogin
  }, {
    path: '/swagger',
    name: 'Swagger',
    component: Swagger,
    beforeEnter: ifAuthenticated
  }, {
    path: '/graphigl',
    name: 'Graphigl',
    component: Graphigl,
    beforeEnter: ifAuthenticated
  },{
    path: '/presentation',
    name: 'Reveal',
    component: Reveal,
    beforeEnter: ifAuthenticated
  },{
    path: '/bundle/:name',
    name: 'Bundles',
    props:true,
    component: Bundles,
    beforeEnter: ifAuthenticated
  },{
    path: '/database/connectors/:name',
    name: 'Connectors',
    props:true,
    component: Connectors,
    beforeEnter: ifAuthenticated
  },{
    path: '/nodefony/readme',
    name: 'nodefonyreadme',
    component: Readme,
    beforeEnter: ifAuthenticated
  },{
    path: '/monitoring/dashboard',
    name: 'DashboardMonitoring',
    component: DashboardMonitoring,
    beforeEnter: ifAuthenticated
  }
]

const router = createRouter({
  history: createWebHistory("doc"),
  routes
})

export default router
