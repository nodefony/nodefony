<template>
<v-container fluid class="d-flex align-space-around flex-wrap">

  <v-card min-width="300" min-height="200" v-for="n in 7" :key="n" class="d-flex flex-column  flex-grow-1 flex-shrink-1 my-5 mx-5" outlined tile min->
    <v-toolbar theme="dark" color="#0337ab">
      <template v-slot:prepend>
        <v-icon>mdi-box</v-icon>
      </template>
      <template v-slot:append>
      </template>
      Flex {{n}}
    </v-toolbar>

  </v-card>
</v-container>
</template>
<script>
export default {
  name: 'DashboardProfiling',
  components: {

  },

  setup() {

  },
  data() {
    return {
      name: "nodefony"
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
