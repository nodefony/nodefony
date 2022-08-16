<template>
<v-container fluid
             class="pa-0">
	<v-card color="#233056"
	        theme="dark">
		<div class="absolute d-flex flex-no-wrap justify-space-between">
			<div class="flex-grow-0 ">
				<v-card-title class="text-h5">
					Bundle {{bundleName}}
				</v-card-title>
				<v-card-subtitle>
					{{package.description}}
				</v-card-subtitle>
				<v-list bg-color="#233056"
				        density="compact">
					<v-list-item density="compact">
						<v-list-item-title>Dependencies :
							<v-badge color="info"
							         :content="nbDependencies"
							         inline>
							</v-badge>

						</v-list-item-title>
					</v-list-item>
					<v-list-item density="compact">
						<v-list-item-title>Dev Dependencies :
							<v-badge color="info"
							         :content="nbDevDependencies"
							         inline>
							</v-badge>
						</v-list-item-title>
					</v-list-item>
				</v-list>
			</div>
			<div class="flex-grow-1 ">

			</div>
			<v-list-item density="compact">
				<v-list-item-title>
					outdated :
					<v-badge :color="nbOutdated?'error':'info'"
					         :content="nbOutdated"
					         inline>
					</v-badge>
				</v-list-item-title>
				<div v-if="$apollo.loading">Check outdated
					<v-progress-linear indeterminate
					                   color="green">
					</v-progress-linear>
				</div>

			</v-list-item>
			<v-avatar class="ma-3 flex-grow-0"
			          size="125"
			          rounded="0">
				<v-icon color="#43853d"
				        class="mr-2"
				        size="125">mdi-npm</v-icon>
			</v-avatar>

		</div>
	</v-card>

	<v-card flat>
		<v-container>
			<v-card-title>
				Dependencies
				<v-chip class="ma-2"
				        color="primary">
					{{nbDependencies}}
				</v-chip>

			</v-card-title>
			<v-table density="compact"
			         class="overflow-auto"
			         fixed-header
			         style="max-height:300px">
				<thead>
					<tr>
						<th class="text-left">
							Name
						</th>
						<th class="text-left">
							version
						</th>
						<th class="text-left">
							wanted
						</th>
						<th class="text-left">
							latest
						</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="( value, key) in dependencies"
					    :key="key"
					    :bgcolor="dependenciesOutdated[key]?'#f5f5f5':''">
						<td>{{ key }}</td>
						<td>{{ value }}</td>
						<td v-if="dependenciesOutdated[key]"> {{dependenciesOutdated[key].wanted}}</td>
						<td v-else></td>
						<td v-if="dependenciesOutdated[key]">{{dependenciesOutdated[key].latest}}</td>
						<td v-else></td>
					</tr>
				</tbody>
			</v-table>
		</v-container>
		<v-container>
			<v-card-title>
				Dev Dependencies
				<v-chip class="ma-2"
				        color="primary">
					{{nbDevDependencies}}
				</v-chip>
			</v-card-title>
			<v-table density="compact"
			         class="overflow-auto"
			         fixed-header
			         style="max-height:300px">
				<thead>
					<tr>
						<th class="text-left">
							Name
						</th>
						<th class="text-left">
							version / current
						</th>
						<th class="text-left">
							wanted
						</th>
						<th class="text-left">
							latest
						</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="( value, key) in devDependencies"
					    :key="key"
					    :bgcolor="dependenciesOutdated[key]?'#f5f5f5':''">
						<td>{{ key }}</td>
						<td>{{ value }}</td>
						<td v-if="devDependenciesOutdated[key]"> {{devDependenciesOutdated[key].wanted}}</td>
						<td v-else></td>
						<td v-if="devDependenciesOutdated[key]">{{devDependenciesOutdated[key].latest}}</td>
						<td v-else></td>
					</tr>
				</tbody>
			</v-table>
		</v-container>
		<!--v-list density="compact">
        <v-list-item v-for="(item, key) in package" density="compact" :key="key">
          <v-list-item-header>
            <v-list-item-title>{{key}} : </v-list-item-title>
          </v-list-item-header>:<wbr>
          <v-list-item-subtitle>{{item}}</v-list-item-subtitle>
        </v-list-item>
      </v-list-->
	</v-card>
</v-container>
</template>

<script>
import {
	useRoute
} from 'vue-router'
import {
	ref,
	reactive,
	toRefs,
	computed
} from "vue";
import gql from 'graphql-tag'
export default {
	name: 'PackageView',
	components: {

	},
	props: {
		bundleName: {
			type: String,
		},
		package: {
			type: Object,
			default: null
		}
	},
	data() {
		return {
			bundle: null,
		}
	},
	apollo: {
		bundle: {
			// gql query
			query: gql `
      query getOutdated($bundle: String!) {
        outdated: outdated(bundle: $bundle)
      }
	    `,
			update: (data) => {
				return {
					outdated: JSON.parse(data.outdated),
				}
			},
			// Reactive parameters
			variables() {
				// Use vue reactive properties here
				return {
					bundle: this.bundleName,
				}
			},
		}
	},
	computed: {
		dependencies() {
			if (this.package && this.package.dependencies) {
				return this.package.dependencies
			}
			return {}
		},
		dependenciesOutdated() {
			let result = {}
			if (this.dependencies && this.outdated) {
				for (let dep in this.dependencies) {
					if (dep in this.outdated) {
						result[dep] = this.outdated[dep]
					}
				}
				return result
			}
			return result
		},
		devDependencies() {
			if (this.package && this.package.devDependencies) {
				return this.package.devDependencies
			}
			return {}
		},
		devDependenciesOutdated() {
			let result = {}
			if (this.devDependencies && this.outdated) {
				for (let dep in this.devDependencies) {
					if (dep in this.outdated) {
						result[dep] = this.outdated[dep]
					}
				}
				return result
			}
			return result
		},
		nbDevDependencies() {
			if (this.devDependencies) {
				return Object.keys(this.devDependencies).length || 0
			}
			return 0
		},
		nbDependencies() {
			if (this.dependencies) {
				return Object.keys(this.dependencies).length || 0
			}
			return 0
		},
		totalPackages() {
			return this.nbDependencies + this.nbDevDependencies
		},
		outdated() {
			if (this.bundle && this.bundle.outdated) {
				if (this.bundle.outdated.stdout) {
					return this.bundle.outdated.stdout
				}
			}
			return null
		},
		nbOutdated() {
			if (this.outdated) {
				return Object.keys(this.outdated).length || 0
			}
			return 0
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


<style scoped lang="scss">

</style>
