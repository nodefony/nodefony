<template>
<v-card>
  <v-layout>
    <v-navigation-drawer image="" width="200" permanent>
      <template v-slot:image>
        <v-img gradient="to top right, rgba(19,84,122,.8), rgba(128,208,199,.8)"></v-img>
      </template>

      <v-tabs v-model="tab" direction="vertical" color="primary">
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
        </v-tab>
        <v-divider></v-divider>
        <v-tab value="firewall">
          <v-icon start>
            mdi-security
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

      </v-tabs>
    </v-navigation-drawer>
    <v-main style="height:100vh" class="overflow-auto">

      <v-window v-model="tab">
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
              <v-table fixed-header height="">
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
  ref,
  toRefs
} from "vue";
import Readme from '@/views/readme.vue';
import gql from 'graphql-tag'
export default {
  name: 'BundleView',
  components: {
    'n-readme': Readme
  },
  props: {
    name: String
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
      }
	    `,
      update: (data) => {
        return {
          routes: data.routes,
          config: JSON.parse(data.config)
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
    const {
      name
    } = toRefs(props)
    return {
      name
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
