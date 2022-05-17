<template>
<v-container fluid class="d-flex align-space-around flex-wrap">
  <v-card v-for="n in 40" :key="n" class="pa-1 ma-1" outlined tile min->
    <div style="width:300px; height:200px">
      Flex {{n}}
    </div>
  </v-card>
</v-container>
</template>
<script>
export default {
  name: 'DashboardMonitoring',
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
