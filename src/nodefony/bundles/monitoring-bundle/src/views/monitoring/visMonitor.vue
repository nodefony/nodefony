<template>
<v-card flat>
	<v-toolbar theme="dark"
	           color="#0337ab">
		<template v-slot:prepend>
			<v-icon>mdi-monitor</v-icon>
		</template>
		<v-toolbar-title>{{monit.name}} {{monit.pm_id }}</v-toolbar-title>
		<template v-slot:append
		          v-if="monit">
			<v-chip v-if="monit.pm2_env"
			        class="ma-2"
			        label
			        text-color="white">
				{{monit.pm2_env.status}}
			</v-chip>
			<v-chip class="ma-2"
			        label
			        text-color="white">
				<v-icon start
				        icon="mdi-identifier"></v-icon>
				{{monit.pid}}
			</v-chip>
			<v-chip v-if="currentMemory"
			        class="ma-2"
			        label
			        text-color="white">
				<v-icon start
				        icon="mdi-memory"></v-icon>

				{{currentMemory.value}} {{currentMemory.unit }}
			</v-chip>
			<v-chip class="ma-2"
			        label
			        text-color="white">
				<v-icon start
				        icon="mdi-cpu-32-bit"></v-icon>
				{{currentCpu}} %
			</v-chip>
		</template>

	</v-toolbar>
	<div ref="vis"></div>
</v-card>
</template>

<script>
import moment from 'moment';
import {
	Graph2d
} from "vis-timeline/peer";
import {
	DataSet
} from "vis-data/peer";

import 'vis-timeline/dist/vis-timeline-graph2d.min.css';
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
			maxMemory: 2147483648,
			groupMemory: "% memory",
			groupCpu: `% cpu`,
			graph2d: null,
			delay: 500,
			monitDataset: new DataSet(),
			currentCpu: 0,
			currentMemory: null
		}
	},
	watch: {
		monit(value) {
			this.addCpuPoint(value.monit.timestamp, value.monit.cpu)
			this.addMemoryPoint(value.monit.timestamp, value.monit.memory)
			this.removeOld()
		}
	},
	mounted() {
		let {
			unit,
			value
		} = this.niceByte(this.maxMemory)
		this.groupMemory = `% memory (${value} ${unit})`
		let options = {
			start: moment().add(-120, 'seconds'), // changed so its faster
			end: moment(),
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
			legend: true,
			defaultGroup: "",
			drawPoints: false,
			/* {
				style: 'circle' // square, circle
			},*/
			shaded: {
				orientation: 'bottom' // top, bottom
			},
			graphHeight: "150px"
		}
		this.graph2d = new Graph2d(this.$refs.vis, this.monitDataset, options);
		this.renderStep();
	},
	computed: {

	},
	methods: {
		niceByte(x, maxMemory = this.maxMemory) {
			let units = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
				n = parseInt(x, 10) || 0,
				l = 0;
			while (n >= 1024) {
				n = n / 1024;
				l++;
			}
			let percent = parseInt(((100 * x) / maxMemory), 10);
			let value = n.toFixed(n >= 10 || l < 1 ? 0 : 1)
			this.currentMemory = {
				unit: units[l],
				percent: percent,
				value: value
			}
			return this.currentMemory
		},
		renderStep() {
			// move the window (you can think of different strategies).
			const now = moment();
			const range = this.graph2d.getWindow();
			const interval = range.end - range.start;
			if (now > range.end) {
				this.graph2d.setWindow(now - 0.1 * interval, now + 0.9 * interval);
			}
			setTimeout(this.renderStep, this.delay);
		},

		addCpuPoint(now, cpu) {
			const date = moment(now) || moment();
			cpu = parseFloat(cpu, 10)
			if (cpu == NaN || cpu == Infinity) {
				return
			}
			let label = `${cpu}`
			this.currentCpu = cpu;
			return this.monitDataset.add({
				group: this.groupCpu,
				x: date,
				y: cpu,
				/*label: {
					content: label,
					className: "mylabel",
					xOffset: 10,
					yOffset: -10,
				}*/
			});
		},
		addMemoryPoint(now, memory) {
			const date = moment(now) || moment();
			memory = parseFloat(memory, 10)
			if (memory == NaN || memory == Infinity) {
				return
			}
			let res = this.niceByte(memory)
			let label = `${res.value} ${res.unit}`
			return this.monitDataset.add({
				group: this.groupMemory,
				x: date,
				y: res.percent,
				/*label: {
					content: label,
					className: "mylabel",
					xOffset: 10,
					yOffset: -10,
				}*/
			});
		},

		removeOld() {
			const range = this.graph2d.getWindow();
			const interval = range.end - range.start;
			const oldIds = this.monitDataset.getIds({
				filter: function(item) {
					return item.x < range.start - interval;
				}
			});
			this.monitDataset.remove(oldIds);
		}

	}

}
</script>

<style lang="scss" scoped>
.mylabel {
    color: #0167b8;
    font-size: 0.5em;
}
</style>
