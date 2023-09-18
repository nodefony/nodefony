import { createRouter, createWebHistory } from 'vue-router'

const Home = () => import('../views/Home.vue')
const Predict = () => import('../views/Predict.vue')
const Speech = () => import('../views/Speech')
const MB = () => import('../views/MobileNet.vue')
const Cam =()=> import('../views/cam.vue')
const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },{
    path: '/mobilenet',
    name: 'mobilenet',
    component: MB
  },{
    path: '/predict',
    name: 'predict',
    component: Predict
  }, {
    path: '/speech',
    name: 'speech',
    component: Speech
  },{
    path: '/cam',
    name: 'webcam',
    component: Cam
  }
]

const router = createRouter({
  history: createWebHistory("ia"),
  routes
})

export default router
