const {
  Worker,
  MessageChannel,
  //MessagePort,
  //isMainThread,
  //parentPort,
  //workerData
} = require('worker_threads');

class ServiceWorker extends nodefony.Service {

  constructor(name, container, workerfile = __filename, options = {}) {
    super(name, container, null, options);
    this.initWorker(workerfile);
  }

  initWorker(workerfile) {
    this.worker = new Worker(workerfile, {
      workerData: this.options
    });
    this.worker.on('online', () => {
      this.logger(`Worker online ! Thread ID : ${this.worker.threadId}`, "INFO");
    });

    this.worker.on('message', (message) => {
      this.logger(message, "INFO", `MAIN EVENT MESSAGE`);
    });

    this.worker.on('error', (e) => {
      this.logger(e, "ERROR");
    });

    this.worker.on('exit', (code) => {
      if (code !== 0) {
        throw new Error(`Worker stopped with exit code ${code}`);
      }
      this.logger(code);
    });
  }

}
nodefony.ServiceWorker = ServiceWorker;
module.exports = ServiceWorker;