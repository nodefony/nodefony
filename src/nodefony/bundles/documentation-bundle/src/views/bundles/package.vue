<template>
<v-container fluid class="pa-0">
  <v-card color="#233056" theme="dark">
    <div class="absolute d-flex flex-no-wrap justify-space-between">
      <div class="flex-grow-0 ">
        <v-card-title class="text-h5">
          Package.json
        </v-card-title>
        <v-card-subtitle>
          {{package.description}}
        </v-card-subtitle>
        <v-list bg-color="#233056" density="compact">
          <v-list-item density="compact">
            <v-list-item-header>
              <v-list-item-title>Dependencies : </v-list-item-title>
            </v-list-item-header>
            <v-list-item-subtitle>
              {{nbDependencies}}
            </v-list-item-subtitle>
          </v-list-item>
          <v-list-item density="compact">
            <v-list-item-header>
              <v-list-item-title>Dev Dependencies : </v-list-item-title>
            </v-list-item-header>
            <v-list-item-subtitle>
              {{nbDevDependencies}}
            </v-list-item-subtitle>
          </v-list-item>
        </v-list>
      </div>
      <div class="flex-grow-1 ">

      </div>
      <v-avatar class="ma-3 flex-grow-0" size="125" rounded="0">
        <v-icon color="#43853d" class="mr-2" size="125">mdi-npm</v-icon>
      </v-avatar>

    </div>
  </v-card>

  <v-card flat>
    <v-container>
      <v-card-title>
        Dependencies
        <v-chip class="ma-2" color="primary">
          {{nbDependencies}}
        </v-chip>

      </v-card-title>
      <v-table density="compact" class="overflow-auto" fixed-header style="max-height:300px">
        <thead>
          <tr>
            <th class="text-left">
              Name
            </th>
            <th class="text-left">
              version
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="( value, key) in dependencies" :key="key">
            <td>{{ key }}</td>
            <td>{{ value }}</td>
          </tr>
        </tbody>
      </v-table>
    </v-container>
    <v-container>
      <v-card-title>
        Dev Dependencies
        <v-chip class="ma-2" color="primary">
          {{nbDevDependencies}}
        </v-chip>
      </v-card-title>
      <v-table density="compact" class="overflow-auto" fixed-header style="max-height:300px">
        <thead>
          <tr>
            <th class="text-left">
              Name
            </th>
            <th class="text-left">
              version
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="( value, key) in devDependencies" :key="key">
            <td>{{ key }}</td>
            <td>{{ value }}</td>
          </tr>
        </tbody>
      </v-table>
    </v-container>
    <!--v-list density="compact">
        <v-list-item v-for="(item, key) in package" density="compact" :key="key">
          <v-list-item-header>
            <v-list-item-title>{{key}} : </v-list-item-title>
          </v-list-item-header>:<wbr>
          <v-list-item-subtitle>{{item}}</v-list-item-subtitle>
        </v-list-item>
      </v-list-->
  </v-card>
</v-container>
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
  name: 'PackageView',
  components: {

  },
  props: {
    package: {
      type: Object,
      default: null
    }
  },
  data() {
    return {

    }
  },
  computed: {
    dependencies() {
      if (this.package && this.package.dependencies) {
        return this.package.dependencies
      }
      return {}
    },
    devDependencies() {
      if (this.package && this.package.devDependencies) {
        return this.package.devDependencies
      }
      return {}
    },
    nbDevDependencies() {
      if (this.devDependencies) {
        return Object.keys(this.devDependencies).length || 0
      }
      return 0
    },
    nbDependencies() {
      if (this.dependencies) {
        return Object.keys(this.dependencies).length || 0
      }
      return 0
    },
    totalPackages() {
      return this.nbDependencies + this.nbDevDependencies
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


<style scoped lang="scss">

</style>
