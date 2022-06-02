<template>
<v-card v-if="app" min-width="300" min-height="200" class="d-flex flex-column  flex-grow-1 flex-shrink-1 my-5 mx-5" outlined tile min->
  <v-toolbar density="compact" rounded theme="dark" color="#233056">
    <template v-slot:prepend>
      <v-list-item class="pl-0" title="Application" prepend-avatar="/app/images/app-logo.png">
      </v-list-item>
    </template>
    <template v-slot:append>
    </template>

    <template v-slot:extension>
      <v-tabs v-model="model">
        <v-tab :value="1">
          App
        </v-tab>

      </v-tabs>
    </template>
  </v-toolbar>

  <v-window v-model="model" class="overflow-auto">
    <v-window-item :value="1">
      <div v-for=" (value, key) in app.App" :key="key">
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
</v-card>
</template>

<script>
export default {
  name: "NodefonyApplication",
  components: {

  },
  props: {
    app: {
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
