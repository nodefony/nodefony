
<template>
<v-container fluid>
	<v-dialog v-model="agree"
	          persistent>
		<v-card>
			<v-card-title class="text-h5">
				Suppression Utilisateurs {{selected.username}}?
			</v-card-title>
			<v-card-text>Attention !!!!! .</v-card-text>
			<v-card-actions>
				<v-spacer></v-spacer>
				<v-btn color="green darken-1"
				       text
				       @click="agree = false">
					Annuller
				</v-btn>
				<v-btn color="green darken-1"
				       text
				       @click="deleteUser()">
					Confirmer
				</v-btn>
			</v-card-actions>
		</v-card>
	</v-dialog>

	<v-table ref="container"
	         fixed-header
	         fixed-footer
	         height="500"
	         density="compact">
		<thead>
			<tr>
				<th v-for="head in headers"
				    :key="head"
				    class="text-center">

					{{head}}
				</th>
			</tr>
		</thead>
		<tbody class="text-center">
			<tr v-for="item in users"
			    :key="item.username">

				<td>{{ item.username }}</td>
				<td>{{ item.name }}</td>
				<td>{{ item.surname }}</td>
				<td>{{ item.email }}</td>
				<td>
					<v-chip color="blue"
					        variant="outlined"
					        density="compact"
					        class="mx-1"
					        v-for="(name) in item.roles">
						{{ name }}
					</v-chip>
				</td>


				<td>
					<v-btn size="small"
					       rounded="lg"
					       class="mx-3"
					       color="primary"
					       variant="outlined"
					       @click="goUser(item.username)">
						<v-icon start
						        icon="mdi-cog-sync-outline"></v-icon>
						Profile
					</v-btn>
					<v-btn size="small"
					       class="mx-3"
					       rounded="lg"
					       color="red"
					       variant="outlined"
					       @click="selected=item;agree=true">
						<v-icon start
						        icon="mdi-delete"></v-icon>
						DELETE
					</v-btn>

				</td>
			</tr>
		</tbody>
		<tfoot>

		</tfoot>

	</v-table>
</v-container>
</template>

<script>
export default {
	name: 'd-users-table',

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
import {
	useRouter
} from 'vue-router'
const router = useRouter()

const nodefony = inject('nodefony')
const dlake = inject('dlake')

//events
//const emit = defineEmits(["preprov", "prov"])

//datas
const {
	t
} = useI18n({
	inheritLocale: true,
	useScope: 'local'
})
const container = ref(null);

const headersUsers = reactive({
	headers: ["username", "name", "surname", "email", "roles",
		"actions"
	]
})

const users = ref([]);

const agree = ref(false);
const selected = ref(null);

onMounted(() => {
	getUsers()
})

// computed
const headers = computed(() => {
	return headersUsers.headers.map((item) => {
		return t(item)
	})
})

//methods
const getUsers = function() {

	return nodefony.request(`users`, "GET", {
			headers: {
				"content-type": "application/json"
			}
		})
		.then((response) => {
			users.value = response.result.rows
		})
		.catch((e) => {
			console.error(e)
		})

}
const goUser = (id) => {
	return router.push({
		name: 'UserProfile',
		params: {
			username: id
		}
	})
}

const deleteUser = (user = selected) => {

	return nodefony.request(`users/${user.value.username}`, "DELETE", {
			headers: {
				"content-type": "application/json"
			}
		})
		.then(async (response) => {
			await getUsers()
			agree.value = false
		})
		.catch((e) => {
			agree.value = false
			console.error(e)
		})
}
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
