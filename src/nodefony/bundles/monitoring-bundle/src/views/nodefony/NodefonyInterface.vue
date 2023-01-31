<template>
  <v-container fluid
               v-if="interfaces">
    <v-card theme="dark"
            variant="outlined"
            rounded
            v-for=" (value, key) in interfaces"
            :key="key"
            class="mt-5">
      <v-toolbar density="compact"
                 color="#167b87">
        <v-card-title>{{key}}</v-card-title>
      </v-toolbar>

      <v-card height="200"
              v-for=" (value2, key2) in value"
              :key="key2"
              class="overflow-auto">
        <v-table density="compact">
          <v-card-title>
            ipv{{value2['family']}} :
            <v-chip inline>{{value2['address']}} </v-chip>
          </v-card-title>
          <tbody>
            <tr v-for=" (value3, key3) in value2"
                :key="key3">
              <td>{{ key3 }}</td>
              <td>{{ value3 }}</td>
            </tr>
          </tbody>
        </v-table>
        <v-divider></v-divider>
      </v-card>
      <v-divider></v-divider>
    </v-card>
  </v-container>
</template>

<script>
export default {
  name: "NodefonyInterface",
  components: {

  },
  props: {
    interfaces: {
      type: Object,
      default: null
    }
  },
  data () {
    return {

    };
  }

};
</script>

<style lang="css" scoped>
</style>
