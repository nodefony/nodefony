<template>
<v-card flat
        style="min-height:600px"
        class="">
	<v-card-title class="text-h6 font-weight-regular justify-space-between">
		<span>{{currentTitle}}</span>
		<v-avatar color="primary"
		          size="24"
		          v-text="step"></v-avatar>
	</v-card-title>

	<v-window class="w-100 h-100 mx-auto"
	          style="height:800px"
	          v-model="step">
		<v-form ref="form"
		        class="h-100"
		        model="form"
		        lazy-validation>

			<v-window-item :value="1"
			               class="h-100">
				<div class="pa-4 text-center">
					<v-icon size="150"
					        color="blue darken-2">
						mdi-account
					</v-icon>
					<h3 v-if="profile"
					    class="text-h4 font-weight-light mb-2">
						Modification du compte utilisateur {{profile.username}}
					</h3>
					<h3 v-else
					    class="text-h4 font-weight-light mb-2">
						Creation d'un compte utilisateur
					</h3>
				</div>
			</v-window-item>

			<v-window-item :value="2"
			               class="h-100">
				<v-card-text>
					<span class="text-caption grey--text text--darken-1">
						This is the name you will use to login to account
					</span>
					<v-text-field autocomplete='username'
					              v-model="formData.username"
					              label="username"
					              name="username"
					              placeholder=""></v-text-field>

					<span class="text-caption grey--text text--darken-1">
						This is the email you will use in account
					</span>
					<v-text-field v-model="formData.email"
					              label="Email"
					              name="email"
					              placeholder="admin@nodefony.com"></v-text-field>


					<span class="text-caption grey--text text--darken-1">
						This is the Surname you will use in account
					</span>
					<v-text-field v-model="formData.surname"
					              label="Surname"
					              name="surname"
					              placeholder="john"></v-text-field>


					<span class="text-caption grey--text text--darken-1">
						This is the name you will use in account
					</span>
					<v-text-field v-model="formData.name"
					              label="Name"
					              name="name"
					              placeholder="john"></v-text-field>

					<span class="text-caption grey--text text--darken-1">
						This is the genre of user account
					</span>
					<v-radio-group v-model="formData.gender">
						<v-radio v-for="genre in genres"
						         name="gender"
						         :key="genre"
						         :label="`${genre}`"
						         :value="genre">
						</v-radio>
					</v-radio-group>


				</v-card-text>
			</v-window-item>

			<v-window-item :value="3"
			               class="mx-auto"
			               style="">

				<v-text-field autocomplete='new-password'
				              v-model="formData.password"
				              :append-icon="showPasswd ? 'mdi-eye' : 'mdi-eye-off'"
				              :rules="[rules.required, rules.min]"
				              :type="showPasswd ? 'text' : 'password'"
				              name="password"
				              label="Mot de passe"
				              hint="At least 8 characters"
				              counter
				              @click:append="showPasswd = !showPasswd">
				</v-text-field>
				<v-text-field autocomplete='new-password'
				              v-model="formData.confirm"
				              :append-icon="showPasswd ? 'mdi-eye' : 'mdi-eye-off'"
				              :rules="[rules.required, rules.min]"
				              :type="showPasswd ? 'text' : 'password'"
				              name="confirm"
				              label="Confirmation"
				              hint="At least 8 characters"
				              counter
				              @click:append="showPasswd = !showPasswd">
				</v-text-field>
				<v-combobox v-model="formData.roles"
				            :items="roles"
				            label="Role du compte"
				            multiple
				            chips>
					<template v-slot:selection="data">
						<v-chip :key="JSON.stringify(data.item)"
						        v-bind="data.attrs"
						        :input-value="data.selected"
						        :disabled="data.disabled"
						        @click:close="data.parent.selectItem(data.item)">
							<v-avatar class="accent white--text"
							          left
							          v-text="data.item.slice(0, 1).toUpperCase()"></v-avatar>
							{{ data.item }}
						</v-chip>
					</template>
				</v-combobox>
				<v-card-text>

				</v-card-text>
			</v-window-item>

		</v-form>
		<v-divider></v-divider>

		<v-card-actions>
			<v-btn v-if="step > 1"
			       text
			       @click="step--">
				Back
			</v-btn>
			<v-btn v-if="! profile"
			       text
			       @click="$refs.form.reset()">
				Clear
			</v-btn>
			<v-spacer></v-spacer>
			<v-btn v-if="step < 3"
			       color="primary"
			       depressed
			       @click="step++">
				Next
			</v-btn>
			<v-btn v-if="step == 3 && profile"
			       :disabled="false"
			       class="white--text"
			       color="deep-purple accent-4"
			       @click="updateUser"
			       depressed>
				Update
			</v-btn>
			<v-btn v-if="step == 3 && ! profile"
			       :disabled="false"
			       class="white--text"
			       color="deep-purple accent-4"
			       @click="addUser"
			       depressed>
				Submit
			</v-btn>
		</v-card-actions>
	</v-window>
</v-card>
</template>



<script>
// @ is an alias to /src
import {
	useI18n
} from 'vue-i18n'
import {
	mapGetters,
	mapActions,
	mapMutations
} from 'vuex';


export default {
	name: 'n-user-stepper',
	components: {},
	inject: ['nodefony'],
	props: {
		profile: {
			type: Object,
			default: null
		}
	},
	data() {
		return {
			form: false,
			formData: {},
			step: 1,
			roles: ["ROLE_ADMIN", "ROLE_USER"],
			genres: ["Homme", "Femme", 'none'],
			showPasswd: false,
			rules: {
				required: value => !!value || 'Required.',
				min: v => v.length >= 8 || 'Min 8 characters',
				emailMatch: () => (`The email and password you entered don't match`),
			},
		}
	},
	mounted() {
		if (this.profile) {
			this.formData = this.profile
		}
	},
	computed: {
		...mapGetters([
			'isAuthenticated',
			'getUser',
		]),

		currentTitle() {
			switch (this.step) {
				case 2:
					if (this.profile) {
						return 'Modifier les Informations'
					}
					return "Informations"
				case 3:
					return 'Créer un mot de passe'
				default:
					if (this.profile) {
						return 'Modifier le compte'
					}
					return ''
			}
		},

	},
	methods: {
		addUser() {
			return this.nodefony.request(`users`, "POST", {
					headers: {
						"content-type": "application/json"
					},
					body: JSON.stringify(this.formData)
				})
				.then(async (response) => {
					return await this.goUser(response.result.user.username)

				})
				.catch((e) => {

					console.error(e)
				})

		},
		updateUser() {
			return this.nodefony.request(`users/${this.formData.username}`, "PUT", {
					headers: {
						"content-type": "application/json"
					},
					body: JSON.stringify(this.formData)
				})
				.then(async (response) => {
					return await this.goUser(response.result.user.username)
				})
				.catch((e) => {
					console.error(e)
				})
		},
		goUser(username) {
			return this.$router.push({
				name: 'UserProfile',
				params: {
					username: username
				}
			}).then(() => {
				const eventName = this.profile ? 'update' : 'create'
				this.$emit(eventName, username)
				this.step = 1
			})
		}
	}

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
	inject,
} from 'vue'

import {
	useI18n
} from 'vue-i18n'

const nodefony = inject('nodefony')

//datas
const {
	t
} = useI18n({
	inheritLocale: true,
	useScope: 'local'
})
const container = ref(null);
const currentItem = ref("tab-Web")
</script>

<style lang="scss">

</style>

<i18n>
{
  "en": {

  },
  "fr": {

  }
}
</i18n>
