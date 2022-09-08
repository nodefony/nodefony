<template>
<v-app-bar app>
	<template v-slot:prepend>
		<v-app-bar-nav-icon v-if="isAuthenticated"
		                    @click="toogleDrawer"></v-app-bar-nav-icon>

		<router-link :to="{ name: 'Home'}"
		             custom
		             v-slot="{ navigate, href, route }">
			<v-btn icon>
				<v-img width="35px"
				       height="35px"
				       @click="navigate"
				       :src="nodefony.logo" />
			</v-btn>
		</router-link>
		<router-link :to="{ name: 'Home'}"
		             custom
		             v-slot="{ navigate, href, route }">
			<v-app-bar-title class="nodefony mx-5 mt-3"
			                 style="font-size:35px"
			                 @click="navigate">Nodefony</v-app-bar-title>
		</router-link>
	</template>

	<v-spacer></v-spacer>

	<router-link :to="{ name: 'Login'}"
	             custom
	             v-slot="{ navigate }">
		<v-btn @click="navigate"
		       v-if="!isAuthenticated"
		       class="ma-2"
		       outlined
		       color="indigo">
		</v-btn>
		<v-avatar v-if="!isAuthenticated"
		          color="cyan">
		</v-avatar>
		<v-menu v-else
		        min-width="200px"
		        rounded
		        anchor="bottom"
		        origin="end">
			<template v-slot:activator="{ props }">
				<v-btn icon
				       v-bind="props">
					<v-avatar color="cyan">
						<span v-if="getInitials"
						      class="white--text text-h5">{{ getInitials }}</span>
						<span v-else
						      class="white--text text-h5">
							<v-icon size="25">mdi-account</v-icon>
						</span>
					</v-avatar>
				</v-btn>
				<!--v-hover v-slot="{ isHovering, props }">
          <Suspense>
            <user-card v-if="isHovering" width="300" tile />
          </Suspense>
        </v-hover-->

			</template>
			<Suspense>
				<user-card width="300"
				           @profile="onProfile"
				           @error="onError"
				           account
				           tile />
			</Suspense>
		</v-menu>
	</router-link>
</v-app-bar>
</template>

<script>
// @ is an alias to /src
import {
	mapGetters,
	mapActions,
	mapMutations
} from 'vuex';
import User from '@/views/users/components/User.vue'

export default {
	name: 'AppBar',
	components: {
		"user-card": User
	},
	inject: ["nodefony"],
	data: () => ({}),
	mounted() {
		if (!this.isAuthenticated) {
			this.$emit("error")
		} else {
			this.$emit("profile")
		}
	},
	computed: {
		...mapGetters([
			'isAuthenticated',
			'getInitials'
		])
	},
	methods: {
		...mapMutations([
			'toogleDrawer',
		]),
		...mapActions({}),
		onProfile(profile) {
			this.$emit("profile", profile)
		},
		onError(error) {
			this.$emit("error", error)
		}
	}
}
</script>

<style scoped lang="scss">
.title {
    color: "indigo--darken-4";
}
</style>
