<template >
<v-container v-if="requests"
             fluid
             class="w-100 pa-0 h-100"
             style="position:absolute">

	<v-toolbar color="#233056"
	           theme="dark"
	           extended
	           flat>
		<v-app-bar-title>
			Requests
			<v-badge color="info"
			         v-if="nbRequests"
			         :content="nbRequests"
			         inline>
			</v-badge>
		</v-app-bar-title>
		<v-card-subtitle>Requests</v-card-subtitle>
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
					Create
				</th>
				<th class="text-left">
					id
				</th>
				<th class="text-left">
					url
				</th>
				<th class="text-left">
					method
				</th>
				<th class="text-left">
					state
				</th>
				<th class="text-left">
					user
				</th>
				<th class="text-left">
					remoteAddress
				</th>
				<th class="text-left">
					userAgent
				</th>
				<th class="text-left">
					route
				</th>
				<th class="text-left">
					time (ms)
				</th>
				<th class="text-left">
					protocol
				</th>
				<th class="text-left">
					scheme
				</th>
			</tr>
		</thead>
		<tbody>
			<tr v-for="item in reverseRequests"
			    :key="item.id"
			    @click="goRequest(item.id)">
				<td>{{ getFormatDate(item.createdAt) }}</td>
				<td>{{ item.id }}</td>
				<td>{{ item.url }}</td>
				<td>{{ item.method }}</td>
				<td>{{ item.state }}</td>
				<td>
					<div v-if="item.user">
						{{ item.user.username }}
					</div>
					<div v-else="item.username">
						{{ item.username ? item.username.username : '' }}
					</div>
				</td>
				<td>{{ item.remoteAddress }}</td>
				<td>{{ item.userAgent }}</td>
				<td>{{ item.route }}</td>
				<td>{{ item.time }}</td>
				<td>{{ item.protocol }}</td>
				<td>{{ item.scheme }}</td>
			</tr>
		</tbody>
	</v-table>
</v-container>
</template>

<script>
import gql from 'graphql-tag'
export default {
	name: "n-requests",
	inject: ["nodefony"],
	components: {},
	props: {},
	apollo: {
		request: {
			// gql query
			query: gql `
      query getRequests {
        requests:getRequests
      }
	    `,
			update: (data) => {
				return {
					requests: JSON.parse(data.requests),
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
		requests() {
			if (this.request && this.request.requests) {
				return this.request.requests.rows
			}
			return null
		},
		nbRequests() {
			if (this.request && this.requests) {
				return this.request.requests.count
			}
			return null
		},
		reverseRequests() {
			if (this.requests) {
				return this.requests.reverse()
			}
		}
	},
	beforeMount() {},
	mounted() {},
	methods: {
		goRequest(id) {
			this.$router.push({
				name: "RequestProfiling",
				params: {
					id: id
				}
			})
		},
		getFormatDate(date) {
			return this.$moment(date).format('LLLL')
		}
	}
}
</script>

<style lang="css" scoped>
</style>
