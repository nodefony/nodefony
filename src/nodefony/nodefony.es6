const execSync = require('child_process').execSync;

/**
 *  The class is a **`Nodefony Nodefony `** .
 *  @class Nodefony
 *  @constructor
 *  @module Nodefony
 *
 */
const myObj = {};

class Nodefony {

  constructor(context) {
    //this.require = require;
    this.path = path.resolve(__dirname);
    this.io = {};
    this.context = context;
    context.nodefony = this;
    this.session = {
      storage: {}
    };
    this.bundles = {};
    this.api = {};
    this.builders = {
      bundles: null,
      project: null,
      react: null,
      vue: null,
      sandbox: null
    };
    this.cliStart = null;
    this.templates = {};
    this.services = {};
    this.commands = {};
    this.encoders = {};
    this.security = {
      factories: {},
      providers: {},
      tokens: {},
      passport: {}
    };
    this.packageManager = "npm";
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
      this.projectPackage = require(path.resolve(cwd, "package.json"));
      this.projectVersion = this.projectPackage.version;
      this.projectName = this.projectPackage.name;
      this.kernelConfig = this.loadConfig(this.kernelConfigPath);
      this.appConfig = this.loadConfig(this.appConfigPath, console.warn);
      this.packageManager = this.kernelConfig.packageManager || "npm";
    } catch (e) {
      if (!this.Error) {
        this.Error = require(path.resolve(__dirname, "error.es6"));
      }
      let error = new this.Error(e);
      throw error;
    }
  }

  setPm2Config() {
    if (this.builded) {
      this.pm2Config = require(this.pm2ConfigPath);
    }
    return this.pm2Config;
  }

  loadConfig(file, log) {
    try {
      let ext = path.extname(file);
      switch (ext) {
      case ".js":
        return require(file);
      case ".yml":
        return yaml.load(this.readFileSync(file));
      }
    } catch (e) {
      if (log) {
        //log(e);
        return {};
      }
      throw e;
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

  isError(it) {
    return nodefony.Error.isError(it);
  }

  isContainer(container) {
    if (container && container.protoService && container.protoParameters) {
      return true;
    }
    return false;
  }

  isPromise(obj) {
    switch (true) {
    case obj instanceof Promise:
    case obj instanceof BlueBird:
      return true;
    default:
      return !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function';
    }
  }

  isUndefined(value) {
    return value === undefined;
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
      if (this.isError(value)) {
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
      try {
        this.kernelConfigPath = path.resolve(cwd, "config", "config.js");
        fs.lstatSync(this.kernelConfigPath);
      } catch (e) {
        this.kernelConfigPath = path.resolve(cwd, "config", "config.yml");
        fs.lstatSync(this.kernelConfigPath);
      }
      this.appPath = path.resolve(cwd, "app");
      fs.lstatSync(this.appPath);
      try {
        this.appConfigPath = path.resolve(this.appPath, "config", "config.js");
        fs.lstatSync(this.appConfigPath);
      } catch (e) {
        this.appConfigPath = path.resolve(this.appPath, "config", "config.yml");
        fs.lstatSync(this.appConfigPath);
      }
      this.pm2ConfigPath = path.resolve(cwd, "config", "pm2.config.js");
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

  checkYarnVersion() {
    let res = null;
    try {
      res = execSync("yarn -v", {
        encoding: "utf8"
      });
      if (res) {
        return res.replace(/\s/g, "");
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  checkNpmVersion() {
    let res = null;
    try {
      res = execSync("npm -v", {
        encoding: "utf8"
      });
      if (res) {
        return res.replace(/\s/g, "");
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  manageCache(cli) {
    if (this.isTrunk) {
      let cacheLink = path.resolve("tmp", "assestLink");
      if (fs.existsSync(cacheLink)) {
        if (cli && cli.logger && cli.debug) {
          cli.logger("DELETE TMP LINK :" + cacheLink, "DEBUG");
        }
        shell.rm("-Rf", this.cacheLink);
      }
      let cacheWebpack = path.resolve("tmp", "webpack");
      if (fs.existsSync(cacheWebpack)) {
        if (cli && cli.logger && cli.debug) {
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
    cli.setHelp("", "preprod", "Run Nodefony Preprod Server ( Usefull to check Clusters Node )");
    cli.setHelp("", "prod", "Run Nodefony Production Server ( PM2 mode )");
    cli.setTitleHelp(cli.clc.cyan("PM2 Process Manager 2"));
    cli.setHelp("", "stop [name]", "Stop Production Project");
    cli.setHelp("", "reload [name]", "Reload Production Project");
    cli.setHelp("", "delete [name]", "Delete Production Project from PM2 management");
    cli.setHelp("", "restart [name]", "Restart Production Project");
    cli.setHelp("", "list", "List all Production Projects");
    cli.setHelp("", "kill", "Kill PM2 daemon ");
    cli.setHelp("", "logs [name] [nblines]", "Stream pm2 logs  [name] is project name  and [nblines] to show ");
    cli.setHelp("", "clean-log", "Remove logs");
    cli.setHelp("", "pm2-logrotate", "install pm2 logrotate");
    cli.setHelp("", "pm2-save", "save pm2 deamon status, It will save the process list with the corresponding environments into the dump file");
    cli.setHelp("", "pm2-startup", "Detect available init system, generate configuration and enable startup system");
    cli.setHelp("", "pm2-unstartup", "Disabling startup system");
    // nodefony
    cli.setTitleHelp(cli.clc.cyan("nodefony"));
    cli.setHelp("", "create [-i] name [path]", "Create New Nodefony Project");
    cli.setHelp("", "build", "Build Nodefony Framework");
    cli.setHelp("", "rebuild", "Rebuild Nodefony Framework (Recompilation when node version change )");
    cli.setHelp("", "install", "Install Nodefony Project");
    cli.setHelp("", "certificates", `Generate HTTPS Certificates  'Change default openssl configuration in config/openssl'`);
    cli.setHelp("", "dependencies", "List Project dependencies");
    cli.setHelp("", "outdated", "List Project dependencies outdated");
    cli.setHelp("", "version", "Get Project Version");
  }

  async start(cmd, args, cli, options = {}) {
    if (cmd !== "preprod" && cluster.isWorker) {
      cmd = "production";
    }
    let environment = false;
    let name = nodefony.projectName;
    switch (cmd) {
    case "dev":
    case "development":
      cli.keepAlive = true;
      this.manageCache(cli);
      environment = "dev";
      process.env.MODE_START = "NODEFONY_DEV";
      cli.setType("SERVER");
      const kernel = new nodefony.appKernel(environment, cli, options);
      return await kernel.start();
    case "preprod":
    case "preproduction":
      cli.keepAlive = true;
      this.manageCache(cli);
      environment = "prod";
      process.env.MODE_START = "NODEFONY";
      cli.setType("SERVER");
      return this.preProd(environment, cli, options);
    case "production":
    case "prod":
    case "start":
    case "pm2":
      cli.keepAlive = true;
      environment = "prod";
      if (process.env.MODE_START && process.env.MODE_START === "PM2") {
        cli.setType("SERVER");
        const kernel = new nodefony.appKernel(environment, cli, options);
        return await kernel.start();
      } else {
        await cli.setCommand("webpack:dump");
        cli.setType("SERVER");
        this.manageCache(cli);
        process.env.MODE_START = "PM2_START";
        return this.pm2Start(cli);
      }
      break;
    case "stop":
      cli.keepAlive = true;
      if (args.length) {
        name = args[0];
      }
      pm2.stop(name, (error, proc) => {
        if (error) {
          cli.logger(error, "ERROR");
          cli.terminate(-1);
        }
        cli.logger(`PM2 Stop Project  ${name}`);
        this.tablePm2(cli, proc);
        cli.terminate(0);
      });
      break;
    case "reload":
      cli.keepAlive = true;
      if (args.length) {
        name = args[0];
      }
      pm2.reload(name, (error, proc) => {
        if (error) {
          cli.logger(error, "ERROR");
          return cli.terminate(-1);
        }
        cli.logger(`PM2 reload Project  ${name}`);
        this.tablePm2(cli, proc);
        return cli.terminate(0);
      });
      break;
    case "restart":
      cli.keepAlive = true;
      if (args.length) {
        name = args[0];
      }
      pm2.restart(name, (error, proc) => {
        if (error) {
          cli.logger(error, "ERROR");
          return cli.terminate(-1);
        }
        cli.logger(`PM2 restart Project  ${name}`);
        this.tablePm2(cli, proc);
        return cli.terminate(0);
      });
      break;
    case "delete":
      cli.keepAlive = true;
      if (args.length) {
        name = args[0];
      }
      pm2.delete(name, (error, proc) => {
        if (error) {
          cli.logger(error, "ERROR");
          return cli.terminate(-1);
        }
        cli.logger(`PM2 delete Project  ${name}`);
        this.tablePm2(cli, proc);
        return cli.terminate(0);
      });
      break;
    case "kill":
      cli.keepAlive = true;
      pm2.killDaemon((error, proc) => {
        if (error) {
          cli.logger(error, "ERROR");
          return cli.terminate(-1);
        }
        cli.logger(`Kill PM2 MANAGER success :  ${proc.success}`);
        pm2.list((error, processDescriptionList) => {
          if (error) {
            cli.logger(error, "ERROR");
            return cli.terminate(-1);
          }
          this.tablePm2(cli, processDescriptionList);
          return process.exit(0);
        });
      });
      break;
    case "status":
    case "list":
      cli.keepAlive = true;
      pm2.list((error, processDescriptionList) => {
        if (error) {
          cli.logger(error, "ERROR");
          return cli.terminate(-1);
        }
        this.tablePm2(cli, processDescriptionList);
        return process.exit(0);
      });
      break;
    case "log":
    case "logs":
      cli.keepAlive = true;
      let myname = null;
      let line = 20;
      if (this.isTrunk) {
        myname = nodefony.projectName;
      } else {
        myname = "all";
      }
      if (args.length) {
        myname = args[0];
        if (args[1]) {
          line = args[1];
        }
      }
      cli.reset();
      cli.logger(`PM2 LOG MANAGEMENT project : ${myname}  line : ${line}`, "INFO");
      pm2.streamLogs(myname, line);
      break;
    case "clean-log":
      cli.keepAlive = true;
      pm2.flush((error, result) => {
        if (error) {
          cli.logger(error, "ERROR");
          return cli.terminate(-1);
        }
        cli.logger(`clean log ${nodefony.projectName}`);
        this.tablePm2(cli, result);
        return process.exit(0);
      });
      break;
    case "pm2-logrotate":
      return cli.npm(["run", "pm2", "install", "pm2-logrotate"]);
    case "pm2-save":
      return cli.npm(["run", "pm2", "save"]);
    case "pm2-startup":
      return cli.spawn("npx", ["pm2", "startup"], {
        cwd: process.cwd(),
        env: process.env,
        stdio: "inherit"
      }).then((code) => {
        cli.log(`[PM2] Init System found To setup the Startup Script, copy/paste the previous command :)`);
        return code;
      }).catch(e => {
        cli.log(e, "ERROR");
      });
    case "pm2-unstartup":
      return cli.npm(["run", "pm2", "unstartup"]);
    case "outdated":
      return cli.setCommand("nodefony:outdated");
    case "test":
      return cli.setCommand("unitest:launch:all");
    case "dependencies":
      return cli.setCommand("nodefony:bundles:dependencies");
    default:
      if (cli.kernel) {
        return await cli.kernel.matchCommand()
          .then((command) => {
            let name = "";
            if (command && command.name) {
              name = command.name;
            }
            cli.logger(`${cli.getEmoji("checkered_flag")}`, "INFO", `Command ${name}`);
            return command;
          })
          .catch((error) => {
            throw error;
            //this.logger(error, "ERROR", `COMMAND`);
          });
      }
      if (this.appKernel) {
        environment = "prod";
        cli.setType("CONSOLE");
        process.env.MODE_START = "NODEFONY_CONSOLE";
        this.manageCache(cli);
        let kernel = new this.appKernel(environment, cli, options);
        return await kernel.start()
          .catch(e => {
            throw e;
          });
      }
      if (cli.commander.hasOwnProperty('help')) {
        cli.clear();
        cli.showHelp();
        return Promise.resolve();
      }
      let error = new Error("No nodefony trunk detected !");
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
    return new Promise((resolve, reject) => {
      this.setPm2Config();
      if (!this.pm2Config) {
        this.pm2Config = this.kernelConfig.system.PM2;
        this.pm2Config.apps[0].script = process.argv[1] || "nodefony";
        this.pm2Config.apps[0].args = "pm2";
        this.pm2Config.apps[0].env = {
          NODE_ENV: "production",
          MODE_START: "PM2"
        };
      }
      if (!this.pm2Config.apps[0].name) {
        this.pm2Config.apps[0].name = this.projectPackage.name || this.projectName;
      }
      this.pm2Config.apps[0].vizion = false ;
      pm2.connect((err) => {
        if (err) {
          cli.logger(err, "ERROR");
          cli.terminate(1);
          return;
        }
        pm2.start(this.pm2Config, (err /*, apps*/ ) => {
          if (err) {
            cli.logger(err.stack || err, "ERROR");
            reject(err);
            cli.terminate(1);
          }
          process.nextTick(() => {
            try {
              pm2.list((err, processDescriptionList) => {
                if (err) {
                  console.error(err);
                }
                this.tablePm2(cli, processDescriptionList);
                cli.logger(`SAVING process`);
                //process.env.PWD = process.cwd();
                pm2.dump((err, result) => {
                  if (err) {
                    cli.logger(err, "ERROR");
                  }
                  if (result.success) {
                    cli.logger(`${process.platform} PM2 process saved `);
                  }
                  cli.log(`

PM2 Process Manager 2 :
   stop [name]                                             Stop Production Project
   reload [name]                                           Reload Production Project
   delete [name]                                           Delete Production Project from PM2 management
   restart [name]                                          Restart Production Project
   list                                                    List all Production Projects
   kill                                                    Kill PM2 daemon
   logs [name] [nblines]                                   Stream pm2 logs  [name] is project name  and [nblines] to show
   clean-log                                               Remove logs
   pm2-logrotate                                           install pm2 logrotate
   pm2-save                                                save pm2 deamon status, It will save the process list with the corresponding environments into the dump file
   pm2-startup                                             Detect available init system, generate configuration and enable startup system
   pm2-unstartup                                           Disabling startup system

Examples :

$ nodefony logs
$ nodefony reload <myproject>
$ nodedony pm2-logrotate
$ nodedony pm2-save

Examples with pm2 native tools :

$ npx pm2 monit
$ npx pm2 --lines 1000 logs
                    `);
                  resolve(pm2.disconnect());
                  if (cli.commander.daemon) {
                    cli.terminate(0);
                  }
                });
              });
            } catch (e) {
              cli.logger(e, "ERROR");
              reject(e);
              resolve(pm2.disconnect());
              cli.terminate(1);
            }
          });
        });
      });
    });
  }

  async preProd(environment, cli, options) {
    const instances = require('os').cpus().length;
    if (cluster.isMaster) {
      for (let i = 0; i < instances; i++) {
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
      const kernel = new nodefony.appKernel(environment, cli, options);
      return await kernel.start();
    }
  }
}

module.exports = Nodefony;
