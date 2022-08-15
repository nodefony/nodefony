<template>
<v-layout class="w-100 h-100"
          style="position:absolute">
	<v-navigation-drawer width="250"
	                     permanent>
		<template v-slot:image>
			<v-img gradient="to top right, rgba(19,84,122,.8), rgba(128,208,199,.8)"></v-img>
		</template>
		<v-card class="d-flex"
		        max-width="250"
		        max-height="125"
		        min-height="100"
		        tile>

			<v-icon size="60"
			        class="mx-3 my-auto"
			        :color="colorRegistred">
				{{icon}}
			</v-icon>

			<v-list-item>
				<v-list-item-header>
					<v-list-item-title class="text-h5">{{name}}</v-list-item-title>
					<v-list-item-subtitle>Bundle</v-list-item-subtitle>
				</v-list-item-header>
			</v-list-item>
		</v-card>
		<v-divider></v-divider>
		<v-tabs density="compact"
		        v-model="tab"
		        class="w-100"
		        direction="vertical"
		        color="primary">
			<v-tab v-if="isRegistred"
			       value="dashboard">
				<v-icon :size="iconSize"
				        start>
					mdi-monitor-dashboard
				</v-icon>
				Dashboard
			</v-tab>
			<v-divider></v-divider>
			<v-tab value="readme">
				<v-icon :size="iconSize"
				        start>
					mdi-language-markdown
				</v-icon>
				README.md
			</v-tab>
			<v-divider></v-divider>
			<v-tab value="package">
				<v-icon :size="iconSize"
				        start>
					mdi-npm
				</v-icon>
				Package
				<v-badge inline
				         v-if="bundle"
				         :content="totalPackages"
				         class="ml-2"
				         color="error">
				</v-badge>
				<v-badge inline
				         v-else
				         :content="0"
				         class="ml-2"
				         color="error">
				</v-badge>
			</v-tab>
			<v-divider></v-divider>
			<div v-if="isRegistred"
			     class="w-100">
				<v-tab value="config"
				       class="w-100">
					<v-icon :size="iconSize"
					        start>
						mdi-tools
					</v-icon>
					Configurations
				</v-tab>
				<v-divider></v-divider>
				<v-tab value="routing"
				       class="w-100">
					<v-icon :size="iconSize"
					        start>
						mdi-protocol
					</v-icon>
					Routing
					<v-badge inline
					         v-if="bundle"
					         :content="bundle.routes.length"
					         class="ml-2"
					         color="error">
					</v-badge>
					<v-badge inline
					         v-else
					         :content="0"
					         class="ml-2"
					         color="error">
					</v-badge>
				</v-tab>
				<v-divider></v-divider>
				<v-tab value="services"
				       class="w-100">
					<v-icon :size="iconSize"
					        start>
						mdi-view-module
					</v-icon>
					Services
					<v-badge inline
					         v-if="bundle"
					         :content="totalServices"
					         class="ml-2"
					         color="error">
					</v-badge>
					<v-badge inline
					         v-else
					         :content="0"
					         class="ml-2"
					         color="error">
					</v-badge>
				</v-tab>
				<v-divider></v-divider>
				<v-tab value="firewall"
				       class="w-100">
					<v-icon :size="iconSize"
					        start>
						mdi-wall-fire
					</v-icon>
					Firewall
				</v-tab>
				<v-divider></v-divider>
				<v-tab value="orm"
				       class="w-100">
					<v-icon :size="iconSize"
					        start>
						mdi-database
					</v-icon>
					ORM Entities
					<v-badge inline
					         v-if="bundle"
					         :content="totalEntities"
					         class="ml-2"
					         color="error">
					</v-badge>
					<v-badge inline
					         v-else
					         content="0"
					         class="ml-2"
					         color="error">
					</v-badge>
				</v-tab>
				<v-divider></v-divider>
				<v-tab value="webpack"
				       class="w-100">
					<v-icon :size="iconSize"
					        start>
						mdi-webpack
					</v-icon>
					WEBPACK
				</v-tab>
				<v-divider></v-divider>
				<v-tab value="tests"
				       class="w-100">
					<v-icon :size="iconSize"
					        start>
						mdi-hospital-box
					</v-icon>
					Unit Tests
				</v-tab>
				<v-divider></v-divider>
				<v-tab value="command"
				       class="w-100">
					<v-icon :size="iconSize"
					        start>
						mdi-language-javascript
					</v-icon>
					Commands
				</v-tab>
				<v-divider></v-divider>
				<v-tab value="fixtures"
				       class="w-100">
					<v-icon :size="iconSize"
					        start>
						mdi-database-plus-outline
					</v-icon>
					Fixtures
				</v-tab>
				<v-divider></v-divider>
			</div>
			<v-tab value="documentation">
				<v-icon :size="iconSize"
				        start>
					mdi-help-box
				</v-icon>
				Documentation
			</v-tab>
			<v-divider></v-divider>

		</v-tabs>
	</v-navigation-drawer>
	<v-main class="w-100 h-100 overflow-auto"
	        style="position:absolute">

		<v-window v-if="bundle"
		          v-model="tab">

			<v-window-item v-if="isRegistred"
			               value="dashboard">
				<v-card flat>
					<v-container v-if="bundleTypeIcon"
					             fluid
					             class="d-flex  justify-center">
						<v-icon size="125"> {{bundleTypeIcon}}
						</v-icon>
					</v-container>
					<v-container v-else
					             fluid
					             class="d-flex  justify-center">
						<v-img class=""
						       width="60"
						       height="51"
						       src="/framework-bundle/images/nodefony-logo.png" />
					</v-container>

					<v-container fluid
					             class="d-flex  justify-center pt-0">
						<v-card-title style="font-size:35px"
						              class="nodefony"> Bundle {{name}}</v-card-title>
					</v-container>

					<v-container fluid
					             class="d-flex flex-row flex-wrap overflow-auto">
						<v-card min-width="400"
						        min-height="300"
						        class="d-flex flex-column  flex-grow-1 flex-shrink-1 my-5 mx-5"
						        outlined
						        tile>

							<v-toolbar theme="dark"
							           color="#233056">
								<template v-slot:prepend>
									<v-img width="60"
									       height="51"
									       src="/framework-bundle/images/nodejs/nodejs-new-pantone-white.png" />
								</template>
								<template v-slot:append>
									<v-chip text-color="white"
									        variant="outlined">
										{{bundle.package.version}}
									</v-chip>
								</template>
								<v-icon color="#43853d"
								        class="mr-2"
								        size="60">mdi-npm</v-icon>
								{{bundle.package.name}}
							</v-toolbar>
							<v-layout>

							</v-layout>

						</v-card>
						<!--v-card min-width="300"
						        min-height="200"
						        v-for="n in 7"
						        :key="n"
						        class="d-flex flex-column  flex-grow-1 flex-shrink-1 my-5 mx-5"
						        outlined
						        tile
						        min->
							<v-toolbar theme="dark"
							           color="#233056">
								<template v-slot:prepend>
									<v-list-item class="pl-0"
									             title="Nodefony"
									             value="nodefony"
									             prepend-avatar="/app/images/app-logo.png">
									</v-list-item>
								</template>
								<template v-slot:append>
								</template>
								Flex {{n}}
							</v-toolbar>

						</v-card-->

					</v-container>

				</v-card>
			</v-window-item>

			<v-window-item value="readme">
				<v-card flat>
					<v-card-text>
						<Suspense>
							<n-readme :bundle="name" />
						</Suspense>
					</v-card-text>
				</v-card>
			</v-window-item>
			<v-window-item v-if="isRegistred"
			               value="config">
				<n-bundle-config :name="name"
				                 :config="bundle.config" />
			</v-window-item>

			<v-window-item value="package">
				<n-bundle-package v-if="bundle && bundle.package"
				                  :package="bundle.package"
				                  :bundleName="name" />
			</v-window-item>


			<div v-if="isRegistred">
				<v-window-item value="routing">
					<n-bundle-routing v-if="bundle && bundle.routes"
					                  :routes="bundle.routes" />
				</v-window-item>

				<v-window-item value="services">
					<n-bundle-services v-if="bundle && bundle.services"
					                   :services="bundle.services" />
				</v-window-item>

				<v-window-item value="firewall">

				</v-window-item>

				<v-window-item value="orm">
					<n-bundle-orm :entities="bundle.entities" />
				</v-window-item>

				<v-window-item value="webpack">

				</v-window-item>
			</div>

		</v-window>
	</v-main>
