#!/usr/bin/env node --experimental-worker
 // nodefony
let nodefony = null;
try {
  nodefony = require("nodefony");
} catch (e) {
  nodefony = require(require("path").resolve("src", "nodefony", "autoloader.es6"));
}

const {
  Worker,
  MessageChannel,
  MessagePort,
  isMainThread,
  parentPort,
  workerData
} = require('worker_threads');

const path = require("path");
const service = path.resolve(__dirname, "service.js");


new nodefony.cli("MAIN", {
  pid: true,
  onStart: (cli) => {
    //console.log(cli)
    try {
      const subChannel = new MessageChannel();
      subChannel.port2.on('message', (value) => {
        console.log('received:', value);
      });
      const worker = new Worker(service, {
        workerData: {}
      });
      worker.on('online', () => {
        cli.logger(`Worker online !`, "INFO", );
      });
      cli.logger(worker.threadId);
      worker.postMessage(subChannel.port1, [subChannel.port1]);

      worker.on('message', (message) => {
        cli.logger(message, "INFO", `MAIN EVENT MESSAGE`);
      });

      worker.on('error', (e) => {
        cli.logger(e, "ERROR");
      });

      worker.on('exit', (code) => {
        if (code !== 0) {
          throw new Error(`Worker stopped with exit code ${code}`);
        }
        cli.logger(code);
      });
    } catch (e) {
      cli.logger(e, "ERROR");
    }
  }
});






/*else {
  const script = workerData;
  console.log(script)
  parentPort.postMessage(script);
}*/

/*if (isMainThread) {
  const worker = new Worker(service);
  const subChannel = new MessageChannel();
  worker.postMessage({
    hereIsYourPort: subChannel.port1
  }, [subChannel.port1]);
  subChannel.port2.on('message', (value) => {
    console.log('received:', value);
  });
} else {
  parentPort.once('message', (value) => {
    assert(value.hereIsYourPort instanceof MessagePort);
    value.hereIsYourPort.postMessage('the worker is sending this');
    value.hereIsYourPort.close();
  });
}*/