import {
  createRouter,
  createWebHistory
} from 'vue-router'
import Store from '@/store';
import HomeView from '@/views/Home.vue'
import Login from '@/views/Login.vue';
import UserHome from '@/views/users/UsersHome.vue';
import UserProfile from '@/views/users/UserProfile.vue';
import UserStepper from '@/views/users/UserStepper.vue';

import Routes from '@/views/router/routes.vue';
import Sessions from '@/views/sessions/sessions.vue';

import Reveal from '@/views/presentations/slides/reveal.vue'
import Bundles from '@/views/bundles/Bundle.vue'
import DatabaseDashboard from '@/views/databases/Dashboard.vue'
import Entity from '@/views/databases/Entity'
import Connectors from '@/views/databases/Connector.vue'


import DashboardMonitoring from '@/views/monitoring/Dashboard.vue'

// profiling
import DashboardProfiling from '@/views/profiling/Dashboard.vue'
import RequestsProfiling from '@/views/profiling/Requests.vue'
import RequestProfiling from '@/views/profiling/Request.vue'
// Doc
import Readme from '@/views//nodefony/Readme.vue'
import Swagger from '@/views/documentation/Swagger.vue'
import Graphigl from '@/views/documentation/Graphigl.vue'

// logs
import Logs from '@/views/logs/Logs.vue'
//service
import Service from '@/views/service/Service.vue'

//migrate
import Migrate from '@/views/migrate/Migrate.vue'

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
  document.location = `/nodefony/login`;
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
    path: '/users',
    name: 'usersHome',
    component: UserHome,
    beforeEnter: ifAuthenticated
  }, {
    path: '/users/add',
    name: 'UserStepper',
    component: UserStepper,
    beforeEnter: ifAuthenticated
  }, {
    path: '/users/:username',
    name: 'UserProfile',
    props: true,
    component: UserProfile,
    beforeEnter: ifAuthenticated
  }, {
    path: '/routes',
    name: 'Routes',
    component: Routes,
    beforeEnter: ifAuthenticated
  }, {
    path: '/sessions',
    name: 'Sessions',
    component: Sessions,
    beforeEnter: ifAuthenticated
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
  }, {
    path: '/presentation',
    name: 'Reveal',
    component: Reveal,
    beforeEnter: ifAuthenticated
  }, {
    path: '/bundle/:name',
    name: 'Bundles',
    props: true,
    component: Bundles,
    beforeEnter: ifAuthenticated
  }, {
    path: '/database',
    name: 'DatabaseDashboard',
    component: DatabaseDashboard,
    beforeEnter: ifAuthenticated,
    children: [{
      path: 'entity/:name',
      name: "OrmEntity",
      props: true,
      components: {
        orm: Entity,
      }
    }]
  }, {
    path: '/database/connectors/:name',
    name: 'Connectors',
    props: true,
    component: Connectors,
    beforeEnter: ifAuthenticated
  }, {
    path: '/readme',
    name: 'nodefonyreadme',
    component: Readme,
    beforeEnter: ifAuthenticated
  }, {
    path: '/monitoring/dashboard',
    name: 'DashboardMonitoring',
    component: DashboardMonitoring,
    beforeEnter: ifAuthenticated
  }, {
    path: '/profiling/dashboard',
    name: 'DashboardProfiling',
    component: DashboardProfiling,
    beforeEnter: ifAuthenticated
  }, {
    path: '/profiling/requests',
    name: 'RequestsProfiling',
    component: RequestsProfiling,
    beforeEnter: ifAuthenticated
  }, {
    path: '/profiling/requests/:id',
    name: 'RequestProfiling',
    props: true,
    component: RequestProfiling,
    beforeEnter: ifAuthenticated
  }, {
    path: '/services',
    name: 'Services',
    component: Service,
    beforeEnter: ifAuthenticated
  }, {
    path: '/logs',
    name: 'Logs',
    component: Logs,
    beforeEnter: ifAuthenticated
  }, {
    path: '/migrate/status',
    name: 'Migrate',
    component: Migrate,
    beforeEnter: ifAuthenticated,
  }
]

const router = createRouter({
  history: createWebHistory("nodefony"),
  routes
})

export default router
