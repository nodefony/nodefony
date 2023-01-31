<template>
  <v-card flat>
    <v-card-text>
      <v-table fixed-header
               height="100vh">
        <thead>
          <tr>
            <th class="text-left">
              Name
            </th>
            <th class="text-left">
              Prefix
            </th>
            <th class="text-left">
              Methods
            </th>
            <th class="text-left">
              Uri
            </th>
            <th class="text-left">
              Host
            </th>
            <th class="text-left">
              variables
            </th>
            <th class="text-left">
              bypassFirewall
            </th>
            <th class="text-left">
              defaultLang
            </th>
            <th class="text-left">
              index
            </th>
            <th class="text-left">
              filePath
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in routes"
              :key="item.name">
            <td>{{ item.name }}</td>
            <td>{{ item.prefix }}</td>
            <td v-if="item.requirements">{{ item.requirements.method }}</td>
            <td v-else></td>
            <td>{{ item.path }}</td>
            <td>{{ item.host }}</td>
            <td>{{ item.variables }}</td>
            <td>{{ item.bypassFirewall }}</td>
            <td>{{ item.defaultLang }}</td>
            <td>{{ item.index }}</td>
            <td>{{ item.filePath }}</td>
          </tr>
        </tbody>
      </v-table>
    </v-card-text>
  </v-card>
</template>


<script>
import {
  useRoute
} from "vue-router";
import {
  computed,
  reactive,
  ref,
  toRefs
} from "vue";


export default {
  name: "RoutingView",
  components: {

  },
  props: {
    routes: {
      type: Object,
      default: null
    }
  },
  data () {
    return {

    };
  },
  computed: {

  },


  beforeMount () {

  },
  mounted () {

  },
  methods: {

  }
};
</script>


<style scoped lang="scss">

</style>
