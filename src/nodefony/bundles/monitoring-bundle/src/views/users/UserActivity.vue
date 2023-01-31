<template lang="html">
  <v-toolbar color="#233056"
             theme="dark"
             extended
             flat>
    <v-app-bar-title>
      Activities
      <v-badge color="info"
               v-if="nbToken"
               :content="nbToken"
               inline>
      </v-badge>
    </v-app-bar-title>
    <v-card-subtitle>tokens</v-card-subtitle>
    <!--template v-slot:prepend>
			<v-icon size="50"
			        color="#43853d"
			        rounded="0">mdi-router</v-icon>
		</template-->
    <template v-slot:append>
      <v-icon size="50"
              color="#43853d"
              rounded="0">mdi-security</v-icon>
    </template>
  </v-toolbar>
  <v-table density="compact">
    <thead>
      <tr>
        <th class="text-left">
          type
        </th>
        <th class="text-left">
          user
        </th>
        <th class="text-left">
          Token ID
        </th>
        <th class="text-left">
          iat(createdAt)
        </th>
        <th class="text-left">
          expire
        </th>
      </tr>
    </thead>
    <tbody v-if="activity">
      <tr
        v-for="item in activity"
        :key="item.id"
      >
        <td>{{ item.type }}</td>
        <td>{{ item.user }}</td>
        <td>{{ item.id }}</td>
        <td>{{ item.iat }}</td>
        <td>{{ item.exp }}</td>
      </tr>
    </tbody>
  </v-table>
</template>

<script>
export default {
  name: "n-users-activity",
  inject: ["nodefony"],
  props: {
    activity: {
      type: Object
    }
  },
  computed: {
    nbToken () {
      if (this.activity) {
        return this.activity.length;
      }
      return 0;
    }
  }
};
</script>

<style lang="css" scoped>
</style>
