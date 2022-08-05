<template >
<v-container v-if="logs"
             fluid
             class="w-100 pa-0 h-100"
             style="position:absolute">

	<v-toolbar color="#233056"
	           theme="dark"
	           extended
	           flat>
		<v-app-bar-title>
			Syslog
			<v-badge color="info"
			         v-if="nbLogs"
			         :content="nbLogs"
			         inline>
			</v-badge>
		</v-app-bar-title>
		<v-card-subtitle>Syslog</v-card-subtitle>
		<template v-slot:prepend>
			<v-icon size="50"
			        color="#43853d"
			        rounded="0">mdi-math-log</v-icon>
		</template>
		<template v-slot:append>
			<v-icon size="50"
			        color="#43853d"
			        rounded="0">mdi-math-log</v-icon>
		</template>
	</v-toolbar>

	<v-table fixed-header
	         class="overflow-auto"
	         style="height:calc(100% - 30px)">
		<thead>
			<tr>
				<th class="text-left">
					timeStamp
				</th>
				<th class="text-left">
					severityName
				</th>
				<th class="text-left">
					msgid
				</th>
				<th class="text-left">
					payload
				</th>
				<th class="text-left">
					typePayload
				</th>
				<th class="text-left">
					moduleName
				</th>
				<th class="text-left">
					msg
				</th>
				<th class="text-left">
					id
				</th>
			</tr>
		</thead>
		<tbody>
			<tr v-for="item in logs"
			    :key="item.id">
				<td>{{ new Date(item.timeStamp) }}</td>
				<td>{{ item.severityName }}</td>
				<td v-html="convertHtml(item.msgid)"></td>
				<td v-html="convertHtml(item.payload)"></td>
				<td>{{ item.typePayload }}</td>
				<td>{{ item.moduleName }}</td>
				<td>{{ item.msg }}</td>
				<td>{{ item.uid }}</td>
			</tr>
		</tbody>
	</v-table>
</v-container>
</template>

<script>
import gql from 'graphql-tag'
import Convert from 'ansi-to-html'
import nodefony from 'nodefony-client'
import {
	ref,
	watch,
	onMounted,
	onUnmounted,
	computed,
	reactive,
	inject
} from 'vue'

export default {
	name: "n-logs",
	inject: ["nodefony"],
	components: {},
	props: {},
	data() {
		return {
			tab: 1,
			convert: null
		}
	},
	mounted() {
		try {
			this.convert = new Convert();
		} catch (e) {
			this.log(e, "ERROR")
		}
	},
	apollo: {
		request: {
			// gql query
			query: gql `
      query getLogs {
        logs:getLogs
      }
	    `,
			update: (data) => {
				return {
					logs: JSON.parse(data.logs),
				}
			},
			// Reactive parameters
			variables() {
				// Use vue reactive properties here
			},
		}
	},
	watch: {},
	computed: {
		logs() {
			if (this.request && this.request.logs) {
				return this.request.logs
			}
			return null
		},
		nbLogs() {
			if (this.request && this.logs) {
				return this.request.logs.length
			}
			return null
		}
	},
	beforeMount() {},
	methods: {
		convertHtml(value) {
			try {
				return this.convert.toHtml(value)
			} catch (e) {
				return value
			}
		}
	}
}
</script>

<style lang="css" scoped>
</style>
