const {
  Worker,
  MessageChannel,
  MessagePort,
  isMainThread,
  parentPort,
  workerData
} = require('worker_threads');


class ServiceWorker extends nodefony.Service {

  constructor(name, container, events = null, options = {}) {
    super(name, container, events, options);
    this.pid = process.pid;
    if (isMainThread) {} else {
      this.port = null;
      this.initialize();
    }
  }

  /**
   *  @method logger
   */
  logger(pci, severity, msgid, msg) {
    if (!msgid) {
      if (isMainThread) {
        msgid = `WORKER ${this.name} `;
      } else {
        msgid = `THREAD ${this.name} `;
      }
    }
    return super.logger(pci, severity, msgid, msg);
  }

  postMessage(message = {}) {
    return new Promise((resolve, reject) => {
      const callback = (result) => {
        return resolve(result);
      };
      try {
        this.once("onMessage", callback);
        this.worker.postMessage(message);
      } catch (e) {
        return reject(e);
      }
    });
  }

  createWorker(workerfile = __filename) {
    this.worker = new Worker(workerfile, {
      workerData: this.options
    });
    this.worker.on('online', () => {
      this.logger(`Worker online ! Create Thread ID : ${this.worker.threadId}`, "INFO");
    });

    this.worker.on('message', (message) => {
      this.logger(message, "INFO", `MAIN RECIEVE EVENT MESSAGE`);
      this.emit("onMessage", message);
    });

    this.worker.on('error', (e) => {
      this.logger(e, "ERROR");
      this.emit("onError", e, this);
    });

    this.worker.on('exit', (code) => {
      if (code !== 0) {
        throw new Error(`Worker stopped with exit code ${code}`);
      }
      this.logger(code);
    });
  }

  initialize() {
    this.log(`INITILIZE THREAD`);
    if (isMainThread) {
      throw new nodefony.Error("You can't initialize MAIN thread");
    }
    this.listenSyslog();
    this.workerData = workerData;
    this.parentPort = parentPort;
    this.parentPort.on('message', (msg) => {
      this.logger(msg, "INFO", `THREAD RECIEVE EVENT MESSAGE`);
      this.emit("onMessage", msg);
    });
    //this.parentPort.on('message', this.listen("message"));
    /*this.on("onMessage", (msg) => {


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
    });*/
  }

  send(msg) {
    this.parentPort.postMessage(msg);
  }

}
nodefony.ServiceWorker = ServiceWorker;
module.exports = ServiceWorker;