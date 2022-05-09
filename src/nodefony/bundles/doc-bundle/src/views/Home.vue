<template>
<v-container fluid class="d-flex align-content-space-around flex-wrap">
  <v-card v-for="n in 40" :key="n" class="pa-2 ma-2" outlined tile height="200" width="500">
    Flex item
  </v-card>
</v-container>
</template>
<script>
export default {
  name: 'HomeView',
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
