const {
  Worker,
  isMainThread,
  parentPort,
  MessagePort,
  workerData
} = require('worker_threads');

const nodefony = require("nodefony");

class Thread extends nodefony.Service {
  constructor(name) {
    super(name);
    this.pid = process.pid;
    this.iterator = 0 ;
    this.listenSyslog();
    this.workerData = workerData;
    parentPort.postMessage("running");
    parentPort.on('message', this.listen("message"));
    this.on("message", (msg) => {
      //this.log(msg, "DEBUG");
      if (msg instanceof MessagePort) {
        this.log(msg, "INFO");
        this.port = msg;
        this.port.postMessage({
          sboob: true
        });
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
    return new Promise((resolve) => {
      this.logger("START INTERVAL", "INFO");
      let interval = setInterval(() => {
        this.fire("message", this.iterator++);
      }, 500);
      setTimeout(() => {
        this.logger("STOP", "INFO");
        clearInterval(interval);
        resolve(ele);
      }, 5000);
    });
  }

}

module.exports = new Thread("thread") ;
