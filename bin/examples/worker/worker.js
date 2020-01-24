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
  //MessagePort,
  isMainThread,
  parentPort,
  //workerData
} = require('worker_threads');

const path = require("path");
const service = path.resolve(__dirname, "service.js");


if (isMainThread) {
  new nodefony.cli("MAIN", {
      pid: true,
      autostart: false
    })
    .start()
    .then((cli) => {
      try {
        const subChannel = new MessageChannel();
        subChannel.port2.on('message', (value) => {
          console.log('received:', value);
        });
        const worker = new Worker(service, {
          workerData: {}
        });
        //cli.logger(` WORKER ID : ${worker.threadId}`);

        worker.on('online', () => {
          cli.logger(`Worker online ! Thread ID : ${worker.threadId}`, "INFO");
        });
        //worker.postMessage(subChannel.port1, [subChannel.port1]);
        setTimeout(() => {
          worker.postMessage("sbbob");
        }, 2000);


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

        return worker;
      } catch (e) {
        cli.logger(e, "ERROR");
      }
    });
} else {
  throw new Error("can't be worker");
}