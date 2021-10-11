<template>
<div class="">
  <img width="100" height="100" alt="ml5" src="../assets/tsf.jpeg">
  <h1>IA Tensorflow.js</h1>
  <img width="100" height="100" alt="Vue logo" src="../assets/logo.png" />
  <img width="250" height="100" alt="ml5" src="../assets/ml5_logo_purple.png" style="margin-left:20px">
  <img width="100" height="100" alt="ml5" src="../assets/p5js.svg" style="margin-left:20px">
  <h1>Image classification using MobileNet and p5.js</h1>
  <video width="200" height="200" autoplay tabindex="-1" id="vjs_video_3_html5_api" webkit-playsinline="" playsinline="playsinline" class="vjs-tech" loop="" preload="auto" src="blob:https://pv.viewsurf.com/d6666520-7692-40a9-a946-6d1a2d94e5c6" muted="muted"></video>
</div>
</template>

<script>
//import * as p5 from 'p5/lib/p5.js';
import p5 from 'p5'
//import * as p5Sound from 'p5/lib/addons/p5.sound.js';
import ml5 from 'ml5';
import * as tfjs from '@tensorflow/tfjs';
import * as tfvis from '@tensorflow/tfjs-vis';
import bird from "@/assets/bird.jpg";
import daurade from "@/assets/daurade.jpg";
import voiture from "@/assets/voiture.jpg";
import aigle from "@/assets/aigle.jpg";
export default {
  name: 'HelloWorld',
  props: {
    msg: String
  },
  data() {
    return {
      classifier: null,
      img: bird,
      P5: null
    }
  },
  beforeCreate() {

  },

  mounted() {
    new p5(this.init, 'canvas');
    console.log(tfjs, tfvis)
    tfvis.visor().surface({
      name: 'My First Surface',
      tab: 'Input Data'
    });
  },
  methods: {
    init(P5) {
      this.P5 = P5;
      this.P5.setup = () => {
        this.setup()
      };
      this.P5.draw = () => {
        this.draw()
      };
    },
    setup() {
      this.P5.createCanvas(400, 400);
      this.preload();

    },
    draw() {
      this.P5.background(200);
      this.P5.image(this.$img, 0, 0);
      //this.P5.image(this.$img, 0, 0, this.$img.width / 2, this.$img.height / 2);
    },
    preload() {
      this.$img = this.P5.loadImage(bird)

      ml5.imageClassifier('MobileNet')
        .then((classifier) => {

          console.log(classifier.model)
          const surface = {
            name: 'Model Summary',
            tab: 'Model Inspection'
          };
          tfvis.show.modelSummary(surface, classifier.model.model);
          return classifier.predict(this.$img);
        })
        .then((results) => {
          // Do something with the results
          this.gotResult(results);
        });

    },
    gotResult(results) {
      // Display error in the console
      // The results are in an array ordered by confidence.
      console.log(results);
      this.P5.createDiv(`Label: ${results[0].label}`);
      this.P5.createDiv(`Confidence: ${this.P5.nf(results[0].confidence, 0, 2)}`);

    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 10px;
}

a {
  color: #42b983;
}
</style>
