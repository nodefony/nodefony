const {
  Worker,
  isMainThread,
  parentPort,
  MessagePort,
  workerData
} = require('worker_threads');

let nodefony = require("nodefony");

class myService extends nodefony.Service {
  constructor(name) {
    super(name);
    this.workerData = workerData;
    parentPort.postMessage("running");
    parentPort.on('message', this.listen("message"));
    this.on("message", (msg) => {
      if (msg.portChanel instanceof MessagePort) {
        this.port = msg;
        this.port.postMessage(msg.test);
      } else {
        if (this.port) {
          this.port.postMessage(msg);
        } else {
          parentPort.postMessage(msg);
        }
      }
    });

    this.asyncCall(workerData);

  }

  async asyncCall(ele) {
    return await this.call(ele);
  }

  call(ele) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        this.fire("message", "try ");
        this.fire("message", "try ");
        this.fire("message", "try ");
        this.fire("message", "try ");
        this.fire("message", "try ");
        this.fire("message", "try ");
        resolve(ele);
      }, 10000);
    });
  }

}

module.exports = new myService("cci");