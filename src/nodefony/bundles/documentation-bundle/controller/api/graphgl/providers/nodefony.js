const moment = require('moment')
const os = require('os')
module.exports = {

  calcUptime(uptime, is12hr = false) {
    const now = moment();
    const exp = moment(uptime);
    days = exp.diff(now, 'days');
    hours = exp.subtract(days, 'days').diff(now, 'hours');
    minutes = exp.subtract(hours, 'hours').diff(now, 'minutes');
    return ` ${days} days  ${hours} hours  ${minutes} minutes`;
  },

  _totalCpuTime(cpu) {
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
  },

  totalCpusTime(cpus) {
    if (cpus) {
      return cpus.map(this._totalCpuTime).reduce((a, b) => a + b, 0);
    }
  },

  getCpuUsage(startUsage, cpus) {
    let elapUsage = null;
    if (!startUsage) {
      elapUsage = process.cpuUsage();
    } else {
      elapUsage = process.cpuUsage(startUsage);
    }
    let newCpus = os.cpus();
    let newStartUsage = process.cpuUsage();
    let elapCpuTimeMs = this.totalCpusTime(newCpus) - this.totalCpusTime(cpus || newCpus);
    let elapUserMS = elapUsage.user / 1000; // microseconds to milliseconds
    let elapSystMS = elapUsage.system / 1000;
    let cpuPercent = (100 * (elapUserMS + elapSystMS) / elapCpuTimeMs).toFixed(1);
    return {
      percent: cpuPercent,
      cpuUsage: newStartUsage,
      cpus: newCpus
    };
  },

  _matrice(cpuUsage, cpus, timeout = 800) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        return resolve(this.getCpuUsage(cpuUsage, cpus))
      }, timeout)
    })
  },

  async getClustersMonitor(name, context) {
    let cpuUsage = null;
    let stats = context.kernel.stats();
    let cpu = this.getCpuUsage(cpuUsage);
    cpu = await this._matrice(cpu.cpuUsage, cpu.cpus)

    let clusters = {
      pm2: [],
      name: name
    };
    let ele = {
      monit: {
        memory: stats.memory.rss,
        cpu: cpu.percent
      },
      name: name,
      pid: context.kernel.processId,
      pm_id: "",
      pm2_env: {
        exec_mode: "development",
        restart_time: 0,
        pm_uptime: context.kernel.uptime,
        status: "online"
      }
    };
    clusters.pm2.push(ele);
    return clusters
  },

  //  provides all functions for each API endpoint
  async getNodefonyStatus(field, context) {

    let obj = {
      version: context.kernel.version,
      start: context.kernel.node_start,
      platform: context.kernel.platform,
      domain: context.kernel.settings.system.domain,
      projectName: context.kernel.projectName,
      environment: context.kernel.environment,
      debug: context.kernel.debug,
      node: process.versions,
      //application: this.getApplicationSettings(field, context),
      //network: JSON.parse(this.getNetwork(field, context)),
      uptime: this.calcUptime(context.kernel.uptime),
      process: {
        name: process.title,
        clusters: await this.getClustersMonitor(process.title, context)
      }
    }
    return JSON.stringify(obj);
  },

  getApplicationSettings(field, context) {
    const app = context.kernel.getBundle("app")
    return JSON.stringify(app.settings);
  },

  getKernelSettings(field, context) {
    return JSON.stringify(context.kernel.settings);
  },

  getServers(field, context) {
    let obj = {
      http: JSON.parse(this.getServerHttp(field, context)),
      https: JSON.parse(this.getServerHttps(field, context)),
      ws: JSON.parse(this.getServerWebsocket(field, context)),
      wss: JSON.parse(this.getServerWebsocketSecure(field, context))
    }
    return JSON.stringify(obj);
  },

  getServerHttp(field, context) {
    const http = context.get("httpServer")
    let obj = {
      settings: http.settings,
      domain: http.domain,
      port: http.port,
      protocol: http.protocol,
      family: http.family,
      ready: http.ready,
    }
    return JSON.stringify(obj);
  },

  getServerHttps(field, context) {
    const https = context.get("httpsServer")
    let obj = {
      settings: https.settings,
      domain: https.domain,
      port: https.port,
      protocol: https.protocol,
      family: https.family,
      ready: https.ready,
      http2: {
        settings: https.settings2,
        allowHTTP1: https.allowHTTP1
      }
    }
    return JSON.stringify(obj);
  },
  getServerWebsocket(field, context) {
    const package = context.kernel.getBundles("http").package
    const ws = context.get("websocketServer")
    const conf = ws.websocketServer.config
    delete conf.httpServer
    let obj = {
      packageName: "websocket",
      version: package.dependencies.websocket,
      port: ws.port,
      domain: ws.domain,
      ready: ws.ready,
      settings: ws.settings,
      config: conf
    }
    return JSON.stringify(obj);

  },
  getServerWebsocketSecure(field, context) {
    const package = context.kernel.getBundles("http").package
    const wss = context.get("websocketServerSecure")
    const conf = wss.websocketServer.config
    delete conf.httpServer
    let obj = {
      packageName: "websocket",
      version: package.dependencies.websocket,
      port: wss.port,
      domain: wss.domain,
      ready: wss.ready,
      settings: wss.settings,
      config: conf
    }
    return JSON.stringify(obj);
  },

  getNetwork(field, context) {
    let obj = {
      local: context.kernel.getLocalExternalIP(),
      interfaces: context.kernel.getNetworkInterfaces()
    }
    return JSON.stringify(obj);
  }



}
