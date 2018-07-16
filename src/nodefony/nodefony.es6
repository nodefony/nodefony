const execSync = require('child_process').execSync;

/**
 *  The class is a **`Nodefony Nodefony `** .
 *  @class Nodefony
 *  @constructor
 *  @module Nodefony
 *
 */
const myObj = {};
module.exports = class Nodefony {

  constructor() {
    this.module = module;
    this.require = require;
    this.io = {};
    this.context = {};
    this.session = {
      storage: {}
    };
    this.bundles = {};
    this.builders = {
      bundles: null
    };
    this.cliStart = null;
    this.templatings = {};
    this.services = {};
    this.commands = {};
    this.encoders = {};
    this.security = {
      factories: {},
      providers: {},
      tokens: {},
      passport: {}
    };
    this.version = this.getVersion();
    this.versions = process.versions;
    this.kernelConfigPath = null;
    this.appPath = null;
    this.appConfigPath = null;
    this.kernelConfig = null;
    this.pm2Config = null;
    this.appConfig = null;
    this.projectName = "nodefony";
    this.appKernel = null;
    this.isRegExp = require('lodash.isregexp');

    this.isCore = false;
    this.isElectron = this.isElectronContext();
    this.yarn = this.checkYarn();
    this.npm = this.checkNpm();
    if (!(this.npm || this.yarn)) {
      let error = new Error("node.js Packages manager not found ");
      console.error("Try to install npm or yarn package manager ");
      throw error;
    }
    //this.globalNpm = this.checkGlobalNpm();
    //this.globalYarn = this.checkGlobalYarn();
    this.builded = false;
    this.checkTrunk();
  }

  checkTrunk(cwd = path.resolve(".")) {
    this.isTrunk = this.isNodefonyTrunk(cwd);
    if (this.isTrunk) {
      this.builded = this.isBuilded(cwd);
      try {
        this.setConfig(cwd);
        this.isCore = this.isCoreTrunk(cwd);
      } catch (e) {
        throw e;
      }
    }
  }

  isBuilded(cwd = path.resolve(".")) {
    try {
      fs.lstatSync(path.resolve(cwd, "node_modules"));
      return true;
    } catch (e) {
      return false;
    }
  }

  setConfig(cwd = path.resolve(".")) {
    try {
      this.kernelConfig = this.loadYaml(this.kernelConfigPath);
      this.appConfig = this.loadYaml(this.appConfigPath);
      this.projectPackage = require(path.resolve(cwd, "package.json"));
      this.projectVersion = this.projectPackage.version;
      //this.projectName = this.appConfig.App.projectName;
      this.projectName = this.projectPackage.name;
    } catch (e) {
      throw e;
    }
  }

  setPm2Config() {
    if (this.builded) {
      this.pm2Config = require(this.pm2ConfigPath);
    }
    return this.pm2Config;
  }

  loadYaml(file) {
    try {
      return yaml.load(this.readFileSync(file));
    } catch (e) {
      throw (e);
    }
  }

  readFileSync(file) {
    try {
      return fs.readFileSync(file, {
        encoding: 'utf8'
      });
    } catch (e) {
      throw e;
    }
  }

  isCoreTrunk() {
    if (this.isTrunk) {
      if (this.projectPackage.name === "nodefony-core") {
        return true;
      }
      try {
        fs.lstatSync(path.resolve(".core"));
        return true;
      } catch (e) {
        return false;
      }
    }
    return false;
  }

  isFunction(it) {
    return Object.prototype.toString.call(it) === '[object Function]';
  }

  isArray(it) {
    return Object.prototype.toString.call(it) === '[object Array]';
  }

  isRegExp(it) {
    return this.isRegExp(it);
  }

  isPromise(obj) {
    return !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function';
  }

  isPlainObject(obj) {
    let proto, Ctor;
    // Detect obvious negatives
    // Use toString instead of jQuery.type to catch host objects
    if (!obj || myObj.toString.call(obj) !== "[object Object]") {
      return false;
    }
    proto = Object.getPrototypeOf(obj);
    // Objects with no prototype (e.g., `Object.create( null )`) are plain
    if (!proto) {
      return true;
    }
    // Objects with prototype are plain iff they were constructed by a global Object function
    Ctor = myObj.hasOwnProperty.call(proto, "constructor") && proto.constructor;
    return typeof Ctor === "function" && myObj.hasOwnProperty.toString.call(Ctor) === myObj.hasOwnProperty.toString.call(Object);
  }

  /**
   *  @method typeOf
   *  @param  value
   *  @return {String} type of value
   */
  typeOf(value) {
    let t = typeof value;
    if (t === 'object') {

      if (value === null) {
        return null;
      }
      if (Buffer.isBuffer(value)) {
        return "buffer";
      }
      if (this.isArray(value)) {
        return "array";
      }
      if (this.isFunction(value)) {
        return 'function';
      }
      if (value instanceof Date) {
        return "date";
      }
      if (this.isRegExp(value)) {
        return "RegExp";
      }
      if (value.callee) {
        return "arguments";
      }
      if (value instanceof SyntaxError) {
        return "SyntaxError";
      }
      if (value instanceof Error) {
        return "Error";
      }
    } else {
      if (t === 'function' && typeof value.call === 'undefined') {
        return 'object';
      }
    }
    return t;
  }

  extend() {
    let options, name, src, copy, copyIsArray, clone,
      target = arguments[0] || {},
      i = 1,
      length = arguments.length,
      deep = false;

    // Handle a deep copy situation
    if (typeof target === "boolean") {
      deep = target;
      // Skip the boolean and the target
      target = arguments[i] || {};
      i++;
    }
    // Handle case when target is a string or something (possible in deep copy)
    if (typeof target !== "object" && this.isFunction(target)) {
      target = {};
    }
    // Extend jQuery itself if only one argument is passed
    if (i === length) {
      target = this;
      i--;
    }
    for (; i < length; i++) {
      // Only deal with non-null/undefined values
      if ((options = arguments[i]) !== null) {
        // Extend the base object
        for (name in options) {
          src = target[name];
          copy = options[name];
          // Prevent never-ending loop
          if (target === copy) {
            continue;
          }
          // Recurse if we're merging plain objects or arrays
          let bool = this.typeOf(copy);
          if (deep && copy && (bool === "object" ||
              (copyIsArray = (bool === "array")))) {
            if (copyIsArray) {
              copyIsArray = false;
              clone = src && bool === "array" ? src : [];
            } else {
              clone = src && bool === "object" ? src : {};
            }
            // Never move original objects, clone them
            target[name] = this.extend(deep, clone, copy);
            // Don't bring in undefined values
          } else if (copy !== undefined) {
            target[name] = copy;
          }
        }
      }
    }
    // Return the modified object
    return target;
  }

  /**
   *  Register Nodefony Library element
   *  @method register
   *  @param {String} name
   *  @param {Function} closure
   *
   */
  register(name, closure) {
    if (typeof closure === "function") {
      // exec closure
      return this[name] = closure(this, name);
    } else {
      return this[name] = closure;
    }
  }

  /**
   *  Register Nodefony Bundle
   *  @method registerBundle
   *  @param {String} name
   *  @param {Function} closure
   *
   */
  registerBundle(name, closure) {
    if (typeof closure === "function") {
      return this.bundles[name] = closure();
    }
    throw new Error("Register bundle : " + name + "  error bundle bad format");
  }

  /**
   *  Register Nodefony controller
   *  @method registerController
   *  @param {String} name
   *  @param {Function} closure
   *
   */
  registerController(name, closure) {
    if (typeof closure === "function") {
      //controller.prototype.name = name ;
      return closure();
    }
    throw new Error("Register Controller : " + name + "  error Controller bad format");
  }

  /**
   *  Register Nodefony Template
   *  @method registerTemplate
   *  @param {String} name
   *  @param {Function} closure
   *
   */
  registerTemplate(name, closure) {
    return this.templatings[name] = closure();
  }

  /**
   *  Register Nodefony service
   *  @method registerService
   *  @param {String} name
   *  @param {Function} closure
   *
   */
  registerService(name, closure) {
    if (name in this.services) {
      throw new Error("Service name : " + name + " already exit in application !!! ");
    }
    if (typeof closure === "function") {
      return this.services[name] = closure();
    }
    throw new Error("Register Service : " + name + "  error Service bad format");
  }

  /**
   *  Register Nodefony entity
   *  @method registerEntity
   *  @param {String} name
   *  @param {Function} closure
   *
   */
  registerEntity(name, closure) {
    if (typeof closure === "function") {
      return closure();
    }
    throw new Error("Register Entity : " + name + "  error Entity bad format");
  }

  registerEncoder(name, closure) {
    if (typeof closure === "function") {
      return this.encoders[name] = closure();
    }
    throw new Error("Register Encoder : " + name + "  error Encoder bad format");
  }


  /**
   *  Register Nodefony fixture
   *  @method registerFixture
   *  @param {String} name
   *  @param {Function} closure
   *
   */
  registerFixture(name, closure) {
    if (typeof closure === "function") {
      return closure();
    }
    throw new Error("Register fixtures : " + name + "  error fixtures bad format");
  }

  /**
   *  Register Nodefony command
   *  @method registerCommand
   *  @param {String} name
   *  @param {Function} closure
   *
   */
  registerCommand(name, closure) {
    if (typeof closure === "function") {
      return closure();
    }
    throw new Error("Register commands : " + name + "  error commands bad format");
  }

  registerFactory(name, closure) {
    if (typeof closure === "function") {
      return nodefony.security.factories[name] = closure();
    }
    throw new Error("Register Factory : " + name + "  Error Factory bad format");
  }
  registerToken(name, closure) {
    if (typeof closure === "function") {
      return nodefony.security.tokens[name] = closure();
    }
    throw new Error("Register Token : " + name + "  Error Token bad format");
  }
  registerProvider(name, closure) {
    if (typeof closure === "function") {
      return nodefony.security.providers[name] = closure();
    }
    throw new Error("Register Provider : " + name + "  Error Provider bad format");
  }

  getVersion() {
    return require(path.resolve(__dirname, "package.json")).version;
  }

  isNodefonyTrunk(cwd = path.resolve(".")) {
    try {

      this.kernelConfigPath = path.resolve(cwd, "config", "config.yml");
      this.appPath = path.resolve(cwd, "app");
      this.appConfigPath = path.resolve(this.appPath, "config", "config.yml");
      this.pm2ConfigPath = path.resolve(cwd, "config", "pm2.config.js");
      fs.lstatSync(this.kernelConfigPath);
      fs.lstatSync(this.appPath);
      fs.lstatSync(this.appConfigPath);
      if (!this.appKernel) {
        this.loadAppKernel(cwd);
      }
      this.isTrunk = true;
      return true;
    } catch (e) {
      this.isTrunk = false;
      return false;
    }
  }

  loadAppKernel(cwd = path.resolve(".")) {
    try {
      return this.appKernel = require(path.resolve(cwd, "app", "appKernel.js"));
    } catch (e) {
      return null;
    }
  }

  isElectronContext() {
    if (this.versions.electron) {
      return require('electron');
    }
    return false;
  }

  checkYarn() {
    try {
      return require("yarn");
    } catch (e) {
      return false;
    }
  }

  checkNpm() {
    try {
      return require("npm");
    } catch (e) {
      return false;
    }
  }
  checkGlobalNpm() {
    let res = null;
    try {
      res = execSync("npm list --depth 1 --global npm", {
        encoding: "utf8"
      });
      if (res) {
        this.globalYarn = true;
        return true;
      }
      this.globalYarn = false;
      return false;
    } catch (e) {
      this.globalYarn = null;
      throw e;
    }
  }
  checkGlobalYarn() {
    let res = null;
    try {
      res = execSync("npm list --depth 1 --global yarn", {
        encoding: "utf8"
      });
      if (res) {
        this.globalYarn = true;
        return true;
      }
      this.globalYarn = false;
      return false;
    } catch (e) {
      this.globalYarn = null;
      throw e;
    }
  }

  manageCache(cli) {
    if (this.isTrunk) {
      let cacheLink = path.resolve("tmp", "assestLink");
      if (fs.existsSync(cacheLink)) {
        if (cli && cli.logger) {
          cli.logger("DELETE TMP LINK :" + cacheLink, "DEBUG");
        }
        shell.rm("-Rf", this.cacheLink);
      }
      let cacheWebpack = path.resolve("tmp", "webpack");
      if (fs.existsSync(cacheWebpack)) {
        if (cli && cli.logger) {
          cli.logger("DELETE TMP :" + cacheWebpack, "DEBUG");
        }
        shell.rm("-Rf", cacheWebpack);
      }
    }
  }

  showHelp(cli) {
    // Servers
    cli.setTitleHelp(`${cli.clc.cyan("Servers")}`);
    cli.setHelp("", "dev", "Run Nodefony Development Server");
    cli.setHelp("", "preprod", "Run Nodefony Preprod Server ( Node Clusters )");
    cli.setHelp("", "prod", "Run Nodefony Production Server ( PM2 mode )");
    cli.setHelp("", "stop", "Stop Nodefony Production Server ( PM2 mode )");
    cli.setHelp("", "kill", "Kill ( PM2 mode )");
    cli.setHelp("", "reload", "RELOAD ( PM2 mode )");
    cli.setHelp("", "Status", "List  process ( PM2 mode )");
    cli.setHelp("", "logs", "Stream logs  process ( PM2 mode )");
    cli.setHelp("", "clean-log", "Remove log ( PM2 mode )");
    // nodefony
    cli.setTitleHelp(cli.clc.cyan("nodefony"));
    cli.setHelp("", "create [-i] name [path]", "Create New Nodefony Project");
    cli.setHelp("", "install", "Install Nodefony");
    cli.setHelp("", "build", "Build Nodefony Project");
    cli.setHelp("", "outdated", "List Nodefony dependencies outdated");
    //this.setHelp("", "app", "Get Application Name");
    cli.setHelp("", "version", "Get Project Version");
  }

  start(cmd, args, cli, options = {}) {
    if (cmd !== "preprod" && cluster.isWorker) {
      cmd = "production";
    }
    let environment = false;
    switch (cmd) {
    case "dev":
    case "development":
      this.manageCache(cli);
      environment = "dev";
      process.env.MODE_START = "NODEFONY_DEV";
      cli.setType("SERVER");
      return new nodefony.appKernel(environment, cli, options);
    case "preprod":
    case "preproduction":
      this.manageCache(cli);
      environment = "prod";
      process.env.MODE_START = "NODEFONY";
      cli.setType("SERVER");
      return this.preProd(environment, cli, options);
    case "production":
    case "prod":
    case "start":
    case "pm2":
      cli.setType("SERVER");
      environment = "prod";
      if (process.env.MODE_START && process.env.MODE_START === "PM2") {
        return new nodefony.appKernel(environment, cli, options);
      } else {
        this.manageCache(cli);
        process.env.MODE_START = "PM2_START";
        return this.pm2Start(cli);
      }
      break;
    case "stop":
      pm2.stop(nodefony.projectName, (error, proc) => {
        if (error) {
          cli.logger(error, "ERROR");
          cli.terminate(-1);
        }
        cli.logger(`PM2 Stop Project  ${nodefony.projectName}`);
        this.tablePm2(cli, proc);
        cli.terminate(0);
      });
      break;
    case "kill":
      pm2.killDaemon((error, proc) => {
        if (error) {
          cli.logger(error, "ERROR");
          cli.terminate(-1);
        }
        cli.logger(`Kill PM2 MANAGER success :  ${proc.success}`);
        pm2.list((error, processDescriptionList) => {
          if (error) {
            cli.logger(error, "ERROR");
            cli.terminate(-1);
          }
          this.tablePm2(cli, processDescriptionList);
          process.exit(0);
        });
      });
      break;
    case "status":
    case "list":
      pm2.list((error, processDescriptionList) => {
        if (error) {
          cli.logger(error, "ERROR");
          cli.terminate(-1);
        }
        this.tablePm2(cli, processDescriptionList);
        process.exit(0);
      });
      break;
    case "log":
    case "logs":
      cli.reset();
      pm2.streamLogs();
      break;
    case "clean-log":
      pm2.flush((error, result) => {
        if (error) {
          cli.logger(error, "ERROR");
          cli.terminate(-1);
        }
        cli.logger(`clean log ${nodefony.projectName}`);
        this.tablePm2(cli, result);
        process.exit(0);
      });
      break;
    case "outdated":
      return cli.setCommand("nodefony:outdated");
    case "test":
      return cli.setCommand("unitest:launch:all");
    case "help":
      return cli.setCommand("", ["-h"]);
    default:
      if (cli.kernel) {
        return cli.kernel.matchCommand();
      }
      if (this.appKernel) {
        environment = "prod";
        cli.setType("CONSOLE");
        process.env.MODE_START = "NODEFONY_CONSOLE";
        this.manageCache(cli);
        let kernel = new this.appKernel(environment, cli, options);
        return kernel.start();
      }
      let error = new Error("No nodefony trunk detected !");
      cli.logger(error, "ERROR");
      cli.showHelp();
      throw error;
    }
  }

  tablePm2(cli, apps) {
    //console.log(apps)
    let table = null;
    table = cli.displayTable(null, {
      head: [
        cli.clc.blue("App name"),
        cli.clc.blue("id"),
        cli.clc.blue("mode"),
        cli.clc.blue("pid"),
        cli.clc.blue("status"),
        cli.clc.blue("restart"),
        cli.clc.blue("uptime"),
        cli.clc.blue("cpu"),
        cli.clc.blue("memory"),
        cli.clc.blue("user"),
        cli.clc.blue("watching")
      ],
      //colWidths: [30, 15, 20, 15]
    });
    apps.forEach((ele) => {
      //console.log(ele.pm2_env)
      //console.log(ele)
      let cpu = "-";
      let memory = "-";
      if (ele.monit) {
        cpu = ele.monit.cpu + "%";
        memory = nodefony.cli.niceBytes(ele.monit.memory);
      }
      let exec_mode = "-";
      if (ele.pm2_env.exec_mode) {
        exec_mode = ele.pm2_env.exec_mode;
      }
      let status = "-";
      if (ele.status) {
        status = ele.status;
      }
      if (ele.pm2_env.status) {
        status = ele.pm2_env.status;
      }
      let uptime = "-";
      if (ele.pm2_env.pm_uptime) {
        uptime = nodefony.cli.niceUptime(ele.pm2_env.pm_uptime);
      }
      let restart = "-";
      if (ele.pm2_env.restart_time) {
        restart = ele.pm2_env.restart_time;
      }
      if (ele.restart_time) {
        restart = ele.restart_time;
      }
      let username = "-";
      if (ele.pm2_env.username) {
        username = ele.pm2_env.username;
      }
      let watch = "-";
      if (ele.pm2_env.watch) {
        watch = ele.pm2_env.watch;
      }
      let pid = "-";
      if (ele.pid) {
        pid = ele.pid;
      }
      table.push([
        ele.name,
        ele.pm_id,
        exec_mode,
        pid,
        status,
        restart,
        uptime,
        cpu,
        memory,
        username,
        watch
      ]);
    });
    console.log(table.toString());
  }

  /*
   * PM2
   */
  pm2Start(cli) {
    this.setPm2Config();
    if (!this.pm2Config) {
      this.pm2Config = this.kernelConfig.system.PM2;
      this.pm2Config.apps[0].script = "nodefony";
      this.pm2Config.apps[0].args = "pm2";
      this.pm2Config.apps[0].env = {
        NODE_ENV: "production",
        MODE_START: "PM2"
      };
    }
    if (!this.pm2Config.apps[0].name) {
      this.pm2Config.apps[0].name = this.projectName;
    }
    //console.log(this.pm2Config)
    pm2.connect(() => {
      pm2.start(this.pm2Config, (err /*, apps*/ ) => {
        if (err) {
          cli.logger(err.stack || err, "ERROR");
          cli.terminate(1);
        }
        try {
          process.nextTick(() => {
            pm2.list((err, processDescriptionList) => {
              if (err) {
                console.error(err);
              }
              this.tablePm2(cli, processDescriptionList);
              console.log(" To see all logs use the command  nodefony logs ");
              console.log(" Or use PM2  pm2 --lines 1000 logs ");
              pm2.disconnect();
            });
          });
        } catch (e) {
          cli.logger(e, "ERROR");
          cli.terminate(1);
        }
      });
    });
  }

  preProd(environment, cli, options) {
    const instances = require('os').cpus().length;
    if (cluster.isMaster) {
      for (var i = 0; i < instances; i++) {
        cluster.fork();
      }
      cluster.on('disconnect', function ( /*worker*/ ) {
        console.error('disconnect!');
      });
      cluster.on('fork', (worker) => {
        let wid = worker.id;
        worker.on('message', (msg) => {
          if (msg && msg.worker === wid) {
            return;
          }
          Object.keys(cluster.workers).forEach(function (id) {
            if (id !== wid) {
              //console.log("CLUSTER SEND FROM  "+ wid + " to " + id)
              cluster.workers[id].send(nodefony.extend(msg, {
                worker: wid,
              }));
            }
          });
        });
      });
    } else {
      return new nodefony.appKernel(environment, cli, options);
    }
  }

};