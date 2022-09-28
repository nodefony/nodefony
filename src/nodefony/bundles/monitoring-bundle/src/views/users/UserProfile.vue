	<template>

	<div class="d-flex flex-row image_back w-100 rounded-lg">
		<span class="back_gradient"></span>
		<v-card class="image_back"
		        width="400"
		        height="200"
		        tile>
			<v-img height="100%"
			       cover
			       src="">
				<v-avatar color="blue"
				          size="150"
				          rounded="0">
					<!--v-img src="https://cdn.vuetifyjs.com/images/profiles/marcus.jpg"></v-img-->
					<v-icon size="150">mdi-account</v-icon>
				</v-avatar>
				<v-list-item
				class="text-white"
        :title="fullname"
        :subtitle="username"
      	>
			</v-list-item>

			</v-img>
		</v-card>

		<v-layout class="d-flex align-end">
			<v-tabs color="light-blue"
			        class="text-white"
			        v-model="currentItem"
			        grow>
				<v-tab :value="1"
				       theme="dark">
					<v-icon>mdi-account-box</v-icon>
					Profile
				</v-tab>

				<v-tab :value="2"
				       theme="dark">
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
	<v-window class="w-100 h-100"
	          style="padding:0 0 0 0"
	          v-model="currentItem">
		<v-window-item :value="1">
			<v-container fluid>
				<v-row>
				<v-col class="col-md-6 col-lg-4 col-12 mt-5">
					<div class="text-h6">Profile Informations</div>
					<v-list density="compact"
					        class="mx-auto">

						<v-list-item v-for="(value, key) in profile">
								<v-list-item-title class="text-subtitle-2">{{key}}</v-list-item-title>
							<div class="text-caption"
							     v-if="key !== 'roles'">
								{{value}}
							</div>
							<div v-else>
								<v-chip class="my-2"
								        color="primary"
								        v-for="(role) in value">
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
			</v-container>
		</v-window-item>

		<v-window-item :value="2">
			<n-user-stepper v-if="profile"
			                :profile="profile"
			                @update="changeTab(1)" />
		</v-window-item>

		<v-window-item :value="3">
			<n-user-activity v-if="activity" :activity="activity"/>
		</v-window-item>


		<v-window-item :value="4" >
			<n-session  class='pa-0 ma-0' :username="profile.username"/>
		</v-window-item>
	</v-window>
	<!--v-container fluid
	             class="px-15"
	             style="padding-top:200px">

	</v-container-->

</template>

<script>
import gql from 'graphql-tag'
import UserStepper from '@/views/users/UserStepper'
import Session from '@/views/sessions/sessions'
import Activity from '@/views/users/UserActivity'
import moment from 'moment'
export default {
	name: "n-users-profile",
	inject: ['nodefony'],
	components: {
		"n-user-stepper": UserStepper,
		"n-session": Session,
		"n-user-activity": Activity,
	},
	props: {
		username: {
			type: String
		}
	},
	data() {
		return {
			currentItem: 0
		}
	},
	apollo: {
		request: {
			// gql query
			query: gql `
      query getProfile($username: String!) {
        user:user(username: $username){
					username
    			surname
    			name
			    enabled
			    userNonExpired
			    credentialsNonExpired
			    accountNonLocked
			    email
			    lang
			    gender
			    url
			    createdAt
			    updatedAt
			    image
			    roles
				}
				activity:getActivity(username: $username){
			    decode
			    jwt {
			      id
			    }
			  }
      }
	    `,
			update: (data) => {
				return {
					profile: data.user,
					sessions: data.sessions,
					activity: data.activity,
					//jwts: data.jwts
				}
			},
			// Reactive parameters
			variables() {
				// Use vue reactive properties here
				return {
					username: this.username,
				}
			},
		}
	},
	async mounted() {
		//await this.getUserProfile();
	},
	computed: {
		fullname() {
			if (this.profile) {
				return `${this.profile.name} ${this.profile.surname}`
			}
			return ""
		},
		profile() {
			if (this.request) {
				const profile = Object.assign({}, this.request.profile)
				if (profile.__typename) {
					delete profile.__typename
				}
				return profile
			}
			return null
		},
		sessions() {
			if (this.request) {
				return this.request.sessions
			}
			return []
		},
		activity() {
			if (this.request) {
				return this.request.activity.map((item) => {
					if (item.jwt) {
						return {
							type: "JWT",
							id: item.jwt.id,
							user: item.decode.data.user.username,
							exp: moment(item.decode.exp * 1000),
							iat: moment(item.decode.iat * 1000),
						}
					}
					return {}
				})
			}
			return []
		},
	},
	methods: {
		async changeTab(index) {
			await this.$apollo.queries.request.refetch()
			this.currentItem = index
		}
	}

}
</script>


<style lang="scss" scoped>
.image_back {
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
