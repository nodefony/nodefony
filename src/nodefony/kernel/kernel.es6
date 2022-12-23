'use strict';
const os = require('os');
const Module = require("module");
let myrequire = null;
let mypackage = null;

const makeRequireFunction = function makeRequireFunction(mod) {
  const myModule = mod.constructor;

  function myRequire(path) {
    try {
      exports.requireDepth += 1;
      return mod.require(path);
    } finally {
      exports.requireDepth -= 1;
    }
  }

  function resolve(request, options) {
    if (typeof request !== 'string') {
      throw new new Error(`resolve arg must be a string  ERR_INVALID_ARG_TYPE : ${request}`);
    }
    return myModule._resolveFilename(request, mod, false, options);
  }
  myRequire.resolve = resolve;

  function paths(request) {
    if (typeof request !== 'string') {
      throw new new Error(`paths arg must be a string  ERR_INVALID_ARG_TYPE : ${request}`);
    }
    return myModule._resolveLookupPaths(request, mod, true);
  }
  resolve.paths = paths;
  myRequire.main = module; //process.mainModule;
  // Enable support to add extra extension types.
  myRequire.extensions = myModule._extensions;
  myRequire.cache = myModule._cache;
  return myRequire;
};
const createRequireFromPath = function createRequireFromPath(filename) {
  const m = new Module(filename, module);
  m.filename = filename;
  m.paths = Module._nodeModulePaths(path.dirname(filename));
  return makeRequireFunction(m);
};
try {
  let filemame = path.resolve(process.cwd(), "package.json");
  myrequire = createRequireFromPath(filemame);
  mypackage = myrequire(filemame);
} catch (e) {}

const regBundleName = /^(\w+)-bundle[\.js]{0,3}$|^(\w+)[Bb]undle[\.js]{0,3}$/;
const regBundle = /^(\w+)[Bb]undle.js$/;
const regClassBundle = /^(\w+)[Bb]undle$/;
const regPackageFile = /^\s*file:(.*)/;

/*const promiseBundleReady = function () {
  let myresolve = null;
  let myPromise = new Promise((resolve) => {
    myresolve = resolve;
  });
  this.promisesBundleReady.push(myPromise);
  return function (bundle) {
    return myresolve(bundle);
  };
};*/

const bundlesCore = {
  "framework-bundle": "framework",
  "monitoring-bundle": "monitoring",
  "http-bundle": "http",
  "realtime-bundle": "realtime",
  "security-bundle": "security",
  "sequelize-bundle": "sequelize",
  "unittests-bundle": "unittests",
  "redis-bundle": "redis",
  "mongoose-bundle": "mongoose",
  "elastic-bundle": "elastic",
  "mail-bundle": "mail"
};

const defaultEnvEnable = {
  dev: true,
  development: true,
  prod: true,
  production: true
};

const defaultOptions = {
  events: {
    nbListeners: 60,
    captureRejections: true
  }
};

