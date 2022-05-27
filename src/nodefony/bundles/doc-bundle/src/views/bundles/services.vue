<template>
<v-card flat>
  <v-card-text>
    <v-table fixed-header height="100vh">
      <thead>
        <tr>
          <th class="text-left">
            Name
          </th>
          <th class="text-left">
            instanceby
          </th>
          <th class="text-left">
            container id
          </th>
          <th class="text-left">
            Call After Instance
          </th>
          <th class="text-left">
            Injections
          </th>

        </tr>
      </thead>
      <tbody>
        <tr v-for="item in services" :key="item.name">
          <td>{{ item.name }}</td>
          <td>{{ item.run }}</td>
          <td>{{ item.scope }}</td>
          <td>{{ item.calls }}</td>
          <td>{{ item.injections }}</td>

        </tr>
      </tbody>
    </v-table>
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
  name: 'ServicesView',
  components: {

  },
  props: {
    services: {
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
