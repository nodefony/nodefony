<template>
  

  <v-app id="inspire">
  <v-app-bar extended>
      <v-app-bar-nav-icon to="/">
        <img width="50" height="50" alt="ml5" src="@/assets/tsf.jpeg">
      </v-app-bar-nav-icon>
      <v-app-bar-title>TensorFlow Demo </v-app-bar-title>
    </v-app-bar>

  <router-link to="/"></router-link>
    <router-view />
</v-app>

</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
