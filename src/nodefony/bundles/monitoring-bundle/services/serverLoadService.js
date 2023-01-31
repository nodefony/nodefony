const QS = require("qs");
const shortId = require("shortid");
const request = require("request");
const os = require("os");


const cpuAverage = function () {
  let totalIdle = 0;
  let totalTick = 0;
  const cpus = os.cpus();
  // Loop through CPU cores
  for (let i = 0; i < cpus.length; i++) {
    const cpu = cpus[i];
    // Total up the time in the cores tick
    for (const type in cpu.times) {
      totalTick += cpu.times[type];
    }
    // Total up the idle time of the core
    totalIdle += cpu.times.idle;
  }
  // Return the average
  return {
    idle: totalIdle / cpus.length,
    total: totalTick / cpus.length
  };
};

const cpuInit = function () {
  const start = cpuAverage.call(this);

  return () => {
    const end = cpuAverage.call(this);
    const dif = {};
    dif.idle = end.idle - start.idle;
    dif.total = end.total - start.total;
    dif.percent = 100 - ~~(100 * dif.idle / dif.total);
    this.cpu.push(dif);
    return dif;
  };
};

const averaging = class averaging {
  constructor () {
    this.timesConcurence = [];
    this.statusCode = {};
    this.requestBySec = [];
    this.cpu = [];
    this.total = 0;
  }

  addTimeAverage (tab) {
    const status = {};
    let time = 0;

    for (let i = 0; i < tab.length; i++) {
      time += tab[i].time;
      if (tab[i].statusCode in this.statusCode) {
        this.statusCode[tab[i].statusCode] += 1;
      } else {
        this.statusCode[tab[i].statusCode] = 1;
      }
      if (tab[i].statusCode in status) {
        status[tab[i].statusCode] += 1;
      } else {
        status[tab[i].statusCode] = 1;
      }
    }
    const res = time / tab.length;
    this.timesConcurence.push(res);

    const requestBySec = tab.length / (time / 1000);
    this.requestBySec.push(requestBySec);

    return {
      average: (res / 1000).toFixed(2),
      total: (time / 1000).toFixed(2),
      requestBySec: requestBySec.toFixed(2),
      statusCode: status
    };
  }

  average () {
    let time = 0;
    for (let i = 0; i < this.timesConcurence.length; i++) {
      time += this.timesConcurence[i];
    }
    return (time / this.timesConcurence.length / 1000).toFixed(2);
  }

  cpuAverage () {
    let idle = 0;
    let total = 0;
    let percent = 0;
    for (let i = 0; i < this.cpu.length; i++) {
      idle += this.cpu[i].idle;
      total += this.cpu[i].total;
      percent += this.cpu[i].percent;
    }
    return {
      idle: ((idle / this.cpu.length)).toFixed(2),
      total: ((total / this.cpu.length)).toFixed(2),
      percent: ((percent / this.cpu.length)).toFixed(2)
    };
  }
};


