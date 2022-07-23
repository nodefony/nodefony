<template >
<v-container v-if="sessions"
             fluid
             class="w-100 pa-0 h-100"
             style="position:absolute">

	<v-toolbar color="#233056"
	           theme="dark"
	           extended
	           flat>
		<v-app-bar-title>
			Sessions
			<v-badge color="info"
			         v-if="nbSessions"
			         :content="nbSessions"
			         inline>
			</v-badge>
		</v-app-bar-title>
		<v-card-subtitle>sessions</v-card-subtitle>
		<template v-slot:prepend>
			<v-icon size="50"
			        color="#43853d"
			        rounded="0">mdi-router</v-icon>
		</template>
		<template v-slot:append>
			<v-icon size="50"
			        color="#43853d"
			        rounded="0">mdi-protocol</v-icon>
		</template>
	</v-toolbar>

	<v-table fixed-header
	         class="overflow-auto"
	         style="height:calc(100% - 30px)">
		<thead>
			<tr>
				<th class="text-left">
					user
				</th>
				<th class="text-left">
					id
				</th>
				<th class="text-left">
					context
				</th>
				<th class="text-left">
					createdAt
				</th>
				<th class="text-left">
					updatedAt
				</th>
				<th class="text-left">
					Attributes
				</th>
				<!--th class="text-left">
          flashBag
        </th>
        <th class="text-left">
					metaBag
				</th-->
			</tr>
		</thead>
		<tbody>
			<tr v-for="item in sessions"
			    :key="item.session_id">
				<td>
					<div v-if="item.user">
						{{ item.user.username }}
					</div>
					<div v-else-if="item.username">
						{{ item.username.username }}
					</div>
				</td>
				<td>{{ item.session_id }}</td>
				<td>{{ item.context }}</td>
				<td>{{ item.createdAt }}</td>
				<td>{{ item.updatedAt }}</td>
				<td>{{ item.Attributes }}</td>
				<!--td>{{ item.flashBag }}</td>
        <td>{{ item.metaBag }}</td-->
			</tr>
		</tbody>
	</v-table>
</v-container>
</template>

<script>
import gql from 'graphql-tag'
export default {
	name: "n-sessions",
	inject: ["nodefony"],
	components: {},
	props: {},
	apollo: {
		request: {
			// gql query
			query: gql `
      query getSessions {
        sessions:getSessions
      }
	    `,
			update: (data) => {
				return {
					sessions: JSON.parse(data.sessions),
				}
			},
			// Reactive parameters
			variables() {
				// Use vue reactive properties here
			},
		}
	},
	watch: {

	},
	data() {
		return {
			tab: 1,
		}
	},
	setup(props) {

		return {}
	},

	computed: {
		sessions() {
			if (this.request && this.request.sessions) {
				return this.request.sessions.rows
			}
			return null
		},
		nbSessions() {
			if (this.request && this.sessions) {
				return this.request.sessions.count
			}
			return null
		}
	},

	beforeMount() {

	},
	mounted() {

	},
	methods: {

	}
}
</script>

<style lang="css" scoped>
</style>
