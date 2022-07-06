<template>
<v-card flat>
	<v-toolbar theme="dark"
	           color="#0337ab">
		<template v-slot:prepend>
			<v-icon>mdi-monitor</v-icon>
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
			drawPoints: {
				style: 'circle' // square, circle
			},
			shaded: {
				orientation: 'bottom' // top, bottom
			},
			graphHeight: "200px"
		}
		this.graph2d = new vis.Graph2d(this.$refs.vis, this.cpuDatase, options);
		this.renderStep();
	},
	computed: {
		cpu() {
			if (this.monit) {
				thi.addCpuPoint(this.monit.cpu)
				return this.monit.cpu
			}
			return null
		},
		memory() {
			if (this.monit) {
				return this.monit.memory
			}
			return null
		},
		cpuDatase() {
			console.log("passs")
			if (this.graph2d && this.monit && this.cpu) {
				const date = vis.moment(this.cpu) || vis.moment();
				this.cpuDataset.add({
					x: date,
					y: this.monit.cpu,
					label: `${this.cpu}%`
				});
				const range = this.graph2d.getWindow();
				const interval = range.end - range.start;
				const oldIds = this.cpuDataset.getIds({
					filter: function(item) {
						return item.x < range.start - interval;
					}
				});
				this.cpuDataset.remove(oldIds);
				return this.cpuDataset
			}
			return this.cpuDataset
		},
		memoryDatase() {
			if (this.graph2d && this.monit && this.memory) {
				const date = vis.moment(this.monit.timestamp) || vis.moment();
				this.memoryDataset.add({
					x: date,
					y: this.monit.memory,
					label: `${this.memory} Bytes`
				});
				const range = this.graph2d.getWindow();
				const interval = range.end - range.start;
				const oldIds = this.memoryDataset.getIds({
					filter: function(item) {
						return item.x < range.start - interval;
					}
				});
				this.memoryDataset.remove(oldIds);
				return this.memoryDataset
			}
			return this.memoryDataset
		}
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
		addCpuPoint() {
			console.log('pasasasasasasa')
		}

	}

}
</script>

<style lang="css" scoped>
</style>
