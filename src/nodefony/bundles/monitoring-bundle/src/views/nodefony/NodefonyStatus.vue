<template >
<v-card v-if="api"
        rounded
        min-width="300"
        min-height="200"
        max-height="380"
        class="d-flex flex-column  flex-grow-1 flex-shrink-0 my-5 mx-5"
        outlined
        tile>
	<v-toolbar rounded
	           density="compact"
	           theme="dark"
	           color="#233056">
		<template v-slot:prepend>
			<v-list-item style="color:white;font-size:2rem"
			             class="pl-0 nodefony"
			             :prepend-avatar="nodefony.logo"
			             title="Nodefony"
			             value="nodefony">
			</v-list-item>
		</template>
		<template v-slot:append>
			<v-chip inline
			        class="mt-2">{{api.status.version}}</v-chip>
		</template>
		<template v-slot:extension>
			<v-tabs v-model="modelNodefony">
				<v-tab value="nodefony">
					Nodefony
				</v-tab>
				<v-tab value="process">
					Processus
				</v-tab>

				<v-tab value="kernel">
					Kernel
				</v-tab>
				<v-tab value="node">
					Node.js
					<v-chip size="small"
					        class="ml-1"
					        variant="outlined"
					        density="compact">{{api.status.node.node}}</v-chip>
				</v-tab>

			</v-tabs>
		</template>
	</v-toolbar>
	<v-window v-model="modelNodefony"
	          style="max-height:300px"
	          class="overflow-auto">

		<v-window-item value="nodefony">
			<v-list density="compact"
			        style="">
				<div v-for=" (value, key) in api.status"
				     :key="key">
					<v-list-item v-if="key !=='node' && key !=='process'"
					             class="text-caption">
						<v-list-item-title>{{key}}</v-list-item-title>
						<v-chip inline
						        density="compact"
						        variant="outlined"
						        color='blue'>{{value}}</v-chip>
					</v-list-item>
					<v-divider></v-divider>
				</div>
			</v-list>
		</v-window-item>

		<v-window-item value="process">
			<div v-for=" (value, key) in api.status.process"
			     :key="key">
				<v-list-item v-if="key !== 'clusters'"
				             class="text-caption">
					<v-list-item-title>{{key}}</v-list-item-title>
					<v-chip inline
					        density="compact"
					        variant="outlined"
					        color='blue'>{{value}}</v-chip>
				</v-list-item>
				<v-table v-else>
					<v-card-title>
						Clusters
						<v-chip inline>{{api.status.process.clusters.name}} </v-chip>
					</v-card-title>
					<tbody>
						<tr v-for=" (value, key) in api.status.process.clusters.pm2"
						    :key="key">
							<td>{{ value.name }}</td>
							<td>{{ value.monit.memory }}</td>
							<td>{{ value.monit.cpu }}</td>
							<td>{{ value.pid }}</td>
							<td>{{ value.pm_id }}</td>
							<td>{{ value.monit.pm2_env }}</td>
						</tr>
					</tbody>
				</v-table>
				<v-divider></v-divider>
			</div>
		</v-window-item>

		<v-window-item value="kernel">
			<v-table density="compact">
				<tbody v-for=" (value, key) in api.kernel.system"
				       :key="key">
					<tr v-if="key !== 'servers' && key !== 'bundles'">
						<td>{{ key}}</td>
						<td>
							<v-chip inline
							        density="compact"
							        variant="outlined"
							        color='blue'>{{value}}
							</v-chip>
						</td>
					</tr>
				</tbody>
			</v-table>

		</v-window-item>

		<v-window-item value="node">
			<v-table density="compact">
				<v-card-title>
					Node.js :
				</v-card-title>
				<tbody>
					<tr v-for=" (value, key) in api.status.node"
					    :key="key">
						<td>{{ key }}</td>
						<td>{{ value }}</td>
					</tr>
				</tbody>
			</v-table>
		</v-window-item>

	</v-window>
</v-card>
</template>

<script>
export default {
	name: "NodefonyStatus",
	inject: ["nodefony"],
	props: {
		api: Object,
		default: null
	},
	data() {
		return {
			modelNodefony: "nodefony"
		}
	},

}
</script>

<style lang="css" scoped>
</style>
