<template >
<v-container v-if="routes"
             fluid
             class="w-100 pa-0 h-100"
             style="position:absolute">

	<v-toolbar color="#233056"
	           theme="dark"
	           extended
	           flat>
		<v-app-bar-title>
			Router
			<v-badge color="info"
			         v-if="nbRoutes"
			         :content="nbRoutes"
			         inline>
			</v-badge>
		</v-app-bar-title>
		<v-card-subtitle>routes</v-card-subtitle>
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
					index
				</th>
				<th class="text-left">
					Bundle
				</th>
				<th class="text-left">
					Name
				</th>
				<th class="text-left">
					Prefix
				</th>
				<th class="text-left">
					Methods
				</th>
				<th class="text-left">
					Uri
				</th>
				<th class="text-left">
					Host
				</th>
				<th class="text-left">
					variables
				</th>
				<th class="text-left">
					bypassFirewall
				</th>
				<th class="text-left">
					defaultLang
				</th>

				<th class="text-left">
					File Declaration
				</th>
			</tr>
		</thead>
		<tbody>
			<tr v-for="item in routes"
			    :key="item.name">
				<td>{{ item.index }}</td>
				<td>{{ item.bundle }}</td>
				<td>{{ item.name }}</td>
				<td>{{ item.prefix }}</td>
				<td v-if="item.requirements">{{ item.requirements.method }}</td>
				<td v-else></td>
				<td>{{ item.path }}</td>
				<td>{{ item.host }}</td>
				<td>{{ item.variables }}</td>
				<td>{{ item.bypassFirewall }}</td>
				<td>{{ item.defaultLang }}</td>
				<td>{{ basename(item.filePath) }}</td>
			</tr>
		</tbody>
	</v-table>
</v-container>
</template>

<script>
import gql from 'graphql-tag'
export default {
	name: "n-routes",
	inject: ["nodefony"],
	components: {

	},
	props: {

	},
	apollo: {
		request: {
			// gql query
			query: gql `
      query getRoutes {
        routes:getRoutes{
          name
          path
          host
          variables
          requirements
          bypassFirewall
          defaultLang
          hash
          prefix
          schemes
          filePath
          bundle
          index
        }
      }
	    `,
			update: (data) => {
				return {
					routes: data.routes,
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
		routes() {
			if (this.request && this.request.routes) {
				return this.request.routes
			}
			return null
		},
		nbRoutes() {
			if (this.request && this.routes) {
				return Object.keys(this.routes).length
			}
			return null
		}
	},

	beforeMount() {

	},
	mounted() {

	},
	methods: {
		basename(path) {
			if (path) {
				return this.nodefony.client.basename(path)
			}
			return ''
		}
	}
}
</script>

<style lang="css" scoped>
</style>
