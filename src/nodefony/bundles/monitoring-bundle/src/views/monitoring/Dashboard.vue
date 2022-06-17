<template>
<v-container r fluid class="d-flex align-space-around flex-wrap">
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
  <n-vis-monitor v-if="pm2" :monit="monit" style="width:100%;height:200px" />
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
      dataset: new vis.DataSet(),
      delay: 500,
      pm2: null,
      monit: null
    }
  },
  beforeMount() {

  },
  computed: {

  },
  async mounted() {
    this.sock.on("message", (service, message, socket) => {
      const res = JSON.parse(message)
      this.pm2 = res.pm2[0]
      this.monit = res.pm2[0].monit
      //this.addCpuPoint(vis.moment(), this.pm2.monit.cpu)
    });
    let options = {
      start: vis.moment().add(-30, 'seconds'), // changed so its faster
      end: vis.moment(),
      dataAxis: {
        left: {
          range: {
            min: -5,
            max: 110
          }
        }
      },
      drawPoints: {
        style: 'circle' // square, circle
      },
      shaded: {
        orientation: 'bottom' // top, bottom
      },
      graphHeight: "200px"
    }
    //this.$graph2d = new vis.Graph2d(this.$refs.vis, this.dataset, options);
    //this.renderStep();

  },
  async beforeUnmount() {
    await this.sock.unSubscribe("monitoring")
    this.sock.close()
    this.sock.destroy()
  },
  methods: {
    renderStep() {
      // move the window (you can think of different strategies).
      const now = vis.moment();
      const range = this.$graph2d.getWindow();
      const interval = range.end - range.start;
      if (now > range.end) {
        this.$graph2d.setWindow(now - 0.1 * interval, now + 0.9 * interval);
      }
      setTimeout(this.renderStep, this.delay);
    },
    addCpuPoint(now, cpu) {
      const date = now;
      this.dataset.add({
        x: date,
        y: cpu,
        label: `${cpu}%`
      });
      const range = this.$graph2d.getWindow();
      const interval = range.end - range.start;
      const oldIds = this.dataset.getIds({
        filter: function(item) {
          return item.x < range.start - interval;
        }
      });
      this.dataset.remove(oldIds);
    },
  }
}
</script>
