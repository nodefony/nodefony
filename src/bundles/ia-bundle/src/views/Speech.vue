<template>
<div class="speech">

  <h1>TensorFlow.js - Audio recognition using transfer learning</h1>
  <button @mousedown="collect(0)" @mouseup="collect(null)">Left</button>
  <button @mousedown="collect(1)" @mouseup="collect(null)">Right</button>
  <button @mousedown="collect(2)" @mouseup="collect(null)">Noise</button>
  <button @click="train()">Train</button>
  <div ref="console"> {{testContent}}</div>

  <button @click="listen()">Listen</button>
  <input type="range" id="output" min="0" max="10" step="0.1">

</div>
</template>

<script>
// @ is an alias to /src
import * as tf from '@tensorflow/tfjs';
import * as tfvis from '@tensorflow/tfjs-vis';
import * as speechCommands from '@tensorflow-models/speech-commands'
const NUM_FRAMES = 3;
const INPUT_SHAPE = [NUM_FRAMES, 232, 1];
export default {
  name: 'Speech',
  data() {
    return {
      testContent: "",
      examples: [],
    }
  },
  components: {},
  mounted() {
    this.run();
  },
  methods: {
    async run() {
      this.$recognizer = speechCommands.create('BROWSER_FFT');
      await this.$recognizer.ensureModelLoaded();
      //this.predictWord();
      this.buildModel();
    },
    predictWord() {
      // Array of words that the recognizer is trained to recognize.
      const words = this.$recognizer.wordLabels();
      this.$recognizer.listen(({
        scores
      }) => {
        // Turn scores into a list of (score,word) pairs.
        scores = Array.from(scores).map((s, i) => ({
          score: s,
          word: words[i]
        }));
        // Find the most probable word.
        scores.sort((s1, s2) => s2.score - s1.score);
        this.testContent = scores[0].word;
      }, {
        probabilityThreshold: 0.75
      });
    },

    collect(label) {
      console.log(label)
      if (this.$recognizer.isListening()) {
        return this.$recognizer.stopListening();
      }
      if (label == null) {
        return;
      }
      this.$recognizer.listen(async ({
        spectrogram: {
          frameSize,
          data
        }
      }) => {
        let vals = this.normalize(data.subarray(-frameSize * NUM_FRAMES));
        this.examples.push({
          vals,
          label
        });
        this.testContent =
          `${this.examples.length} examples collected`;
      }, {
        overlapFactor: 0.999,
        includeSpectrogram: true,
        invokeCallbackOnNoiseAndUnknown: true
      });
    },

    normalize(x) {
      const mean = -100;
      const std = 10;
      return x.map(x => (x - mean) / std);
    },

    flatten(tensors) {
      const size = tensors[0].length;
      const result = new Float32Array(tensors.length * size);
      tensors.forEach((arr, i) => result.set(arr, i * size));
      return result;
    },

    buildModel() {
      this.$model = tf.sequential();

      this.$model.add(tf.layers.depthwiseConv2d({
        depthMultiplier: 8,
        kernelSize: [NUM_FRAMES, 3],
        activation: 'relu',
        inputShape: INPUT_SHAPE
      }));
      this.$model.add(tf.layers.maxPooling2d({
        poolSize: [1, 2],
        strides: [2, 2]
      }));
      this.$model.add(tf.layers.flatten());
      this.$model.add(tf.layers.dense({
        units: 3,
        activation: 'softmax'
      }));
      const optimizer = tf.train.adam(0.01);
      this.$model.compile({
        optimizer,
        loss: 'categoricalCrossentropy',
        metrics: ['accuracy']
      });
      tfvis.show.modelSummary({
        name: 'Model Summary'
      }, this.$model);
    },
    async train() {
      const ys = tf.oneHot(this.examples.map(e => e.label), 3);
      const xsShape = [this.examples.length, ...INPUT_SHAPE];
      const xs = tf.tensor(this.flatten(this.examples.map(e => e.vals)), xsShape);

      await this.$model.fit(xs, ys, {
        batchSize: 16,
        epochs: 10,
        callbacks: tfvis.show.fitCallbacks({
            name: 'Training Performance'
          },
          ['loss', 'acc'], {
            height: 200,
            callbacks: ['onEpochEnd']
          }
        )
        /*callbacks: {
          onEpochEnd: (epoch, logs) => {
            let accuracy = (logs.acc * 100).toFixed(1);
            let myepoch = epoch + 1;
            this.textContent =
              `Accuracy: ${accuracy}% Epoch: ${myepoch}`;
            tfvis.show.fitCallbacks({
                name: 'Training Performance'
              },
              ['loss', 'acc'], {
                height: 200,
                callbacks: ['onEpochEnd']
              })
          }
        }*/
      });
      tf.dispose([xs, ys]);
    },
    listen() {
      if (this.$recognizer.isListening()) {
        this.$recognizer.stopListening();
        this.testContent = 'Listen';
        return;
      }

      this.testContent = 'Stop';

      this.$recognizer.listen(async ({
        spectrogram: {
          frameSize,
          data
        }
      }) => {
        const vals = this.normalize(data.subarray(-frameSize * NUM_FRAMES));
        const input = tf.tensor(vals, [1, ...INPUT_SHAPE]);
        const probs = this.$model.predict(input);
        const predLabel = probs.argMax(1);
        await this.moveSlider(predLabel);
        tf.dispose([input, probs, predLabel]);
      }, {
        overlapFactor: 0.999,
        includeSpectrogram: true,
        invokeCallbackOnNoiseAndUnknown: true
      });
    },
    async moveSlider(labelTensor) {
      const label = (await labelTensor.data())[0];
      this.testContent = label;
      if (label == 2) {
        return;
      }
      let delta = 0.1;
      const prevValue = +document.getElementById('output').value;
      this.testContent =
        prevValue + (label === 0 ? -delta : delta);
    }

  }
}
</script>
