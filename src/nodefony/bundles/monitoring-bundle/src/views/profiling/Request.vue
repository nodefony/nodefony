<template >
<v-container v-if="request"
             fluid
             class="w-100 pa-0 h-100"
             style="position:absolute">
	<v-toolbar color="#233056"
	           theme="dark"
	           extended
	           flat>
		<v-app-bar-title>
			Request
			<v-badge color="info"
			         :content="code"
			         inline>
			</v-badge>
		</v-app-bar-title>
		<v-card-subtitle>Request</v-card-subtitle>
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
</v-container>
</template>

<script>
import gql from 'graphql-tag'
export default {
	name: "n-request",
	inject: ["nodefony"],
	components: {},
	props: {
		id: {
			type: String
		}
	},
	apollo: {
		req: {
			// gql query
			query: gql `
      query getRequest($id: String!) {
        request:getRequestsById(id:$id)
      }
	    `,
			update: (data) => {
				return {
					request: JSON.parse(data.request),
				}
			},
			// Reactive parameters
			variables() {
				return {
					id: this.id
				}
			},
		}
	},
	computed: {
		request() {
			if (this.req) {
				return this.req.request
			}
			return null
		},
		code() {
			return this.request.state
		}
	}
}
</script>

<style lang="css" scoped>
</style>
