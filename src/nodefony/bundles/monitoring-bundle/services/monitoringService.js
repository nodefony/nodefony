const net = require('net');
const os = require('os');

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

  constructor(socket) {
    this.socket = socket;
    this.id = socket._handle.fd + "_" + socket.server._connectionKey;
    this.readable = socket.readable;
    this.writable = socket.writable;
  }
  write(data) {
    this.socket.write(data);
  }
};

module.exports = class monitoring extends nodefony.Service {

  constructor(realTime, container, kernel) {

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

    this.listen(this, "onReady", () => {
      this.name = this.kernel.projectName || "nodefony";
      this.port = this.container.getParameters("bundles.realtime.services.monitoring.port") || 1318;
      if (this.realTime && this.kernel.type === "SERVER") {
        this.createServer();
      }
    });
  }

  logger(pci, severity, msgid) {
    if (!msgid) {
      msgid = "SERVICE MONITORING ";
    }
    if (this.realTime) {
      this.realTime.logger(pci, severity, msgid);
    } else {
      this.kernel.logger(pci, severity, msgid);
    }
  }

  createServer() {
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
      this.logger("CONNECT TO SERVICE MONITORING FROM : " + socket.remoteAddress, "INFO");

      let closed = false;
      let interval = null;
      let conn = new connection(socket);
      this.connections.push(conn);
      this.connections[conn.id] = this.connections[this.connections.length - 1];

      /*let callback = function (pdu) {
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
          this.logger("CONNECT PM2 REALTIME MONITORING", "DEBUG");
          // PM2 REALTIME
          interval = setInterval(() => {
            pm2.describe(this.name, (err, list) => {
              let clusters = {
                pm2: [],
                name: this.name
              };
              if (list) {
                for (let i = 0; i < list.length; i++) {
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
          let stats = this.kernel.stats();
          let cpu = this.getCpuUsage(cpuUsage, cpus);
          cpuUsage = cpu.cpuUsage;
          cpus = cpu.cpus;
          let clusters = {
            pm2: [],
            name: this.name
          };
          let ele = {
            monit: {
              memory: stats.memory.rss,
              cpu: cpu.percent
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

      socket.on('end', () => {
        closed = true;
        if (this.syslog) {
          if (this.connections && this.connections[conn.id] && this.connections[conn.id].listener) {
            this.syslog.unListen("onLog", this.connections[conn.id].listener);
          }
        }
        clearInterval(interval);
        this.logger("CLOSE CONNECTION TO SERVICE MONITORING FROM : " + socket.remoteAddress + " ID :" + conn.id, "INFO");
        socket.end();
        delete this.connections[conn.id];
      });

      socket.on("data", (buffer) => {
        try {
          console.log(buffer.toString());
        } catch (e) {
          this.logger("message :" + buffer.toString() + " error : " + e.message, "ERROR");
        }
      });
    });

    /*
     *	EVENT CLOSE
     */
    this.server.on("close", ( /*socket*/ ) => {
      this.stopped = true;
      this.logger("SHUTDOWN server MONITORING listen on Domain : " + this.domain + " Port : " + this.port, "INFO");
    });

    /*
     *	EVENT ERROR
     */
    this.server.on("error", (error) => {
      let myError = new nodefony.Error(error);
      switch (error.errno) {
      case "ENOTFOUND":
        this.logger("CHECK DOMAIN IN /etc/hosts or config unable to connect to : " + this.domain, "ERROR");
        this.logger(myError, "CRITIC");
        break;
      case "EADDRINUSE":
        this.logger("Domain : " + this.domain + " Port : " + this.port + " ==> ALREADY USE ", "ERROR");
        this.logger(myError, "CRITIC");
        setTimeout(() => {
          this.server.close();
        }, 1000);
        break;
      default:
        this.logger(myError, "CRITIC");
      }
    });

    /*
     *	LISTEN ON DOMAIN
     */
    this.server.listen(this.port, this.domain, () => {
      this.logger("Create server MONITORING listen on Domain : " + this.domain + " Port : " + this.port, "INFO");
    });

    /*
     *  KERNEL EVENT TERMINATE
     */
    this.kernel.listen(this, "onTerminate", () => {
      this.stopServer();
    });
  }

  getCpuUsage(startUsage, cpus) {
    //let now = Date.now()
    //while (Date.now() - now < 500);

    let elapUsage = null;
    if (!startUsage) {
      elapUsage = process.cpuUsage();
    } else {
      elapUsage = process.cpuUsage(startUsage);
    }

    let newCpus = os.cpus();
    let newStartUsage = process.cpuUsage();

    let elapCpuTimeMs = totalCpusTime(newCpus) - totalCpusTime(cpus || newCpus);

    let elapUserMS = elapUsage.user / 1000; // microseconds to milliseconds
    let elapSystMS = elapUsage.system / 1000;
    let cpuPercent = (100 * (elapUserMS + elapSystMS) / elapCpuTimeMs).toFixed(1);

    return {
      percent: cpuPercent,
      cpuUsage: newStartUsage,
      cpus: newCpus
    };
  }

  stopServer() {
    this.stopped = true;
    for (let i = 0; i < this.connections.length; i++) {
      this.logger("CLOSE CONNECTIONS SERVICE REALTIME : " + this.name);
      if (this.connections[i].listener) {
        this.syslog.unListen("onLog", this.connections[i].listener);
      }
      this.connections[i].socket.end();
      let id = this.connections[i].id;
      delete this.connections[id];
    }
    this.connections.length = 0;
    if (this.server) {
      try {
        this.server.close();
      } catch (e) {
        this.logger(e, "ERROR");
      }
    }
  }
};