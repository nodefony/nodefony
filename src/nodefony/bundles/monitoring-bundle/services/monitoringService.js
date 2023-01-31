const net = require("net");
const os = require("os");

const _totalCpuTime = function (cpu) {
  // millis
  if (!cpu || !cpu.times) {
    return 0;
  }
  const {
    user,
    nice,
    sys,
    idle,
    irq
  } = cpu.times;

  return user + nice + sys + idle + irq;
};

const totalCpusTime = function (cpus) {
  if (cpus) {
    return cpus.map(_totalCpuTime).reduce((a, b) => a + b, 0);
  }
};

const connection = class connection {
  constructor (socket) {
    this.socket = socket;
    this.id = `${socket._handle.fd}_${socket.server._connectionKey}`;
    this.readable = socket.readable;
    this.writable = socket.writable;
  }

  write (data) {
    this.socket.write(data);
  }
};

module.exports = class monitoring extends nodefony.Service {
  constructor (realTime, container, kernel) {
    super("MONITORING", container, kernel.notificationsCenter);

    this.realTime = realTime;
    this.kernel = kernel;
    this.status = "disconnect";
    this.connections = [];
    this.domain = kernel.domain;
    this.port = 1318;
    this.server = null;
    this.syslog = kernel.syslog;
    this.node_start = this.kernel.node_start;

    if (this.kernel.ready) {
      this.initilize();
    } else {
      this.once("onReady", () => {
        this.initilize();
      });
    }
  }

  initilize () {
    this.port = this.container.getParameters("bundles.realtime.services.monitoring.port") || 1318;
    if (this.realTime && this.kernel.type === "SERVER") {
      this.createServer();
    }
  }

  log (pci, severity, msgid) {
    if (!msgid) {
      msgid = "MONITORING";
    }
    if (this.realTime) {
      this.realTime.log(pci, severity, msgid);
    } else {
      this.kernel.log(pci, severity, msgid);
    }
  }

  createServer () {
    this.server = net.createServer({
      allowHalfOpen: true
    }, (socket) => {
      socket.write("");
      this.stopped = false;
    });

    /*
     *	EVENT CONNECTIONS
     */
    this.server.on("connection", (socket) => {
      this.log(`CONNECT TO SERVICE MONITORING FROM : ${socket.remoteAddress}`, "INFO");

      let closed = false;
      let interval = null;
      const conn = new connection(socket);
      this.connections.push(conn);
      this.connections[conn.id] = this.connections[this.connections.length - 1];

      /* let callback = function (pdu) {
        if (closed || this.stopped) {
          if (this.syslog) {
            if (this.connections && this.connections[conn.id]) {
              this.syslog.unListen("onLog", this.connections[conn.id].listener);
            }
          }
          return;
        }
        let ele = {
          pdu: pdu
        };
        conn.write(JSON.stringify(ele));
      };*/

      switch (this.node_start) {
      case "PM2":
        pm2.connect(() => {
          this.log("CONNECT PM2 REALTIME MONITORING", "DEBUG");
          // PM2 REALTIME
          interval = setInterval(() => {
            pm2.describe(this.kernel.projectName || "nodefony", (err, list) => {
              const clusters = {
                pm2: [],
                name: this.name
              };
              if (list) {
                for (let i = 0; i < list.length; i++) {
                  list[i].monit.timestamp = new Date().getTime();
                  clusters.pm2.push({
                    monit: list[i].monit,
                    name: list[i].name,
                    pid: list[i].pid,
                    pm_id: list[i].pm_id,
                    pm2_env: {
                      exec_mode: list[i].pm2_env.exec_mode,
                      restart_time: list[i].pm2_env.restart_time,
                      pm_uptime: list[i].pm2_env.pm_uptime,
                      status: list[i].pm2_env.status
                    }
                  });
                }
              }
              if (closed || this.stopped) {
                clearInterval(interval);
                return;
              }
              conn.write(JSON.stringify(clusters));
            });
          }, 1000);
        });
        break;
      case "NODEFONY_DEV":
        let cpuUsage = null;
        let cpus = null;
        interval = setInterval(() => {
          const stats = this.kernel.stats();
          const cpu = this.getCpuUsage(cpuUsage, cpus);
          cpuUsage = cpu.cpuUsage;
          cpus = cpu.cpus;
          const clusters = {
            pm2: [],
            name: this.name
          };
          const ele = {
            monit: {
              memory: stats.memory.rss,
              cpu: cpu.percent,
              timestamp: new Date().getTime()
            },
            name: this.name,
            pid: this.kernel.processId,
            pm_id: "",
            pm2_env: {
              exec_mode: "development",
              restart_time: 0,
              pm_uptime: this.kernel.uptime,
              status: "online"
            }
          };
          clusters.pm2.push(ele);
          conn.write(JSON.stringify(clusters));
        }, 1000);
        break;
      case "NODEFONY":
        break;
      }

      socket.on("end", () => {
        closed = true;
        if (this.syslog) {
          if (this.connections && this.connections[conn.id] && this.connections[conn.id].listener) {
            this.syslog.unListen("onLog", this.connections[conn.id].listener);
          }
        }
        clearInterval(interval);
        this.log(`CLOSE CONNECTION TO SERVICE MONITORING FROM : ${socket.remoteAddress} ID :${conn.id}`, "INFO");
        socket.end();
        delete this.connections[conn.id];
      });

      socket.on("data", (buffer) => {
        try {
          console.log(buffer.toString());
        } catch (e) {
          this.log(`message :${buffer.toString()} error : ${e.message}`, "ERROR");
        }
      });
    });

    /*
     *	EVENT CLOSE
     */
    this.server.on("close", (/* socket*/) => {
      this.stopped = true;
      this.log(`SHUTDOWN server MONITORING listen on Domain : ${this.domain} Port : ${this.port}`, "INFO");
    });

    /*
     *	EVENT ERROR
     */
    this.server.on("error", (error) => {
      const myError = new nodefony.Error(error);
      switch (error.errno) {
      case "ENOTFOUND":
        this.log(`CHECK DOMAIN IN /etc/hosts or config unable to connect to : ${this.domain}`, "ERROR");
        this.log(myError, "CRITIC");
        break;
      case "EADDRINUSE":
        this.log(`Domain : ${this.domain} Port : ${this.port} ==> ALREADY USE `, "ERROR");
        this.log(myError, "CRITIC");
        setTimeout(() => {
          this.server.close();
        }, 1000);
        break;
      default:
        this.log(myError, "CRITIC");
      }
    });

    /*
     *	LISTEN ON DOMAIN
     */
    this.server.listen(this.port, this.domain, () => {
      this.log(`Create server MONITORING listen on Domain : ${this.domain} Port : ${this.port}`, "INFO");
    });

    /*
     *  KERNEL EVENT TERMINATE
     */
    this.kernel.once("onTerminate", () => {
      this.stopServer();
    });
  }

  getCpuUsage (startUsage, cpus) {
    // let now = Date.now()
    // while (Date.now() - now < 500);

    let elapUsage = null;
    if (!startUsage) {
      elapUsage = process.cpuUsage();
    } else {
      elapUsage = process.cpuUsage(startUsage);
    }

    const newCpus = os.cpus();
    const newStartUsage = process.cpuUsage();

    const elapCpuTimeMs = totalCpusTime(newCpus) - totalCpusTime(cpus || newCpus);

    const elapUserMS = elapUsage.user / 1000; // microseconds to milliseconds
    const elapSystMS = elapUsage.system / 1000;
    const cpuPercent = (100 * (elapUserMS + elapSystMS) / elapCpuTimeMs).toFixed(1);

    return {
      percent: cpuPercent,
      cpuUsage: newStartUsage,
      cpus: newCpus
    };
  }

  stopServer () {
    return new Promise((resolve, reject) => {
      this.stopped = true;
      for (let i = 0; i < this.connections.length; i++) {
        this.log(`CLOSE CONNECTIONS SERVICE REALTIME : ${this.name}`);
        if (this.connections[i].listener) {
          this.syslog.unListen("onLog", this.connections[i].listener);
        }
        this.connections[i].socket.end();
        const {id} = this.connections[i];
        delete this.connections[id];
      }
      this.connections.length = 0;
      if (this.server) {
        try {
          this.server.close((error) => {
            if (error) {
              return reject(error);
            }
            return resolve(this.server);
          });
        } catch (e) {
          this.log(e, "ERROR");
          return reject(e);
        }
      }
    });
  }

  async close () {
    await this.stopServer();
  }
};
