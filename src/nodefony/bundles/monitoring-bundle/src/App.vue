<template>
  <v-app id="nodefony">
    <app-navigation v-if="profile" />

    <app-bar @profile="onProfile"
             @error="onError" />

    <v-main ref="main">
      <router-view v-if="profile"
                   :key="$route.fullPath">
      </router-view>
    </v-main>
  </v-app>
</template>

<script>
// @ is an alias to /src
import {
// mapGetters,
// mapActions,
// mapMutations
} from "vuex";
import Navigation from "/src/views/layouts/Navigation.vue";
import Bar from "/src/views/layouts/Bar.vue";
export default {
  name: "App",
  components: {
    "app-navigation": Navigation,
    "app-bar": Bar
  },
  data () {
    return {
      profile: false
    };
  },
  mounted () {},
  beforeMount () {},
  methods: {
    onProfile () {
      this.profile = true;
    },
    onError () {
      this.profile = true;
    }
  }
};
</script>

<script setup>
import {
  getCurrentInstance,
  inject,
  ref,
  unref
} from "vue";
const nodefony = inject("nodefony");
const main = ref(null);
try {
  nodefony.application = getCurrentInstance();
  nodefony.main = unref(main);
} catch (e) {
  console.error(e);
}
</script>

<style lang="scss">
#app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    /*text-align: center;*/
    color: #2c3e50;
}

/*nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}*/
</style>
