const nodefony_version = require(path.join("..", "..", "..", "package.json")).version;
const os = require('os');

module.exports = nodefony.register("kernel", function () {

  const regBundleName = /^(.+)[Bb]undle[\.js]{0,3}$/;
  const regBundle = /^(.+)[Bb]undle.js$/;
  const regClassBundle = /^(.+)[Bb]undle$/;

  const waitingBundle = function () {
    this.eventReadywait -= 1;
    if (this.eventReadywait === 0 || this.eventReadywait === -1) {
      process.nextTick(() => {
        try {
          this.logger("\x1B[33m EVENT KERNEL READY\x1b[0m", "DEBUG");
          this.fire("onReady", this);
          this.ready = true;
          this.logger("\x1B[33m EVENT KERNEL POST READY\x1b[0m", "DEBUG");
          this.fire("onPostReady", this);
          if (this.type === "SERVER") {
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
        } catch (e) {
          this.logger(e, "ERROR");
        }
      });
    }
  };

  const bundlesCore = {
    frameworkBundle: true,
    monitoringBundle: true,
    documentationBundle: true,
    asseticBundle: true,
    httpBundle: true,
    realTimeBundle: true,
    securityBundle: true,
    sequelizeBundle: true,
    unitTestBundle: true
  };

  const defaultEnvEnable = {
    dev: true,
    development: true,
    prod: true,
    production: true
  };

  const defaultOptions = {
    nbListeners: 40
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
  const kernel = class kernel extends nodefony.Service {

    constructor(environment, debug, type, options) {
      super("KERNEL", null, null, nodefony.extend({}, defaultOptions, options));
      //Autoloader
      this.autoLoader = nodefony.autoloader;
      this.autoLoader.setKernel(this);
      this.set("autoLoader", this.autoLoader);
      this.version = nodefony_version;
      this.platform = process.platform;
      this.isElectron = this.autoLoader.isElectron() || false;
      this.uptime = new Date().getTime();
      this.numberCpu = os.cpus().length;
      this.type = type;
      this.debug = debug || false;
      this.booted = false;
      this.ready = false;
      this.started = false;
      this.settings = null;
      this.regBundle = regBundle;
      this.node_start = process.env.MODE_START || this.options.node_start;
      this.bundles = {};
      this.eventReadywait = 0;
      this.setParameters("bundles", {});
      this.bundlesCore = bundlesCore;
      // Paths
      this.rootDir = process.cwd();
      this.appPath = path.resolve(this.rootDir, "app");
      this.configPath = path.resolve(this.rootDir, "config", "config.yml");
      this.generateConfigPath = path.resolve(this.rootDir, "config", "generatedConfig.yml");
      this.publicPath = path.resolve(this.rootDir, "web");
      this.nodefonyPath = this.autoLoader.dirname;
      //core repository
      try {
        this.isCore = new nodefony.fileClass(path.resolve(this.rootDir, ".core"));
      } catch (e) {
        this.isCore = false;
      }
      this.typeCluster = this.clusterIsMaster() ? "master" : "worker";

      try {
        // Manage Kernel Container
        this.set("kernel", this);
        // Manage Reader
        this.reader = new nodefony.Reader(this.container);
        this.set("reader", this.reader);
        // Manage Injections
        this.injection = new nodefony.injection(this.container);
        this.set("injection", this.injection);
        // SERVERS
        this.initServers();
        // cli worker
        this.cli = new nodefony.cliKernel("NODEFONY", this.container, this.notificationsCenter, {
          autoLogger: false,
          version: this.version,
          pid: this.typeCluster === "worker" ? true : false,
          onStart: ( /*cli*/ ) => {
            this.start(environment);
          }
        });
        this.cli.createDirectory(path.resolve(this.rootDir, "tmp"), null, (file) => {
          this.tmpDir = file;
        }, true);
        this.git = this.cli.setGitPath(this.rootDir);
        this.cacheLink = path.resolve(this.rootDir, "tmp", "assestLink");
        this.cacheWebpack = path.resolve(this.rootDir, "tmp", "webpack");
      } catch (e) {
        console.trace(e);
        throw e;
      }
      this.once("onPostRegister", () => {
        if (this.type === "SERVER") {
          if (!fs.existsSync(this.cacheLink)) {
            try {
              fs.mkdirSync(this.cacheLink);
              this.cli.assetInstall();
            } catch (e) {
              this.logger(e, "WARNING");
            }
          }
        } else {
          try {
            let ret = this.cli.loadCommand();
            if (ret) {
              return;
            }
          } catch (e) {
            this.logger(e, "ERROR");
            this.terminate(1);
            return;
          }
          process.nextTick(() => {
            try {
              this.cli.matchCommand();
            } catch (e) {
              this.logger(e, "ERROR");
              this.terminate(1);
            }
          });
        }
      });
    }

    start(environment) {
      if (!this.started) {
        // Environment
        this.setEnv(environment);
        // config
        this.readKernelConfig();
        // Clusters
        this.initCluster();
        // Manage Template engine
        this.initTemplate();

        // Boot
        /*if ( this.options.logSpinner ){
        this.cli.startSpinner("kernel",['⣾','⣽','⣻','⢿','⡿','⣟','⣯','⣷'] );
        //this.cli.startSpinner("Kernel Boot Nodefony");
        this.logger("Kernel Boot Nodefony");
        this.on("onPostReady", () => {
        setTimeout( () => {
        this.cli.stopSpinner();
      },15000);
    });
  }
  setTimeout(()=>{
  this.boot();
  this.started = true ;
}, 2000);*/
        this.boot();
        this.started = true;
      }
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
      let txt = this.cli.clc.blue("      \x1b NODEFONY " + this.type);
      txt += " Cluster : " + this.cli.clc.magenta(this.typeCluster);
      txt += " Cluster : " + this.cli.clc.magenta(this.typeCluster);
      txt += " Environment : " + this.cli.clc.magenta(this.environment);
      txt += " Debug :" + this.cli.clc.magenta(this.debug) + "\n";
      return txt;
    }

    readKernelConfig() {
      try {
        this.reader.readConfig(this.configPath, this.name, (result) => {
          this.settings = result;
          this.settings.name = "NODEFONY";
          this.settings.version = this.version;
          this.settings.environment = this.environment;
          this.settings.debug = this.debug;
          this.setParameters("kernel", this.settings);
          this.httpPort = result.system.httpPort || null;
          this.httpsPort = result.system.httpsPort || null;
          this.domain = result.system.domain || null;
          this.hostname = result.system.domain || null;
          this.hostHttp = this.hostname + ":" + this.httpPort;
          this.hostHttps = this.hostname + ":" + this.httpsPort;
          this.domainAlias = result.system.domainAlias;
          this.initializeLog();

        });
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
        console.trace(e);
        this.logger(e, "ERROR");
        throw e;
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
      bundles.push(path.resolve(this.nodefonyPath, "bundles", "httpBundle"));
      bundles.push(path.resolve(this.nodefonyPath, "bundles", "frameworkBundle"));
      // FIREWALL
      if (this.settings.system.security) {
        bundles.push(path.resolve(this.nodefonyPath, "bundles", "securityBundle"));
      }
      // ORM MANAGEMENT
      switch (this.settings.orm) {
      case "sequelize":
        bundles.push(path.resolve(this.nodefonyPath, "bundles", "sequelizeBundle"));
        break;
      default:
        this.logger(new Error("nodefony can't load ORM : " + this.settings.orm), "WARNING");
      }
      // REALTIME
      if (this.settings.system.realtime) {
        bundles.push(path.resolve(this.nodefonyPath, "bundles", "realTimeBundle"));
      }
      // MONITORING
      if (this.settings.system.monitoring) {
        bundles.push(path.resolve(this.nodefonyPath, "bundles", "monitoringBundle"));
      }
      // DOCUMENTATION
      if (this.settings.system.documentation) {
        bundles.push(path.resolve(this.nodefonyPath, "bundles", "documentationBundle"));
      }
      // TEST UNIT
      if (this.settings.system.unitTest) {
        bundles.push(path.resolve(this.nodefonyPath, "bundles", "unitTestBundle"));
      }
      // DEMO
      if (this.settings.system.demo) {
        bundles.push(path.resolve(this.rootDir, "src", "bundles", "demoBundle"));
      }
      try {
        this.fire("onPreRegister", this);
      } catch (e) {
        this.logger(e);
      }
      try {
        this.registerBundles(bundles, () => {
          this.preboot = true;
          this.logger("\x1B[33m EVENT KERNEL onPreBoot\x1b[0m", "DEBUG");
          this.fire("onPreBoot", this);
          this.registerBundles(this.configBundle);
        }, false);

      } catch (e) {
        this.logger(e, "ERROR");
      }
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
          let name = this.settings.system.bundles[bundle].replace("\.\/", "").replace(/\/\//, "/");
          config.push(name);
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
            exist = fs.existsSync(path.resolve(this.rootDir, yml.system.bundles[bundle]));
          } catch (e) {
            this.logger(e, "WARNING");
          }
          if (!exist) {
            delete yml.system.bundles[bundle];
            if (remove) {
              try {
                fs.writeFileSync(pathConfig, yaml.safeDump(yml), {
                  encoding: 'utf8'
                });
                this.logger(nameConfig + " : " + bundle + " Bundle don't exist", "WARNING");
                this.logger("Update Config  : " + pathConfig);
              } catch (e) {
                this.logger(e, "ERROR");
              }
            } else {
              let error = new Error(nameConfig + " : " + bundle + " Bundle don't exist");
              this.logger(error, "ERROR");
              this.logger("Config file : " + pathConfig);
              this.logger(yml.system.bundles);
            }
            try {
              let link = path.resolve(this.publicPath, bundle + "Bundle");
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
        console.trace(e);
        this.logger(e, "ERROR");
      }
    }

    initServers() {
      if (this.type === "SERVER") {
        this.once("onPostReady", () => {
          // create HTTP server
          let http = null;
          let https = null;
          try {
            if (this.settings.system.servers.http) {
              http = this.get("httpServer").createServer();
            }
            // create HTTPS server
            if (this.settings.system.servers.https) {
              https = this.get("httpsServer").createServer();
            }
            // create WEBSOCKET server
            if (this.settings.system.servers.ws) {
              this.get("websocketServer").createServer(http);
            }
            // create WEBSOCKET SECURE server
            if (this.settings.system.servers.wss) {
              this.get("websocketServerSecure").createServer(https);
            }
          } catch (e) {
            this.logger(e, "ERROR");
            console.error(e);
            throw e;
          }
        });
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
      if (this.environment === "dev") {
        this.cli.listenSyslog(this.syslog, this.debug);
      } else {
        // PM2
        if (this.options.node_start === "PM2") {
          return this.cli.listenSyslog(this.syslog, this.debug);
        }
        return this.cli.listenSyslog(this.syslog, this.debug);
      }
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
      let ret = null;
      switch (typeof str) {
      case "string":
        ret = regBundleName.exec(str);
        if (ret) {
          return ret[1];
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

    getBundleClass(file, force) {
      try {
        return this.autoLoader.load(file.path, force);
      } catch (e) {
        throw e;
      }
    }

    loadBundle(file) {
      try {
        let Class = this.getBundleClass(file, true);
        let name = this.getBundleName(Class);
        if (Class) {
          if (typeof Class === "function") {
            Class.prototype.path = file.dirName;
            Class.prototype.autoLoader = this.autoLoader;
            try {
              this.bundles[name] = new Class(name, this, this.container);
            } catch (e) {
              this.logger(e, "ERROR");
              console.trace(e);
              throw e;
            }
            if (this.bundles[name].waitBundleReady) {
              this.eventReadywait += 1;
              this.bundles[name].listen(this, "onReady", waitingBundle);
            }
          } else {
            throw new Error("Bundle " + name + " Class is not a function");
          }
        }
      } catch (e) {
        throw e;
      }
    }

    /**
     *  register Bundle
     *  @method registerBundles
     *  @param {String} path
     *  @param {Function} callbackFinish
     */
    registerBundles(mypath, callbackFinish, nextick) {
      let func = function () {
        try {
          return new nodefony.finder({
            path: mypath,
            followSymLink: true,
            exclude: /^doc$|^node_modules$/,
            recurse: false,
            onFile: (file) => {
              if (file.matchName(this.regBundle)) {
                try {
                  if (this.cli.commander && this.cli.commander.args && this.cli.commander.args[0]) {
                    switch (this.cli.commander.args[0]) {
                    case "npm:install":
                      //let name = this.getBundleName(file.name);
                      let Class = this.getBundleClass(file, true);
                      let name = this.getBundleName(Class);
                      if (file.shortName in this.bundlesCore) {
                        if (this.isCore) {
                          this.cli.installPackage(name, file, true);
                        }
                      } else {
                        this.cli.installPackage(name, file, false);
                      }
                      break;
                    default:
                      this.loadBundle(file);
                    }
                  } else {
                    this.loadBundle(file);
                  }
                } catch (e) {
                  console.trace(e);
                  this.logger(e, "ERROR");
                }
              }
            },
            onFinish: callbackFinish || this.initializeBundles.bind(this)
          });
        } catch (e) {
          this.logger(e, "ERROR");
          this.logger("GLOBAL CONFIG REGISTER : ", "INFO");
          this.logger(this.configBundle, "INFO");
          let gene = this.readGeneratedConfig();
          if (gene) {
            this.logger("GENERATED CONFIG REGISTER file ./config/GeneratedConfig.yml : ", "INFO");
            this.logger(gene, "INFO");
          }
        }
      };
      if (nextick === undefined) {
        process.nextTick(() => {
          try {
            return func.call(this);
          } catch (e) {
            this.logger(e, "ERROR");
          }
        });
      } else {
        try {
          return func.apply(this);
        } catch (e) {
          this.logger(e, "ERROR");
        }
      }
    }

    /**
     *  initialisation application bundle
     *  @method initApplication
     */
    initApplication() {
      let App = class AppBundle extends nodefony.Bundle {
        constructor(name, myKernel, myContainer) {
          super(name, myKernel, myContainer);
        }
      };
      App.prototype.path = this.appPath;
      App.prototype.autoLoader = this.autoLoader;
      App.prototype.settings = this.settings;
      this.bundles.App = new App("App", this, this.container);
      this.readConfigDirectory(path.resolve(this.appPath, "config"), (result) => {
        if (result) {
          this.bundles.App.parseConfig(result);
          this.bundles.App.configPath = path.resolve(this.bundles.App.path, "config");
        }
      });
      // OVERRIDE VIEWS BUNDLE in APP DIRECTORY
      this.once("onBoot", () => {
        for (let bundle in this.bundles) {
          if (bundle === "App") {
            continue;
          }
          let result = this.bundles.App.resourcesFiles.findByNode(bundle + "Bundle");
          if (result.length()) {
            try {
              this.logger("\x1b[32m APP OVERRIDING\x1b[0m views for bundle : " + bundle, "WARNING");
              this.bundles[bundle].registerViews(result);
              this.bundles[bundle].registerI18n(null, result);
            } catch (e) {
              this.logger(e);
            }
          }
        }
      });
      return this.bundles.App;
    }

    /**
     *  initialisation  all bundles
     *  @method initializeBundles
     */
    initializeBundles() {
      this.app = this.initApplication();
      this.logger("\x1B[33m EVENT KERNEL onPostRegister\x1b[0m", "DEBUG");
      this.fire("onPostRegister", this);

      for (let name in this.bundles) {
        this.logger("\x1b[36m INITIALIZE Bundle :  " + name.toUpperCase() + "\x1b[0m", "DEBUG");
        try {
          this.bundles[name].boot();
        } catch (e) {
          this.logger("BUNDLE :" + name + " " + e, "ERROR");
          console.trace(e);
          continue;
        }
      }
      if (this.eventReadywait === 0) {
        waitingBundle.call(this);
      }
      this.logger("\x1B[33m EVENT KERNEL BOOT\x1b[0m", "DEBUG");
      this.fire("onBoot", this);
      this.booted = true;
      return;
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
              this.logger(util.inspect(e), "ERROR", "BUNDLE " + name + " CONFIG :" + ele.name);
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
              this.logger(util.inspect(e), "ERROR", "BUNDLE " + this.name.toUpperCase() + " CONFIG ROUTING :" + ele.name);
            }
            break;
          case /^services\..*$/.test(ele.name):
            try {
              this.logger(name + " SERVICE LOAD FILE :" + ele.path, "DEBUG", "SERVICE KERNEL READER");
              this.get("injection").reader(ele.path, this.name);
            } catch (e) {
              this.logger(util.inspect(e), "ERROR", "BUNDLE " + this.name.toUpperCase() + " CONFIG SERVICE :" + ele.name);
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
              this.logger(util.inspect(e), "ERROR", "BUNDLE " + name + " CONFIG SECURITY :" + ele.name);
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
        console.trace(e);
        code = 1;
      }
      process.nextTick(() => {
        this.logger("NODEFONY Kernel Life Cycle Terminate CODE : " + code, "INFO");
        process.exit(code);
      });
      return code;
    }
  };
  return kernel;
});