import { createApp } from 'vue'
import App from './App.vue'
import i18n from './i18n'
import store from './store'
import router from './router'


import vuetify from './plugins/vuetify'

createApp(App).use(router).use(store).use(i18n).use(vuetify).mount('#app')

