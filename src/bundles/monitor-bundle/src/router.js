import Vue from 'vue'
import Router from 'vue-router'

import NotFound from '@/views/NotFound.vue'
import DashboardLayout from '@/layouts/dashboard/dashboardLayout.vue'

// pages
const Dashboard = () => import(/* webpackChunkName: "dashboard" */ '@/views/Dashboard.vue')

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: '/monitor',
  routes: [{
    path: '/',
    name: 'dashboard-root',
    redirect: '/dashboard',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: DashboardLayout,
    children: [{
      path: 'dashboard',
      name: 'dashboard',
      component: Dashboard
    }]
  }, {
    path: '*',
    component: NotFound
  }]
})
