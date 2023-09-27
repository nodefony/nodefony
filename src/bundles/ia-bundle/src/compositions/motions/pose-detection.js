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

import * as posedetection from '@tensorflow-models/pose-detection';
import '@tensorflow/tfjs-backend-webgl';
import '@tensorflow/tfjs-backend-webgpu';

import * as mpPose from '@mediapipe/pose';
import * as tf from '@tensorflow/tfjs-core';

function isiOS() {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function isAndroid() {
  return /Android/i.test(navigator.userAgent);
}

function isMobile() {
  return isAndroid() || isiOS();
}

const DEFAULT_LINE_WIDTH = 2;
const DEFAULT_RADIUS = 4;

const VIDEO_SIZE = {
  '640 X 480': { width: 640, height: 480 },
  '640 X 360': { width: 640, height: 360 },
  '360 X 270': { width: 360, height: 270 }
};


const BLAZEPOSE_CONFIG = {
  maxPoses: 1,
  type: 'full',
  scoreThreshold: 0.65,
  render3D: true
};
const POSENET_CONFIG = {
  maxPoses: 1,
  scoreThreshold: 0.5
};
const MOVENET_CONFIG = {
  maxPoses: 1,
  type: 'lightning',
  scoreThreshold: 0.3,
  customModel: '',
  enableTracking: false
};

const STATE = {
  camera: { targetFPS: 60, sizeOption: '640 X 480' },
  backend: 'tfjs-webgpu',
  flags: {},
  modelConfig: BLAZEPOSE_CONFIG
};

/**
 * This map descripes tunable flags and theior corresponding types.
 *
 * The flags (keys) in the map satisfy the following two conditions:
 * - Is tunable. For example, `IS_BROWSER` and `IS_CHROME` is not tunable,
 * because they are fixed when running the scripts.
 * - Does not depend on other flags when registering in `ENV.registerFlag()`.
 * This rule aims to make the list streamlined, and, since there are
 * dependencies between flags, only modifying an independent flag without
 * modifying its dependents may cause inconsistency.
 * (`WEBGL_RENDER_FLOAT32_CAPABLE` is an exception, because only exposing
 * `WEBGL_FORCE_F16_TEXTURES` may confuse users.)
 */
const TUNABLE_FLAG_VALUE_RANGE_MAP = {
  WEBGL_VERSION: [1, 2],
  WASM_HAS_SIMD_SUPPORT: [true, false],
  WASM_HAS_MULTITHREAD_SUPPORT: [true, false],
  WEBGL_CPU_FORWARD: [true, false],
  WEBGL_PACK: [true, false],
  WEBGL_FORCE_F16_TEXTURES: [true, false],
  WEBGL_RENDER_FLOAT32_CAPABLE: [true, false],
  WEBGL_FLUSH_THRESHOLD: [-1, 0, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2],
  CHECK_COMPUTATION_FOR_ERRORS: [true, false],
};

const BACKEND_FLAGS_MAP = {
  ['tfjs-wasm']: ['WASM_HAS_SIMD_SUPPORT', 'WASM_HAS_MULTITHREAD_SUPPORT'],
  ['tfjs-webgl']: [
    'WEBGL_VERSION', 'WEBGL_CPU_FORWARD', 'WEBGL_PACK',
    'WEBGL_FORCE_F16_TEXTURES', 'WEBGL_RENDER_FLOAT32_CAPABLE',
    'WEBGL_FLUSH_THRESHOLD'
  ],
  ['tfjs-webgpu']: [],
  ['mediapipe-gpu']: []
};

const MODEL_BACKEND_MAP = {
  [posedetection.SupportedModels.PoseNet]: ['tfjs-webgl', 'tfjs-webgpu'],
  [posedetection.SupportedModels.MoveNet]: ['tfjs-webgl', 'tfjs-wasm', 'tfjs-webgpu'],
  [posedetection.SupportedModels.BlazePose]: ['mediapipe-gpu', 'tfjs-webgl', 'tfjs-webgpu']
}

const TUNABLE_FLAG_NAME_MAP = {
  PROD: 'production mode',
  WEBGL_VERSION: 'webgl version',
  WASM_HAS_SIMD_SUPPORT: 'wasm SIMD',
  WASM_HAS_MULTITHREAD_SUPPORT: 'wasm multithread',
  WEBGL_CPU_FORWARD: 'cpu forward',
  WEBGL_PACK: 'webgl pack',
  WEBGL_FORCE_F16_TEXTURES: 'enforce float16',
  WEBGL_RENDER_FLOAT32_CAPABLE: 'enable float32',
  WEBGL_FLUSH_THRESHOLD: 'GL flush wait time(ms)'
};

class Camera {
  constructor(element, paramCam = {}) {
    this.video = element
    this.constraints = {}
    this.param = paramCam
    this.setup(paramCam)
  }

  async setup(cameraParam = STATE.camera) {
    const { targetFPS, sizeOption } = cameraParam;
    const $size = VIDEO_SIZE[sizeOption];
    this.constraints = {
      'audio': false,
      'video': {
        facingMode: 'user',
        // Only setting the video to a specified size for large screen, on
        // mobile devices accept the default size.
        width: isMobile() ? VIDEO_SIZE['360 X 270'].width : $size.width,
        height: isMobile() ? VIDEO_SIZE['360 X 270'].height : $size.height,
        frameRate: {
          ideal: targetFPS,
        }
      }
    };
  }

  getUserMediaSupported() {
    return !!(navigator.mediaDevices &&
      navigator.mediaDevices.getUserMedia);
  }

  async enableCam(constraints = this.constraints) {
    // Activate the webcam stream.
    return new Promise((resolve, reject) => {
      if (!this.getUserMediaSupported) {
        return reject()
      }
      return navigator.mediaDevices.getUserMedia(this.constraints)
        .then((stream) => {
          if (this.video) {
            this.video.srcObject = stream;
            this.video.onloadedmetadata = () => {
              return resolve(stream);
            };
            this.video.play();
            return
          }
          return resolve(stream);
        });
    });
  }

}

class PoseDetection {

  constructor() {
    this.rafId = null
    this.camera = null
    this.detector = null
    this.stream = null

  }

  async init(model = "PoseNet", element, camera = STATE.camera) {
    this.model = model
    this.camera = new Camera(element, camera);
    this.stream = await this.camera.enableCam();
    await tf.ready();
    this.detector = await this.createDetector();
    
    this.engine = tf.engine();
    console.log( "REGISTRY : ", this.engine.registryFactory)
    console.log( "Models : ", posedetection.SupportedModels)
  }

  async renderPrediction() {
    try {
      await this.checkGuiUpdate();

      if (!STATE.isModelChanged) {
        
        await this.renderResult();
      }

    } catch (e) {
      console.trace(e)
    }
    //this.rafId = requestAnimationFrame(this.renderPrediction.bind(this));

  }

  async renderResult() {
    
    if (this.camera.video.readyState < 2) {
      await new Promise((resolve) => {
        this.camera.video.onloadeddata = () => {
          return resolve(this.camera.video);
        };
      });
    }
    if (this.detector != null) {
      //let poses = await this.detector.estimatePosesGPU(
      let poses = await this.detector.estimatePoses(
        this.camera.video,
        { maxPoses: 1, flipHorizontal: false });
        return poses
    }
  }

  async createDetector() {
    console.log(this.model, STATE)
    switch (this.model) {
      case posedetection.SupportedModels.PoseNet:
        console.log("passss1")
        return posedetection.createDetector(this.model, {
          quantBytes: 4,
          architecture: 'MobileNetV1',
          outputStride: 16,
          inputResolution: { width: 500, height: 500 },
          multiplier: 0.75
        });

      case posedetection.SupportedModels.BlazePose:
        console.log("passss2")
        const runtime = STATE.backend.split('-')[0];
        if (runtime === 'mediapipe') {
          return posedetection.createDetector(this.model, {
            runtime,
            modelType: STATE.modelConfig.type,
            solutionPath:
              `https://cdn.jsdelivr.net/npm/@mediapipe/pose@${mpPose.VERSION}`
          });
        } else if (runtime === 'tfjs') {
          return posedetection.createDetector(
            this.model, { runtime, modelType: STATE.modelConfig.type });
        }
      case posedetection.SupportedModels.MoveNet:
        console.log("passss3")
        let modelType;
        if (STATE.modelConfig.type == 'lightning') {
          modelType = posedetection.movenet.modelType.SINGLEPOSE_LIGHTNING;
        } else if (STATE.modelConfig.type == 'thunder') {
          modelType = posedetection.movenet.modelType.SINGLEPOSE_THUNDER;
        } else if (STATE.modelConfig.type == 'multipose') {
          modelType = posedetection.movenet.modelType.MULTIPOSE_LIGHTNING;
        }
        const modelConfig = { modelType };

        if (STATE.modelConfig.customModel !== '') {
          modelConfig.modelUrl = STATE.modelConfig.customModel;
        }
        if (STATE.modelConfig.type === 'multipose') {
          modelConfig.enableTracking = STATE.modelConfig.enableTracking;
        }
        return posedetection.createDetector(this.model, modelConfig);
    }
    console.log("passss4")
  }

  async checkGuiUpdate() {
    if (STATE.isTargetFPSChanged || STATE.isSizeOptionChanged) {
      this.stream = await this.camera.enableCam();

      STATE.isTargetFPSChanged = false;
      STATE.isSizeOptionChanged = false;
    }

    if (STATE.isModelChanged || STATE.isFlagChanged || STATE.isBackendChanged) {
      STATE.isModelChanged = true;
      window.cancelAnimationFrame(this.rafId);

      if (detector != null) {
        detector.dispose();
      }
      try {
        detector = await createDetector(STATE.model);
      } catch (error) {
        detector = null;
        alert(error);
      }

      STATE.isFlagChanged = false;
      STATE.isBackendChanged = false;
      STATE.isModelChanged = false;
    } else {

    }


  }
}






export default new PoseDetection()