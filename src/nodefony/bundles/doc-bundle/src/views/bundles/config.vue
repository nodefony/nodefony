<template>
<v-card flat>
  <v-card-text>
    <v-list density="compact">
      <v-list-item v-for="(item, key) in config" density="compact" :key="key">
        <v-list-item-header>
          <v-list-item-title>{{key}} : </v-list-item-title>
        </v-list-item-header>:<wbr>
        <v-list-item-subtitle>{{item}}</v-list-item-subtitle>
      </v-list-item>
    </v-list>
  </v-card-text>
</v-card>
</template>


<script>
import {
  useRoute
} from 'vue-router'
import {
  ref,
  reactive,
  toRefs,
  computed
} from "vue";


export default {
  name: 'RoutingView',
  components: {

  },
  props: {
    config: {
      type: Object,
      default: null
    }
  },
  data() {
    return {

    }
  },
  computed: {

  },


  beforeMount() {

  },
  mounted() {

  },
  methods: {

  }
}
</script>


<style scoped lang="scss">

</style>
