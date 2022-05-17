<template>
<v-card>
  <v-layout>
    <v-navigation-drawer width="250" permanent>
      <template v-slot:image>
        <v-img gradient="to top right, rgba(19,84,122,.8), rgba(128,208,199,.8)"></v-img>
      </template>
      <v-card class="d-flex" max-width="250" max-height="125" min-height="100" tile>

        <v-icon size="60" class="mx-3 my-auto" color="green darken-2">
          {{icon}}
        </v-icon>

        <v-list-item>
          <v-list-item-header>
            <v-list-item-title class="text-h5">{{name}}</v-list-item-title>
            <v-list-item-subtitle>Bundle</v-list-item-subtitle>
          </v-list-item-header>
        </v-list-item>
      </v-card>
      <v-divider></v-divider>
      <v-tabs density="compact" v-model="tab" direction="vertical" color="primary">
        <v-tab value="dashboard">
          <v-icon start>
            mdi-monitor-dashboard
          </v-icon>
          Dashboard
        </v-tab>
        <v-divider></v-divider>
        <v-tab value="readme">
          <v-icon start>
            mdi-language-markdown
          </v-icon>
          README.md
        </v-tab>
        <v-divider></v-divider>
        <v-tab value="config">
          <v-icon start>
            mdi-tools
          </v-icon>
          Configurations
        </v-tab>
        <v-divider></v-divider>
        <v-tab value="routing">
          <v-icon start>
            mdi-protocol
          </v-icon>
          Routing
          <v-badge inline v-if="bundle" :content="bundle.routes.length" class="ml-2" color="error">
          </v-badge>
          <v-badge inline v-else :content="0" class="ml-2" color="error">
          </v-badge>
        </v-tab>
        <v-divider></v-divider>
        <v-tab value="services">
          <v-icon start>
            mdi-view-module
          </v-icon>
          Services
        </v-tab>
        <v-divider></v-divider>
        <v-tab value="firewall">
          <v-icon start>
            mdi-wall-fire
          </v-icon>
          Firewall
        </v-tab>
        <v-divider></v-divider>
        <v-tab value="entity">
          <v-icon start>
            mdi-database
          </v-icon>
          ORM Database
        </v-tab>
        <v-divider></v-divider>
        <v-tab value="tests">
          <v-icon start>
            mdi-hospital-box
          </v-icon>
          Unit Tests
        </v-tab>
        <v-divider></v-divider>
        <v-tab value="command">
          <v-icon start>
            mdi-language-javascript
          </v-icon>
          Commands
        </v-tab>
        <v-divider></v-divider>
        <v-tab value="fixtures">
          <v-icon start>
            mdi-database-plus-outline
          </v-icon>
          Fixtures
        </v-tab>
        <v-divider></v-divider>
        <v-tab value="documentation">
          <v-icon start>
            mdi-help-box
          </v-icon>
          Documentation
        </v-tab>
        <v-divider></v-divider>

      </v-tabs>
    </v-navigation-drawer>
    <v-main style="height:100vh ;max-height:100vh" class="overflow-auto">


      <v-window v-if="bundle" v-model="tab">

        <v-window-item value="dashboard">
          <v-card flat>

            <!--v-container fluid class="d-flex justify-center my-6">
              <v-card-title>Bundle {{name}}</v-card-title>
            </v-container-->
            <v-container fluid class="d-flex  justify-center">
              <v-img class="" width="60" height="51" src="/framework-bundle/images/nodefony-logo.png" />
            </v-container>

            <v-container fluid class="d-flex  justify-center pt-0">
              <v-card-title style="font-size:35px" class="nodefony">{{name}} {{bundle.package.version}}</v-card-title>
            </v-container>


            <v-container fluid class="d-flex flex-row flex-wrap overflow-auto">
              <v-card min-width="300" min-height="200" max-width="400" max-height="400" class="d-flex flex-column  flex-grow-1 flex-shrink-1 my-5 mx-5" outlined tile>

                <v-toolbar color="blue">

                  <v-img :width="100" :height="91" class="" src="/framework-bundle/images/nodejs/nodejs-new-pantone-black.png" />
                  <v-toolbar-title>Node Package</v-toolbar-title>

                  <v-spacer></v-spacer>


                </v-toolbar>

                <v-card-title> </v-card-title>
                <v-list-item v-for="(item, key) in bundle.package" density="compact" :key="key">
                  <v-list-item-header>
                    <v-list-item-title>{{key}} : </v-list-item-title>
                  </v-list-item-header>:<wbr>
                  <v-list-item-subtitle>{{item}}</v-list-item-subtitle>
                </v-list-item>

              </v-card>
              <v-card min-width="300" min-height="200" v-for="n in 7" :key="n" class="d-flex flex-column  flex-grow-1 flex-shrink-1 my-5 mx-5" outlined tile min->
                <div>
                  Flex {{n}}
                </div>
              </v-card>

            </v-container>

          </v-card>
        </v-window-item>

        <v-window-item value="readme">
          <v-card flat>
            <v-card-text>
              <Suspense>
                <n-readme :bundle="name" />
              </Suspense>
            </v-card-text>
          </v-card>
        </v-window-item>


        <v-window-item value="routing">
          <v-card flat>
            <v-card-text>
              <v-table fixed-header height="100vh">
                <thead>
                  <tr>
                    <th class="text-left">
                      Name
                    </th>
                    <th class="text-left">
                      Prefix
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
                  <tr v-for="item in bundle.routes" :key="item.name">

                    <td>{{ item.name }}</td>
                    <td>{{ item.prefix }}</td>
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
        </v-window-item>

      </v-window>
    </v-main>
  </v-layout>
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
import Readme from '@/views/readme.vue';
import gql from 'graphql-tag'
export default {
  name: 'BundleView',
  components: {
    'n-readme': Readme
  },
  props: {
    //name: String
  },
  apollo: {
    bundle: {
      // gql query
      query: gql `
      query getRoutes($bundle: String!) {
        routes:getRouteByBundle(name: $bundle){
          name
          path
          host
          variables
          bypassFirewall
          defaultLang
          hash
          prefix
          schemes
          filePath
          bundle
          index
        }
        config:getConfigByBundle(name: $bundle)
        package:getBundlePackage(name: $bundle)
      }
	    `,
      update: (data) => {
        return {
          routes: data.routes,
          config: JSON.parse(data.config),
          package: JSON.parse(data.package)
        }
      },
      // Reactive parameters
      variables() {
        // Use vue reactive properties here
        return {
          bundle: this.name,
        }
      },
    }
  },

  data() {
    return {
      tab: 1,
      bundle: null,
    }
  },
  setup(props) {
    const route = useRoute()
    const name = reactive(route.params.name)
    //computed
    const icon = computed(() => {
      switch (name) {
        case "security":
          return "mdi-security"
        case "doc":
          return "mdi-help-rhombus"
        case "sequelize":
          return "mdi-database"
        case "users":
          return "mdi-account-multiple"
        case "redis":
          return "mdi-database"
        case "elastic":
          return "mdi-database"
        case "mongoose":
          return "mdi-database"
        case "mail":
          return "mdi-email-outline"
        case "framework":
          return "mdi-tools"
        case "http":
          return "mdi-protocol"
        case "test":
          return "mdi-help-box"
        case "realtime":
          return "mdi-update"
        case "unittests":
          return "mdi-function-variant"
        default:
          return "mdi-package"
      }
    })
    return {
      name,
      icon
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
