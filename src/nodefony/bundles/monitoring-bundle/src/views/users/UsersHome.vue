<template>
  <v-container fluid
               class="ma-0 pa-0">

    <v-window v-model="currentItem">
      <v-window-item>
        <d-users-table />
      </v-window-item>

    </v-window>
  </v-container>
</template>

<script>
import UsersTable from "@/views/users/components/TableUsers";
export default {
  name: "UsersList",
  components: {
    "d-users-table": UsersTable
  },
  data () {
    return {
      currentItem: ""
    };
  },
  computed: {}
};
</script>
