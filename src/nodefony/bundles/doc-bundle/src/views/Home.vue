<template>
<v-card flat class="h-100 overflow-auto">

  <v-container fluid class="d-flex  justify-center">
    <v-img class="" width="100" height="91" src="/framework-bundle/images/nodefony-logo.png" />
  </v-container>
  <v-container fluid class="d-flex  justify-center pt-0">
    <v-card-title style="font-size:50px" class="nodefony">{{name}}</v-card-title>
  </v-container>
  <!--v-container fluid class="d-flex flex-row  align-items-stretch flex-wrap ">
    <v-card min-width="300" min-height="200" v-for="n in 5" :key="n" class="d-flex flex-column flex-wrap flex-grow-1 flex-shrink-1  pa-2 ma-2 mt-auto" outlined tile min->
      <div>
        Flex {{n}}
      </div>
    </v-card>
  </v-container-->
  <v-container fluid class="d-flex flex-row flex-wrap overflow-auto">

    <v-card min-width="300" min-height="200" v-for="n in 7" :key="n" class="d-flex flex-column  flex-grow-1 flex-shrink-1 my-5 mx-5" outlined tile min->
      <v-toolbar theme="dark" color="#233056">
        <template v-slot:prepend>
          <v-list-item class="pl-0" title="Nodefony" value="nodefony" prepend-avatar="/app/images/app-logo.png">
          </v-list-item>
        </template>
        <template v-slot:append>
        </template>
        Flex {{n}}
      </v-toolbar>

    </v-card>

  </v-container>
</v-card>
<!--v-layout class="d-flex align-center flex-column mt-10">
  <v-img :aspect-ratio="1" class="" width="200" height="182" src="/framework-bundle/images/nodefony-logo.png" />
  <h1 class="nodefony" style="font-size:75px"> {{name}}</h1>

  <v-img :aspect-ratio="2" class="" width="200" height="182" src="/framework-bundle/images/nodejs/nodejs-new-pantone-black.png" />


</v-layout-->
</template>
<script>
export default {
  name: 'HomeView',
  components: {},

  setup() {

  },
  data() {
    return {
      name: "Nodefony"
    }
  },
  beforeMount() {

  },
  mounted() {

  },
  methods: {

  }
}
</script>

<style lang="scss">
@font-face {
    font-family: 'Gochi Hand';
    src: url("https://fonts.googleapis.com/css?family=Gochi+Hand") format('woff2');
}

.nodefony {
    font-family: 'Gochi Hand' !important;
    color: #0167b8;
    letter-spacing: 0;
}
</style>