</v-layout>
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
import Readme from '@/views/readme.vue';
import Package from '@/views/bundles/package.vue';
import Routing from '@/views/bundles/routing.vue';
import Config from '@/views/bundles/config.vue';
import Services from '@/views/bundles/services.vue';
import Orm from '@/views/bundles/orm.vue';
import gql from 'graphql-tag'
export default {
	name: 'BundleView',
	components: {
		'n-readme': Readme,
		'n-bundle-package': Package,
		'n-bundle-routing': Routing,
		'n-bundle-config': Config,
		'n-bundle-services': Services,
		'n-bundle-orm': Orm
	},
	props: {
		//name: String
	},
	apollo: {
		bundle: {
			// gql query
			query: gql `
      query getRoutes($bundle: String!) {
        routes:getRouteByBundle(name: $bundle){
          name
          path
          host
          variables
          bypassFirewall
          defaultLang
          hash
          prefix
          schemes
          filePath
          bundle
          index
        }
        config:getConfigByBundle(name: $bundle)
        services:getServicesbyBundle(name: $bundle)
        bunble:getBundle(name: $bundle)
        entities: getEntitiesByBundle(name: $bundle)
      }
	    `,
			update: (data) => {
				const parseBundle = JSON.parse(data.bunble)
				return {
					routes: data.routes,
					config: JSON.parse(data.config),
					package: parseBundle.package,
					services: JSON.parse(data.services),
					bunble: parseBundle,
					entities: JSON.parse(data.entities),
				}
			},
			// Reactive parameters
			variables() {
				// Use vue reactive properties here
				return {
					bundle: this.name,
				}
			},
		}
	},
	data() {
		return {
			tab: "dashboard",
			bundle: null,
			iconSize: 35
		}
	},
	computed: {
		bundleTypeIcon() {
			switch (this.bundle.config.type) {
				case "vue":
					return "mdi-vuejs"
				case "react":
					return "mdi-react"
				default:
					return null
			}
		},
		totalPackages() {
			let dev = 0
			let dep = 0
			if (this.bundle && this.bundle.package && this.bundle.package.devDependencies) {
				dev = Object.keys(this.bundle.package.devDependencies).length || 0
			}
			if (this.bundle && this.bundle.package && this.bundle.package.dependencies) {
				dep = Object.keys(this.bundle.package.dependencies).length || 0
			}
			return (dev + dep)
		},
		totalServices() {
			if (this.bundle && this.bundle.services) {
				return this.bundle.services.length
			}
			return 0
		},
		totalEntities() {
			if (this.bundle && this.bundle.entities) {
				return Object.keys(this.bundle.entities).length
			}
			return 0
		},
		isRegistred() {
			if (this.bundle && this.bundle.bunble) {
				this.tab = "dashboard"
				return this.bundle.bunble.registred
			}
			this.tab = "readme"
			return false
		},
		colorRegistred() {
			if (this.isRegistred) {
				return 'green darken-2'
			}
			return "red darken-2"
		}

	},
	setup(props) {
		const route = useRoute()
		const name = reactive(route.params.name)
		//computed
		const icon = computed(() => {
			switch (name) {
				case "security":
					return "mdi-security"
				case "doc":
					return "mdi-help-rhombus"
				case "sequelize":
					return "mdi-database"
				case "users":
					return "mdi-account-multiple"
				case "redis":
					return "mdi-database"
				case "elastic":
					return "mdi-database"
				case "mongoose":
					return "mdi-database"
				case "mail":
					return "mdi-email-outline"
				case "framework":
					return "mdi-tools"
				case "http":
					return "mdi-protocol"
				case "test":
					return "mdi-help-box"
				case "realtime":
					return "mdi-update"
				case "unittests":
					return "mdi-function-variant"
				default:
					return "mdi-package"
			}
		})
		return {
			name,
			icon
		}
	},
	beforeMount() {},
	mounted() {},
	methods: {}
}
</script>


<style scoped lang="scss">

</style>
