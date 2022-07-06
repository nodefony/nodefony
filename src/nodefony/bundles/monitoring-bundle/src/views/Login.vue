<template>
<v-container fluid
             class="">
	<v-row class="mt-10"
	       justify="center"
	       align="center">

		<v-card rounded="xl"
		        elevation="8"
		        width="40%">
			<v-row class="ma-5">
				<v-col>
					<v-row justify="center"
					       align="center"
					       class="mb-3">
						<img src="/app/images/app-logo.png" />
					</v-row>
					<v-row justify="center"
					       align="center">
						<v-card-title>Nodefony </v-card-title>
					</v-row>
				</v-col>
			</v-row>
			<v-container>
				<!--n-snackbar-notify v-if="message" top :pdu="message" :timeout="1000*10"></n-snackbar-notify-->
				<n-alert-notify v-if="message"
				                :pdu="message"
				                density="compact"
				                rounded="xl"
				                variant="outlined"></n-alert-notify>
			</v-container>
			<v-card-subtitle class="pb-0">
				<v-text-field v-if="isLoading"
				              color="success"
				              loading
				              disabled>
				</v-text-field>


			</v-card-subtitle>

			<v-card-text class="text--primary">

				<v-form @submit.prevent="submit"
				        ref="form">
					<v-text-field v-model="username"
					              placeholder="username"
					              :counter="50"
					              :rules="nameRules"
					              :label="t('username')"
					              required
					              prepend-icon="mdi-account-circle" />

					<v-text-field :label="t('password')"
					              v-model="password"
					              placeholder="password"
					              prepend-icon="mdi-lock"
					              :type="showPassword ? 'text' : 'password'"
					              :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
					              @click:append="showPassword = !showPassword"
					              required />

					<v-btn type="submit"
					       class="mx-6 my-4"
					       color="success">
						{{ t('submit') }}
					</v-btn>

				</v-form>
			</v-card-text>
		</v-card>
		<!--/v-col-->
	</v-row>
</v-container>
</template>

<script>
// @ is an alias to /src

import {
	mapGetters,
	mapActions,
	mapMutations
} from 'vuex';
import notify from '@/plugins/nodefony/notify/NsnackbarNotify.vue';
import alert from '@/plugins/nodefony/notify/NalertNotify.vue';

import {
	useI18n
} from 'vue-i18n'


export default {
	name: 'AppLogin',
	setup() {
		const {
			t
		} = useI18n({
			inheritLocale: true,
			useScope: 'local'
		})
		return {
			t
		}
	},
	components: {
		"n-snackbar-notify": notify,
		"n-alert-notify": alert
	},
	data: () => ({
		showPassword: false,
		valid: true,
		username: '',
		password: '',
		nameRules: [
			v => !!v || 'Name is required',
			v => (v && v.length <= 50) || 'Name must be less than 50 characters'
		],
		message: null,
		validMessage: null,
		logColor: 'teal',
		viewerActive: false
	}),

	async mounted() {
		await this.clear();
		//this.openNavBar();
		if (this.$route.name === "Logout") {
			await this.logout()
		}
		await this.closeDrawer();
		//this.notify(this.log("sldlskdjsldkssss"), {}, "alert")
		//this.notify(this.log("sldlskdjsldk"))
		//this.notify(this.log("sldlskdjsldk"))
		//this.notify(this.log("sldlskdjsldk"))
	},
	watch: {
		message(value) {
			if (value) {
				//this.notify(value)
			}
		}
	},
	computed: {
		...mapGetters([
			'isLoading',
		])
	},
	methods: {
		...mapMutations([
			'clear',
			'closeDrawer'
		]),
		...mapActions({
			auth: 'AUTH_REQUEST',
			logout: 'AUTH_LOGOUT'
		}),
		reset() {
			this.$refs.form.reset();
		},
		resetValidation() {
			this.$refs.form.resetValidation();
		},
		validate() {
			return this.$refs.form.validate();
		},
		parseMessage(pdu) {
			pdu.msgid = "LOGIN";
			if (!pdu.payload) {
				pdu.payload = 'No Message';
				return pdu;
			}
			if (pdu.payload.response) {
				pdu.payload = pdu.payload.response.data.message;
			} else {
				if (pdu.payload.message) {
					pdu.payload = pdu.payload.message;
				} else {
					if (!pdu.payload) {
						pdu.type = 'error';
						pdu.payload = 'INTERNAL ERROR';
					}
				}
			}
			return pdu;
		},
		async submit() {
			const form = this.$refs.form;
			if (form.validate()) {
				this.message = null;
				try {
					const {
						username,
						password
					} = this;
					return this.auth({
							url: '/api/jwt/login',
							username,
							password
						})
						.then((res) => {
							this.$router.push('/')
							window.location = 'home';
							return res;
						})
						.catch(e => {
							this.message = null
							let pdu = this.log(e, 'ERROR')
							this.message = this.parseMessage(pdu);
						});
				} catch (e) {
					this.message = this.parseMessage(this.log(e, 'ERROR'));
				} finally {
					form.resetValidation();
				}
			}
		}

	}
}
</script>


<style lang="scss">

</style>


<i18n>
{
  "en": {
    "signin" : "Authentication",
    "submit" : "Submit",
    "username" : "User Name",
    "password" : "Password"
  },
  "fr": {
    "signin" : "Authentification",
    "submit" : "Accerder",
    "username" : "Utilisateur",
    "password" : "Mot de passe"
  }
}
</i18n>
