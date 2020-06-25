const {
  MessagePort,
  isMainThread,
  parentPort,
  workerData
} = require('worker_threads');

if (isMainThread) {
  // service worker MAIN in nodefony context
  class worker extends nodefony.ServiceWorker {
    constructor(container) {
      super("worker", container);
      this.createWorker(__filename);
      this.on("onMessage", this.onMessage);
    }

    onMessage(message) {}

    find(...args) {
      return this.postMessage({
        action: "find",
        param: args
      });
    }
  }
  module.exports = worker;

} else {
  // thread in node context
  let path = require("path");
  const nodefony = require(path.resolve("src", "nodefony"));

  class myService extends nodefony.ServiceWorker {

    constructor(name) {
      super(name);
      this.on("onMessage", (...args) => {
        this.onMessage.apply(this, args);
      });
      this.send(`running thread on ${this.pid}`);
    }

    async onMessage(message) {
      switch (message.action) {
      case "find":
        let res = await this.find.apply(this, message.param);
        return this.send(res);
      }
    }

    async find(path, options = {}) {
      const finder = new nodefony.Finder2();
      return finder.in(path, {
          recurse: true,
          excludeDir: /node_modules|tmp|docker|.git|assets|tests|test|doc|documentation|public/
        })
        .then((result) => {
          return {
            result: result,
            totals: finder.totals
          };
        });
    }
  }

  module.exports = new myService("Finder");
}
