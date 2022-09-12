<template>
<v-layout v-if="orm"
          class="w-100 h-100"
          style="position:absolute">
	<v-navigation-drawer width="250"
	                     permanent>
		<v-card class="d-flex"
		        max-width="250"
		        max-height="125"
		        min-height="100"
		        tile>
			<v-img class="mt-3"
			       width="80"
			       height="80"
			       :src="imageOrm" />
			<v-list-item line="three">
				<v-list-item-header>
					<v-list-item-title class="text-h5">{{name}}</v-list-item-title>
					<v-list-item-subtitle>ORM</v-list-item-subtitle>
					<v-list-item-subtitle>Debug : {{orm.orm.debug}}</v-list-item-subtitle>
					<v-list-item-subtitle>Version : {{orm.orm.version}}</v-list-item-subtitle>
				</v-list-item-header>
			</v-list-item>
		</v-card>
		<v-tabs density="compact"
		        v-model="tab"
		        direction="vertical">
			<v-tab value="dashboard"
			       to="/database">
				<v-icon :size="iconSize"
				        start>
					mdi-monitor-dashboard
				</v-icon>
				Dashboard
			</v-tab>
			<v-divider></v-divider>
			<div v-if="!routeChild">
				<v-tab value="connectors">
					<v-icon :size="iconSize"
					        start>
						mdi-connection
					</v-icon>
					Connectors
					<v-spacer></v-spacer>
					<v-chip density="compact"
					        inline> {{nbConnectors}}</v-chip>
				</v-tab>
				<v-divider></v-divider>
				<v-tab value="entities">
					<v-icon :size="iconSize"
					        start>
						mdi-database-edit
					</v-icon>
					Entity <v-spacer></v-spacer>
					<v-chip density="compact"
					        inline> {{nbEntities}}</v-chip>
				</v-tab>
				<v-divider></v-divider>
			</div>
		</v-tabs>

	</v-navigation-drawer>

	<v-layout v-if="routeChild"
	          class="h-100 w-100 overflow-auto"
	          style="margin-left:250px">
		<router-view name="orm"></router-view>
	</v-layout>
	<v-window v-else
	          v-model="tab"
	          class="h-100 w-100 overflow-auto"
	          style="margin-left:250px">
		<v-window-item value="dashboard">
			<v-container fluid
			             class="w-100 h-100">
				<v-layout fluid
				          class="d-flex flex-row flex-wrap justify-space-around">
					<n-orm-connector widget
					                 v-for="(connector) in connectors"
					                 :key="connector.name"
					                 :connector="connector"
					                 min-width="300"
					                 max-width="600"
					                 min-height="200"
					                 class="d-flex flex-column flex-grow-1 flex-shrink-1 my-2 mx-2" />
				</v-layout>

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
			</v-container>
		</v-window-item>
		<v-window-item value="connectors">
			<v-table fixed-header>
				<thead>
					<tr>
						<th class="text-left">
							Name
						</th>
						<th class="text-left">
							Type
						</th>
						<th class="text-left">
							State
						</th>
						<th class="text-left">
							Options
						</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="item in connectors"
					    :key="item.name">
						<td>
							<v-chip @click="goConnector(item.name)"
							        density="compact">{{item.name}}</v-chip>
						</td>
						<td>{{ item.type }}</td>
						<td>{{ item.state }}</td>
						<td>{{ item.options }}</td>
					</tr>
				</tbody>
			</v-table>
		</v-window-item>
		<v-window-item value="entities">

			<v-table fixed-header>
				<thead>
					<tr>
						<th class="text-left">
							Name
						</th>
						<th class="text-left">
							Table Name
						</th>
						<th class="text-left">
							Bundle
						</th>
						<th class="text-left">
							Connector
						</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="item in entities"
					    :key="item.name">
						<td>
							<v-chip @click="goEntity(item.name)"
							        density="compact">{{item.name}}
							</v-chip>
						</td>
						<td>{{ item.tableName }}</td>
						<td>{{ item.bundleName }}</td>
						<td>
							<v-chip @click="goConnector(item.connectorName)"
							        density="compact">{{item.connectorName}}
							</v-chip>
						</td>
					</tr>
				</tbody>
			</v-table>
		</v-window-item>
	</v-window>

</v-layout>
</template>
<script>
import gql from 'graphql-tag'
import imageSequelise from '@/../public/img/sequelize.png'
import imageMongoose from '@/../public/img/mongoose.png'
import connector from '@/views/databases/Connection'
import entity from '@/views/databases/Entity'
import {
	useRouter,
	useRoute
} from 'vue-router'

export default {
	name: 'databaseDashboard',
	components: {
		"n-orm-connector": connector,
		"n-orm-entity": entity,
	},

	setup() {
		const route = useRoute()
	},
	data() {
		return {
			tab: "dashboard",
			iconSize: 25
		}
	},
	mounted() {},
	watch: {

	},
	apollo: {
		orm: {
			// gql query
			query: gql `
        query getOrm {
          orm:getOrm
          connectors:getConnectors
          entities:getEntities
        }
	    `,
			update: (data) => {
				return {
					orm: JSON.parse(data.orm),
					connectors: JSON.parse(data.connectors),
					entities: JSON.parse(data.entities)
				}
			},
			// Reactive parameters
			variables() {
				// Use vue reactive properties here
				return {}
			},
		}
	},
	computed: {
		routeChild() {
			switch (this.$route.name) {
				case "OrmEntity":
					return true
				default:
					this.tab = "dashboard"
					return false
			}
		},
		name() {
			if (this.orm) {
				return this.orm.orm.name
			}
			return ""
		},
		connectors() {
			if (this.orm) {
				return this.orm.connectors
			}
			return null
		},
		nbConnectors() {
			if (this.connectors) {
				return Object.keys(this.connectors).length
			}
		},
		entities() {
			if (this.orm) {
				return this.orm.entities
			}
			return null
		},
		nbEntities() {
			if (this.entities) {
				return Object.keys(this.entities).length
			}
		},
		imageOrm() {
			if (this.name) {
				if (this.name === "sequelize") {
					return imageSequelise
				}
				if (this.name === "mongoose") {
					return imageMongoose
				}
			}
		}
	},
	beforeMount() {

	},
	methods: {
		goConnector(name) {
			return this.$router.push({
				name: 'Connectors',
				params: {
					name: name
				}
			})
		},
		goEntity(name) {
			return this.$router.push({
				path: `/database/entity/${name}`,
				param: {
					entity: name
				}
			})
		}
	}
}
</script>

<style lang="scss">

</style>
