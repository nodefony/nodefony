import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../components/home'
import Account from '../components/account'
import Login from '../components/login'
import store from '../store'

Vue.use(VueRouter)

/* const routes = [
  {
    path: '/about',
    name: 'about',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import( / webpackChunkName: "about" / '../views/About.vue')
  }
]; */

const ifNotAuthenticated = (to, from, next) => {
  if (!store.getters.isAuthenticated) {
    next()
    return
  }
  next('/')
}

const ifAuthenticated = (to, from, next) => {
  if (store.getters.isAuthenticated) {
    next()
    return
  }
  next('/login')
}

const routes = [{
  path: '/',
  name: 'Home',
  component: Home
},
{
  path: '/account',
  name: 'Account',
  component: Account,
  beforeEnter: ifAuthenticated
},
{
  path: '/login',
  name: 'Login',
  component: Login,
  beforeEnter: ifNotAuthenticated
}]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
