<template>
<v-card>
  <v-layout>
    <v-navigation-drawer width="250" permanent>
      <template v-slot:image>
        <v-img gradient="to top right, rgba(19,84,122,.8), rgba(128,208,199,.8)"></v-img>
      </template>

      <v-tabs density="compact" v-model="tab" direction="vertical" color="primary">
        <v-tab value="readme">
          <v-icon start>
            mdi-language-markdown
          </v-icon>
          README.md
        </v-tab>
        <v-divider></v-divider>
        <v-tab value="config">
          <v-icon start>
            mdi-tools
          </v-icon>
          Configurations
        </v-tab>
        <v-divider></v-divider>

        <v-tab value="tests">
          <v-icon start>
            mdi-hospital-box
          </v-icon>
          Unit Tests
        </v-tab>

        <v-divider></v-divider>

      </v-tabs>
    </v-navigation-drawer>
    <v-main style="height:100vh ;max-height:100vh" class="overflow-auto">

      <v-window v-model="tab">
        <v-window-item value="readme">
          <v-card flat>
            <v-card-text>

            </v-card-text>
          </v-card>
        </v-window-item>


        <v-window-item value="config">

        </v-window-item>

      </v-window>
    </v-main>
  </v-layout>
</v-card>
</template>

<script>
import {
  useRoute
} from 'vue-router'
import {
  ref,
  reactive,
  toRefs,
  computed
} from "vue";

import gql from 'graphql-tag'
export default {
  name: 'serviceView',
  components: {

  },
  props: {

  },
  apollo: {
    service: {
      // gql query
      query: gql `
      query getServices(service: String!) {
        routes:getServices(name: service){
          name
        }
      }
	    `,
      update: (data) => {
        return {
          services: data.service,
        }
      },
      // Reactive parameters
      variables() {
        // Use vue reactive properties here
        return {
          service: this.name,
        }
      },
    }
  },

  data() {
    return {
      tab: 1,
      service: null,
    }
  },
  setup(props) {
    const route = useRoute()
    const name = reactive(route.params.name)

    return {
      name
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


<style scoped lang="scss">

</style>
