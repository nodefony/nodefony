<template>
<v-app ref="app">
  <v-app-bar color="grey-lighten-2" name="app-bar" class="justify-center">

  </v-app-bar>
  <v-navigation-drawer color="grey-darken-2" permanent name="drawer">

  </v-navigation-drawer>
  <v-main>
    <router-view :key="$route.fullPath"></router-view>
  </v-main>
</v-app>
</template>

<script>
export default {
  name: 'App',

  data: () => ({

  }),
}
</script>
