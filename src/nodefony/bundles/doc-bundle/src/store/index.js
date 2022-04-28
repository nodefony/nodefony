import { createStore } from 'vuex'

// application store
import app from './application/index.js'

// nodefony store
import user from '@/plugins/nodefony/store/modules/user'
import auth from '@/plugins/nodefony/store/modules/auth'


export default createStore({
  state: {
  },
  getters: {
  },
  mutations: {
  },
  actions: {
  },
  modules: {
    app,
    user,
    auth
  }
})
