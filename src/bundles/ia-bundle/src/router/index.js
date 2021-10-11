import { createRouter, createWebHistory } from 'vue-router'
//import Home from '../views/Home.vue'
const Home = () => import('../views/Home.vue')
//import Predict from '../views/Predict.vue'
const Predict = () => import('../views/Predict.vue')
const Speech = () => import('../views/Speech')

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },{
    path: '/predict',
    name: 'predict',
    component: Predict
  }, {
    path: '/speech',
    name: 'speech',
    component: Speech
  }
]

const router = createRouter({
  history: createWebHistory("ia"),
  routes
})

export default router
