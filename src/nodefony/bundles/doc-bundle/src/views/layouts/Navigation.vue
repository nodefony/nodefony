<template>
<v-navigation-drawer v-model="drawer" width="300" app>
  <Suspense>
    <user-card tile />
  </Suspense>
  <v-divider></v-divider>
  <v-list nav dense class="ma-0 pa-0">

    <v-list density="compact" nav>
      <v-list-item prepend-icon="mdi-home" title="Home" value="home" to="/home"></v-list-item>

      <v-divider></v-divider>
      <v-list-group v-if="isAdmin">
        <template v-slot:activator="{ props }">
          <v-list-item v-bind="props" title="Nodefony" value="nodefony" prepend-avatar="/app/images/app-logo.png">
          </v-list-item>
        </template>
        <v-list-item prepend-icon="mdi-language-markdown" title="readme" value="readme" to="/nodefony/readme"></v-list-item>
        <v-list-item prepend-icon="mdi-api" title="Kernel" value="kernel"></v-list-item>
        <v-list-item prepend-icon="mdi-api" title="Api" value="api"></v-list-item>
        <v-list-item prepend-icon="mdi-api" title="controller" value="controller"></v-list-item>
      </v-list-group>

      <v-divider></v-divider>
      <v-list-group v-if="isAdmin">
        <template v-slot:activator="{ props }">
          <v-list-item v-bind="props" prepend-icon="mdi-view-module" title="Bundles" value="bundles"></v-list-item>
        </template>
        <v-list-item prepend-icon="mdi-application-outline" title="App" value="app" to="/bundle/app"></v-list-item>
        <v-list-item prepend-icon="mdi-protocol" title="http" value="http" to="/bundle/http"></v-list-item>
        <v-list-item prepend-icon="mdi-tools" title="framework" value="framework" to="/bundle/framework"></v-list-item>
        <v-list-item prepend-icon="mdi-account" title="users" value="users" to="/bundle/users"></v-list-item>
        <v-list-item prepend-icon="mdi-email-outline" title="mail" value="mail" to="/bundle/mail"></v-list-item>
        <v-list-item prepend-icon="mdi-update" title="realtime" value="realtime" to="/bundle/realtime"></v-list-item>
        <v-list-item prepend-icon="mdi-function-variant" title="unittests" value="unittests" to="/bundle/unittests"></v-list-item>

        <v-list-item prepend-icon="mdi-security" title="security" value="security" to="/bundle/security"></v-list-item>
        <v-list-item prepend-icon="mdi-database" title="sequelize" value="sequelize" to="/bundle/sequelize"></v-list-item>
        <v-list-item prepend-icon="mdi-database" title="redis" value="redis" to="/bundle/redis"></v-list-item>
        <v-list-item prepend-icon="mdi-database" title="mongoose" value="mongoose" to="/bundle/mongoose"></v-list-item>
        <v-list-item prepend-icon="mdi-database" title="elastic" value="elastic" to="/bundle/elastic"></v-list-item>
        <v-list-item prepend-icon="mdi-help-box" title="doc" value="doc" to="/bundle/doc"></v-list-item>
        <v-list-item prepend-icon="mdi-help-box" title="test" value="test" to="/bundle/test"></v-list-item>
      </v-list-group>

      <v-divider></v-divider>
      <v-list-group v-if="isAdmin">
        <template v-slot:activator="{ props }">
          <v-list-item v-bind="props" prepend-icon="mdi-database" title="Databases" value="databases"></v-list-item>
        </template>
        <v-list-group>
          <template v-slot:activator="{ props }">
            <v-list-item v-bind="props" title="Connectors" value="Connectors">
            </v-list-item>
          </template>
          <v-list-item title="nodefony" value="nodefonydatabase" to="/database/connectors/nodefony">
          </v-list-item>
        </v-list-group>

      </v-list-group>


      <v-divider></v-divider>

      <v-list-group>
        <template v-slot:activator="{ props }">
          <v-list-item v-bind="props" prepend-icon="mdi-api" title="Documentation" value="documentation"></v-list-item>
        </template>
        <v-list-item prepend-icon="mdi-api " title="Swagger" value="swagger" to="/swagger"></v-list-item>
        <v-list-item prepend-icon="mdi-api " title="Graphigl" value="graphgl" to="/graphigl"></v-list-item>
      </v-list-group>

      <v-divider></v-divider>
      <v-list-group v-if="isAdmin">
        <template v-slot:activator="{ props }">
          <v-list-item v-bind="props" prepend-icon="mdi-file-powerpoint-box" title="Presentation" value="presentation"></v-list-item>
        </template>
        <v-list-item prepend-icon="mdi-application-outline" title="Example" value="example" to="/presentation"></v-list-item>
      </v-list-group>

    </v-list>

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
import User from '@/components/users/User.vue'
export default {
  name: 'AppNavigation',
  components: {
    "user-card": User
  },
  data: () => ({}),
  computed: {
    ...mapGetters([
      'getDrawer',
      'isAuthenticated',
      'hasRole'
    ]),
    isAdmin() {
      return this.hasRole("ROLE_ADMIN")
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
