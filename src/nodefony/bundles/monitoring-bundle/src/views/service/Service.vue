<template>
<v-container fluid class="pa-0 w-100 h-100" style="position:absolute">

  <v-toolbar color="#233056" theme="dark" extended flat>
    <v-app-bar-title>
      Services
      <v-badge color="info" v-if="nbService" :content="nbService" inline>
      </v-badge>
    </v-app-bar-title>
    <v-card-subtitle>routes</v-card-subtitle>
    <template v-slot:prepend>

    </template>
    <template v-slot:append>
      <v-icon size="50" color="#43853d" rounded="0">mdi-view-module</v-icon>
    </template>
  </v-toolbar>

  <v-container v-if="services" fluid class="w-100 pa-0 h-100" style="position:absolute">

    <v-table fixed-header class="overflow-auto" style="height:calc(100% - 60px)">
      <thead>
        <tr>
          <th class="text-left">
            Name
          </th>
          <th class="text-left">
            Bundle
          </th>
          <th class="text-left">
            instanceby
          </th>
          <th class="text-left">
            container id
          </th>
          <th class="text-left">
            Call After Instance
          </th>
          <th class="text-left">
            Injections
          </th>
        </tr>
      </thead>
      <tbody class=" h-100">
        <tr v-for="item in services" :key="item.name">
          <td>{{ item.name }}</td>
          <td>{{ item.bundle }}</td>
          <td>{{ item.run }}</td>
          <td>{{ item.scope }}</td>
          <td>{{ item.calls }}</td>
          <td>{{ item.injections }}</td>
        </tr>
      </tbody>
    </v-table>
  </v-container>
</v-container>
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
    request: {
      // gql query
      query: gql `
      query getServices {
        services:getServices
      }
	    `,
      update: (data) => {
        return {
          services: JSON.parse(data.services),
        }
      },
      // Reactive parameters
      variables() {
        // Use vue reactive properties here
      },
    }
  },
  watch: {

  },
  data() {
    return {
      tab: 1,
    }
  },
  setup(props) {
    const route = useRoute()
    return {}
  },

  computed: {
    services() {
      if (this.request && this.request.services) {
        return this.request.services
      }
      return null
    },
    nbService() {
      if (this.request && this.services) {
        return Object.keys(this.services).length
      }
      return null
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
