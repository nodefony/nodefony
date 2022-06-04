import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import nodefony from '@/plugins/nodefony/nodefony'
import apollo from '@/plugins/apollo/apollo'
import vuetify from './plugins/vuetify'
import { loadFonts } from './plugins/webfontloader'
import i18n from './i18n'
import './registerServiceWorker'

loadFonts()

try{
  const app = createApp(App)
    .use(store)
    .use(router)
    .use(i18n)
    .use(vuetify)
    .use(nodefony,{
      router,
      store,
      vuetify,
      i18n
    })
    .use(apollo,{
      router,
      store,
      vuetify,
      i18n,
      nodefony
    })
    app.mount('#app')
}catch(e){
  console.error(e)
}
