<template>
<v-card v-if="entity" class="w-100 overflow-auto" outlined tile>
  <v-toolbar density="compact" theme="dark" color="#233056">
    <template v-slot:prepend>
      <v-icon>mdi-database-edit</v-icon>
    </template>
    <template v-slot:append>

    </template>
    <v-toolbar-title>ORM Entity</v-toolbar-title>
    <v-spacer></v-spacer>
    <v-btn color="grey" density="compact" variant="outlined" class="mr-2" @click="goToEntity"> {{entity.name}}</v-btn>
  </v-toolbar>

  <v-list density="compact" style="">
    <v-list-item class="text-caption">
      <v-list-item-header class="text-subtitle-2">
        <v-list-item-title>Name</v-list-item-title>
      </v-list-item-header>
      {{entity.name}}
    </v-list-item>
    <v-divider></v-divider>
    <v-list-item class="text-caption">
      <v-list-item-header>
        <v-list-item-title>Table Name</v-list-item-title>
      </v-list-item-header>
      {{entity.tableName}}
    </v-list-item>
    <v-divider></v-divider>
    <v-list-item class="text-caption" density="compact">
      <v-list-item-header class="text-subtitle-2">
        <v-list-item-title>Connector</v-list-item-title>
      </v-list-item-header>
      <v-chip class="text-caption" density="compact">{{entity.connectorName}}</v-chip>
    </v-list-item>
    <v-divider></v-divider>
    <v-list-item class="text-caption" density="compact">
      <v-list-item-header class="text-subtitle-2">
        <v-list-item-title>Bundle</v-list-item-title>
      </v-list-item-header>
      {{entity.bundleName}}
    </v-list-item>
    <v-divider></v-divider>
    <v-list-item class="text-caption" density="compact">
      <v-list-item-header class="text-subtitle-2">
        <v-list-item-title>Attributes</v-list-item-title>
      </v-list-item-header>
      <v-chip class="text-caption" density="compact">{{nbAttributes}}</v-chip>
    </v-list-item>
  </v-list>
  <v-container v-if="diagram">
    <div class="mermaid text-center">
      {{diagram}}
    </div>
  </v-container>
  <v-container v-if="!widget && attributes">
    <v-card-title>Schema</v-card-title>
    <v-table fixed-header density="compact">
      <thead>
        <tr>
          <th class="text-left">
            Name
          </th>
          <th class="text-left">
            Type
          </th>
          <th class="text-left">
            Base Type
          </th>
          <th class="text-left">
            maxLength
          </th>
          <th class="text-left">
            default
          </th>
          <th class="text-left">
            nullable
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, key) in properties" :key="key">
          <td>{{ key }}</td>
          <td>{{ item.type }}</td>
          <td>{{ attributes[key] ? attributes[key].type : '' }}</td>
          <td>{{ item.maxLength }}</td>
          <td>{{ item.default }}</td>
          <td>{{ item.nullable }}</td>
        </tr>
      </tbody>
    </v-table>
  </v-container>
</v-card>
</template>

<script>
import gql from 'graphql-tag'
import mermaid from '@/plugins/nodefony/compositions/mermaid.js'
export default {
  name: "n-orm-entity",
  props: {
    name: {
      type: String
    },
    widget: {
      type: Boolean,
      default: false
    },
    skipQuery: {
      type: Boolean,
      default: false
    },
    ormEntity: {
      type: Object,
      default: null
    }
  },
  setup() {
    const {
      parseEntitySchema,
      init
    } = mermaid();

    return {
      parseEntitySchema,
      init
    }
  },
  data() {
    return {}
  },
  beforeMount() {},
  mounted() {},
  apollo: {
    request: {
      // gql query
      query: gql `
        query getEntity($name: String!) {
          entity:getEntity(name:$name)
        }
	    `,
      update: (data) => {
        return JSON.parse(data.entity)
      },
      // Reactive parameters
      variables() {
        // Use vue reactive properties here
        return {
          name: this.name
        }
      },
      // Disable the query
      skip() {
        return this.skipQuery
      }
    }
  },
  computed: {
    diagram() {
      const dia = this.parseEntitySchema(this.name, this.schema, this.attributes)
      this.$nextTick(() => {
        this.init();
      })
      return dia
    },
    entity() {
      if (this.skipQuery && this.ormEntity) {
        return this.ormEntity
      }
      if (this.request) {
        return this.request[this.name]
      }
    },
    schema() {
      if (this.entity) {
        return this.entity.schema
      }
    },
    properties() {
      if (this.schema) {
        return this.schema.properties
      }
    },
    attributes() {
      if (this.entity) {
        return this.entity.attributes
      }
    },
    nbAttributes() {
      if (this.properties) {
        return Object.keys(this.properties).length
      }
    },
  },
  methods: {
    goToEntity() {
      return this.$router.push({
        path: `/database/entity/${this.entity.name}`,
        param: {
          entity: this.entity
        }
      })
    }
  }
}
</script>

<style lang="css" scoped>
</style>
