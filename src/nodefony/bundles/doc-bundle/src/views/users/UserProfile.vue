<template>
<d-app-layout>

  <div class="d-flex flex-row imgage_montain w-100 rounded-lg">
    <span class="back_gradient"></span>
    <v-card class="" width="400" height="200" tile>
      <v-img height="100%" cover src="">
        <v-avatar color="blue" size="150" rounded="0">
          <!--v-img src="https://cdn.vuetifyjs.com/images/profiles/marcus.jpg"></v-img-->
          <v-icon size="150">mdi-account</v-icon>
        </v-avatar>
        <v-list-item class="text-white" :title="fullname" :subtitle="username">
        </v-list-item>
      </v-img>
    </v-card>

    <v-layout class="d-flex align-end">
      <v-tabs color="light-blue" class="text-white" v-model="currentItem" grow>
        <v-tab :value="1" theme="dark">
          <v-icon>mdi-account-box</v-icon>
          Profile
        </v-tab>

        <v-tab :value="2" theme="dark">
          <v-icon>mdi-account-reactivate</v-icon>
          Modifier
        </v-tab>

        <v-tab :value="3">
          <v-icon>mdi-account-details</v-icon>
          Activitées
        </v-tab>

        <v-tab :value="4">
          <v-icon>mdi-shield-account</v-icon>
          Sessions
        </v-tab>
      </v-tabs>
    </v-layout>
  </div>
  <v-window class="w-100 h-100" style="padding:200px 15px 0 15px" v-model="currentItem">
    <v-window-item :value="1">
      <v-row>
        <v-col class="col-md-6 col-lg-4 col-12 mt-5">
          <div class="text-h6">Profile Informations</div>
          <v-list density="compact" class="mx-auto">

            <v-list-item v-for="(value, key) in profile">
              <v-list-item-header>
                <v-list-item-title class="text-subtitle-2">{{key}}</v-list-item-title>
              </v-list-item-header>
              <div class="text-caption" v-if="key !== 'roles'">
                {{value}}
              </div>
              <div v-else>
                <v-chip class="my-2" color="primary" v-for="(role) in value">
                  {{role}}
                </v-chip>
              </div>
            </v-list-item>
          </v-list>
        </v-col>
        <v-col class="col-md-6 col-lg-4 col-12 mt-5">
          <div class="text-h6">Platform Settings</div>

        </v-col>
      </v-row>
    </v-window-item>

    <v-window-item :value="2">
      <d-user-stepper v-if="profile" :profile="profile" @update="changeTab(1)" />
    </v-window-item>
  </v-window>
  <!--v-container fluid
	             class="px-15"
	             style="padding-top:200px">

	</v-container-->

</d-app-layout>
</template>


<script>
import UserStepper from '@/views/users/UserStepper'
export default {
  name: "d-users-profile",
  inject: ['dlake', 'nodefony'],
  components: {
    "d-user-stepper": UserStepper,
  },
  props: {
    username: {
      type: String
    }
  },
  data() {
    return {
      profile: null,
      currentItem: 0
    }
  },
  async mounted() {
    await this.getUserProfile();
  },
  computed: {
    fullname() {
      if (this.profile) {
        return `${this.profile.name} ${this.profile.surname}`
      }
      return ""
    }
  },
  methods: {
    changeTab(index) {
      this.currentItem = index
    },
    getUserProfile() {
      return this.nodefony.request(`users/${this.username}`, "GET", {
          headers: {
            "content-type": "application/json"
          }
        })
        .then((result) => {
          this.profile = result.result
          return this.profile
        })
        .catch(e => {
          this.$router.push({
            name: "NotFound",
            params: {
              code: e.code
            }
          })
        })
    }
  }

}
</script>


<style lang="scss" scoped>
.imgage_montain {
    position: absolute;
    height: 200px;
    background-color: #233056;
    background-position: 50% center;
    background-size: cover;
}

.back_gradient {
    height: 200px !important;
    /*background-image: linear-gradient(195deg, #ec407a, #d81b60) !important;*/
    background-image: linear-gradient(195deg, rgba(19, 84, 122, .8), rgba(128, 208, 199, .8)) !important;
    opacity: 0.8 !important;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}
</style>
