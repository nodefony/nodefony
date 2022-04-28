<template>
<v-navigation-drawer v-model="drawer" width="300" app>
  <Suspense>
    <user-card tile />
  </Suspense>
  <v-divider></v-divider>
  <v-list nav dense>

    <v-list density="compact" nav>
      <v-list-item prepend-icon="mdi-home" title="Home" value="home" to="/home"></v-list-item>

      <v-list-group v-if="isAdmin">
        <template v-slot:activator="{ props }">
          <v-list-item v-bind="props" prepend-icon="mdi-link-variant" title="App" value="CollectLinks"></v-list-item>
        </template>
      </v-list-group>

      <v-divider></v-divider>

      <v-list-group>
        <template v-slot:activator="{ props }">
          <v-list-item v-bind="props" prepend-icon="mdi-api" title="api" value="api"></v-list-item>
        </template>
        <v-list-item prepend-icon="mdi-api " title="Swagger" value="swagger" to="/swagger"></v-list-item>
        <v-list-item prepend-icon="mdi-api " title="Graphigl" value="graphgl" to="/graphigl"></v-list-item>
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
  name: 'Navigation',
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
