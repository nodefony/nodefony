<template >
<v-card v-if="nodefony"
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
			<v-list-item style="color:white;font-size:1.5rem"
			             class="pl-0 nodefony"
			             title="Nodefony"
			             value="nodefony"
			             prepend-avatar="/framework-bundle/images/nodefony-logo.png">
			</v-list-item>
		</template>
		<template v-slot:append>
			<v-chip inline
			        class="mt-2">{{nodefony.status.version}}</v-chip>
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
				</v-tab>kernel
				<v-tab value="node">
					Node.js
					<v-chip size="small"
					        class="ml-1"
					        variant="outlined"
					        density="compact">{{nodefony.status.node.node}}</v-chip>
				</v-tab>

			</v-tabs>
		</template>
	</v-toolbar>
	<v-window v-model="modelNodefony"
	          style="max-height:300px"
	          class="overflow-auto">

		<v-window-item :value="nodefony">
			<v-list density="compact"
			        style="">
				<div v-for=" (value, key) in nodefony.status"
				     :key="key">
					<v-list-item v-if="key !=='node' && key !=='process'"
					             class="text-caption">
						<v-list-item-header class="text-subtitle-2">
							<v-list-item-title>{{key}}</v-list-item-title>
						</v-list-item-header>
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
			<div v-for=" (value, key) in nodefony.status.process"
			     :key="key">
				<v-list-item v-if="key !== 'clusters'"
				             class="text-caption">
					<v-list-item-header class="text-subtitle-2">
						<v-list-item-title>{{key}}</v-list-item-title>
					</v-list-item-header>
					<v-chip inline
					        density="compact"
					        variant="outlined"
					        color='blue'>{{value}}</v-chip>
				</v-list-item>
				<v-table v-else>
					<v-card-title>
						Clusters
						<v-chip inline>{{nodefony.status.process.clusters.name}} </v-chip>
					</v-card-title>
					<tbody>
						<tr v-for=" (value, key) in nodefony.status.process.clusters.pm2"
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
			<div v-for=" (value, key) in nodefony.kernel.system"
			     :key="key">
				<v-list-item v-if="key !== 'servers' && key !== 'bundles'"
				             class="text-caption">
					<v-list-item-header class="text-subtitle-2">
						<v-list-item-title>{{key}}</v-list-item-title>
					</v-list-item-header>
					<v-chip inline
					        density="compact"
					        variant="outlined"
					        color='blue'>{{value}}</v-chip>
				</v-list-item>
				<v-divider></v-divider>
			</div>

		</v-window-item>

		<v-window-item value="node">
			<v-table density="compact">
				<v-card-title>
					Node.js :
				</v-card-title>
				<tbody>
					<tr v-for=" (value, key) in nodefony.status.node"
					    :key="key">
						<td>{{ key }}</td>
						<td>{{ value }}</td>
					</tr>
				</tbody>
			</v-table>
			<!--v-list density="compact" style="">
          <div v-for=" (value, key) in nodefony.status.node" :key="key">
            <v-list-item class="text-caption">
              <v-list-item-header class="text-subtitle-2">
                <v-list-item-title>{{key}}</v-list-item-title>
              </v-list-item-header>
              <v-chip inline>{{value}}</v-chip>
            </v-list-item>
            <v-divider></v-divider>
          </div>
        </v-list-->
		</v-window-item>

	</v-window>
</v-card>
</template>

<script>
export default {
	name: "NodefonyStatus",
	props: {
		nodefony: Object,
		default: null
	},
	data() {
		return {
			modelNodefony: 0
		}
	},

}
</script>

<style lang="css" scoped>
</style>
