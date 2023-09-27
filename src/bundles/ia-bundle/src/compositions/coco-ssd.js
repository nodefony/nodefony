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


import * as cocoSsd from '@tensorflow-models/coco-ssd'
import * as tfjs from '@tensorflow/tfjs';
import * as tf from '@tensorflow/tfjs-core';

const Cocossd = () => {

  let model = ref(null)


  onBeforeMount(() => {

  })

   onMounted(async () => {
    await tf.ready();
  })

  const getUserMediaSupported = () => {
    return !!(navigator.mediaDevices &&
      navigator.mediaDevices.getUserMedia);
  }

  const enableCam = (constraints = { video: true }) => {
    // Only continue if the COCO-SSD has finished loading.
   
    if (!model) {
      return Promise.reject();
    }
    // Activate the webcam stream.
    return navigator.mediaDevices.getUserMedia(constraints)
      .then((stream) => {
        return stream
      });
  }


  const loadModel = async () => {
    return cocoSsd.load()
      .then(function (loadedModel) {
        model = loadedModel;
        return model
        // Show demo section now model is ready to use.
      });
  }

  return {
    model,
    loadModel,
    enableCam,
    getUserMediaSupported
  }
}




export default Cocossd