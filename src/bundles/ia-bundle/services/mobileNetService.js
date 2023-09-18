const tf = require("@tensorflow/tfjs-node");
//const tf = require('@tensorflow/tfjs-node-gpu');
const mobilenet = require('@tensorflow-models/mobilenet');
const fs = require("fs");
/*const {
  GPU
} = require('gpu.js')*/

class mobileNet extends nodefony.Service {

  constructor(container) {
    super("mobileNet", container);
    this.model = null;
    //console.log(tf.getBackend());
    //tf.setBackend('webgl');
    //console.log(tf.getBackend());
  }

  async loadModel() {
    this.model = await mobilenet.load();
    return this.model
  }

  async classify(imagePath) {
    this.testGpu()
    const image = fs.readFileSync(imagePath);
    const decodedImage = tf.node.decodeImage(image, 3);
    const model = await this.loadModel();
    const predictions = await model.classify(decodedImage);
    console.log('predictions:', predictions);
  }

  testGpu() {
    const matrices = this.generateMatrices()
    const out = this.createKernel()(matrices[0], matrices[1])
    //console.log(out[y][x]) // Logs the element at the xth row and the yth column of the matrix
    //console.log(out[10][12]) // Logs the element at the 10th row and the 12th column of the output matrix
    //console.log(out) // Logs the element at the 10th row and the 12th column of the output matrix

  }

  createKernel() {
    try {
      const gpu = new GPU({
        //mode: 'dev'
      });
      return gpu.createKernel(`function(a, b) {
        let sum = 0;
        for (let i = 0; i < 512; i++) {
          sum += a[this.thread.y][i] * b[i][this.thread.x];
        }
        return sum;
      }`)
        .setOutput([512, 512]);
    } catch (e) {
      console.log(e);
    }
  }
  generateMatrices() {
    const matrices = [[], []]
    for (let y = 0; y < 512; y++) {
      matrices[0].push([])
      matrices[1].push([])
      for (let x = 0; x < 512; x++) {
        matrices[0][y].push(Math.random())
        matrices[1][y].push(Math.random())
      }
    }
    return matrices
  }


}

module.exports = mobileNet;
