<template>
<v-container r
             fluid
             class="d-flex align-space-around flex-wrap">
	<!--v-card flat height="200" class="w-100">
    <v-toolbar theme="dark" color="#0337ab">
      <template v-slot:prepend>
        <v-icon>mdi-box</v-icon>
      </template>
      <template v-slot:append>
      </template>
    </v-toolbar>
    <div ref="vis" style="width:100%;height:200px"></div>

  </v-card-->
	<n-vis-monitor v-if="pm2"
	               :monit="monitor"
	               :name="name"
	               style="width:100%;height:400px" />
</v-container>
</template>
<script>
import nodefony from 'nodefony-client'
import Socket from 'nodefony-client/src/transports/socket/socket'
Socket(nodefony)
import NVisMonitor from '@bundles/monitoring-bundle/src/views/monitoring/visMonitor'
import vis from 'vis'
import 'vis/dist/vis-timeline-graph2d.min.css';

export default {
	name: 'DashboardMonitoring',
	components: {
		"n-vis-monitor": NVisMonitor
	},
	setup() {
		const sock = new nodefony.Socket()
		sock.on("handshake", (message, socket) => {
			//this.logger("handshake", "INFO");
			//console.log("hanskake")
		});
		sock.on("ready", (message, socket) => {
			//this.logger(`ready`);
		});
		sock.on("disconnect", (message, socket) => {
			//this.logger("disconnect", "INFO");
		});
		sock.on("subscribe", (service, message, socket) => {
			//this.logger(`Socket subscribe ${service}`)
		});
		sock.on("unsubscribe", (service, message, socket) => {
			//this.logger(`Socket unsubscribe : ${service}`)
		});
		sock.on("connect", (message, socket) => {
			//this.logger(`Socket connect`)
			socket.subscribe("monitoring");
		});

		sock.on("error", (code, args, message) => {
			//this.logger( message, "ERROR");
		});
		return {
			sock
		}
	},
	data() {
		return {
			name: "nodefony",
			pm2: null,
			monit: null,
			name: "cluster"
		}
	},
	beforeMount() {

	},
	computed: {
		monitor() {
			if (this.monit) {
				return this.monit
			}
			return null
		}
	},
	async mounted() {
		this.sock.on("message", (service, message, socket) => {
			const res = JSON.parse(message)
			this.pm2 = res.pm2[0]
			this.monit = res.pm2[0].monit
		});
	},
	async beforeUnmount() {
		await this.sock.unSubscribe("monitoring")
		this.sock.close()
		this.sock.destroy()
	},
	methods: {

	}
}
</script>
