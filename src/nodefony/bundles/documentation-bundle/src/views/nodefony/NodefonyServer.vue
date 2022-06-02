<template>
<v-container v-if="server">
  <v-tabs v-model="model">
    <v-tab :value="1">
      Server
    </v-tab>
    <v-tab :value="2">
      Settings
    </v-tab>
    <v-tab v-if="server.config" :value="3">
      Config
    </v-tab>
    <v-tab v-if="server.http2" :value="4">
      HTTP2
    </v-tab>
  </v-tabs>
  <v-window v-model="model" class="overflow-auto">
    <v-window-item :value="1">
      <div v-for=" (value, key) in server" :key="key">
        <v-list-item v-if="key != 'settings' && key != 'config' && key != 'http2'" class="text-caption">
          <v-list-item-header class="text-subtitle-2">
            <v-list-item-title>{{key}}</v-list-item-title>
          </v-list-item-header>
          <v-chip inline density="compact" variant="outlined" color='blue'>{{value}}</v-chip>
        </v-list-item>
        <v-divider></v-divider>
      </div>
    </v-window-item>

    <v-window-item v-if="server.http2" :value="4">
      <v-table density="compact">
        <tbody>
          <tr v-for=" (value, key) in server.http2" :key="key">
            <td>{{ key }}</td>
            <td>{{ value }}</td>
          </tr>
        </tbody>
      </v-table>
    </v-window-item>

    <v-window-item :value="2">
      <div v-for=" (value, key) in server.settings" :key="key">
        <div v-if="key == 'headers'">
          <v-card-title>
            Headers :
          </v-card-title>
          <v-table density="compact">
            <tbody>
              <tr v-for=" (value, key) in value" :key="key">
                <td>{{ key }}</td>
                <td>{{ value }}</td>
              </tr>
            </tbody>
          </v-table>
        </div>
        <div v-else-if="key == 'certificats'" class="text-caption">
          <v-card-title>
            certificates :
          </v-card-title>
          <v-table density="compact">
            <tbody>
              <tr v-for=" (value, key) in value" :key="key">
                <td>{{ key }}</td>
                <td>{{ value }}</td>
              </tr>
            </tbody>
          </v-table>
        </div>

        <v-list-item v-else class="text-caption">
          <v-list-item-header class="text-subtitle-2">
            <v-list-item-title>{{key}}</v-list-item-title>
          </v-list-item-header>
          <v-chip inline density="compact" variant="outlined" color='blue'>{{value || 'undefined'}}</v-chip>
        </v-list-item>
        <v-divider></v-divider>
      </div>
    </v-window-item>

    <v-window-item v-if="server.config" :value="3">
      <div v-for=" (value, key) in server.config" :key="key">
        <v-list-item class="text-caption">
          <v-list-item-header class="text-subtitle-2">
            <v-list-item-title>{{key}}</v-list-item-title>
          </v-list-item-header>
          <v-chip inline density="compact" variant="outlined" color='blue'>{{value}}</v-chip>
        </v-list-item>
        <v-divider></v-divider>
      </div>
    </v-window-item>
  </v-window>
</v-container>
</template>

<script>
export default {
  name: "NodefonyServer",
  components: {

  },
  props: {
    server: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      model: 1
    }
  }

}
</script>

<style lang="css" scoped>
</style>
