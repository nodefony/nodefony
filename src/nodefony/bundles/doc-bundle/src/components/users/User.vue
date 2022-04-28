
<template>
<v-container fluid class="pa-0">

  <v-card v-if="profile" v-bind="{...$props, ...$attrs}">
    <v-card-text class="ma-0">
      <div class="mx-auto text-center">
        <v-avatar color="cyan" size="36px">
          <v-img v-if="getAvatar" alt="Avatar" :src="getAvatar"></v-img>
          <span v-else class="white--text text-h5">{{ getInitials }}</span>
          <!--v-icon
                v-else
                :color="cyan"
                :icon="mdi-account"
              ></v-icon-->
        </v-avatar>

        <h3>{{ getFullName }}</h3>
        <p class="text-caption mt-1">
          {{ profile.email }}
        </p>
        <div v-if="account">
          <v-divider class="my-3"></v-divider>
          <!--v-btn rounded variant="text">
            Edit Account
          </v-btn>
          <v-divider class="my-3"></v-divider-->
          <v-btn rounded variant="text" @click="logout">
            Disconnect
          </v-btn>

        </div>
      </div>
    </v-card-text>
  </v-card>
  <!--/v-menu-->

</v-container>
</template>


<script>
// @ is an alias to /src
export default {
  name: 'User',
  components: {}
}
</script>

<script setup>
import {
  ref,
  watch,
  onMounted,
  onUnmounted,
  computed,
  reactive,
  inject
} from 'vue'

import {
  useStore
} from 'vuex'
const store = useStore()
import {
  useRouter,
  useRoute
} from 'vue-router'
const router = useRouter()

// props
const props = defineProps({
  account: {
    type: Boolean,
    default: false
  }
})

//data
const profile = ref(null)

// computed
const getUser = computed(() => store.getters.getUser)
const isAuthenticated = computed(() => store.getters.isAuthenticated)
const getProfile = computed(() => store.getters.getProfile)
const getInitials = computed(() => store.getters.getInitials)
const getFullName = computed(() => store.getters.getFullName)
const getTrigramme = computed(() => store.getters.getTrigramme)

const getAvatar = computed(() => {
  if (profile) {
    return profile.value.image
  }
  return null
})
const subtitle = computed(() => {
  if (profile) {
    return `${profile.value.email}`
  }
  return ""
})

// Methods
const getUserProfile = (url) => store.dispatch("USER_REQUEST", url)
const logoutApi = () => store.dispatch("AUTH_LOGOUT")

const logout = async function() {
  await logoutApi()
  return router.go('/login')
}

if (isAuthenticated.value && !getProfile.value) {
  // profile
  await getUserProfile(`/api/users/${getUser.value}`)
    .then((ele) => {
      profile.value = ele.result;
      return ele
    })
    .catch((e) => {
      //document.location = `/si/login`;
      return router.go('/login')
    });
} else {
  profile.value = getProfile.value
}
</script>

<style scoped lang="scss">

</style>
