import * as tfjs from '@tensorflow/tfjs';

class TensorFlow {
  constructor(libModel = null) {
    this.model = null
    this.libModel = null
  }

  loadModel() {
    return this.libModel.load()
      .then(function (loadedModel) {
        this.model = loadedModel;
        return model
        // Show demo section now model is ready to use.
      });
  }

  getUserMediaSupported() {
    return !!(navigator.mediaDevices &&
      navigator.mediaDevices.getUserMedia);
  }

  enableCam() {

    // Activate the webcam stream.
    return navigator.mediaDevices.getUserMedia(constraints)
      .then((stream) => {
        return stream
      });
  }
}

export default TensorFlow