const colorLogEvent = clc.cyan.bgBlue(`EVENT KERNEL`);
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
    this.package = mypackage;
    this.debug = (!!cli.commander.opts().debug) || false;
    this.appEnvironment = null
    this.setEnv(environment);
    // Manage Kernel Container
    this.set("kernel", this);
    this.set("cli", this.cli);
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
    this.postReady = false;
    this.started = false;
    this.preRegistered = false;
    this.isCore = nodefony.isCore;
    this.settings = null;
    this.domainCheck = true;
    this.regBundle = regBundle;
    this.regBundleName = regBundleName;
    this.node_start = process.env.MODE_START || this.options.node_start;
    this.bundles = {};
    this.promisesBundleReady = [];
    this.setParameters("bundles", {});
    this.bundlesCore = bundlesCore;
    // Paths
    this.rootDir = process.cwd();
    this.path = this.rootDir;
    this.bundlesPath = path.resolve(this.rootDir, "src", "bundles");
    this.appPath = nodefony.appPath; // path.resolve(this.rootDir, "app");
    this.configPath = nodefony.kernelConfigPath; //path.resolve(this.rootDir, "config", "config.yml");
    this.generateConfigPath = path.resolve(this.rootDir, "config", "generatedConfig.yml");
    this.publicPath = path.resolve(this.rootDir, "web");
    this.nodefonyPath = this.autoLoader.dirname;
    this.cacheLink = path.resolve(this.rootDir, "tmp", "assestLink");
    this.cacheWebpack = path.resolve(this.rootDir, "tmp", "webpack");
    this.tmpDir = null;
    this.typeCluster = this.clusterIsMaster() ? "master" : "worker";
    this.cli.setKernel(this);
    try {
      // Manage Reader
      this.reader = new nodefony.Reader(this.container);
      this.set("reader", this.reader);
      // Manage Injections
      this.injection = new nodefony.Injection(this.container);
      this.set("injection", this.injection);
      this.setCli();
      this.cli.createDirectory(path.resolve(this.rootDir, "tmp"), null, (file) => {
        this.tmpDir = file;
      }, true);
      this.git = this.cli.setGitPath(this.rootDir);
      this.once("onPostReady", () => {
        if (process.getuid && process.getuid() === 0) {
          //this.drop_root();
        }
        //this.clean();
        this.postReady = true;
        switch (this.environment) {
          case 'production':
          case 'prod':
          case 'preprod':
          case 'preproduction':
            this.clean();
            break;
          default:
            this.clean();
            myrequire = null;
        }
      });
    } catch (e) {
      console.trace(e);
      throw e;
    }
  }

  clean() {
    require.cache = null;
    delete require.cache;
    myrequire.cache = null;
    delete myrequire.cache;
    myrequire = null;
  }

  drop_root() {
    try {
      process.setgid('nobody');
      process.setuid('nobody');
    } catch (e) {
      console.error(e);
      console.log('Refusing to keep the process alive as root.');
      nodefony.cli.quit(1);
    }
  }

  getLocalExternalIP() {
    return [].concat(...Object.values(os.networkInterfaces()))
      .find((details) => !details.internal);
  }

  getNetworkInterfaces() {
    const nets = os.networkInterfaces();
    const devices = Object.create(null); // or just '{}', an empty object
    for (const name of Object.keys(nets)) {
      for (const net of nets[name]) {
        if (!devices[name]) {
          devices[name] = [];
          devices[name].push(net);
        } else {
          devices[name].push(net);
        }
      }
    }
    return devices;
  }

  start() {
    if (!this.started) {
      return this.cli.showAsciify(this.projectName)
        .then(async () => {
          this.cli.showBanner();
          this.cli.blankLine();
          try {
            // config
            this.readKernelConfig();
            this.setNodeEnv(this.environment)
            // Clusters
            this.initCluster();
            // Manage Template engine
            this.initTemplate();
          } catch (e) {
            throw e;
          }
          this.started = true;
          return await this.boot()
            .catch(e => {
              throw e;
            });
        })
        .catch(async (e) => {
          throw e;
        });
    }
  }

  loadCommand() {
    try {
      return this.cli.loadCommand()
        .then((commands) => {
          if (this.debug) {
            this.displayCommand(commands);
          }
          return commands;
        });
    } catch (e) {
      this.log(e, "ERROR");
      this.terminate(e.code || 1);
      return;
    }
  }

  displayCommand(commands) {
    let table = this.cli.displayTable([], {
      head: [
        "BUNDLES",
        "COMMAND NAME"
      ]
    });
    for (let bundle in commands) {
      let cmd = commands[bundle];
      for (let command in cmd) {
        let tab = [];
        tab.push(bundle);
        tab.push(command);
        table.push(tab);
      }
    }
    this.log("\n" + table.toString(), "DEBUG");
  }

  async matchCommand() {
    try {
      return await this.cli.matchCommand();
    } catch (e) {
      throw e;
    }
  }

  setCli() {
    if (this.typeCluster === "worker") {
      this.cli.setPid();
    }
    this.cli.setProcessTitle(this.projectName);
    this.cli.setCommandVersion(this.isCore ? this.version : nodefony.projectVersion);
    //this.cli.syslog.removeAllListeners();
    this.cli.syslog.reset();
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

  getRegisteredBundles(name = null) {
    if (name) {
      const bundle = this.getBundle(name);
      if (bundle) {
        return {
          name: bundle.name,
          packageName: bundle.package.name,
          package: bundle.package,
          path: bundle.path,
          version: bundle.package.version,
          registred: true
        };
      }
      return null;
    }
    let tab = [];
    const bundles = this.getBundles();
    for (const mybundle in bundles) {
      const bundle = bundles[mybundle];
      let ob = {
        name: bundle.name,
        packageName: bundle.package.name,
        package: bundle.package,
        path: bundle.path,
        version: bundle.version,
        registred: true
      };
      tab.push(ob);
    }
    return tab;
  }

  async getUnregistredBundle(nameBundle) {
    const finder = new nodefony.Finder2({
      recurse: false,
      depth: 1
    });
    let result = await finder
      .in(this.bundlesPath)
      .then((result) => {
        if (result[0].children.length) {
          return result[0].children
            .map((bundle) => {
              const name = this.regBundleName.exec(bundle.name);
              if (name && nameBundle === name[1]) {
                return this.loadBundleUnregister(name[1], bundle);
              }
              return null;
            })
            .filter((bundle) => {
              if (bundle) {
                return bundle;
              }
            });
        }
        return null;
      })
      .catch(e => {
        this.log(e, "ERROR");
      });
    if (result.length) {
      return result[0];
    }

    const localNodefony = path.resolve(this.nodefonyPath, "bundles");
    result = await finder
      .in(localNodefony)
      .then((result) => {
        if (result[0].children.length) {
          //console.log(result[0].children)
          return result[0].children
            .map((bundle) => {
              const name = this.regBundleName.exec(bundle.name);
              if (name && nameBundle === name[1]) {
                return this.loadBundleUnregister(name[1], bundle);
              }
              return null;
            })
            .filter((bundle) => {
              if (bundle) {
                return bundle;
              }
            });
        }
        return null;
      })
      .catch(e => {
        this.log(e, "ERROR");
      });
    if (result && result.length) {
      return result[0];
    }
    return null;
  }

  loadBundleUnregister(name, bundle) {
    try {
      const mypackage = path.resolve(bundle.path, "package.json");
      const pack = require(mypackage);
      return {
        name: name, //pack.name.replace("@nodefony/", "").replace("-bundle", "").replace("Bundle", ""),
        packageName: pack.name,
        package: pack,
        path: bundle.path,
        version: pack.version,
        registred: false
      };
    } catch (e) {
      this.log(e, "WARNING")
      return false
    }

  }

  async getUnregistredBundles() {
    let tab = [];
    //unregistered
    const finder = new nodefony.Finder2({
      recurse: false,
      depth: 1
    });
    let result = await finder
      .in(this.bundlesPath)
      .then((result) => {
        if (result[0].children.length) {
          return result[0].children
            .map((bundle) => {
              const name = this.regBundleName.exec(bundle.name);
              if (name && !(name[1] in this.bundles)) {
                return this.loadBundleUnregister(name[1], bundle);
              }
              return false;
            })
            .filter((bundle) => {
              if (true) {
                return bundle;
              }
            });
        }
      })
      .catch(e => {
        this.log(e, "ERROR");
      });
    tab = tab.concat(result);

    let localNodefony = null
    if (this.isCore) {
      localNodefony = path.resolve(this.nodefonyPath, "bundles");
    } else {
      localNodefony = path.resolve(this.path, "node_modules", "@nodefony")
    }
    result = await finder
      .in(localNodefony)
      .then((result) => {
        if (result[0].children.length) {
          //console.log(result[0].children)
          return result[0].children
            .map((bundle) => {
              const name = this.regBundleName.exec(bundle.name);
              if (name) {
                return this.loadBundleUnregister(name[1], bundle);
              }
            })
            .filter((bundle) => {
              if (bundle) {
                if (!(bundle.name in this.bundles)) {
                  return bundle;
                }
              }
            });
        }
      })
      .catch(e => {
        this.log(e, "ERROR");
      });
    if (result) {
      tab = tab.concat(result);
    }
    return tab;
  }

  setEnv(environment) {
    if (environment in defaultEnvEnable) {
      switch (environment) {
        case "dev":
        case "development":
          this.environment = "dev";
          //process.env.NODE_ENV = "development";
          //process.env.BABEL_ENV = 'development';
          break;
        default:
          this.environment = "prod";
          //process.env.NODE_ENV = "production";
          //process.env.BABEL_ENV = 'production';
      }
    }
    //process.env.NODE_DEBUG = this.debug;
  }

  setNodeEnv(environment){
    if (environment in defaultEnvEnable) {
      switch (environment) {
        case "dev":
        case "development":
          process.env.NODE_ENV = "development";
          process.env.BABEL_ENV = 'development';
          break;
        default:
          process.env.NODE_ENV = "production";
          process.env.BABEL_ENV = 'production';
      }
    }
    process.env.NODE_DEBUG = this.debug;
  }

  logEnv() {
    let txt = `      \x1b ${this.cli.clc.blue(this.type)} `;
    txt += ` ${this.cli.clc.magenta('Cluster')} : ${this.typeCluster} `;
    txt += ` ${this.cli.clc.magenta('Nodefony Environment')} : ${this.environment}  `;
    if (this.appEnvironment) {
      txt += ` ${this.cli.clc.magenta('App Environment')} : ${this.appEnvironment.environment}  `;
    }
    txt += ` ${this.cli.clc.magenta('Debug')} : ${this.debug}\n`;
    return txt;
  }

  readKernelConfig() {
    try {
      if (path.basename(this.configPath) === "config.js") {
        this.settings = this.autoLoader.load(this.configPath, true);
      } else {
        this.settings = nodefony.kernelConfig;
      }
      this.settings.name = "NODEFONY";
      this.settings.version = this.version;
      this.settings.environment = this.environment;
      this.settings.debug = this.debug;
      this.setParameters("kernel", this.settings);
      this.httpPort = this.settings.system.httpPort || null;
      this.httpsPort = this.settings.system.httpsPort || null;
      this.domain = this.settings.system.domain || null;
      this.hostname = this.settings.system.domain || null;
      this.hostHttp = this.hostname + ":" + this.httpPort;
      this.hostHttps = this.hostname + ":" + this.httpsPort;
      this.domainAlias = this.settings.system.domainAlias;
      this.domainCheck = this.settings.system.domainCheck;
      this.initializeLog();
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
      this.log(e, "ERROR");
      throw e;
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
      return path.resolve(this.rootDir, myPath);
    }
  }

  getConfigBunbles() {
    let config = [];
    if (this.settings && this.settings.system && this.settings.system.bundles) {
      for (let bundle in this.settings.system.bundles) {
        let res = null;
        try {
          res = this.searchPackage(bundle, this.settings.system.bundles[bundle]);
          config.push(res);
        } catch (e) {
          this.log(e, "WARNING");
          continue;
        }
      }
    }
    return config;
  }

  checkBundlesExist(yml, nameConfig, pathConfig, remove) {
    if (yml && yml.system && yml.system.bundles) {
      for (let bundle in yml.system.bundles) {
        let exist = null;
        try {
          exist = this.searchPackage(bundle, yml.system.bundles[bundle]);
        } catch (e) {
          this.log(e, "WARNING");
        }
        if (!exist) {
          delete yml.system.bundles[bundle];
          if (remove) {
            try {
              fs.writeFileSync(pathConfig, yaml.dump(yml), {
                encoding: 'utf8'
              });
              this.log(nameConfig + " : " + bundle + " Bundle don't exist in file : " + pathConfig, "WARNING");
              this.log("Update Config  : " + pathConfig);
            } catch (e) {
              this.log(e, "ERROR");
            }
          } else {
            let error = new Error(nameConfig + " : " + bundle + " Bundle don't exist in file : " + pathConfig);
            this.log(error, "ERROR");
            this.log("Config file : " + pathConfig);
            this.log(yml.system.bundles);
          }
          try {
            let link = path.resolve(this.publicPath, bundle);
            let stat = fs.lstatSync(link);
            if (stat) {
              exist = fs.existsSync(fs.readlinkSync(link));
              if (!exist) {
                fs.unlinkSync(link);
                this.log("REMOVE LINK : " + link);
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
      throw e;
    }
  }

  searchPackage(name, mypath) {
    let res = null;
    let error = null;
    if (mypath && mypath !== "*") {
      try {
        res = regPackageFile.exec(mypath);
        if (res) {
          mypath = res[1];
        } else {
          try {
            if (this.cli.checkVersion(mypath)) {
              if (myrequire) {
                try {
                  res = myrequire.resolve(`${name}`);
                  let version = myrequire(path.resolve(path.dirname(res), "package.json")).version;
                  if (version === mypath) {
                    if (this.type === "SERVER") {
                      this.log(`Find NPM Bundle Package : ${name}@${mypath} in : ${res}`, "DEBUG");
                    }
                    return `${name}`;
                  } else {
                    throw new Error(`Can not found NPM Bundle Package : ${name}@${mypath}`);
                  }
                } catch (e) {
                  error = e;
                }
              }
              try {
                res = require.resolve(`${name}`);
                let version = myrequire(path.resolve(path.dirname(res), "package.json")).version;
                if (version === mypath) {
                  if (this.type === "SERVER") {
                    this.log(`Find NPM Bundle Package : ${name}@${mypath} in : ${res}`, "DEBUG");
                  }
                  return `${name}`;
                } else {
                  throw new Error(`Can not found NPM Bundle Package : ${name}@${mypath}`);
                }
              } catch (e) {
                if (error) {
                  throw error;
                }
                throw e;
              }
            } //
          } catch (e) {}
        }
        res = null;
        res = this.checkPath(mypath);
        if (myrequire) {
          try {
            myrequire.resolve(res);
            if (this.type === "SERVER") {
              this.log(`Find Local Bundle Package : ${name} in : ${res}`, "DEBUG");
            }
            return res;
          } catch (e) {}
        }
        try {
          require.resolve(res);
        } catch (e) {
          // no main in package.json
          let bundleName = this.getBundleName(name);
          if (bundleName) {
            try {
              require.resolve(path.resolve(res, bundleName + "Bundle.js"));
            } catch (e) {
              this.log(e, "ERROR");
              throw new Error(`${name} is not a Bundle Package`);
            }
          } else {
            throw new Error(`${name} is not a Bundle Package`);
          }
        }
        if (this.type === "SERVER") {
          this.log(`Find Local Bundle Package : ${name} in : ${res}`, "DEBUG");
        }
        return res;
      } catch (e) {
        if (error) {
          throw error;
        }
        throw e;
      }
    }
    if (!this.isCore) {
      if (myrequire) {
        try {
          res = myrequire.resolve(name);
          this.log(`Find NPM Bundle Package : ${name} in : ${res}`, "DEBUG");
          return name;
        } catch (e) {}
        try {
          res = myrequire.resolve(`@nodefony/${name}`);
          this.log(`Find NPM Bundle Package : ${name} in : ${res}`, "DEBUG");
          return `@nodefony/${name}`;
        } catch (e) {}
      }
      try {
        res = require.resolve(name);
        this.log(`Find NPM Bundle Package : ${name} in : ${res}`, "DEBUG");
        return name;
      } catch (e) {}
      try {
        res = null;
        res = path.resolve(this.nodefonyPath, "bundles", name);
        require.resolve(res);
        if (this.type === "SERVER") {
          this.log(`Find Core Bundle Package : ${name} in : ${res}`, "DEBUG");
        }
        return res;
      } catch (e) {}
      try {
        res = null;
        res = require.resolve(`@nodefony/${name}`);
        if (this.type === "SERVER") {
          this.log(`Find NPM Bundle Package : @nodefony/${name} in : ${res}`, "DEBUG");
        }
        return `@nodefony/${name}`;
      } catch (e) {}
    }
    try {
      res = null;
      res = path.resolve(this.rootDir, "src", "bundles", name);
      require.resolve(res);
      if (this.type === "SERVER") {
        this.log(`Find Local Bundle Package : ${name} in : ${res}`, "DEBUG");
      }
      return res;
    } catch (e) {}
    try {
      res = null;
      res = path.resolve(this.nodefonyPath, "bundles", name);
      require.resolve(res);
      if (this.type === "SERVER") {
        this.log(`Find Core Bundle Package : ${name} in : ${res}`, "DEBUG");
      }
      return res;
    } catch (e) {}
    try {
      res = null;
      res = path.resolve(this.nodefonyPath, '..', '..', "src", "bundles", name);
      require.resolve(res);
      if (this.type === "SERVER") {
        this.log(`Find Core Local Bundle Package : ${name} in : ${res}`, "DEBUG");
      }
      return res;
    } catch (e) {}
    try {
      res = null;
      const globalPath = path.resolve(process.execPath, '..', '..', 'lib', 'node_modules', "nodefony", "bundle");
      res = path.resolve(globalPath, `@nodefony/${name}`);
      require.resolve(res);
      if (this.type === "SERVER") {
        this.log(`Find Global Core Bundle Package : @nodefony/${name} in : ${res}`, "DEBUG");
      }
      return res;
    } catch (e) {}
    try {
      res = null;
      const globalPath = path.resolve(process.execPath, '..', '..', 'lib', 'node_modules', "nodefony", 'node_modules');
      res = path.resolve(globalPath, `@nodefony/${name}`);
      require.resolve(res);
      if (this.type === "SERVER") {
        this.log(`Find Global Bundle Package : @nodefony/${name} in : ${res}`, "DEBUG");
      }
      return res;
    } catch (e) {
      if (error) {
        throw error;
      }
      return require.resolve(name);
    }
  }

  /**
   *  @method boot
   */
  async boot() {
    /*
     *  BUNDLES
     */
    this.configBundle = this.getConfigBunbles();
    let bundles = [];
    let res = null;
    try {
      res = this.searchPackage("http-bundle");
      bundles.push(res);
      res = this.searchPackage("framework-bundle");
      bundles.push(res);
      if (this.settings.system.security) {
        res = this.searchPackage("security-bundle");
        bundles.push(res);
      }
      /*if (this.settings.system.documentation) {
        res = this.searchPackage("documentation-bundle");
        bundles.push(res);
      }*/
      switch (this.settings.orm) {
        case "sequelize":
          res = this.searchPackage("sequelize-bundle");
          bundles.push(res);
          break;
        case "mongoose":
          res = this.searchPackage("mongoose-bundle");
          bundles.push(res);
          break;
        default:
          let error = new Error("nodefony can't load ORM : " + this.settings.orm);
          this.log(error, "ERROR");
          throw error;
      }
      if (this.settings.system.realtime) {
        res = this.searchPackage("realtime-bundle");
        bundles.push(res);
      }
      if (this.settings.system.unitTest || this.type === "CONSOLE") {
        res = this.searchPackage("unittests-bundle");
        bundles.push(res);
      }
      if (this.settings.system.redis) {
        res = this.searchPackage("redis-bundle");
        bundles.push(res);
      }
      if (this.settings.system.mongo) {
        res = this.searchPackage("mongo-bundle");
        bundles.push(res);
      }
      if (this.settings.system.elastic) {
        res = this.searchPackage("elastic-bundle");
        bundles.push(res);
      }
      if (this.settings.system.mail) {
        res = this.searchPackage("mail-bundle");
        bundles.push(res);
      }
      if (this.settings.system.monitoring) {
        res = this.searchPackage("monitoring-bundle");
        bundles.push(res);
      }
    } catch (e) {
      this.log(e, "ERROR");
      this.terminate(1);
    }
    try {
      if (this.settings.system.demo) {
        res = this.searchPackage("demo-bundle");
        bundles.push(res);
      }
    } catch (e) {
      this.log(e, "ERROR");
    }

    switch (this.isInstall()) {
      case "install":
        return await this.install(bundles)
          .catch(e => {
            throw e;
          });
      case "rebuild":
        return await this.rebuild(bundles)
          .catch(e => {
            throw e;
          });
      default:
        return await this.preRegister(bundles)
          .then(() => {
            return this;
          })
          .catch(e => {
            throw e;
          });
    }
  }

  async install(coreBundles = []) {
    let bundles = coreBundles.concat(this.configBundle, [this.appPath]);
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
            this.log(e, "ERROR");
            continue;
          }
        }
        if (this.isCore) {
          await this.cli.installPackage(bundleFile, "development");
        } else {
          let dir = path.basename(bundleFile.dirName);
          if (!this.isBundleCore(dir)) {
            await this.cli.installPackage(bundleFile, "development");
          }
        }
      }
      return await this.preRegister(coreBundles)
        .catch(e => {
          throw e;
        });
    } catch (e) {
      this.log(e, "ERROR");
      throw e;
    }
  }

  async rebuild(coreBundles) {
    let bundles = coreBundles.concat(this.configBundle, [this.appPath]);
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
            this.log(e, "ERROR");
            continue;
          }
        }
        await this.cli.rebuildPackage(bundleFile, "production");
      }
      return await this.preRegister(coreBundles)
        .catch(e => {
          throw e;
        });
    } catch (e) {
      this.log(e, "ERROR");
      throw e;
    }
  }

  async preRegister(bundles) {
    try {
      //this.fire("onPreRegister", this);
      await this.emitAsync("onPreRegister", this)
      .catch(e => {
        throw e
      })
      this.preRegistered = true;
      return await this.registerBundles(bundles)
        .then(async (res) => {
          this.preboot = true;
          //this.fire("onPreBoot", this);
          await this.emitAsync("onPreBoot", this);
          this.log(res, "DEBUG", "REGISTER BUNDLES");
          return await this.registerBundles(this.configBundle)
            .then(async (res) => {
              if (res.length) {
                this.log(res, "DEBUG", "REGISTER BUNDLES");
              }
              //this.fire("onRegister", this);
              await this.emitAsync("onRegister", this);
              return await this.initializeBundles()
                .catch(e => {
                  throw e
                })
            })
            .catch(e => {
              throw e
            })
        })
        .catch(e => {
          throw e;
        });
    } catch (e) {
      this.log(e,"ERROR");
      throw e
    }
  }

  async onReady() {
    return new Promise((resolve, reject) => {
      //process.nextTick(() => {
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
        this.log(e, "ERROR");
        return reject(e);
      }
    });
    //});
  }

  /**
   *  initialisation  all bundles
   *  @method initializeBundles
   */
  async initializeBundles() {
    let tab = [];
    try {
      this.app = await this.initApplication();
      await this.emitAsync("onPostRegister", this);
    } catch (e) {
      this.log(e, "ERROR");
      throw e;
    }
    // INITIALIZE
    try {
      await this.emitAsync("onInitialize", this);
    } catch (e) {
      this.log(e, "WARNING", "EVENTS onBoot");
      throw e;
    }
    for (let name in this.bundles) {
      this.log("\x1b[36m INITIALIZE Bundle :  " + name.toUpperCase() + "\x1b[0m", "DEBUG");
      try {
        tab.push(await this.bundles[name].initialize());
      } catch (e) {
        //this.log(e, "ERROR");
        throw e
        //continue;
      }
    }

    // BOOT
    tab.length = 0;
    try {
      //this.fire("onBoot", this, tab);
      await this.emitAsync("onBoot", this, tab);
    } catch (e) {
      this.log(e, "WARNING", "EVENTS onBoot");
      throw e;
    }
    this.booted = true;

    for (let name in this.bundles) {
      this.log("\x1b[36m BOOT Bundle :  " + name.toUpperCase() + "\x1b[0m", "DEBUG");
      try {
        tab.push(await this.bundles[name].boot());
      } catch (e) {
        this.log(e, "ERROR");
        //continue;
        throw e;
      }
    }
    if (this.console) {
      await this.loadCommand();
    } else {
      await this.cli.assetInstall();
      /*if (!fs.existsSync(this.cacheLink)) {
        try {
          fs.mkdirSync(this.cacheLink);
          this.cli.assetInstall();
        } catch (e) {
          this.log(e, "WARNING");
        }
      }*/
    }

    /*let bundles = [];
    for await (let boot of this.promisesBundleReady) {
      this.log(`End Waiting Bundle Ready  ${boot.name}`, "DEBUG");
      bundles.push(boot);
    }*/
    //await this.emitAsync("onReady", this, tab);
    try {
      //this.fire("onReady", this, bundles);
      await this.emitAsync("onReady", this, tab);
    } catch (e) {
      this.log(e, "WARNING", "EVENTS onReady");
      throw e
    }
    this.ready = true;

    if (this.console) {
      return this.matchCommand()
        .then((command) => {
          let name = command;
          if (command && command.name) {
            name = command.name;
          }
          this.log(`${this.cli.getEmoji("checkered_flag")}`, "INFO", `Command ${name}`);
          return command;
        })
        .catch((error) => {
          //this.log(error, "ERROR", `COMMAND`);
          throw error;
        });
    }
    return await this.onReady()
      .then(async () => {
        await this.emitAsync("onPostReady", this);
        return this;
      })
      .catch((error) => {
        this.log(error, "CRITIC");
      });
  }

  getOrm() {
    return this.settings.orm;
  }

  getOrmStrategy() {
    return this.getORM().settings.strategy;
  }

  getORM() {
    return this.get(this.getOrm());
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
      this.log(e, "ERROR");
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
    if (this.console && this.cli && this.cli.commander && this.cli.commander.opts().json) {
      return;
    }
    if (cluster.isMaster) {
      console.log(this.logEnv());
      this.fire("onCluster", "MASTER", this, process);
    } else if (cluster.isWorker) {
      console.log(this.logEnv());
      this.workerId = cluster.worker.id;
      this.worker = cluster.worker;
      this.fire("onCluster", "WORKER", this, process);
      //process.on("message", this.listen(this, "onMessage"));
      process.on("message", (msg) => {
        this.fire("onMessage", msg);
      });
    }
    if (nodefony.warning) {
      this.log(nodefony.warning, "WARNING");
    }
  }

  fire() {
    this.log(`${colorLogEvent} ${arguments[0]}`, "DEBUG");
    return super.fire.apply(this, arguments);
  }

  emit() {
    this.log(`${colorLogEvent} ${arguments[0]}`, "DEBUG");
    return super.fire.apply(this, arguments);
  }

  emitAsync() {
    this.log(`${colorLogEvent} ${arguments[0]}`, "DEBUG");
    return super.emitAsync.apply(this, arguments);
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
      return this.cli.initSyslog(this.environment, this.debug);
    }
    if (!this.settings.system.log.active) {
      return;
    }
    if (this.debug) {
      this.debug = this.settings.system.log.debug || true;
    }
    return this.cli.initSyslog(this.environment, this.debug);
  }

  /**
   *  @method getTemplate
   */
  getTemplate(name) {
    return nodefony.templates[name];
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
   *  @method log
   */
  log(pci, severity, msgid, msg) {
    if (!msgid) {
      msgid = this.cli.clc.magenta("KERNEL");
    }
    return super.log(pci, severity, msgid, msg);
  }

  /**
   *  get bundle instance
   *  @method getBundle
   *  @param {String} name
   */
  getBundle(name) {
    this.regBundleName.test(name);
    let res = regBundleName.exec(name);
    if (res) {
      name = res[1];
    }
    if (name === "App" || name === "app") {
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
        this.log(`${bundle.name} : ${file.path}`, "DEBUG", "LOADER BUNDLE");
        this.bundles[bundle.name] = new bundle.class(bundle.name, this, this.container);
        this.bundles[bundle.name].loader = loader;
        //console.log(bundle.name, this.notificationsCenter._events)
      } catch (e) {
        throw e;
      }
      //this.bundles[bundle.name].once("onReady", promiseBundleReady.call(this));
      return this.bundles[bundle.name];
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
      return "install";
    }
    if (this.cli.command === "nodefony" &&
      this.cli.task === "build"
    ) {
      return "install";
    }
    if (this.cli.command === "nodefony" &&
      this.cli.task === "rebuild"
    ) {
      return "rebuild";
    }
    if (this.cli.command === "nodefony" &&
      this.cli.task === "install") {
      return "install";
    }
    if (this.cli.command === "install") {
      this.cli.command = "nodefony";
      this.cli.task = "install";
      return "install";
    }
    return false;
  }

  async isBundleDirectory(dir) {
    let directory = this.isPathExist(dir);
    if (directory) {
      let finder = new nodefony.Finder2({
        followSymLink: true,
        excludeDir: nodefony.Bundle.excludeDir(),
        exclude: nodefony.Bundle.exclude(),
        recurse: false,
        match: this.regBundle
      });
      let result = await finder.in(directory);
      return result.getFiles();
    }
    return false;
  }

  isNodeModule(module) {
    //console.log(module)
    let error = null;
    try {
      return require.resolve(module);
    } catch (e) {
      //this.log(e, "ERROR");
      error = e;
    }
    try {
      return myrequire.resolve(module);
    } catch (e) {
      this.log(e, "ERROR");
      return false;
    }
  }

  /**
   *  register Bundle
   *  @method
   *  @param {array} bundles
   */
  registerBundles(bundles) {
    return new Promise(async (resolve, reject) => {
      switch (nodefony.typeOf(bundles)) {
        case "array":
          try {
            for (let i = 0; i < bundles.length; i++) {
              let Path = await this.isBundleDirectory(bundles[i]);
              if (Path && Path.length) {
                try {
                  let bundle = this.loadBundle(Path[0], "filesystem");
                  await bundle.find();
                } catch (e) {
                  this.log(e, "ERROR");
                  throw e
                }
              } else {
                try {
                  Path = this.isNodeModule(bundles[i]);
                  if (Path) {
                    let bundle = this.loadBundle(Path, "package");
                    await bundle.find();
                  } else {
                    this.log("GLOBAL CONFIG REGISTER : ", "INFO");
                    this.log(this.configBundle, "INFO");
                    let gene = this.readGeneratedConfig();
                    if (gene) {
                      this.log("GENERATED CONFIG REGISTER file ./config/GeneratedConfig.yml : ", "INFO");
                      this.log(gene, "INFO");
                    }
                  }
                } catch (e) {
                  this.log(e, "ERROR");
                  throw e
                }
              }
            }
            return resolve(bundles);
          } catch (e) {
            return reject(e)
          }
        default:
          return reject(new Error("registerBundles argument bundles must be an array "));
      }
    });
  }

  /**
   *  initialisation application bundle
   *  @method initApplication
   */
  async initApplication() {
    let app = class appBundle extends nodefony.Bundle {
      constructor(name, myKernel, myContainer) {
        super(name, myKernel, myContainer);
      }
    };
    app.prototype.path = this.appPath;
    app.prototype.autoLoader = this.autoLoader;
    app.prototype.settings = this.settings;
    this.bundles.app = new app("app", this, this.container);
    await this.bundles.app.find();
    // OVERRIDE VIEWS BUNDLE in APP DIRECTORY
    this.once("onBoot", async () => {
      for (let bundle in this.bundles) {
        if (bundle === "app") {
          continue;
        }
        let result = this.bundles.app.resourcesFiles.find(bundle + "-bundle");
        if (result.length) {
          try {
            this.bundles[bundle].registerI18n(null, result);
          } catch (e) {
            this.log(e, "ERROR");
          }
        }
      }
    });
    return this.bundles.app;
  }

  // CONFIG
  readConfigFile(bundle, Path, callback) {
    try {
      this.log(bundle + " CONFIG LOAD FILE :" + Path, "DEBUG", "KERNEL READER");
      return this.reader.readConfig(Path, this.name, callback);
    } catch (e) {
      this.log(e, "ERROR", "BUNDLE " + bundle + " CONFIG :" + Path);
      throw e
    }
  }
  readRoutingFile(bundle, Path) {
    // ROUTING
    try {
      this.log(bundle + " ROUTER LOAD FILE :" + Path, "DEBUG", "KERNEL READER");
      let router = this.get("router");
      if (router) {
        return router.reader(Path, this.name);
      } else {
        this.log(bundle + " Router service not ready to LOAD FILE :" + Path, "WARNING", "KERNEL READER");
      }
    } catch (e) {
      this.log(e, "ERROR", "BUNDLE " + this.name.toUpperCase() + " CONFIG ROUTING :" + Path);
      throw e
    }
  }
  readServicesFile(bundle, Path, callback) {
    try {
      this.log(bundle + " LOAD FILE :" + Path, "DEBUG", "KERNEL READER");
      return this.get("injection").reader(Path, this.name);
    } catch (e) {
      this.log(e, "ERROR", "BUNDLE " + this.name.toUpperCase() + " CONFIG SERVICE :" + Path);
      throw e
    }
  }

  readSecurityFile(bundle, Path, callback) {
    try {
      let firewall = this.get("security");
      if (firewall) {
        this.log(bundle + " SECURITY LOAD FILE :" + Path, "DEBUG", "KERNEL READER");
        return firewall.reader(Path, this.name);
      } else {
        this.log(bundle + " SECURITY LOAD FILE :" + Path + " BUT SERVICE NOT READY", "WARNING");
      }
    } catch (e) {
      this.log(e, "ERROR", "BUNDLE " + this.name.toUpperCase() + " CONFIG SECURITY :" + Path);
      throw e
    }
  }

  findConfigFile(ele, callback) {
    let name = this.name.toUpperCase();
    switch (true) {
      case /^config\..*$/.test(ele.name):
        try {
          return this.kernel.readConfigFile.call(this, name, ele.path, callback)
        } catch (e) {
          throw e
        }
      case /^routing\..*$/.test(ele.name):
        try {

          return this.kernel.readRoutingFile.call(this, name, ele.path, callback)
        } catch (e) {
          throw e
        }
      case /^services\..*$/.test(ele.name):
        try {
          return this.kernel.readServicesFile.call(this, name, ele.path, callback)
        } catch (e) {
          throw e
        }
      case /^security\..*$/.test(ele.name):
        try {
          return this.kernel.readSecurityFile.call(this, name, ele.path, callback)
        } catch (e) {
          throw e
        }
    }
  }

  /**
   *
   *  @method readConfig
   */
  readConfig(error, result, callback) {
    if (error) {
      throw error
    } else {
      if (!result) {
        throw new Error(`readConfig no result found`);
      }
      result.forEach((ele) => {
        try {
          this.kernel.findConfigFile.call(this, ele, callback)
        } catch (e) {
          throw e
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
          this.log((message || ele) + " ( Resident Set Size ) PID ( " + this.processId + " ) : " + nodefony.cli.niceBytes(memory[ele]), "DEBUG", "MEMORY " + ele);
          break;
        case "heapTotal":
          this.log((message || ele) + " ( Total Size of the Heap ) PID ( " + this.processId + " ) : " + nodefony.cli.niceBytes(memory[ele]), "DEBUG", "MEMORY " + ele);
          break;
        case "heapUsed":
          this.log((message || ele) + " ( Heap actually Used ) PID ( " + this.processId + " ) : " + nodefony.cli.niceBytes(memory[ele]), "DEBUG", "MEMORY " + ele);
          break;
        case "external":
          this.log((message || ele) + " PID ( " + this.processId + " ) : " + nodefony.cli.niceBytes(memory[ele]), "DEBUG", "MEMORY " + ele);
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
  async terminate(code) {
    if (code === undefined) {
      code = 0;
    }
    if (this.debug) {
      console.trace(`terminate : ${code}`);
    }
    try {
      if (fs.existsSync(this.cacheLink)) {
        try {
          fs.rmdirSync(this.cacheLink);
        } catch (e) {
          this.log(e, "WARNING");
        }
      }
      await this.fireAsync("onTerminate", this, code);
    } catch (e) {
      this.log(e, "ERROR");
      code = 1;
    }
    process.nextTick(() => {
      this.log("NODEFONY Kernel Life Cycle Terminate CODE : " + code, "INFO");
      try {
        nodefony.cli.quit(code);
      } catch (e) {
        this.log(e, "ERROR");
      }
    });
    return code;
  }
}

nodefony.kernel = Kernel;
nodefony.Kernel = Kernel;
module.exports = Kernel;
