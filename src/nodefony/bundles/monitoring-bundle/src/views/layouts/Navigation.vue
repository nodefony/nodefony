<template>
<v-navigation-drawer v-model="drawer" width="300" app>
  <Suspense>
    <user-card tile />
  </Suspense>
  <v-divider></v-divider>

  <v-list density="compact" nav class="ma-0 pa-0">
    <v-list-item href="/" prepend-icon="mdi-arrow-left-circle" title="Home Application" value="home"></v-list-item>

    <v-list-item prepend-icon="mdi-monitor-dashboard" title="Dashboard" value="dashboard" to="/home"></v-list-item>
    <v-divider></v-divider>

    <v-list-group>
      <template v-slot:activator="{ props }">
        <v-list-item v-bind="props" prepend-icon="mdi-help-rhombus" title="Documentation" value="documentation"></v-list-item>
      </template>
      <v-list-item prepend-icon="mdi-api " title="Swagger" value="swagger" to="/swagger"></v-list-item>
      <v-list-item prepend-icon="mdi-api " title="Graphigl" value="graphgl" to="/graphigl"></v-list-item>

      <v-list-group>
        <template v-slot:activator="{ props }">
          <v-list-item class="pl-0" v-bind="props" title="Nodefony" value="nodefony" prepend-avatar="/app/images/app-logo.png">
          </v-list-item>
        </template>
        <v-list-item prepend-icon="mdi-language-markdown" title="readme" value="readme" to="/readme"></v-list-item>
        <v-list-item prepend-icon="mdi-api" title="Kernel" value="kernel"></v-list-item>
        <v-list-item prepend-icon="mdi-api" title="Api" value="api"></v-list-item>
        <v-list-item prepend-icon="mdi-api" title="controller" value="controller"></v-list-item>
      </v-list-group>
      <v-divider></v-divider>
    </v-list-group>
    <v-divider></v-divider>


    <v-list-group v-if="bundles">
      <template v-slot:activator="{ props }">
        <v-list-item v-bind="props" prepend-icon="mdi-view-module" title="Bundles" value="bundles"></v-list-item>
      </template>

      <v-list-item v-for="(bundle) in bundles" key="bundle.name" :title="bundle.name" :value="bundle.name" :to="`/bundle/${bundle.name}`">
        <template v-slot:prepend>
          <v-icon :color="bundle.color" class="mr-2">{{bundle.icon}}</v-icon>
        </template>
      </v-list-item>

    </v-list-group>
    <v-divider></v-divider>

    <v-list-item prepend-icon="mdi-view-module-outline" title="Services" value="services" to="/services"></v-list-item>
    <v-divider></v-divider>

    <v-list-item prepend-icon="mdi-router" title="Router" value="router" :to="{name:'Routes'}">
    </v-list-item>
    <v-divider></v-divider>


    <v-list-item prepend-icon="mdi-security" title="Firewall" value="firewall"></v-list-item>
    <v-divider></v-divider>


    <v-list-group v-if="isAdmin">
      <template v-slot:activator="{ props }">
        <v-list-item v-bind="props" prepend-icon="mdi-database" title="Databases / ORM" value="databases"></v-list-item>
      </template>
      <v-list-item title="Dashboard" prepend-icon="mdi-view-dashboard-variant" value="dashboarddatabase" to="/database">
      </v-list-item>
      <v-list-group>
        <template v-slot:activator="{ props }">
          <v-list-item v-bind="props" title="Schemas" value="Connectors">
          </v-list-item>
        </template>
        <v-list-item v-for="(connector) in connectors" :title="connector.name" :key="connector.name" :to="`/database/connectors/${connector.name}`">
        </v-list-item>
      </v-list-group>
    </v-list-group>
    <v-divider></v-divider>

    <v-list-item prepend-icon="mdi-cookie-lock" title="Sessions" value="sessions" :to="{name:'Sessions'}">
    </v-list-item>
    <v-divider></v-divider>

    <v-list-group v-if="isAdmin">
      <template v-slot:activator="{ props }">
        <v-list-item v-bind="props" prepend-icon="mdi-account-multiple" title="Users" value="usersProfile"></v-list-item>
      </template>
      <v-list-item prepend-icon="mdi-table-account" title="List" value="usersList" to="/users">
      </v-list-item>
      <v-list-item prepend-icon="mdi-account-plus" title="Add User" value="usersAdd" to="/users/add">
      </v-list-item>
    </v-list-group>
    <v-divider></v-divider>

    <v-list-item prepend-icon="mdi-math-log " title="Syslog" value="syslog" to="/logs"></v-list-item>
    <v-divider></v-divider>

    <v-list-group v-if="isAdmin">
      <template v-slot:activator="{ props }">
        <v-list-item v-bind="props" prepend-icon="mdi-file-powerpoint-box" title="Presentation" value="presentation"></v-list-item>
      </template>
      <v-list-item prepend-icon="mdi-application-outline" title="Example" value="example" to="/presentation"></v-list-item>
    </v-list-group>

    <v-divider></v-divider>
    <v-list-group v-if="isAdmin">
      <template v-slot:activator="{ props }">
        <v-list-item v-bind="props" prepend-icon="mdi-web-sync" title="Profiling" value="profiling"></v-list-item>
      </template>
      <v-list-item prepend-icon="mdi-monitor-dashboard" title="Dashboard" value="dashboardProfiling" to="/profiling/dashboard">
      </v-list-item>
      <v-list-item prepend-icon="mdi-monitor" title="Requests" value="requestsProfiling" to="/profiling/requests">
      </v-list-item>
    </v-list-group>

    <v-divider></v-divider>
    <v-list-group v-if="isAdmin">
      <template v-slot:activator="{ props }">
        <v-list-item v-bind="props" prepend-icon="mdi-monitor" title="Monitoring" value="monitoring"></v-list-item>
      </template>
      <v-list-item prepend-icon="mdi-monitor-dashboard" title="Dashboard" value="DashboardMonitoring" to="/monitoring/dashboard">
      </v-list-item>
    </v-list-group>
    <v-divider></v-divider>
    <v-list-group v-if="isAdmin">
      <template v-slot:activator="{ props }">
        <v-list-item v-bind="props" prepend-icon="mdi-alpha-p-box" title="PM2" value="pm2"></v-list-item>
      </template>
      <v-list-item prepend-icon="mdi-cog" title="config" value="pm2config">
      </v-list-item>
    </v-list-group>

  </v-list>


