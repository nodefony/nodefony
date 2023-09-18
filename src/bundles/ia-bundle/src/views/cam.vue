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

       <v-progress-circular
      :size="50"
      v-show="invisible"
      color="primary"
      indeterminate
    ></v-progress-circular>


      <v-container v-show="!invisible" fluid >
         <div ref="liveView" class="camView">

          <div v-for="child in children" style="position:absolute" >
            <p :style="child.style"> {{ child.text }}</p>
          </div>
           <video id="webcam" ref="webcam" muted autoplay class="video"></video>
        </div>

        <v-btn v-if="!loaded" @click="enableCam">Enable Webcam</v-btn>
       
         
      </v-container>

    </v-card>

  </v-container>
</template>

<script>
import { nextTick } from 'vue'
import cocoSsd from "@/compositions/coco-ssd.js"

export default {
  name: 'WebCam',
  components: {},
  data() {
    return {
      cocossd: cocoSsd(),
      invisible: true,
      loaded: false,
      webcam: null,
      children: [],
      predictions: null
    }
  },
  async beforeMount() { 
      nextTick( () => {
       this.cocossd.loadModel()
        .then((model) => {
          this.invisible = false
          this.model = model
          return model
        })
    })
  },
  async mounted() {
    if (!this.cocossd.getUserMediaSupported()) {
      return
    }
    this.webcam = this.$refs["webcam"]
    this.liveView = this.$refs["liveView"]
  },
  computed: {},
  methods: {
    enableCam(event) {
      if (!this.model) {
        return;
      }
      return this.cocossd.enableCam()
        .then((stream) => {
          this.webcam.srcObject = stream;
          this.webcam.addEventListener('loadeddata', this.predictWebcam);
          this.loaded = true
        })
    },
    predictWebcam() {
      // Now let's start classifying a frame in the stream.
      return this.model.detect(this.webcam)
        .then((predictions) => {
          this.predictions = predictions
          console.log(predictions)
          this.children.splice(0);
          for (let n = 0; n < predictions.length; n++) {
            if (predictions[n].score > 0.66) {
              let obj = { text: '', style: '' }
              obj.text = ` ${predictions[n].class} - with ${Math.round(parseFloat(predictions[n].score) * 100)} % confidence.`
              obj.style = `top: 0; left: 0;margin-left:${predictions[n].bbox[0]}px;margin-top:${predictions[n].bbox[1] - 10}px;width:${predictions[n].bbox[2] - 10}px;height:${predictions[n].bbox[3] - 10}px`
              this.children.push(obj)
            }
          }
          setTimeout(() => {
            window.requestAnimationFrame(this.predictWebcam);
          }, 0)
          return
        });
    }

  }
}
</script>


<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>


video {
  display: block;
}

.invisible {
  opacity: 0.2;
}

.video{
  height: 480px;
  width:640px;
}

.camView {
  position: relative;
  float: left;
  width: calc(100% - 20px);
  margin: 10px;
  cursor: pointer;
}

.camView p {
  position: absolute;
  padding: 5px;
  background-color: rgba(255, 111, 0, 0.3);
  color: #FFF;
  border: 1px dashed rgba(255, 255, 255, 0.7);
  z-index: 2;
  font-size: 12px;
}

</style>