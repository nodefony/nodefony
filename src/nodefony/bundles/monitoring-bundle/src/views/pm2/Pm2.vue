<template >
<v-container fluid
             class="w-100 pa-0 h-100"
             style="position:absolute">

	<v-toolbar color="#233056"
	           theme="dark"
	           extended
	           flat>
		<v-app-bar-title>
			Process Manager (PM2)
			<v-badge color="info"
			         v-if="pm2"
			         :content="nbProcess"
			         inline>
			</v-badge>
		</v-app-bar-title>
		<template v-slot:prepend>
			<v-icon size="50"
			        color="#43853d"
			        rounded="0">mdi-security</v-icon>
		</template>
		<template v-slot:append>
			<v-img class="mt-3"
			       width="120"
			       height="120"
			       :src="imagePm2" />
		</template>
	</v-toolbar>

	<v-table fixed-header
	         v-if="process"
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
			<tr v-for="item in process"
			    :key="item.name">
			</tr>
		</tbody>
	</v-table>
</v-container>
</template>

<script>
import gql from 'graphql-tag'
import imagePm2 from '@/../public/img/pm2-logo.png'
export default {
	name: "n-pm2",
	inject: ["nodefony"],
	components: {

	},
	props: {

	},
	apollo: {
		request: {
			// gql query
			query: gql `
      query getPM2 {
        process:getPM2process
        config:getPM2config
      }
	    `,
			update: (data) => {
				return {
					process: data.process,
					config: data.config
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
			imagePm2: imagePm2
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
