<template >
  <v-window class="h-100">

    <v-data-table-server
      fixed-header
      :loading="loading"
      :headers="headers"
      :items="sessions"
      :items-length="totalSessions"
      :search="search"
      item-value="name"
      density="compact"
      :items-per-page="itemsPerPage"
      @update:options="options = $event"
      class="elevation-5">


      <template v-slot:item="{ item }">
        <tr>
          <td >
            <v-chip v-if="item.user && getUser(item.user || item.username)"
                    density="compact">
              {{getUser(item.user || item.username)}}
            </v-chip>
          </td>
          <td>{{item.session_id}}</td>
          <td>{{item.context}}</td>
          <td>{{JSON.stringify(item.Attributes, null, " ")}}</td>
          <td>{{moment(item.updatedAt)}}</td>
          <td> {{moment(item.createdAt)}}</td>


        </tr>
      </template>


      <template v-slot:top>
        <v-toolbar color="#233056"
                   theme="dark"
                   extended
                   flat>
          <v-app-bar-title>
            Sessions
            <v-badge color="info"
                     v-if="nbSessions"
                     :content="nbSessions"
                     inline>
            </v-badge>
          </v-app-bar-title>
          <v-card-subtitle>sessions</v-card-subtitle>
          <template v-slot:prepend>
            <v-icon size="50"
                    color="#43853d"
                    rounded="0">mdi-router</v-icon>
          </template>
          <template v-slot:append>
            <v-icon size="50"
                    color="#43853d"
                    rounded="0">mdi-protocol</v-icon>
          </template>
        </v-toolbar>
        <v-card-title>
          Search Sessions
          <v-spacer></v-spacer>
          <v-text-field v-model="search"
                        append-icon="mdi-magnify"
                        label="Search"
                        single-line
                        hide-details>
          </v-text-field>
        </v-card-title>
      </template>
    </v-data-table-server>

  </v-window>
</template>

<script>
import gql from "graphql-tag";
export default {
  name: "n-sessions",
  inject: ["nodefony", "moment"],
  components: {},
  props: {
    username: {
      type: String
    }
  },
  data () {
    return {
      search: "",
      itemsPerPage: 12,
      options: {
        // startIndex: 0,
        itemsPerPage: 12,
        order: [
          ["updatedAt", "asc"]
        ]
      },
      headers: [{
        title: "user",
        align: "start",
        key: "user"
      }, {
        title: "id",
        align: "start",
        key: "session_id"
      }, {
        title: "context",
        align: "start",
        key: "context"
      }, {
        title: "attributes",
        align: "start",
        key: "Attributes"
      }, {
        title: "update",
        align: "start",
        key: "updatedAt"
      }, {
        title: "create",
        align: "start",
        key: "createdAt"
      }]
    };
  },
  apollo: {
    request: {
      // gql query
      query: gql`
      query getSessions($username: String, $query: Object) {
        sessions:getSessions(username: $username, query: $query){
          total
          sessions {
            session_id
            context
            Attributes
            flashBag
            metaBag
            createdAt
            updatedAt
            user {
              username
            }
          }
        }
      }
	    `,
      update: (data) => data,
      // Reactive parameters
      variables () {
        // Use vue reactive properties here
        return {
          username: this.username,
          query: {
            ...this.options,
            type: "dataTable"
          }
        };
      },
      skip () {
        return false;
      }
    }
  },
  watch: {
    options: {
      handler (value) {
        // console.log(value);
      },
      deep: true
    }
  },

  computed: {
    loading () {
      return this.$apollo.queries.request.loading;
    },
    sessions () {
      if (this.request && this.request.sessions) {
        return this.request.sessions.sessions;
      }
      return [];
    },
    nbSessions () {
      if (this.sessions && this.request) {
        return this.request.sessions.sessions.length;
      }
      return null;
    },
    totalSessions () {
      if (this.request && this.request.sessions) {
        return this.request.sessions.total;
      }
      return 0;
    }
  },
  // beforeMount () {},
  // mounted () {},
  methods: {
    getUser (user) {
      if (user && user.username) {
        return user.username;
      }
      return null;
    }
  }
};
</script>

<style lang="css" scoped>
</style>
