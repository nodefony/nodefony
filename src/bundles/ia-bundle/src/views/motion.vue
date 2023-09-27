<template>
  <v-container fluid class=" " style="padding-top:130px">

    <v-card variant="outlined" width="900" height="800">

      <template v-slot:title>
        <h3>Multiple object detection using pre trained model in TensorFlow.js</h3>
      </template>
      <v-card-text v-if="!loaded">
        <p>Hold some objects up close to your webcam to get a real-time classification! When ready click
          "enable webcam"
          below and accept access to the webcam when the browser asks (check the top left of your window)</p>
      </v-card-text>

      <v-container fluid>

        <v-btn v-if="!loaded" @click="enableCam">Enable Webcam</v-btn>
        <video id="webcam" ref="webcam" muted autoplay class="video"></video>
        <canvas id="canvas" ref="canvas" muted autoplay class="canvas"></canvas>


      </v-container>

    </v-card>

  </v-container>
</template>

<script>
import { nextTick } from 'vue'
import poseDetection from "@/compositions/motions/pose-detection.js"

export default {
  name: 'WebCam',
  components: {},
  data(inst) {
    return {
      poseDetection,
      loaded: false
    }
  },
  async beforeMount() {

  },
  async mounted() {
    this.webcam = this.$refs["webcam"]
    this.canvas = this.$refs["canvas"]
  },
  computed: {},
  methods: {
    async enableCam(event) {
      return this.poseDetection.init('BlazePose', this.webcam)
        .then(async () => {
          this.loaded = true
          this.canvas.width = this.webcam.width;
          this.canvas.height = this.webcam.height;
          await this.poseDetection.renderPrediction()
        })
        .catch((e) => {
          console.error(e)
        })

    }

  }
}
</script>


<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.video {
  width: 640px;
  height: 480px;
}

.canvas {
  width: 640px;
  height: 480px;
}
</style>