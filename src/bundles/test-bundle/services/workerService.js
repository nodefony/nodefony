const {
  //MessagePort,
  isMainThread,
  //parentPort,
  //workerData
} = require('worker_threads');


if (isMainThread) {
  class worker extends nodefony.ServiceWorker {
    constructor(container) {
      super("worker", container, __filename);
    }
  }
  module.exports = worker;

} else {
  let nodefony = null;
  try {
    nodefony = require("nodefony");
  } catch (e) {
    nodefony = require(require("path").resolve("src", "nodefony", "autoloader.es6"));
  }
  console.log("passss worker");
}