import {
  createRouter,
  createWebHistory
} from 'vue-router'
import Store from '@/store';
import HomeView from '@/views/Home.vue'
import Login from '@/views/Login.vue';
import Swagger from '@/views/documentation/Swagger.vue'
import Graphigl from '@/views/documentation/Graphigl.vue'
import Reveal from '@/views/documentation/slides/reveal.vue'

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
  }
]

const router = createRouter({
  history: createWebHistory("doc"),
  routes
})

export default router
