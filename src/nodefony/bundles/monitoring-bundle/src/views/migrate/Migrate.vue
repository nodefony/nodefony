<template lang="html">
  <v-card v-if="migrate"
          flat>
    <v-container>
      <v-card-title>
        Migrations Pendings
        <v-chip v-if="pending"
                class="ma-2"
                color="primary">
          {{pending.length}}
        </v-chip>
        <v-btn density="compact"
               @click="allMigrate()">
          Migrate All
        </v-btn>
      </v-card-title>
      <v-table density="compact"
               class="overflow-auto"
               fixed-header
               style="max-height:300px">
        <thead>
          <tr>
            <th class="text-left">
              Name
            </th>
            <th class="text-left">
              Connector
            </th>
            <th class="text-left">
              Path
            </th>
            <th class="text-left">
              Actions
            </th>
          </tr>
        </thead>
        <tbody v-if="pending">
          <tr v-for="( mig, key) in pending"
              :key="mig.name">
            <td>{{ mig.name }}</td>
            <td>{{ mig.connector }}</td>
            <td>{{ mig.path }}</td>
            <td>
              <v-btn density="compact"
                     @click="upMigrate(mig.name, mig.path, mig.connector)">
                exec
              </v-btn>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-container>
    <v-container>
      <v-card-title>
        Migrations Executed
        <v-chip v-if="executed"
                class="ma-2"
                color="primary">
          {{executed.length}}
        </v-chip>
        <v-btn density="compact"
               @click="allRevert()">
          Revert All
        </v-btn>
      </v-card-title>
      <v-table density="compact"
               class="overflow-auto"
               fixed-header
               style="max-height:300px">
        <thead>
          <tr>
            <th class="text-left">
              Name
            </th>
            <th class="text-left">
              Connector
            </th>
            <th class="text-left">
              Path
            </th>
            <th class="text-left">
              Actions
            </th>
          </tr>
        </thead>
        <tbody v-if="executed">
          <tr v-for="( mig, key) in executed"
              :key="mig.name">
            <td>{{ mig.name }}</td>
            <td>{{ mig.connector }}</td>
            <td>{{ mig.path }}</td>
            <td>
              <v-btn density="compact"
                     @click="downMigrate(mig.name, mig.path, mig.connector)">
                revert
              </v-btn>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-container>
  </v-card>
</template>

<script>
import gql from "graphql-tag";
export default {
  name: "Migrate",
  apollo: {
    migrate: {
      // gql query
      query: gql`
        query getMigrate {
          status:getMigrations
        }
	    `,
      update: (data) => ({
        status: JSON.parse(data.status)
      }),
      // Reactive parameters
      variables () {
        // Use vue reactive properties here
        return {};
      }
    }
  },
  computed: {
    pending () {
      if (this.migrate.status) {
        const tab = [];
        for (const ele in this.migrate.status.pending) {
          for (const ele2 in this.migrate.status.pending[ele]) {
            this.migrate.status.pending[ele][ele2].connector = ele;
            tab.push(this.migrate.status.pending[ele][ele2]);
          }
        }
        return tab;
      }
      return null;
    },
    executed () {
      if (this.migrate.status) {
        const tab = [];
        for (const ele in this.migrate.status.executed) {
          for (const ele2 in this.migrate.status.executed[ele]) {
            this.migrate.status.executed[ele][ele2].connector = ele;
            tab.push(this.migrate.status.executed[ele][ele2]);
          }
        }
        return tab;
      }
      return null;
    }
  },
  methods: {
    upMigrate (name = null, path = null, connector = null) {
      return this.$apollo.mutate({
        // Query
        mutation: gql`mutation ($name: String!, $path:String! ,$connector:String!) {
            upMigrate(name: $name , path: $path, connector: $connector)
          }`,
        variables: {
          name,
          path,
          connector
        }
      })
        .then(() => this.$apollo.queries.migrate.refetch());
    },
    downMigrate (name = null, path = null, connector = null) {
      return this.$apollo.mutate({
        // Query
        mutation: gql`mutation ($name: String!, $path:String!, $connector:String! ) {
            downMigrate(name: $name , path: $path, connector: $connector)
          }`,
        variables: {
          name,
          path,
          connector
        }
      })
        .then(() => this.$apollo.queries.migrate.refetch());
    },
    allMigrate (connector = null) {
      return this.$apollo.mutate({
        // Query
        mutation: gql`mutation ( $connector:String ) {
            allMigrate( connector: $connector)
          }`,
        variables: {
          connector
        }
      })
        .then(() => this.$apollo.queries.migrate.refetch());
    },
    allRevert (connector = null) {
      return this.$apollo.mutate({
        // Query
        mutation: gql`mutation ( $connector:String ) {
            allRevert( connector: $connector)
          }`,
        variables: {
          connector
        }
      })
        .then(() => this.$apollo.queries.migrate.refetch());
    }
  }
};
</script>

<style lang="css" scoped>
</style>
