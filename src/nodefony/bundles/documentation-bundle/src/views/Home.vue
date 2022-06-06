<template>
<div v-if="$apollo.queries.nodefony.loading">


  <v-container style="height: 400px;">
    <v-row class="fill-height" align-content="center" justify="center">
      <v-row class="text-subtitle-1 text-center">
        <v-img class="" width="100" height="91" src="/framework-bundle/images/nodefony-logo.png" />
      </v-row>
      <v-col class="text-subtitle-1 text-center" cols="12">
        Getting Nodefony Monitoring
      </v-col>
      <v-col cols="6">
        <v-progress-linear color="deep-purple accent-4" indeterminate rounded height="6"></v-progress-linear>
      </v-col>
    </v-row>
  </v-container>
</div>
<v-container v-else fluid v-if="nodefony" class="overflow-auto">

  <!--v-container fluid class="d-flex  justify-center">
    <v-img class="" width="100" height="91" src="/framework-bundle/images/nodefony-logo.png" />
  </v-container>
  <v-container fluid class="d-flex  justify-center pt-0">
    <v-card-title style="font-size:50px" class="nodefony">{{name}}</v-card-title>
    <v-chip inline>{{nodefony.status.version}}</v-chip>
  </v-container-->

  <v-row fluid class="flex-row">
    <n-nodefony-status :nodefony="nodefony" />
    <n-nodefony-network :nodefony="nodefony" />
  </v-row>

  <v-row fluid class=" flex-row">

    <n-nodefony-application :app="nodefony.application" />


    <v-card min-width="300" min-height="200" class="d-flex flex-column  flex-grow-1 flex-shrink-1 my-5 mx-5" outlined tile min->
      <v-toolbar rounded theme="dark" color="#233056">
        <template v-slot:prepend>
          <v-icon>mdi-box</v-icon>
        </template>
        <template v-slot:append>
        </template>
        Bundles
      </v-toolbar>
    </v-card>
    <v-card min-width="300" min-height="200" class="d-flex flex-column  flex-grow-1 flex-shrink-1 my-5 mx-5" outlined tile min->
      <v-toolbar rounded theme="dark" color="#233056">
        <template v-slot:prepend>
          <v-icon>mdi-box</v-icon>
        </template>
        <template v-slot:append>
        </template>
        ORM
      </v-toolbar>
    </v-card>
    <v-card min-width="300" min-height="200" class="d-flex flex-column  flex-grow-1 flex-shrink-1 my-5 mx-5" outlined tile min->
      <v-toolbar rounded theme="dark" color="#233056">
        <template v-slot:prepend>
          <v-icon>mdi-box</v-icon>
        </template>
        <template v-slot:append>
        </template>
        Users
      </v-toolbar>
    </v-card>
    <v-card min-width="300" min-height="200" class="d-flex flex-column  flex-grow-1 flex-shrink-1 my-5 mx-5" outlined tile min->
      <v-toolbar theme="dark" color="#233056">
        <template v-slot:prepend>
          <v-icon>mdi-box</v-icon>
        </template>
        <template v-slot:append>
        </template>
        Routing
      </v-toolbar>
    </v-card>
    <!--v-card min-width="300" min-height="200" v-for="n in 7" :key="n" class="d-flex flex-column  flex-grow-1 flex-shrink-1 my-5 mx-5" outlined tile min->

      <v-toolbar theme="dark" color="#233056">
        <template v-slot:prepend>
          <v-icon>mdi-box</v-icon>
        </template>
        <template v-slot:append>
        </template>
        Flex {{n}}
      </v-toolbar>

    </v-card-->
  </v-row>
</v-container>
</template>
<script>
import gql from 'graphql-tag'
import NodefonyStatus from '@/views/nodefony/NodefonyStatus'
import NodefonyNetwork from '@/views/nodefony/NodefonyNetwork'
import NodefonyApplication from '@/views/nodefony/NodefonyApplication'
export default {
  name: 'HomeView',
  components: {
    "n-nodefony-status": NodefonyStatus,
    "n-nodefony-network": NodefonyNetwork,
    "n-nodefony-application": NodefonyApplication
  },
  apollo: {
    nodefony: {
      // gql query
      query: gql `
      query getNodefony {
        status:getNodefonyStatus
        servers:getServers
        network:getNetwork
        application:getApplicationSettings
        kernel:getKernelSettings
      }
	    `,
      update: (data) => {
        return {
          status: JSON.parse(data.status),
          servers: JSON.parse(data.servers),
          network: JSON.parse(data.network),
          application: JSON.parse(data.application),
          kernel: JSON.parse(data.kernel)
        }
      },
      // Reactive parameters
      variables() {
        // Use vue reactive properties here
      },
      //pollInterval: 300
    }
  },
  setup() {},
  data() {
    return {
      name: "Nodefony",
      modelNodefony: 0,
    }
  },
  computed: {

  },
  beforeMount() {},
  mounted() {},
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
