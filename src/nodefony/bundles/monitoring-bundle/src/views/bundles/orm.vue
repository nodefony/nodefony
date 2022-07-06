<template >
<v-layout fluid
          class="d-flex flex-row flex-wrap justify-space-around">
	<n-orm-entity widget
	              skipQuery
	              v-for="(entity) in entities"
	              :key="entity.name"
	              :ormEntity="entity"
	              :name="entity.name"
	              min-width="300"
	              min-height="200"
	              max-width="400"
	              class="d-flex flex-column  flex-grow-1 flex-shrink-1 my-2 mx-2" />
</v-layout>
</template>

<script>
import gql from 'graphql-tag'
import entity from '@/views/databases/Entity'
export default {
	name: "n-bundle-orm",
	components: {
		"n-orm-entity": entity
	},
	props: {
		entities: {
			type: Object,
			required: true
		}
	},
	computed: {
		nbEntities() {
			if (this.entities) {
				return Object.keys(this.entities).length
			}
		},
	}
}
</script>

<style lang="css" scoped>
</style>
