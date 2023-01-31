const {
  Worker,
  isMainThread,
  parentPort,
  MessagePort,
  workerData
} = require("worker_threads");

let nodefony = null;
try {
  nodefony = require("nodefony");
} catch (e) {
  nodefony = require(require("path").resolve("src", "nodefony", "autoloader.es6"));
}
const {green} = clc;

class myService extends nodefony.Service {
  constructor (name) {
    super(name);
    this.pid = process.pid;
    this.listenSyslog();
    this.workerData = workerData;
    parentPort.postMessage("running");
    parentPort.on("message", this.listen("message"));
    this.on("message", (msg) => {
      if (msg instanceof MessagePort) {
        console.log(msg);
        this.port = msg;
        this.port.postMessage({
          sboob: true
        });
      } else if (this.port) {
        this.port.postMessage(msg);
      } else {
        parentPort.postMessage(msg);
      }
    });

    this.asyncCall(workerData);
  }

  listenSyslog (options) {
    const defaultOption = {
      severity: {
        operator: "<=",
        data: "7"
      }
    };
    return this.syslog.listenWithConditions(this, options || defaultOption, (pdu) => this.normalizeLog(pdu));
  }

  normalizeLog (pdu) {
    // console.log(pdu)
    const date = new Date(pdu.timeStamp);
    if (pdu.payload === "" || pdu.payload === undefined) {
      console.error(`${date.toDateString()} ${date.toLocaleTimeString()} ${nodefony.Service.logSeverity(pdu.severityName)} ${green(pdu.msgid)} ` + " : " + "logger message empty !!!!");
      console.trace(pdu);
      return;
    }
    let message = pdu.payload;
    switch (typeof message) {
    case "object":
      switch (true) {
      case message instanceof nodefony.Error:
        break;
      case message instanceof Error:
        message = new nodefony.Error(message);
        break;
      default:
        message = util.inspect(message);
      }
      break;
    default:
    }
    return console.log(`${date.toDateString()} ${date.toLocaleTimeString()} ${nodefony.Service.logSeverity(pdu.severityName)} ${green(pdu.msgid)} : ${message}`);
  }

  /**
   *  @method logger
   */
  logger (pci, severity, msgid, msg) {
    if (!msgid) {
      msgid = `WORKER ${this.pid} `;
    }
    return super.logger(pci, severity, msgid, msg);
  }


  async asyncCall (ele) {
    return await this.call(ele);
  }

  call (ele) {
    return new Promise((resolve, reject) => {
      this.logger("START INTERVAL", "INFO");
      const interval = setInterval(() => {
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

module.exports = new myService("cci");
