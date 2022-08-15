<template >
<v-container v-if="bundle"
             fluid>
	<v-window v-for="bundle in bundle.bundles">
		<n-bundle-package v-if="bundle.package"
		                  :package="bundle.package"
		                  :bundleName="bundle.name" />
	</v-window>
</v-container>
</template>

<script>
import gql from 'graphql-tag'
import Package from '@/views/bundles/package.vue';
export default {
	name: "n-npm-package",
	components: {
		'n-bundle-package': Package,
	},
	apollo: {
		bundle: {
			// gql query
			query: gql `
      query getOutdated ($registred: Boolean!){
        bundles: getBundles(registred: $registred)
      }
	    `,
			update: (data) => {
				return {
					bundles: JSON.parse(data.bundles),
				}
			},
			// Reactive parameters
			variables() {
				// Use vue reactive properties here
				return {
					registred: true,
				}
			},
		}
	},
}
</script>

<style lang="css" scoped>
</style>