</v-navigation-drawer>
</template>

<script>
// @ is an alias to /src
import {
  mapGetters,
  mapActions,
  mapMutations
} from 'vuex';
import User from '@/views/users/components/User.vue'
import gql from 'graphql-tag'
export default {
  name: 'AppNavigation',
  components: {
    "user-card": User
  },
  data: () => ({

  }),
  apollo: {
    request: {
      // gql query
      query: gql `
      query getBundles($registred: Boolean) {
        bundles:getBundles(registred: $registred)
        connectors:getConnectors
      }
      `,
      update: (data) => {
        return {
          bundles: JSON.parse(data.bundles),
          connectors: JSON.parse(data.connectors)
        }
      },
      // Reactive parameters
      variables() {
        // Use vue reactive properties here
        return {
          registred: true,
        }
      },
    }
  },

  computed: {
    ...mapGetters([
      'getDrawer',
      'isAuthenticated',
      'hasRole'
    ]),
    isAdmin() {
      return this.hasRole("ROLE_ADMIN")
    },

    connectors() {
      if (!this.request) {
        return null
      }
      return this.request.connectors
    },

    bundles() {
      if (!this.request) {
        return []
      }
      const ret = this.request.bundles
        .map((bundle) => {
          if (bundle.registred) {
            bundle.color = "blue"
          } else {
            bundle.color = "red"
          }
          switch (bundle.name) {
            case "users":
              bundle.icon = "mdi-account-multiple"
              break
            case "mail":
              bundle.icon = "mdi-email-outline"
              break
            case "test":
            case "unittests":
              bundle.icon = "mdi-function-variant"
              break
            case "doc":
            case "documentation":
              bundle.icon = "mdi-help-box"
              break
            case "http":
              bundle.icon = "mdi-protocol"
              break
            case "framework":
              bundle.icon = "mdi-tools"
              break
            case "security":
              bundle.icon = "mdi-security"
              break
            case "monitoring":
              bundle.icon = "mdi-monitor"
              break
            case "realtime":
              bundle.icon = "mdi-update"
              break
            case "sequelize":
            case "redis":
            case "elastic":
            case "mongoose":
              bundle.icon = "mdi-database"
              break
            default:
              bundle.icon = "mdi-application-outline"
          }
          return bundle
        })
      return ret
    },
    drawer: {
      get() {
        return this.getDrawer
      },
      set(ele) {
        return
      }
    }
  },

  methods: {
    ...mapMutations([]),
    ...mapActions({}),
    open() {
      //window.open('', '_blank')
    }
  }
}
</script>


<style lang="scss">

</style>
