const drawer = window.sessionStorage.getItem("drawer") ||false;
const navbar = window.sessionStorage.getItem("navbar") ||true;

const state = {
  drawer: JSON.parse(drawer),
  navbar: JSON.parse(navbar),
};

const getters = {
  getDrawer(state){
    return state.drawer;
  },
  getNavBar(state){
    return state.navbar;
  }
}

const mutations = {
  toogleDrawer (state) {
    state.drawer = ! state.drawer;
    window.sessionStorage.setItem("drawer", state.drawer)
  },
  openDrawer(state){
    state.drawer =true;
    window.sessionStorage.setItem("drawer", state.drawer)
  },
  closeDrawer(state){
    state.drawer =false;
    window.sessionStorage.setItem("drawer", state.drawer)
  },
  toogleNavBar (state) {
    state.navbar = ! state.navbar;
    window.sessionStorage.setItem("navbar", state.navbar)
  },
  openNavBar(state){
    state.navbar =true;
    window.sessionStorage.setItem("navbar", state.navbar)
  },
  closeNavBar(state){
    state.navbar =false;
    window.sessionStorage.setItem("navbar", state.navbar)
  }
}

const actions = {};

export default {
  state,
  getters,
  actions,
  mutations
}
