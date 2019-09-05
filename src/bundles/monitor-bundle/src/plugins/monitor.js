// css assets
import '@/assets/scss/custom.scss'

import SideBar from '@/components/SidebarPlugin'

export default {

  install (Vue) {
    Vue.use(SideBar)
  }
}
