const  nodefony = require("nodefony");
const {
  Worker,
  MessageChannel,
  MessagePort,
  isMainThread,
  parentPort,
  workerData
} = require('worker_threads');

const path = require("path");
const thread = path.resolve(__dirname, "thread.js");


class myWorker extends nodefony.Service {

  constructor(service){
    super("Worker", service.container);
    this.worker = this.createWorker();
    this.subChannel = this.createSubChannel();
    this.worker.postMessage(this.subChannel.port1, [this.subChannel.port1]);
  }

  createWorker(data ={}){
    const worker = new Worker(thread, {
      workerData: data
    });
    //this.log(worker.threadId);
    worker.on('online', () => {
      this.log(`Worker online !`, "INFO");
    });

    worker.on('message', (message) => {
      this.log(message, "INFO");
    });

    worker.on('error', (e) => {
      this.log(e, "ERROR");
    });

    worker.on('exit', (code) => {
      if (code !== 0) {
        throw new Error(`Worker stopped with exit code ${code}`);
      }
      this.log(code);
    });
    return worker ;
  }

  createSubChannel(){
    const subChannel = new MessageChannel();
    subChannel.port2.on('message', (value) => {
      this.log('received:', value);
    });
    return subChannel ;
  }

}

module.exports = myWorker ;
