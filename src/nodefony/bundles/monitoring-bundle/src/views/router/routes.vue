<template >
  <v-layout class="h-100">
    <v-data-table :loading="loading"
                  :headers="headers"
                  :items="routes"
                  :items-length="nbRoutes"
                  :search="search"
                  item-value="name"
                  density="compact"
                  :items-per-page="itemsPerPage"
                  class="elevation-2">

      <template v-slot:top>
        <v-toolbar color="#233056"
                   theme="dark"
                   extended
                   flat>
          <v-app-bar-title>
            Router
            <v-badge color="info"
                     v-if="nbRoutes"
                     :content="nbRoutes"
                     inline>
            </v-badge>
          </v-app-bar-title>
          <v-card-subtitle>routes</v-card-subtitle>
          <template v-slot:prepend>
            <v-icon size="50"
                    color="#43853d"
                    rounded="0">mdi-router</v-icon>
          </template>
          <template v-slot:append>
            <v-icon size="50"
                    color="#43853d"
                    rounded="0">mdi-protocol</v-icon>
          </template>
        </v-toolbar>
        <v-card-title>
          Search Routes
          <v-spacer></v-spacer>
          <v-text-field v-model="search"
                        append-icon="mdi-magnify"
                        label="Search"
                        single-line
                        hide-details></v-text-field>
        </v-card-title>
      </template>

      <template v-if="item"
                v-slot:item.requirements="{ item }">
        <v-chip v-if="getMethods(item.raw.requirements.method)"
                v-for='method in item.raw.requirements.method'
                density="compact">
          {{method}}
        </v-chip>
      </template>
    </v-data-table>
  </v-layout>
</template>

<script>
import gql from "graphql-tag";
export default {
  name: "n-routes",
  inject: ["nodefony"],
  components: {},
  props: {},
  apollo: {
    request: {
      // gql query
      query: gql`
      query getRoutes {
        routes:getRoutes{
          name
          path
          host
          variables
          requirements
          bypassFirewall
          defaultLang
          hash
          prefix
          schemes
          filePath
          bundle
          index
        }
      }
	    `,
      update: (data) => ({
        routes: data.routes
      }),
      // Reactive parameters
      variables () {
        // Use vue reactive properties here
      }
    }
  },
  watch: {},
  data () {
    return {
      itemsPerPage: 12,
      search: "",
      // loading: false,
      options: {},
      headers: [{
        title: "index",
        align: "start",
        key: "index"
      }, {
        title: "Bundle",
        key: "bundle"
      }, {
        title: "Name",
        key: "name"
      }, {
        title: "Prefix",
        key: "prefix"
      }, {
        title: "Methods",
        key: "requirements"
      }, {
        title: "Uri",
        key: "path"
      }, {
        title: "Host",
        key: "host"
      }, {
        title: "variables",
        sortable: false,
        key: "variables"
      }, {
        title: "bypassFirewall",
        key: "defaultLang"
      }, {
        title: "defaultLang",
        key: "defaultLang"
      }, {
        title: "File Declaration",
        sortable: false,
        align: "start",
        key: "filePath"
      }]
    };
  },
  computed: {
    routes () {
      if (this.request && this.request.routes) {
        return this.request.routes;
      }
      return [];
    },
    nbRoutes () {
      if (this.request && this.routes) {
        return Object.keys(this.routes).length;
      }
      return null;
    },
    loading () {
      return this.$apollo.queries.request.loading;
    }
  },
  beforeMount () {},
  mounted () {},
  methods: {
    basename (path) {
      if (path) {
        return this.nodefony.client.basename(path);
      }
      return "";
    },
    getMethods (methods) {
      if (methods) {
        if (typeof methods === "string") {
          return false;
        }
        return true;
      }
      return false;
    }
  }
};
</script>

<style lang="css" scoped>
</style>
