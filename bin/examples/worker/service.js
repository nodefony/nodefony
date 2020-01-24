const {
  //Worker,
  isMainThread,
  parentPort,
  MessagePort,
  workerData
} = require('worker_threads');

let nodefony = null;
try {
  nodefony = require("nodefony");
} catch (e) {
  nodefony = require(require("path").resolve("src", "nodefony", "autoloader.es6"));
}
const green = clc.green;

class myService extends nodefony.Service {
  constructor(...args) {
    super("cci");
    this.pid = process.pid;
    this.port = null;
    this.initialize();
    this.send(`running thread on ${green(this.pid)}`);
    //this.asyncCall(workerData);
  }

  initialize() {
    this.listenSyslog();
    this.workerData = workerData;
    this.parentPort = parentPort;
    this.parentPort.on('message', (msg) => {
      this.emit("onMessage", msg);
    });
    //this.parentPort.on('message', this.listen("message"));
    this.on("onMessage", (msg) => {
      console.log(msg)
      if (msg instanceof MessagePort) {
        this.port = msg;
        this.port.postMessage({
          foo: true
        });
      } else {
        if (this.port) {
          this.port.postMessage(msg);
        } else {
          this.send(msg);
        }
      }
    });
  }

  send(msg) {
    this.parentPort.postMessage(msg);
  }

  /**
   *  @method logger
   */
  logger(pci, severity, msgid, msg) {
    if (!msgid) {
      msgid = `WORKER ${this.pid} `;
    }
    return super.logger(pci, severity, msgid, msg);
  }

  async asyncCall(ele) {
    return await this.call(ele);
  }

  call(ele) {
    return new Promise((resolve, reject) => {
      this.logger("START INTERVAL", "INFO");
      let interval = setInterval(() => {
        this.fire("message", "send ");
      }, 500);
      setTimeout(() => {
        this.logger("STOP", "INFO");
        clearInterval(interval);
        resolve(ele);
      }, 10000);
    });
  }
}

if (isMainThread) {
  module.exports = myService;
} else {
  module.exports = new myService();
}