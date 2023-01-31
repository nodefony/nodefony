const moment = require("moment");
const os = require("os");

const calcUptime = (uptime, is12hr = false) => {
  const now = moment();
  const exp = moment(uptime);
  days = exp.diff(now, "days");
  hours = exp.subtract(days, "days").diff(now, "hours");
  minutes = exp.subtract(hours, "hours").diff(now, "minutes");
  return ` ${days} days  ${hours} hours  ${minutes} minutes`;
};

const _totalCpuTime = (cpu) => {
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

const totalCpusTime = (cpus) => {
  if (cpus) {
    return cpus.map(_totalCpuTime).reduce((a, b) => a + b, 0);
  }
};

const getCpuUsage = (startUsage, cpus) => {
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
};

const _matrice = (cpuUsage, cpus, timeout = 800) => new Promise((resolve, reject) => {
  setTimeout(() => resolve(getCpuUsage(cpuUsage, cpus)), timeout);
});

const getClustersMonitor = async (name, context) => {
  const cpuUsage = null;
  const stats = context.kernel.stats();
  let cpu = getCpuUsage(cpuUsage);
  cpu = await _matrice(cpu.cpuUsage, cpu.cpus);

  const clusters = {
    pm2: [],
    name
  };
  const ele = {
    monit: {
      memory: stats.memory.rss,
      cpu: cpu.percent
    },
    name,
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
  return clusters;
};

module.exports = {
  Query: {
    //  provides all functions for each API endpoint
    async getNodefonyStatus (obj, field, context, info) {
      const ele = {
        version: context.kernel.version,
        start: context.kernel.node_start,
        platform: context.kernel.platform,
        domain: context.kernel.settings.system.domain,
        projectName: context.kernel.projectName,
        environment: context.kernel.environment,
        debug: context.kernel.debug,
        node: process.versions,
        // application: obj.getApplicationSettings(field, context),
        // network: JSON.parse(obj.getNetwork(field, context)),
        uptime: calcUptime(context.kernel.uptime),
        process: {
          name: process.title,
          clusters: await getClustersMonitor(process.title, context)
        }
      };
      return JSON.stringify(ele);
    },

    getApplicationSettings (obj, field, context, info) {
      const app = context.kernel.getBundle("app");
      return JSON.stringify(app.settings);
    },

    getKernelSettings (obj, field, context, info) {
      return JSON.stringify(context.kernel.settings);
    },

    getServers (obj, field, context, info) {
      const ele = {
        http: JSON.parse(this.getServerHttp(obj, field, context, info)),
        https: JSON.parse(this.getServerHttps(obj, field, context, info)),
        ws: JSON.parse(this.getServerWebsocket(obj, field, context, info)),
        wss: JSON.parse(this.getServerWebsocketSecure(obj, field, context, info))
      };
      return JSON.stringify(ele);
    },

    getServerHttp (obj, field, context, info) {
      const http = context.get("httpServer");
      const ele = {
        settings: http.settings,
        domain: http.domain,
        port: http.port,
        protocol: http.protocol,
        family: http.family,
        ready: http.ready
      };
      return JSON.stringify(ele);
    },

    getServerHttps (obj, field, context, info) {
      const https = context.get("httpsServer");
      const ele = {
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
      };
      return JSON.stringify(ele);
    },

    getServerWebsocket (obj, field, context, info) {
      const {package} = context.kernel.getBundles("http");
      const ws = context.get("websocketServer");
      const conf = ws.websocketServer.config;
      delete conf.httpServer;
      const ele = {
        packageName: "websocket",
        version: package.dependencies.websocket,
        port: ws.port,
        domain: ws.domain,
        ready: ws.ready,
        settings: ws.settings,
        config: conf
      };
      return JSON.stringify(ele);
    },

    getServerWebsocketSecure (obj, field, context, info) {
      const {package} = context.kernel.getBundles("http");
      const wss = context.get("websocketServerSecure");
      const conf = wss.websocketServer.config;
      delete conf.httpServer;
      const ele = {
        packageName: "websocket",
        version: package.dependencies.websocket,
        port: wss.port,
        domain: wss.domain,
        ready: wss.ready,
        settings: wss.settings,
        config: conf
      };
      return JSON.stringify(ele);
    },

    getNetwork (obj, field, context, info) {
      const ele = {
        local: context.kernel.getLocalExternalIP(),
        interfaces: context.kernel.getNetworkInterfaces()
      };
      return JSON.stringify(ele);
    },

    getProfilingStatus (obj, field, context, info) {
      const monitoring = context.kernel.getBundle("monitoring");
      const ele = {
        settings: monitoring.settings
      };
      return JSON.stringify(ele);
    }
  }

};
