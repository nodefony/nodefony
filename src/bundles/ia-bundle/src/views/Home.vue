<template>
  <!--div class="home">
  <HelloWorld msg="Welcome to Your Vue.js App" />
</div-->

  <v-main>
    <v-container>

      <v-row>
        <v-col cols="3">
          <v-card border density="compact" :prepend-avatar="logo" subtitle="" title="Projet Texte" variant="text">
            <v-img height="300" :src="ml" cover></v-img>
            <v-card-text>
              Entrainez le modèle avec des images issues de fichiers ou de votre webcam.
            </v-card-text>
            <template v-slot:actions>
              

              <v-btn color="primary" variant="text" to="/test">Go</v-btn>
            </template>
          </v-card>
        </v-col>
        <v-col cols="3">

          <v-card border density="compact" :prepend-avatar="logo" subtitle="" title="Projet Images" variant="text">
            <v-img height="300" :src="cam" cover></v-img>
            <v-card-text>
              Entrainez le modèle avec des images issues de fichiers ou de votre webcam.
            </v-card-text>
            <template v-slot:actions>
              <v-btn color="primary" variant="text" to="/cam">Go</v-btn>
            </template>
          </v-card>
        </v-col>
        <v-col cols="3">
          <v-card border density="compact" :prepend-avatar="logo" subtitle="" title="Projet Audio" variant="text">
            <v-img height="300" :src="audio" cover></v-img>
            <v-card-text>
              Entrainez le modèle avec des images issues de fichiers ou de votre webcam.
            </v-card-text>
            <template v-slot:actions>
              <v-btn color="primary" variant="text">View More</v-btn>

              <v-btn color="primary" variant="text">Go</v-btn>
            </template>
          </v-card>

        </v-col>
        <v-col cols="3">
          <v-card border density="compact" :prepend-avatar="logo" subtitle="" title="Projet Posture" variant="text">
            <v-img height="300" :src="posture" cover></v-img>
            <v-card-text>
              Entrainez le modèle avec des images issues de fichiers ou de votre webcam.
            </v-card-text>
            <template v-slot:actions>
              <v-btn color="primary" variant="text">View More</v-btn>

              <v-btn color="primary" variant="text">Go</v-btn>
            </template>
          </v-card>
        </v-col>

      </v-row>

      <v-row>

        <v-col cols="3">
          <v-card border density="compact" :prepend-avatar="p5" subtitle="" title="P5 demo" variant="text">
            <v-img height="200" :src="p5Logo" cover></v-img>
            <v-card-text>
              Entrainez le modèle avec des images issues de fichiers ou de votre webcam.
            </v-card-text>
            <template v-slot:actions>
              <v-btn color="primary" variant="text">View More</v-btn>

              <v-btn color="primary" variant="text">Go</v-btn>
            </template>
          </v-card>
        </v-col>

        <v-col cols="3">
          <v-card border density="compact" :prepend-avatar="logo" subtitle="" title="ML5 Project" variant="text">
            <v-img  height="200" :src="ml5Logo" cover></v-img>
            <v-card-text>
              Entrainez le modèle avec des images issues de fichiers ou de votre webcam.
            </v-card-text>
            <template v-slot:actions>

              <v-btn color="primary" variant="text" to="/mobilenet">Go</v-btn>
            </template>
          </v-card>
        </v-col>


        <v-col cols="6">
          <v-card border density="compact" :prepend-avatar="danfoLogo" subtitle="" title="Danfo" variant="text">
            <v-card-text>
              Danfo.js is an open-source, JavaScript library providing high-performance, intuitive, and easy-to-use data structures for manipulating and processing structured data.
              <div  id="plot_div" style="height:300px"></div>
            </v-card-text>
            <template v-slot:actions>
              <v-btn color="primary" variant="text">View More</v-btn>

              <v-btn color="primary" variant="text">Go</v-btn>
            </template>
          </v-card>
        </v-col>

      </v-row>


    </v-container>
  </v-main>
</template>

<script>
// @ is an alias to /src
//import HelloWorld from '@/components/HelloWorld.vue'
import daurade from "@/assets/daurade.jpg";
import logo from "@/assets/tensor.jpeg";
import p5 from "@/assets/p5.png";
import p5Logo from "@/assets/p5js.svg";
import danfoLogo from "@/assets/danfo.png";
import cam from "@/assets/cam.webp";
import audio from "@/assets/audio.jpg";
import posture from "@/assets/posture.png";
import ml from "@/assets/ml.jpg";

import ml5Logo from "@/assets/ml5_logo_purple.png";

//import * as tf from '@tensorflow/tfjs'
//import { LinearRegression, setBackend } from 'scikitjs'
import * as dfd from "danfojs"


export default {
  name: 'Home',
  components: {
    //HelloWorld
  },
  data() {
    return {
      daurade,
      logo,
      p5,
      p5Logo,
      ml5Logo,
      danfoLogo,
      cam,
      audio,
      posture,
      ml
    }
  },
  mounted() {
    //this.test()
    this.danfo()
  },
  methods: {
    async test() {
      setBackend(tf)
      // Perform a linear regression
      let X = [
        [2, 3],
        [1, 4],
        [5, 7]
      ]
      let y = [10, 14, 20]

      let lr = new LinearRegression()
      await lr.fit(X, y)
      console.log("passss", lr)
      console.log(lr.coef)
    },
    danfo() {
      let s = new dfd.Series([1, 3, 5, undefined, 6, 8])
      s.print()

      let df = new dfd.DataFrame({
        'pig': [20, 18, 489, 675, 1776],
        'horse': [4, 25, 281, 600, 1900]
      }, { index: [1990, 1997, 2003, 2009, 2014] })
      df.plot("plot_div").line()
    }
  }
}
</script>
