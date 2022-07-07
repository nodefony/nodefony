<template>
<v-card flat>
	<v-toolbar theme="dark"
	           color="#0337ab">
		<template v-slot:prepend>
			<v-icon>mdi-monitor</v-icon>
			<v-toolbar-title>{{name}}</v-toolbar-title>
		</template>
		<template v-slot:append>
		</template>

	</v-toolbar>
	<div ref="vis"></div>
</v-card>
</template>

<script>
import vis from 'vis'
import 'vis/dist/vis-timeline-graph2d.min.css';
export default {
	name: "n-vis-monitor",
	props: {
		monit: {
			type: Object,
			default: null
		},
		name: {
			type: String,
			required: true
		}
	},
	data() {
		return {
			graph2d: null,
			delay: 500,
			cpuDataset: new vis.DataSet(),
			memoryDataset: new vis.DataSet()
		}
	},
	watch: {
		monit(value) {
			this.addCpuPoint(value.timestamp, value.cpu)
		}
	},
	mounted() {
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
			moment: this.$moment,
			locale: 'fr',
			drawPoints: {
				style: 'circle' // square, circle
			},
			shaded: {
				orientation: 'bottom' // top, bottom
			},
			graphHeight: "200px"
		}
		this.graph2d = new vis.Graph2d(this.$refs.vis, this.cpuDataset, options);
		this.renderStep();
	},
	computed: {

	},
	methods: {
		renderStep() {
			// move the window (you can think of different strategies).
			const now = vis.moment();
			const range = this.graph2d.getWindow();
			const interval = range.end - range.start;
			if (now > range.end) {
				this.graph2d.setWindow(now - 0.1 * interval, now + 0.9 * interval);
			}
			setTimeout(this.renderStep, this.delay);
		},

		addCpuPoint(now, cpu) {
			const date = vis.moment(now) || vis.moment();
			cpu = parseFloat(cpu, 10)
			if (cpu == NaN || cpu == Infinity) {
				return
			}
			this.cpuDataset.add({
				x: date,
				y: cpu,
				label: `${cpu}%`
			});
			const range = this.graph2d.getWindow();
			const interval = range.end - range.start;
			const oldIds = this.cpuDataset.getIds({
				filter: function(item) {
					return item.x < range.start - interval;
				}
			});
			this.cpuDataset.remove(oldIds);
		},

	}

}
</script>

<style lang="css" scoped>
</style>
