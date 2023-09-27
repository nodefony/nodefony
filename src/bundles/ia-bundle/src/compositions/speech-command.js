import {
  ref,
  reactive,
  onMounted,
  computed,
  onBeforeMount,
  nextTick,
  inject,
  defineEmits
} from "vue"

import * as tf from '@tensorflow/tfjs-core';
import * as tfjs from '@tensorflow/tfjs';
import * as speechCommand from '@tensorflow-models/speech-commands'

const Speech = () => {

  let model = ref(null)
  let recognizer = ref(null)

  onBeforeMount(() => {

  })

  onMounted(async () => {
    await tf.ready();
  })

  const run = async () => {

    recognizer = speechCommand.create('BROWSER_FFT');
    await recognizer.ensureModelLoaded();
    return predictWord();
  }


  const predictWord = () => {
    return new Promise((resolve, reject) => {
      const words = recognizer.wordLabels();
      return recognizer.listen(({ scores }) => {
        // Turn scores into a list of (score,word) pairs.
        scores = Array.from(scores).map((s, i) => ({ score: s, word: words[i] }));
        // Find the most probable word.
        scores.sort((s1, s2) => s2.score - s1.score);
        return resolve(scores)
      },  { probabilityThreshold: 0.75 })
    })
  }

  return {
    run
  }
}




export default Speech