<template >
<v-container fluid
             class="w-100 pa-0 h-100"
             style="position:absolute">

	<v-toolbar color="#233056"
	           theme="dark"
	           extended
	           flat>
		<v-app-bar-title>
			Web Firewall Application (WAF)
			<v-badge color="info"
			         v-if="areas"
			         :content="nbAreas"
			         inline>
			</v-badge>
		</v-app-bar-title>
		<v-card-subtitle>Security</v-card-subtitle>
		<template v-slot:prepend>
			<v-icon size="50"
			        color="#43853d"
			        rounded="0">mdi-security</v-icon>
		</template>
		<template v-slot:append>
			<v-icon size="50"
			        color="#43853d"
			        rounded="0">mdi-security</v-icon>
		</template>
	</v-toolbar>

	<v-table fixed-header
	         v-if="areas"
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
			<tr v-for="item in areas"
			    :key="item.name">
			</tr>
		</tbody>
	</v-table>
</v-container>
</template>

<script>
import gql from 'graphql-tag'
export default {
	name: "n-firewall",
	inject: ["nodefony"],
	components: {

	},
	props: {

	},
	apollo: {
		request: {
			// gql query
			query: gql `
      query getFirewall {
        areas:getFirewallAreas{
          name
        }
      }
	    `,
			update: (data) => {
				return {
					areas: data.areas,
				}
			},
			// Reactive parameters
			variables() {
				// Use vue reactive properties here
			},
		}
	},
	watch: {},
	data() {
		return {
			tab: 1,
		}
	},
	setup(props) {
		return {}
	},
	computed: {},
	beforeMount() {},
	mounted() {},
	methods: {}
}
</script>

<style lang="css" scoped>
</style>
