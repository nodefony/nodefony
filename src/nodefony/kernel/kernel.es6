const os = require('os');
module = nodefony.module;

module.exports = nodefony.register("kernel", function () {

  const regBundleName = /^(.+)-bundle[\.js]{0,3}$|^(.+)[Bb]undle[\.js]{0,3}$/;
  const regBundle = /^(.+)[Bb]undle.js$/;
  const regClassBundle = /^(.+)[Bb]undle$/;

  const promiseBundleReady = function () {
    let myresolve = null;
    let myPromise = new Promise((resolve) => {
      myresolve = resolve;
    });
    this.promisesBundleReady.push(myPromise);
    return function (bundle) {
      return myresolve(bundle);
    };
  };

  const bundlesCore = {
    "framework-bundle": "framework",
    "monitoring-bundle": "monitoring",
    "documentation-bundle": "documentation",
    "assetic-bundle": "assetic",
    "http-bundle": "http",
    "realtime-bundle": "realtime",
    "security-bundle": "security",
    "sequelize-bundle": "sequelize",
    "mongo-bundle": "mongo",
    "unittests-bundle": "unittests"
  };

  const defaultEnvEnable = {
    dev: true,
    development: true,
    prod: true,
    production: true
  };

  const defaultOptions = {
    nbListeners: 60
  };
  /**
   *  KERKEL class
   *  The class is a **`KERNEL NODEFONY`** .
   *  @module NODEFONY
   *  @main nodefony
   *  @class kernel
   *  @constructor
   *  @param {String} environment  DEV || PROD
   *  @param {Bollean} debug
   *  @param {class} autoLoader
   *
   */
  class Kernel extends nodefony.Service {

    constructor(environment, cli, options) {
      super("KERNEL", cli.container, cli.notificationsCenter, nodefony.extend({}, defaultOptions, options));
      this.cli = cli;
      this.type = cli.type;
      this.setEnv(environment);
      // Manage Kernel Container
      this.set("kernel", this);
      this.set("cli", this.cli);
      this.debug = (!!cli.commander.debug) || false;
      //Autoloader
      this.autoLoader = nodefony.autoloader;
      this.autoLoader.setKernel(this);
      this.set("autoLoader", this.autoLoader);
      this.version = nodefony.version;
      this.platform = process.platform;
      this.projectName = nodefony.projectName;
      this.isElectron = nodefony.isElectron;
      this.uptime = new Date().getTime();
      this.numberCpu = os.cpus().length;
      //boolean
      this.console = this.isConsole();
      this.booted = false;
      this.ready = false;
      this.started = false;
      this.preRegistered = false;

      this.settings = null;
      this.regBundle = regBundle;
      this.regBundleName = regBundleName;
      this.node_start = process.env.MODE_START || this.options.node_start;
      this.bundles = {};
      this.promisesBundleReady = [];
      this.setParameters("bundles", {});
      this.bundlesCore = bundlesCore;
      // Paths
      this.rootDir = process.cwd();
      this.bundlesPath = path.resolve(this.rootDir, "src", "bundles");
      this.appPath = nodefony.appPath; // path.resolve(this.rootDir, "app");
      this.configPath = nodefony.kernelConfigPath; //path.resolve(this.rootDir, "config", "config.yml");
      this.generateConfigPath = path.resolve(this.rootDir, "config", "generatedConfig.yml");
      this.publicPath = path.resolve(this.rootDir, "web");
      this.nodefonyPath = this.autoLoader.dirname;
      this.cacheLink = path.resolve(this.rootDir, "tmp", "assestLink");
      this.cacheWebpack = path.resolve(this.rootDir, "tmp", "webpack");
      this.tmpDir = null;
      //core repository
      this.isCore = nodefony.isCore;
      this.typeCluster = this.clusterIsMaster() ? "master" : "worker";
      this.cli.setKernel(this);
      //Events
      this.once("onPostRegister", () => {
        if (!this.console) {
          if (!fs.existsSync(this.cacheLink)) {
            try {
              fs.mkdirSync(this.cacheLink);
              this.cli.assetInstall();
            } catch (e) {
              this.logger(e, "WARNING");
            }
          }
        }
      });
      try {
        // Manage Reader
        this.reader = new nodefony.Reader(this.container);
        this.set("reader", this.reader);
        // Manage Injections
        this.injection = new nodefony.injection(this.container);
        this.set("injection", this.injection);
        this.setCli();
        this.cli.createDirectory(path.resolve(this.rootDir, "tmp"), null, (file) => {
          this.tmpDir = file;
        }, true);
        this.git = this.cli.setGitPath(this.rootDir);
        if (!this.console) {
          this.cli.showAsciify(this.projectName)
            .then(() => {
              this.cli.showBanner();
              return this.start();
            })
            .catch((e) => {
              this.logger(e, "ERROR");
              throw e;
            });
        }
      } catch (e) {
        console.trace(e);
        throw e;
      }
    }

    start() {
      if (!this.started) {
        try {
          // config
          this.readKernelConfig();
          // Clusters
          this.initCluster();
          // Manage Template engine
          this.initTemplate();
        } catch (e) {
          this.logger(e, "ERROR");
          throw e;
        }
        this.started = true;
        return this.boot();
      }
    }

    loadCommand() {
      try {
        return this.cli.loadCommand();
      } catch (e) {
        this.logger(e, "ERROR");
        this.terminate(e.code || 1);
        return;
      }
    }

    matchCommand() {
      try {
        return this.cli.matchCommand();
      } catch (e) {
        this.logger(e, "ERROR");
        this.terminate(e.code || 1);
      }
    }

    setCli() {
      if (this.typeCluster === "worker") {
        this.cli.setPid();
      }
      this.cli.setCommandVersion(this.isCore ? this.version : nodefony.projectVersion);
      this.cli.syslog.removeAllListeners('onLog');
    }

    isBundleCore(name) {
      if (name in bundlesCore) {
        return true;
      }
      for (let bundle in bundlesCore) {
        if (bundlesCore[bundle] === name) {
          return true;
        }
      }
      let res = regBundleName.exec(name);
      if (res) {
        if (res[2]) {
          return this.isBundleCore(res[2].toLowerCase());
        }
      }
      return false;
    }

    setEnv(environment) {
      if (environment in defaultEnvEnable) {
        switch (environment) {
        case "dev":
        case "development":
          this.environment = "dev";
          process.env.NODE_ENV = "development";
          process.env.BABEL_ENV = 'development';
          break;
        default:
          this.environment = "prod";
          process.env.NODE_ENV = "production";
          process.env.BABEL_ENV = 'production';
        }
      }
    }

    logEnv() {
      let txt = this.cli.clc.blue("      \x1b KERNEL " + this.type);
      txt += " Cluster : " + this.cli.clc.magenta(this.typeCluster);
      txt += " Environment : " + this.cli.clc.magenta(this.environment);
      txt += " Debug :" + this.cli.clc.magenta(this.debug) + "\n";
      return txt;
    }

    readKernelConfig() {
      try {
        //this.reader.readConfig(this.configPath, this.name, (result) => {
        this.settings = nodefony.kernelConfig;
        if (!nodefony.kernelConfig) {

        }
        this.settings.name = "NODEFONY";
        this.settings.version = this.version;
        this.settings.environment = this.environment;
        this.settings.debug = this.debug;
        this.setParameters("kernel", this.settings);
        this.httpPort = nodefony.kernelConfig.system.httpPort || null;
        this.httpsPort = nodefony.kernelConfig.system.httpsPort || null;
        this.domain = nodefony.kernelConfig.system.domain || null;
        this.hostname = nodefony.kernelConfig.system.domain || null;
        this.hostHttp = this.hostname + ":" + this.httpPort;
        this.hostHttps = this.hostname + ":" + this.httpsPort;
        this.domainAlias = nodefony.kernelConfig.system.domainAlias;
        this.initializeLog();
        //});
        if (!this.settings.system.bundles) {
          this.settings.system.bundles = {};
        }
        let gconf = this.readGeneratedConfig();
        if (gconf) {
          if (gconf.system && gconf.system.bundles) {
            this.settings = nodefony.extend(true, gconf, this.settings);
          }
        }
      } catch (e) {
        //console.trace(e);
        this.logger(e, "ERROR");
        throw e;
      }
    }

    searchPackage(name) {
      let res = null;
      let error = null;
      try {
        res = require.resolve(`@nodefony/${name}`);
        this.logger(`find Package : @nodefony/${name} in : ${res}`, "INFO");
        return `@nodefony/${name}`;
      } catch (e) {
        error = e;
      }
      try {
        res = path.resolve(this.nodefonyPath, "bundles", name);
        //require.resolve(res);
        this.logger(`find Core Package : ${name} in : ${res}`, "INFO");
        return res;
      } catch (e) {}
      try {
        const globalPath = path.resolve(process.execPath, '..', '..', 'lib', 'node_modules', "nodefony", 'node_modules');
        res = path.resolve(globalPath, `@nodefony/${name}`);
        //require.resolve(res);
        this.logger(`find globalPath Package : @nodefony/${name} in : ${res}`, "INFO");
        return res;
      } catch (e) {
        throw error;
      }
    }

    /**
     *  @method boot
     */
    boot() {
      /*
       *  BUNDLES
       */
      this.configBundle = this.getConfigBunbles();
      let bundles = [];
      //console.log(module)
      /*if (this.isCore) {
        //const nodefonyPath = path.resolve(this.rootDir, "src", "nodefony");
        //this.nodefonyCorePath = path.resolve(this.nodefonyPath, "core");
        bundles.push(path.resolve(this.nodefonyPath, "bundles", "http-bundle"));
        bundles.push(path.resolve(this.nodefonyPath, "bundles", "framework-bundle"));
        // FIREWALL
        if (this.settings.system.security) {
          bundles.push(path.resolve(this.nodefonyPath, "bundles", "security-bundle"));
        }
        // ORM MANAGEMENT
        switch (this.settings.orm) {
        case "sequelize":
          bundles.push(path.resolve(this.nodefonyPath, "bundles", "sequelize-bundle"));
          break;
        case "mongoose":
          bundles.push(path.resolve(this.nodefonyPath, "bundles", "mongo-bundle"));
          break;
        default:
          this.logger(new Error("nodefony can't load ORM : " + this.settings.orm), "WARNING");
        }
        // REALTIME
        if (this.settings.system.realtime) {
          bundles.push(path.resolve(this.nodefonyPath, "bundles", "realtime-bundle"));
        }
        // MONITORING
        if (this.settings.system.monitoring) {
          bundles.push(path.resolve(this.nodefonyPath, "bundles", "monitoring-bundle"));
        }
        // DOCUMENTATION
        if (this.settings.system.documentation) {
          bundles.push(path.resolve(this.nodefonyPath, "bundles", "documentation-bundle"));
        }
        // TEST UNIT
        if (this.settings.system.unitTest) {
          bundles.push(path.resolve(this.nodefonyPath, "bundles", "unittests-bundle"));
        }
        // DEMO
        if (this.settings.system.demo) {
          bundles.push(path.resolve(this.rootDir, "src", "bundles", "demo-bundle"));
        }
      } else {*/
      let res = null;
      try {
        res = require.resolve("@nodefony/http-bundle");
        bundles.push("@nodefony/http-bundle");
      } catch (e) {}
      if (!res) {
        try {
          bundles.push(path.resolve(this.nodefonyPath, "bundles", "http-bundle"));
        } catch (e) {
          throw e;
        }
      }
      res = null;
      try {
        res = require.resolve("@nodefony/framework-bundle");
        bundles.push("@nodefony/framework-bundle");
      } catch (e) {}
      if (!res) {
        try {
          bundles.push(path.resolve(this.nodefonyPath, "bundles", "framework-bundle"));
        } catch (e) {
          throw e;
        }
      }
      // FIREWALL
      res = null;
      if (this.settings.system.security) {
        try {
          res = require.resolve("@nodefony/security-bundle");
          bundles.push("@nodefony/security-bundle");
        } catch (e) {}
        if (!res) {
          try {
            bundles.push(path.resolve(this.nodefonyPath, "bundles", "security-bundle"));
          } catch (e) {
            throw e;
          }
        }
      }
      // ORM MANAGEMENT
      res = null;
      switch (this.settings.orm) {
      case "sequelize":
        try {
          res = require.resolve("@nodefony/sequelize-bundle");
          bundles.push("@nodefony/sequelize-bundle");
        } catch (e) {}
        if (!res) {
          try {
            bundles.push(path.resolve(this.nodefonyPath, "bundles", "sequelize-bundle"));
          } catch (e) {
            throw e;
          }
        }
        break;
      case "mongoose":
        try {
          res = require.resolve("@nodefony/mongo-bundle");
          bundles.push("@nodefony/mongo-bundle");
        } catch (e) {}
        if (!res) {
          try {
            bundles.push(path.resolve(this.nodefonyPath, "bundles", "mongo-bundle"));
          } catch (e) {
            throw e;
          }
        }
        break;
      default:
        let error = new Error("nodefony can't load ORM : " + this.settings.orm);
        this.logger(error, "ERROR");
        throw error;
      }
      // REALTIME
      res = null;
      if (this.settings.system.realtime) {
        try {
          res = require.resolve("@nodefony/realtime-bundle");
          bundles.push("@nodefony/realtime-bundle");
        } catch (e) {}
        if (!res) {
          try {
            bundles.push(path.resolve(this.nodefonyPath, "bundles", "realtime-bundle"));
          } catch (e) {
            throw e;
          }
        }
      }
      // MONITORING
      res = null;
      if (this.settings.system.monitoring) {
        try {
          res = require.resolve("@nodefony/monitoring-bundle");
          bundles.push("@nodefony/monitoring-bundle");
        } catch (e) {}
        if (!res) {
          try {
            bundles.push(path.resolve(this.nodefonyPath, "bundles", "monitoring-bundle"));
          } catch (e) {
            throw e;
          }
        }
      }
      // DOCUMENTATION
      res = null;
      if (this.settings.system.documentation) {
        try {
          res = require.resolve("@nodefony/documentation-bundle");
          bundles.push("@nodefony/documentation-bundle");
        } catch (e) {}
        if (!res) {
          try {
            bundles.push(path.resolve(this.nodefonyPath, "bundles", "documentation-bundle"));
          } catch (e) {
            throw e;
          }
        }
      }
      // TEST UNIT
      res = null;
      if (this.settings.system.unitTest) {
        try {
          res = require.resolve("@nodefony/unittests-bundle");
          bundles.push("@nodefony/unittests-bundle");
        } catch (e) {}
        if (!res) {
          try {
            bundles.push(path.resolve(this.nodefonyPath, "bundles", "unittests-bundle"));
          } catch (e) {
            throw e;
          }
        }
      }
      // DEMO
      res = null;
      if (this.settings.system.demo) {
        try {
          res = nodefony.require.resolve("@nodefony/demo-bundle");
          bundles.push("@nodefony/demo-bundle");
        } catch (e) {}
        if (!res) {
          try {
            res = path.resolve(this.rootDir, "src", "bundles", "demo-bundle");
            require.resolve(res);
            bundles.push(res);
          } catch (e) {
            res = null;
            //this.logger(e.message, "WARNING");
          }
        }
        if (!res) {
          try {
            res = path.resolve(this.nodefonyPath, "..", "bundles", "demo-bundle");
            require.resolve(res);
            bundles.push(res);
          } catch (e) {
            this.logger(e.message, "ERROR");
          }
        }
      }
      //}

      if (this.isInstall()) {
        return this.install(bundles);
      } else {
        return this.preRegister(bundles);
      }
    }

    install(coreBundles = []) {
      let bundles = coreBundles.concat(this.configBundle, [this.appPath]);
      let mypromise = [];
      try {
        for (let i = 0; i < bundles.length; i++) {
          let bundleFile = null;
          try {
            bundleFile = new nodefony.fileClass(path.resolve(bundles[i], "package.json"));
          } catch (e) {
            let Path = this.isNodeModule(bundles[i]);
            if (Path) {
              bundleFile = new nodefony.fileClass(Path);
            } else {
              this.logger(e, "ERROR");
              continue;
            }
          }
          if (this.isCore) {
            mypromise.push(this.cli.installPackage(bundleFile, this.environment));
          } else {
            let dir = path.basename(bundleFile.dirName);
            if (!this.isBundleCore(dir)) {
              mypromise.push(this.cli.installPackage(bundleFile, this.environment));
            }
          }
        }
      } catch (e) {
        throw e;
      }
      return Promise.all(mypromise)
        .then(() => {
          return this.preRegister(coreBundles);
        })
        .catch((e) => {
          this.logger(e, "ERROR");
          return e;
        });
    }

    preRegister(bundles) {
      try {
        this.fire("onPreRegister", this);
        this.preRegistered = true;
      } catch (e) {
        this.logger(e);
      }
      return this.registerBundles(bundles)
        .then((res) => {
          this.preboot = true;
          this.fire("onPreBoot", this);
          this.logger(res, "DEBUG", "REGISTER BUNDLES");
          return this.registerBundles(this.configBundle)
            .then((res) => {
              if (res.length) {
                this.logger(res, "DEBUG", "REGISTER BUNDLES");
              }
              this.fire("onRegister", this);
              return this.initializeBundles();
            });
        });
    }

    onReady() {
      return new Promise((resolve, reject) => {
        process.nextTick(() => {
          try {
            if (this.type === "SERVER") {
              this.initServers();
              if (global && global.gc) {
                this.memoryUsage("MEMORY POST READY ");
                setTimeout(() => {
                  global.gc();
                  this.memoryUsage("EXPOSE GARBADGE COLLECTOR ON START");
                }, 20000);
              } else {
                this.memoryUsage("MEMORY POST READY ");
              }
            }
            return resolve(this);
          } catch (e) {
            this.logger(e, "ERROR");
            return reject(e);
          }
        });
      });
    }

    /**
     *  initialisation  all bundles
     *  @method initializeBundles
     */
    initializeBundles() {
      let tab = [];
      try {
        this.app = this.initApplication();
        this.fire("onPostRegister", this);
        if (this.console) {
          this.loadCommand();

        }
      } catch (e) {
        this.logger(e, "ERROR");
        throw e;
      }
      for (let name in this.bundles) {
        this.logger("\x1b[36m INITIALIZE Bundle :  " + name.toUpperCase() + "\x1b[0m", "DEBUG");
        try {
          tab.push(this.bundles[name].boot());
        } catch (e) {
          this.logger(e, "ERROR");
          //console.trace(e);
          continue;
        }
      }
      return new Promise.all(tab)
        .then((tab) => {
          this.fire("onBoot", this, tab);
          this.booted = true;
          return new Promise.all(this.promisesBundleReady)
            .then((bundles) => {
              this.fire("onReady", this, bundles);
              this.ready = true;
              if (this.console) {
                return this.matchCommand();
              }
              return this.onReady()
                .then(() => {
                  this.fire("onPostReady", this);
                  return this;
                });
            });
        })
        .catch((e) => {
          this.logger(e, "ERROR");
          return e;
        });
    }

    getOrm() {
      return this.settings.orm;
    }

    checkPath(myPath) {
      if (!myPath) {
        return null;
      }
      let abs = path.isAbsolute(myPath);
      if (abs) {
        return myPath;
      } else {
        return this.rootDir + "/" + myPath;
      }
    }

    getConfigBunbles() {
      let config = [];
      this.checkBundlesExist(this.settings, "Kernel Config", this.configPath);
      try {
        for (let bundle in this.settings.system.bundles) {
          config.push(this.settings.system.bundles[bundle]);
        }
      } catch (e) {
        throw e;
      }
      return config;
    }

    checkBundlesExist(yml, nameConfig, pathConfig, remove) {
      let exist = null;
      if (yml && yml.system && yml.system.bundles) {
        for (let bundle in yml.system.bundles) {
          try {
            exist = nodefony.require(yml.system.bundles[bundle]);
          } catch (e) {
            //this.logger(e, "WARNING");
          }
          if (!exist) {
            try {
              exist = fs.existsSync(path.resolve(this.rootDir, yml.system.bundles[bundle]));
            } catch (e) {
              this.logger(e, "WARNING");
            }
          }
          if (!exist) {
            delete yml.system.bundles[bundle];
            if (remove) {
              try {
                fs.writeFileSync(pathConfig, yaml.safeDump(yml), {
                  encoding: 'utf8'
                });
                this.logger(nameConfig + " : " + bundle + " Bundle don't exist in file : " + pathConfig, "WARNING");
                this.logger("Update Config  : " + pathConfig);
              } catch (e) {
                this.logger(e, "ERROR");
              }
            } else {
              let error = new Error(nameConfig + " : " + bundle + " Bundle don't exist in file : " + pathConfig);
              this.logger(error, "ERROR");
              this.logger("Config file : " + pathConfig);
              this.logger(yml.system.bundles);
            }
            try {
              let link = path.resolve(this.publicPath, bundle);
              let stat = fs.lstatSync(link);
              if (stat) {
                exist = fs.existsSync(fs.readlinkSync(link));
                if (!exist) {
                  fs.unlinkSync(link);
                  this.logger("REMOVE LINK : " + link);
                }
              }
            } catch (e) {}
          }
        }
      }
    }

    readGeneratedConfig() {
      let exist = null;
      try {
        exist = fs.existsSync(this.generateConfigPath);
        if (exist) {
          try {
            let yml = yaml.load(fs.readFileSync(this.generateConfigPath, 'utf8'));
            this.checkBundlesExist(yml, "Generated Config", this.generateConfigPath, true);
            return yml;
          } catch (e) {
            throw e;
          }
        } else {
          return null;
        }
      } catch (e) {
        //console.trace(e);
        //this.logger(e, "ERROR");
        throw e;
      }
    }

    initServers() {
      // create HTTP server
      let http = null;
      let http2 = null;
      try {
        if (this.settings.system.servers.http) {
          http = this.get("httpServer").createServer();
        }
        // create HTTPS/HTTP2 server
        if (this.settings.system.servers.https) {
          http2 = this.get("httpsServer").createServer();
        }
        // create WEBSOCKET server
        if (this.settings.system.servers.ws) {
          this.get("websocketServer").createServer(http);
        }
        // create WEBSOCKET SECURE server
        if (this.settings.system.servers.wss) {
          this.get("websocketServerSecure").createServer(http2);
        }
      } catch (e) {
        this.logger(e, "ERROR");
        throw e;
      }
    }

    /*
     *  CLUSTERS
     *
     */
    clusterIsMaster() {
      return cluster.isMaster;
    }

    initCluster() {
      this.processId = process.pid;
      this.process = process;
      if (this.console && this.cli && this.cli.commander && this.cli.commander.json) {
        return "";
      }
      if (cluster.isMaster) {
        console.log(this.logEnv());
        this.fire("onCluster", "MASTER", this, process);
      } else if (cluster.isWorker) {
        console.log(this.logEnv());
        this.workerId = cluster.worker.id;
        this.worker = cluster.worker;
        this.fire("onCluster", "WORKER", this, process);
        process.on("message", this.listen(this, "onMessage"));
      }
    }

    fire() {
      this.logger(this.cli.clc.blue(`EVENT KERNEL : ${arguments[0]} `), "DEBUG");
      return super.fire.apply(this, arguments);
    }

    sendMessage(message) {
      return process.send({
        type: 'process:msg',
        data: message
      });
    }

    /**
     *  @method initializeLog
     */
    initializeLog() {
      if (this.type === "CONSOLE") {
        return this.cli.listenSyslog(this.syslog, this.debug);
      }
      if (!this.settings.system.log.active) {
        return;
      }
      return this.cli.listenSyslog(this.syslog, this.debug);
    }

    /**
     *  @method getTemplate
     */
    getTemplate(name) {
      return nodefony.templatings[name];
    }

    /**
     *  @method initTemplate
     */
    initTemplate() {
      let classTemplate = this.getTemplate(this.settings.templating);
      this.templating = new classTemplate(this.container, this.settings[this.settings.templating]);
      this.set("templating", this.templating);
    }

    /**
     *  @method logger
     */
    logger(pci, severity, msgid, msg) {
      if (!msgid) {
        msgid = this.cli.clc.magenta("KERNEL " + this.type + " ");
      }
      return super.logger(pci, severity, msgid, msg);
    }

    /**
     *  get bundle instance
     *  @method getBundle
     *  @param {String} name
     */
    getBundle(name) {
      if (name === "App") {
        return this.bundles.app;
      }
      for (let ns in this.bundles) {
        if (ns === name) {
          return this.bundles[ns];
        }
      }
      return null;
    }

    /**
     *  get all Bundles instance
     *  @method getBundles
     *  @param {String} name
     */
    getBundles(name) {
      if (name) {
        return this.getBundle(name);
      }
      return this.bundles;
    }

    /**
     *  get  Bundle name
     *  @method getBundleName
     *  @param {String} str
     */
    getBundleName(str) {
      if (str === "app") {
        return str;
      }
      let ret = null;
      switch (typeof str) {
      case "string":
        ret = regBundleName.exec(str);
        if (ret) {
          return ret[1] || ret[2];
        }
        throw new Error("Bundle Bad Name :" + str);
      case "function":
        ret = regClassBundle.exec(str.name);
        if (ret) {
          return ret[1];
        }
        throw new Error("Bundle Bad Name :" + str.name);
      default:
        throw new Error("Bundle Bad Name :" + str);
      }
    }

    getBundleClass(Class, Path) {
      try {
        switch (true) {
        case (Class instanceof nodefony.fileClass):
          return this.getBundleClass(require(Class.path), require.resolve(Class.path));
        case (typeof Class === "function"):
          if (Class.toString().indexOf("class") >= 0) {
            Class.prototype.path = path.dirname(Path);
            Class.prototype.autoLoader = this.autoLoader;
            return {
              class: Class,
              name: this.getBundleName(Class)
            };
          } else {
            throw new Error(`getBundleClass Bad Bundle Class : ${Class.toString()} Path : ${Path}`);
          }
          break;
        case (typeof Class === "string"):
          return this.getBundleClass(require(Class), require.resolve(Class));
        default:
          throw new Error(`getBundleClass Bad Bundle Class : ${typeof Class} Path : ${Path}`);
        }
      } catch (e) {
        throw e;
      }
    }

    loadBundle(file, loader) {
      try {
        let bundle = this.getBundleClass(file);
        try {
          this.bundles[bundle.name] = new bundle.class(bundle.name, this, this.container);
          this.bundles[bundle.name].loader = loader;
        } catch (e) {
          throw e;
        }
        this.bundles[bundle.name].once("onReady", promiseBundleReady.call(this));
      } catch (e) {
        throw e;
      }
    }

    isPathExist(Path) {
      try {
        let mypath = path.resolve(Path);
        if (fs.existsSync(mypath)) {
          return mypath;
        }
      } catch (e) {
        return false;
      }
    }

    isConsole() {
      return this.type === "CONSOLE";
    }

    isInstall() {
      if (this.cli.command === "nodefony" &&
        this.cli.task === "bundles" &&
        this.cli.action === "install") {
        return true;
      }
      if (this.cli.command === "nodefony" &&
        this.cli.task === "build"
      ) {
        return true;
      }
      if (this.cli.command === "nodefony" &&
        this.cli.task === "install") {
        return true;
      }
      if (this.cli.command === "install") {
        this.cli.command = "nodefony";
        this.cli.task = "install";
        return true;
      }
      return false;
    }

    isBundleDirectory(dir) {
      let directory = this.isPathExist(dir);
      if (directory) {
        let finder = new nodefony.finder({
          path: directory,
          followSymLink: true,
          exclude: /^doc$|^node_modules$|^build$/,
          recurse: false,
          match: this.regBundle,
          onFile: (file) => {
            try {
              this.loadBundle(file, "filesystem");
            } catch (e) {
              this.logger(e, "ERROR");
            }
          }
        });
        return finder.result.length() === 1;
      }
      return false;
    }

    isNodeModule(module) {
      try {
        return nodefony.require.resolve(module);
      } catch (e) {
        this.logger(e, "ERROR");
        return false;
      }
    }

    /**
     *  register Bundle
     *  @method
     *  @param {array} bundles
     */
    registerBundles(bundles) {
      return new Promise((resolve, reject) => {
        switch (nodefony.typeOf(bundles)) {
        case "array":
          for (let i = 0; i < bundles.length; i++) {
            let Path = this.isBundleDirectory(bundles[i]);
            if (!Path) {
              try {
                Path = this.isNodeModule(bundles[i]);
                if (Path) {
                  this.loadBundle(Path, "package");
                } else {
                  this.logger("GLOBAL CONFIG REGISTER : ", "INFO");
                  this.logger(this.configBundle, "INFO");
                  let gene = this.readGeneratedConfig();
                  if (gene) {
                    this.logger("GENERATED CONFIG REGISTER file ./config/GeneratedConfig.yml : ", "INFO");
                    this.logger(gene, "INFO");
                  }
                }
              } catch (e) {
                this.logger(e, "ERROR");
              }
            }
          }
          return resolve(bundles);
        default:
          return reject(new Error("registerBundles argument bundles must be an array "));
        }
      });
    }

    /**
     *  initialisation application bundle
     *  @method initApplication
     */
    initApplication() {
      let app = class appBundle extends nodefony.Bundle {
        constructor(name, myKernel, myContainer) {
          super(name, myKernel, myContainer);
        }
      };
      app.prototype.path = this.appPath;
      app.prototype.autoLoader = this.autoLoader;
      app.prototype.settings = this.settings;
      this.bundles.app = new app("app", this, this.container);
      this.readConfigDirectory(path.resolve(this.appPath, "config"), (result) => {
        if (result) {
          this.bundles.app.parseConfig(result);
          this.bundles.app.configPath = path.resolve(this.bundles.app.path, "config");
        }
      });
      // OVERRIDE VIEWS BUNDLE in APP DIRECTORY
      this.once("onBoot", () => {
        for (let bundle in this.bundles) {
          if (bundle === "app") {
            continue;
          }
          let result = this.bundles.app.resourcesFiles.findByNode(bundle + "Bundle");
          if (result.length()) {
            try {
              this.logger("\x1b[32m APP OVERRIDING\x1b[0m views for bundle : " + bundle, "WARNING");
              this.bundles[bundle].registerViews(result);
              this.bundles[bundle].registerI18n(null, result);
            } catch (e) {
              this.logger(e, "ERROR");
            }
          }
        }
      });
      return this.bundles.app;
    }


    /**
     *
     *  @method readConfigDirectory
     */
    readConfigDirectory(Path, callbackConfig) {
      return new nodefony.finder({
        path: Path,
        onFinish: (error, result) => {
          this.readConfig(error, result, callbackConfig);
        }
      });
    }

    /**
     *
     *  @method readConfig
     */
    readConfig(error, result, callback) {
      let name = this.name.toUpperCase();
      if (error) {
        this.logger(error, "ERROR");
      } else {
        result.forEach((ele) => {
          switch (true) {
          case /^config\..*$/.test(ele.name):
            try {
              this.logger(name + " CONFIG LOAD FILE :" + ele.path, "DEBUG", "SERVICE KERNEL READER");
              this.reader.readConfig(ele.path, this.name, callback);
            } catch (e) {
              this.logger(e, "ERROR", "BUNDLE " + name + " CONFIG :" + ele.path);
            }
            break;
          case /^routing\..*$/.test(ele.name):
            // ROUTING
            try {
              this.logger(name + " ROUTER LOAD FILE :" + ele.path, "DEBUG", "SERVICE KERNEL READER");
              let router = this.get("router");
              if (router) {
                router.reader(ele.path, this.name);
              } else {
                this.logger(name + " Router service not ready to LOAD FILE :" + ele.path, "WARNING", "SERVICE KERNEL READER");
              }
            } catch (e) {
              this.logger(e, "ERROR", "BUNDLE " + this.name.toUpperCase() + " CONFIG ROUTING :" + ele.path);
            }
            break;
          case /^services\..*$/.test(ele.name):
            try {
              this.logger(name + " SERVICE LOAD FILE :" + ele.path, "DEBUG", "SERVICE KERNEL READER");
              this.get("injection").reader(ele.path, this.name);
            } catch (e) {
              this.logger(e, "ERROR", "BUNDLE " + this.name.toUpperCase() + " CONFIG SERVICE :" + ele.path);
            }
            break;
          case /^security\..*$/.test(ele.name):
            try {
              let firewall = this.get("security");
              if (firewall) {
                this.logger(name + " SECURITY LOAD FILE :" + ele.path, "DEBUG", "SERVICE KERNEL READER");
                firewall.reader(ele.path, this.name);
              } else {
                this.logger(name + " SECURITY LOAD FILE :" + ele.path + " BUT SERVICE NOT READY", "WARNING");
              }
            } catch (e) {
              this.logger(e, "ERROR", "BUNDLE " + this.name.toUpperCase() + " CONFIG SECURITY :" + ele.path);
            }
            break;
          }
        });
      }
    }

    memoryUsage(message) {
      //let memory =  process.memoryUsage() ;
      let memory = this.stats().memory;
      for (let ele in memory) {
        switch (ele) {
        case "rss":
          this.logger((message ||  ele) + " ( Resident Set Size ) PID ( " + this.processId + " ) : " + nodefony.cli.niceBytes(memory[ele]), "INFO", "MEMORY " + ele);
          break;
        case "heapTotal":
          this.logger((message ||  ele) + " ( Total Size of the Heap ) PID ( " + this.processId + " ) : " + nodefony.cli.niceBytes(memory[ele]), "INFO", "MEMORY " + ele);
          break;
        case "heapUsed":
          this.logger((message ||  ele) + " ( Heap actually Used ) PID ( " + this.processId + " ) : " + nodefony.cli.niceBytes(memory[ele]), "INFO", "MEMORY " + ele);
          break;
        case "external":
          this.logger((message ||  ele) + " PID ( " + this.processId + " ) : " + nodefony.cli.niceBytes(memory[ele]), "INFO", "MEMORY " + ele);
          break;
        }
      }
    }

    stats() {
      let stat = {
        memory: {}
        //cpu:process.cpuUsage()
      };
      let memory = process.memoryUsage();
      for (let ele in memory) {
        stat.memory[ele] = memory[ele];
      }
      return stat;
    }

    /**
     *
     *  @method terminate
     */
    terminate(code) {
      if (code === undefined) {
        code = 0;
      }
      try {
        if (fs.existsSync(this.cacheLink)) {
          try {
            fs.rmdirSync(this.cacheLink);
          } catch (e) {
            this.logger(e, "WARNING");
          }
        }
        this.fire("onTerminate", this, code);
      } catch (e) {
        this.logger(e, "ERROR");
        //console.trace(e);
        code = 1;
      }
      process.nextTick(() => {
        this.logger("NODEFONY Kernel Life Cycle Terminate CODE : " + code, "INFO");
        try {
          nodefony.cli.quit(code);
        } catch (e) {
          this.logger(e, "ERROR");
        }
      });
      return code;
    }
  }
  return Kernel;
});