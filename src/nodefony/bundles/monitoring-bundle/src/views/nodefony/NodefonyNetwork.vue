<template>
  <v-card v-if="api"
          min-width="300"
          min-height="200"
          max-height="380"
          class="d-flex flex-column  flex-grow-1 flex-shrink-0 my-5 mx-5"
          outlined
          tile>
    <v-toolbar rounded
               density="compact"
               theme="dark"
               color="#233056">
      <template v-slot:prepend>
        <v-list-item class="pl-0"
                     :prepend-avatar="nodefony.logo"
                     title="Network">
        </v-list-item>
      </template>

      <template v-slot:extension>
        <v-tabs v-model="modelNetwork"
                centered>
          <v-tab v-for="(server, key) in api.servers"
                 :key="key"
                 :value="key">
            {{key}}
          </v-tab>
          <v-tab value="interfaces">
            Interfaces
          </v-tab>
        </v-tabs>
      </template>
    </v-toolbar>

    <v-window v-model="modelNetwork"
              style="max-height:300px"
              class="overflow-auto">

      <v-window-item class="overflow-auto"
                     value="interfaces">
        <n-nodefony-interface :interfaces="api.network.interfaces" />
      </v-window-item>

      <v-window-item v-for="(server, key) in api.servers"
                     :key="key"
                     :value="key">
        <n-nodefony-server :server="server" />
      </v-window-item>


    </v-window>
  </v-card>
</template>

<script>
import NodefonyServer from "@/views/nodefony/NodefonyServer";
import NodefonyInterface from "@/views/nodefony/NodefonyInterface";
export default {
  name: "NodefonyNetwork",
  inject: ["nodefony"],
  components: {
    "n-nodefony-server": NodefonyServer,
    "n-nodefony-interface": NodefonyInterface
  },
  props: {
    api: Object,
    default: null
  },
  data () {
    return {
      modelNetwork: "http"
    };
  }

};
</script>

<style lang="css" scoped>
</style>
