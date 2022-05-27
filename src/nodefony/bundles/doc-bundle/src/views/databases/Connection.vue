<template>
<v-card v-if="connector" outlined tile>
  <v-toolbar theme="dark" color="#233056">
    <template v-slot:prepend>
      <v-icon>mdi-connection</v-icon>
    </template>
    <template v-slot:append>
      <v-img class="" width="35" height=">35" :src="imageSqLite" />
    </template>
    <v-toolbar-title>Connector {{connector.type}}</v-toolbar-title>
    <v-chip :color="colorConnect" density="compact">{{connector.state}}</v-chip>

    <v-spacer></v-spacer>
    <div class="mr-2">
      {{connector.name}}
    </div>
  </v-toolbar>
  <v-container fluid>
    <v-row>
      <v-col>
        <div> Descriptions</div>
        <v-list density="compact" style="">
          <v-list-item class="text-caption">
            <v-list-item-header class="text-subtitle-2">
              <v-list-item-title>Name</v-list-item-title>
            </v-list-item-header>
            {{connector.name}}
          </v-list-item>
          <v-list-item class="text-caption">
            <v-list-item-header>
              <v-list-item-title>Type</v-list-item-title>
            </v-list-item-header>
            {{connector.type}}
          </v-list-item>
          <v-list-item class="text-caption" density="compact">
            <v-list-item-header class="text-subtitle-2">
              <v-list-item-title>State</v-list-item-title>
            </v-list-item-header>
            <v-chip density="compact">{{connector.state}}</v-chip>
          </v-list-item>
          <v-list-item v-if="connector.type== 'sqlite'" lines="two" class="text-caption" density="compact">
            <v-list-item-header class="text-subtitle-2">
              <v-list-item-title>Storage</v-list-item-title>
              <v-list-item-subtitle>{{connector.settings.options.storage}}</v-list-item-subtitle>
            </v-list-item-header>
          </v-list-item>
        </v-list>
      </v-col>
      <v-divider v-if="!widget" class="" vertical></v-divider>
      <v-col v-if="!widget">
        <div> Options</div>
        <v-list>
          <div v-for="(value, key) in connector.settings.options " :key="key">
            <v-list-item v-if="key !== 'storage'" class="text-caption">
              <v-list-item-header class="text-subtitle-2">
                <v-list-item-title>{{key}}</v-list-item-title>
              </v-list-item-header>
              {{value}}
            </v-list-item>
          </div>
        </v-list>
      </v-col>
    </v-row>
  </v-container>
</v-card>
</template>


<script>
import imageSqLite from '@/../public/img/sqlite.webp'
export default {
  name: "n-orm-connection",
  props: {
    connector: {
      type: Object,
      default: null
    },
    widget: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      imageSqLite: imageSqLite
    }
  },
  computed: {
    colorConnect() {
      if (this.connector) {
        if (this.connector.state === "CONNECTED") {
          return "green"
        }
      }
      return 'red'
    }
  }
}
</script>

<style lang="css" scoped>
</style>
