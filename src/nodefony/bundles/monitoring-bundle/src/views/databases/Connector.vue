<template>
  <v-container fluid
               v-if="connector">
    <n-orm-connection :connector="connector" />
    <div v-if="diagram"
         class="mermaid text-center">
      {{diagram}}
    </div>
  </v-container>
</template>
<script>
import gql from "graphql-tag";
import mermaid from "@/plugins/nodefony/compositions/mermaid.js";
import Connection from "@bundles/monitoring-bundle/src/views/databases/Connection.vue";
export default {
  name: "connectorView",
  components: {
    "n-orm-connection": Connection
  },
  props: {
    name: {
      type: String
    }
  },
  apollo: {
    request: {
      // gql query
      query: gql`
        query getConnector($name: String!) {
          connector:getConnector(name:$name)
        }
	    `,
      update: (data) => ({
        connector: JSON.parse(data.connector)
      }),
      // Reactive parameters
      variables () {
        // Use vue reactive properties here
        return {
          name: this.name
        };
      },
      // Disable the query
      skip () {
        return this.skipQuery;
      }
    }
  },

  setup () {
    const {
      parseConnectorSchema,
      init
    } = mermaid();
    return {
      parseConnectorSchema,
      init
    };
  },
  data () {
    return {
      skipQuery: false
    };
  },
  mounted () {},
  computed: {
    connector () {
      if (!this.skipQuery && this.request) {
        return this.request.connector;
      }
      return null;
    },
    diagram () {
      if (this.connector && this.connector.entities) {
        const dia = this.parseConnectorSchema(this.name, this.connector.entities);
        this.$nextTick(() => {
          console.log(dia);
          this.init();
        });
        return dia;
      }
      return "";
    }
  },
  methods: {

  }
};
</script>