const testLoad = class testLoad {
  constructor (context, manager, options) {
    this.manager = manager;
    this.nbRequest = parseInt(options.nbRequest, 10);
    this.nbRequestSent = 0;
    this.nbError = 0;
    this.nbSuccess = 0;
    this.concurrence = parseInt(options.concurence, 10);
    this.interval = this.nbRequest / this.concurrence;
    this.context = context;
    this.options = options;
    this.averaging = new averaging();
    this.sid = options.sid;

    this.httpsSettings = this.manager.get("httpsServer").settings;
    this.rootDir = this.manager.kernel.rootDir;
    this.stopChain = false;
    this.running = false;

    /* this.agentOptions = {
    	key: fs.readFileSync(this.rootDir+this.httpsSettings.certificats.key),
    	cert: fs.readFileSync(this.rootDir+this.httpsSettings.certificats.cert),
    	rejectUnauthorized: false,
    };

    if ( this.httpsSettings.certificats.ca ){
    	this.agentOptions["ca"] = fs.readFileSync(this.rootDir+this.httpsSettings.certificats.ca) ;
    }*/

    this.agentOptions = {
      "rejectUnauthorized": false
    };
  }

  requests (start) {
    const tab = [];
    const cpu = cpuInit.call(this.averaging);
    for (let i = 0; i < this.concurrence; i++) {
      tab.push(this.HttpRequest());
    }
    let myResult = null;
    this.running = true;
    // tab.map(function(ele){return ele()})
    Promise.all(tab)
      .catch((e) => {
        this.manager.logger(e, "ERROR");
        this.running = false;
        // throw e ;
        this.context.send(JSON.stringify({
          running: this.running,
          message: e.message
        }));
      })
      .then((result) => {
        // console.log(result)
        // this.manager.logger( "PROMISE HTTP THEN" , "DEBUG");
        myResult = result;
        const stop = new Date().getTime();
        if (result) {
          const addTimeAverage = this.averaging.addTimeAverage(result);
          const time = stop - start;
          this.averaging.total += time;
          const sec = time / 1000;
          const nbRequestSec = this.concurrence / addTimeAverage.average;
          // this.averaging.addRequestBySec( nbRequestSec );
          this.context.send(JSON.stringify({
            average: addTimeAverage.average,
            statusCode: addTimeAverage.statusCode,
            requestBySecond: nbRequestSec.toFixed(2),
            totalTime: sec, // this.averaging.averageResquestBySec(),
            percentEnd: (this.nbRequestSent * 100 / this.nbRequest).toFixed(2),
            nbResquest: this.nbRequestSent,
            running: this.running,
            cpu: cpu()
          }));
          if (this.nbRequestSent < this.nbRequest && this.stopChain === false) {
            this.requests(new Date().getTime());
          } else {
            this.running = false;
            const avg = this.averaging.average();
            this.context.send(JSON.stringify({
              message: "END LOAD TEST",
              average: avg,
              averageNet: (avg / this.concurrence * 1000).toFixed(2), // ms
              totalTime: this.averaging.total / 1000,
              stop,
              statusCode: this.averaging.statusCode,
              requestBySecond: (this.nbRequestSent / (this.averaging.total / 1000)).toFixed(2),
              percentEnd: 100,
              nbResquest: this.nbRequestSent,
              running: this.running,
              cpu: this.averaging.cpuAverage()
              // prototcol:prototcol
            }));
            this.context.close();
          }
        }
      })
      .done((/* ele*/) => {
        this.manager.logger("PROMISE concurrence HTTP DONE", "DEBUG");
      });
  }

  HttpRequest () {
    const options = {
      url: this.options.url,
      method: this.options.method || "GET",
      forever: true, // keepAlive
      followRedirect: true,
      agentOptions: this.agentOptions,
      headers: {
        // 'User-Agent': 'NODEFONY'
        "User-Agent": this.manager.userAgent
      },
      jar: null
    };

    if (this.context.session) {
      const j = request.jar();
      const cookie = request.cookie(`${this.context.session.name}=${this.context.session.id}`);
      const {url} = options;
      j.setCookie(cookie, url);
      options.jar = j;
    }

    const promise = new Promise((resolve /* , reject*/) => {
      const start = new Date().getTime();
      request(options, (error, response /* , body*/) => {
        const stop = new Date().getTime();
        this.nbRequestSent += 1;
        // console.log(this.nbRequestSent);
        if (error) {
          const {code} = error;
          // console.log(error)
          this.nbError += 1;
          resolve({
            error,
            message: error.message,
            statusCode: code,
            time: stop - start
          });
          return;
        }
        const code = response.statusCode;
        resolve({
          statusCode: code,
          time: stop - start
        });
      });
    });
    return promise;
  }

  stop (sid) {
    this.stopChain = true;
    delete this.manager.connections[sid];
  }

  handleMessage (message) {
    if (!message) {
      return;
    }
    switch (message.action) {
    case "stop":
      this.stop(this.sid);
      break;
    default:
    }
  }
};

// service
module.exports = class serverLoad extends nodefony.Service {
  constructor (container, kernel) {
    super("serverLoad", container, container.get("notificationsCenter"));
    this.kernel = kernel;
    this.connections = {};
    this.userAgent = `nodefony/${this.kernel.settings.version} (${process.platform};${process.arch}) V8/${process.versions.v8} node/${process.versions.node}`;
  }

  logger (pci, severity, msgid) {
    if (!msgid) {
      msgid = "\x1b[34m SERVICE SERVER LOAD \x1b[0m";
    }
    if (this.realTime) {
      return this.realTime.logger(pci, severity, msgid);
    }
    return this.kernel.logger(pci, severity, msgid);
  }

  handleConnection (message, context) {
    switch (message.type) {
    case "action":
      if (message.sid) {
        this.connections[message.sid].handleMessage(message);
      }
      break;
    default:
      if (message.query) {
        const obj = QS.parse(message.query);
        this.loadHTTP(context, obj);
      } else {
        this.loadHTTP(context, message);
      }
    }
  }

  loadHTTP (context, options) {
    let sid = null;
    if (!options.sid) {
      sid = shortId.generate();
      const start = new Date().getTime();
      context.send(JSON.stringify({
        message: "START LOAD TEST",
        nbRequest: options.nbRequest,
        running: true,
        concurence: options.concurence,
        percentEnd: 0,
        start,
        sid
      }));
      this.connections[sid] = new testLoad(context, this, options);
      this.connections[sid].requests(start);
    } else {
      sid = options.sid;
      this.connections[sid].context = null;
      this.connections[sid].context = context;
    }
    context.listen(this, "onClose", function () {
      this.connections[sid].stop(sid);
    });
  }
};
