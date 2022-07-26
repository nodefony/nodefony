const Module = require("module");

const colorLogEvent = clc.cyan.bgBlue(`EVENT BUNDLE`);
const regFixtures = /^(\w+)Fixtures.js$/;
const regController = /^(\w+)Controller\.[m]?js$/;
const regClassController = /^(\w+)Controller$/;
const regService = /^(\w+)Service.[ej]s[6]?$/;
const regCommand = /^(\w+)Command.js$/;
const regEntity = /^(\w+)Entity.js$/;
const regI18nFile = /^(.*)\.(.._..)\.(.*)$/;
const regConfigFile = /^(.*)\..*$/;
const regRoutingFile = /^(routing)\..*$/;
const regWebpackCongig = /^(webpack)\.(dev\.|prod\.)?config\.js$/;

const checkIngnoreFile = function (string, basename) {
  let file = null;
  try {
    file = new nodefony.fileClass(string);
  } catch (e) {
    if (basename.match(/^\./)) {
      return true;
    }
    return false;
  }
  if (basename.match(/^\./)) {
    return true;
  }
  if (file.type === "Directory") {
    return "Directory";
  }
  return false;
};

const moduleFindDependencies = class moduleFindDependencies {
  constructor(Path, type, bundle) {
    this.container = {};
    this.bundle = bundle;
    this.childs = [];
    this.type = type;
    switch (type) {
    case "controller":
      this.path = this.bundle.controllersPath;
      this.reg = regController;
      this.loader = this.bundle.loadController;
      break;
    case "routing":
      this.path = this.bundle.configPath;
      this.reg = regRoutingFile;
      this.loader = this.bundle.reloadRouting;
      break;
    case "service":
      this.path = this.bundle.servicesPath;
      this.reg = regService;
      this.loader = this.bundle.reloadService;
      break;
    default:
      throw new Error("moduleFindDependencies type not valid : " + type);
    }
    this.cache = Module._cache;
    if (Path) {
      this.findRequire(Path);
    }
  }
  set(ele, val) {
    return this.container[ele] = val;
  }
  get(ele) {
    return this.container[ele];
  }
  setChild(path) {
    this.childs.push(path);
  }
  length() {
    return Object.keys(this.container).length;
  }
  findRequire(Path, check) {
    if (check === undefined) {
      check = true;
    }
    for (let module in this.cache) {
      if (this.cache[module].filename.indexOf(this.path) >= 0) {
        let basename = path.basename(this.cache[module].filename);
        if (check && this.cache[module].filename.indexOf(Path) >= 0) {
          if (path.basename(Path) === basename) {
            this.setChild(this.cache[module].filename);
          }
        }
        if (this.cache[module].children.length) {
          for (let child in this.cache[module].children) {
            if (this.cache[module].children[child].filename.indexOf(Path) >= 0) {
              let res = this.reg.exec(basename);
              if (res) {
                this.set(res[1], this.cache[module].filename);
                return this;
              } else {
                this.setChild(this.cache[module].filename);
                return this.findRequire(this.cache[module].filename, false);
              }
            }
          }
        }
      }
    }
    return this;
  }
  reload() {
    if (this.length()) {
      for (let i = 0; i < this.childs.length; i++) {
        this.bundle.log("Reload " + this.type + " Dependency : " + this.childs[i]);
        this.bundle.loadFile(this.childs[i], true);
      }
      for (let control in this.container) {
        this.loader.call(this.bundle, control, this.container[control], true);
      }
    }
  }
};

const defaultWatcher = function (reg /*, settings*/ ) {
  return {
    ignoreInitial: true,
    ignored: [
      (string) => {
        let basename = path.basename(string);
        let file = checkIngnoreFile(string, basename);
        if (file === true) {
          return true;
        }
        if (file === "Directory") {
          return false;
        }
        if (basename.match(reg)) {
          return false;
        }
        return true;
      }
    ],
    cwd: this.path
  };
};


const defaultOptions = {
  events: {
    nbListeners: 60,
    captureRejections: true
  }
};
/*
 *  BUNDLE CLASS
 */
class Bundle extends nodefony.Service {
  constructor(name, kernel, container) {
    super(name, container, null, nodefony.extend(true, {}, defaultOptions));
    this.log("\x1b[36m REGISTER BUNDLE : " + this.name + "   \x1b[0m", "DEBUG", this.kernel.cli.clc.magenta("KERNEL"));
    this.bundleName = path.basename(this.path);
    this.location = path.dirname(this.path);
    this.publicPath = path.resolve(this.path, "Resources", "public");
    this.environment = this.kernel.environment;
    this.waitBundleReady = false;
    this.setParameters("bundles." + this.name, this.getParameters("bundles." + this.name) || {});
    this.production = (this.kernel.environment === "prod") ? true : false;
    this.package = require(path.resolve(this.path, "package.json"));
    this.version = this.package.version;
    this.packageName = this.package.name;
    this.isCore = this.kernel.isBundleCore(this.name);

    // services
    this.injectionService = this.get("injection");
    this.reader = this.kernel.reader;

    // webpack
    this.webPackConfig = null;
    this.webpackWatch = false;
    this.webpackCompiler = null;
    this.webPackConfig = null;
    this.watching = null;

    // config
    this.regConfigFile = regConfigFile;
    this.configPath = path.resolve(this.path, "Resources", "config");
    //views
    this.views = {};
    this.views["."] = {};
    this.watcherView = null;
    // views
    this.serviceTemplate = this.get("templating");
    this.regTemplateExt = new RegExp("^(.+)\." + this.serviceTemplate.extention + "$");
    this.viewsPath = path.resolve(this.path, "Resources", "views");

    // controllers
    this.controllersPath = path.resolve(this.path, "controller");
    this.controllers = {};
    this.watcherController = null;
    this.regController = regController;

    // I18n

    this.locale = this.kernel.settings.system.locale;
    this.i18nPath = path.resolve(this.path, "Resources", "translations");
    this.watcherI18n = null;
    this.regI18nFile = regI18nFile;

    // Register Service
    this.servicesPath = path.resolve(this.path, "services");
    this.watcherServices = null;
    this.regService = regService;

    // others
    this.entities = {};
    this.fixtures = {};
    this.regRoutingFile = regRoutingFile;
    this.regWebpackCongig = regWebpackCongig;

    try {
      this.finder = new nodefony.Finder2({
        exclude: nodefony.Bundle.exclude(),
        excludeDir: nodefony.Bundle.excludeDir(),
        recurse: true
      });
    } catch (e) {
      throw e;
    }
    // KERNEL EVENTS
    this.kernel.prependOnceListener("onBoot", async () => {
      try {
        this.router = this.get("router");
        this.sockjs = this.get("sockjs");
        //this.orm = this.get("orm");
        //console.log("PASSS",this.orm)
        this.webpackService = this.get("webpack");
        this.translation = this.get("translation");
        // Register internationalisation
        if (this.translation) {
          this.locale = this.translation.defaultLocale;
        }
        // I18n
        this.i18nFiles =  await this.findI18nFiles();

        // Register Entity
        await this.registerEntities();

        // WATCHERS
        if (this.kernel.environment === "dev" && this.settings.watch && this.kernel.type !== "CONSOLE") {
          this.initWatchers();
        }
      } catch (e) {
        throw e;
      }
    });

    this.kernel.once("onPostReady", async () => {
      switch(this.kernel.environment){
        case 'production':
        case 'prod':
        case 'preprod':
        case 'preproduction':
          this.clean();
          break;
      }
    });
    // BUNDLE EVENTS
    this.register()
  }

  async register(){
    return await this.emitAsync("onRegister", this);
  }

  static excludeDir() {
    return /^public$|^node_modules$|^clones$|^\.git|assets$|tmp$|doc$|build$|css$|scss$|public$/;
  }
  static exclude() {
    return /yarn.lock$|package-lock.json$|yarn-error.log$|package.json$/;
  }

  async initialize() {
    // Register services before boot
    return await this.registerServices()
      .then(async (results) => {
        let dir = null;
        if (this.name === "app") {
          dir = this.findResult;
          this.configPath = path.resolve(this.path, "config");
        } else {
          dir = this.resourcesFiles;
        }
        // config
        let conf = dir.find("config")[0];
        if (conf) {
          this.kernel.readConfig.call(this, null, conf.children, (result) => {
            //console.log(result)
            this.parseConfig(result);
          });
        } else {
          throw new Error("Bundle must have config directory");
        }
        //EVENT BOOT BUNDLE
        await this.emitAsync("onInitialize", this);
        return results;
      });
  }

  async find() {
    return this.findResult = await this.finder
      .in(this.path)
      .then((result) => {
        //this.log(result[0].children.length ,'WARNING', `FINDER ${this.name}`);
        this.resourcesFiles = result[0].children.find("Resources");
        return result[0].children;
      })
      .catch(e => {
        this.log(e, "ERROR");
      });
  }

  boot() {
    return new Promise(async (resolve, reject) => {
      try {
        //EVENT BOOT BUNDLE
        await this.emitAsync("onBoot", this);
        // finder controller
        await this.findControllerFiles();
        // finder views
        await this.findViewFiles();
        // I18N
        await this.registerI18n(this.locale);
        // Register Controller
        await this.registerControllers();
        // Register Views
        await this.registerViews();
        if (this.kernel.type === "CONSOLE") {
          await this.registerFixtures();
        }
      } catch (e) {
        return reject(e);
      }
      if (this.waitBundleReady === false) {
        await this.emitAsync("onReady", this);
      }
      return resolve(this);
    });
  }

  clean() {
    this.log(`CLEAN MEMORY BUNDLE :  ${this.name}`);
    this.findResult = null;
    delete this.findResult;
    this.webPackConfig = null;
    delete this.webPackConfig;
    this.webpackCompiler = null;
    delete this.webpackCompiler;
    this.watching = null;
    delete this.watching;
    this.viewFiles = null;
    delete this.viewFiles;
    //this.i18nFiles = null;
    //delete this.i18nFiles;
    this.controllerFiles = null;
    delete this.controllerFiles;
    this.commandFiles = null;
    delete this.commandFiles;
    this.resourcesFiles = null;
    delete this.resourcesFiles;
    this.fixtureFiles = null;
    delete this.fixtureFiles;
    this.entityFiles = null;
    delete this.entityFiles;
  }

  emitAsync() {
    this.log(`${colorLogEvent} ${arguments[0]}`, "DEBUG");
    return super.emitAsync.apply(this, arguments);
  }

  initWebpack() {
    try {
      return this.findWebPackConfig()
        .then((compiler) => {
          if (!this.watching || this.kernel.environment === "prod") {
            if (this.kernel.cli.command === "webpack") {
              return Promise.resolve(compiler);
            }
            if (this.kernel.isCore || !this.isCore) {
              this.log(`MEMORY clean webpack compile bundle : ${this.name}`, "DEBUG");
            }
            this.webPackConfig = null;
            delete this.webPackConfig;
            this.webpackCompiler = null;
            delete this.webpackCompiler;
            return Promise.resolve(compiler);
          }
        })
        .catch((e) => {
          this.log(e, "ERROR");
          throw e;
        });
    } catch (e) {
      this.log(e, "ERROR");
      throw e;
    }
  }

  compileWebpack() {
    return new Promise((resolve, reject) => {
      if (this.webpackCompiler) {
        try {
          return this.webpackService.runCompiler(this.webpackCompiler, this.name + "_" + this.webpackCompiler.name, this.name, this.webpackCompiler.name)
            .catch(e => {
              return reject(e);
            });
        } catch (e) {
          return reject(e);
        }
      }
      return resolve();
    });
  }

  findWebPackConfig() {
    return new Promise((resolve, reject) => {
      let res = null;
      let file = null;
      switch (this.settings.type) {
      case "angular":
        try {
          res = this.findResult.find("webpack.config.js")[0];
          if (!res) {
            return reject(new Error("Angular bundle no webpack config file : webpack.config.js "));
          }
          return resolve(this.loadWebpackConfig(res));
        } catch (e) {
          shell.cd(this.kernel.rootDir);
          throw e;
        }
        break;
      case "react":
        file = null;
        try {
          switch (process.env.NODE_ENV) {
          case "development":
          case "production":
            file = path.resolve(this.path, "config", "webpack.config.js");
            break;
          }
          res = new nodefony.fileClass(file);
          process.env.PUBLIC_URL = path.resolve("/", this.bundleName, "dist");
          return resolve(this.loadWebpackConfig(res));
        } catch (e) {
          shell.cd(this.kernel.rootDir);
          return reject(e);
        }
        break;
      case "vue":
        file = path.resolve(this.path, "node_modules", "@vue", "cli-service", "webpack.config.js");
        try {
          this.webpackConfigFile = new nodefony.fileClass(file);
          process.env.VUE_CLI_CONTEXT = this.path;
          return resolve(this.loadWebpackConfig(this.webpackConfigFile));
        } catch (e) {
          shell.cd(this.kernel.rootDir);
          return reject(e);
        }
        break;
      default:
        try {
          this.webpackConfigFile = this.findResult.find("webpack.config.js")[0];
          if (!this.webpackConfigFile) {
            return resolve(false);
          }
          return resolve(this.loadWebpackConfig(this.webpackConfigFile));
        } catch (e) {
          shell.cd(this.kernel.rootDir);
          return reject(e);
        }
      }
    });
  }

  loadWebpackConfig(conf) {
    return this.webpackService.loadConfig(conf, this)
      .then((compiler) => {
        shell.cd(this.kernel.rootDir);
        return compiler;
      }).catch(e => {
        shell.cd(this.kernel.rootDir);
        throw e;
      });
  }

  initWatchers() {
    if (!this.settings.watch) {
      return;
    }
    let controllers = false;
    let views = false;
    let i18n = false;
    let config = false;
    let services = false;
    //let entities = false;
    let regJs = new RegExp(".*\.js$|.*\.es6$|.*\.es7$|.*\.mjs$");
    try {
      switch (typeof this.settings.watch) {
      case "object":
        controllers = this.settings.watch.controllers || false;
        views = this.settings.watch.views || false;
        i18n = this.settings.watch.translations || false;
        config = this.settings.watch.config || false;
        services = this.settings.watch.services || false;
        this.webpackWatch = this.settings.watch.webpack || false;
        break;
      case "boolean":
        controllers = this.settings.watch || false;
        views = this.settings.watch || false;
        i18n = this.settings.watch || false;
        config = this.settings.watch || false;
        services = this.settings.watch || false;
        this.webpackWatch = this.settings.watch || false;
        break;
      default:
        this.log("BAD CONFIG WATCHER  ", "WARNING");
        return;
      }
      // controllers
      if (controllers) {
        this.watcherController = new nodefony.kernelWatcher(this.controllersPath, defaultWatcher.call(this, regJs), this);
        this.watcherController.setSockjsServer(this.sockjs);
        this.watcherController.listenWatcherController();
        this.kernel.on("onTerminate", () => {
          this.log("Watching Ended : " + this.watcherController.path, "INFO");
          this.watcherController.close();
        });
      }
      // views
      if (views) {
        this.watcherView = new nodefony.kernelWatcher(this.viewsPath, defaultWatcher.call(this, this.regTemplateExt), this);
        this.watcherView.listenWatcherView();
        this.watcherView.setSockjsServer(this.sockjs);
        this.kernel.on("onTerminate", () => {
          this.log("Watching Ended : " + this.watcherView.path, "INFO");
          this.watcherView.close();
        });
      }
      // I18n
      if (i18n) {
        this.watcherI18n = new nodefony.kernelWatcher(this.i18nPath, defaultWatcher.call(this, regI18nFile), this);
        this.watcherI18n.listenWatcherI18n();
        this.watcherI18n.setSockjsServer(this.sockjs);
        this.kernel.on("onTerminate", () => {
          this.log("Watching Ended : " + this.watcherI18n.path, "INFO");
          this.watcherI18n.close();
        });
      }
      // config
      if (config) {
        this.watcherConfig = new nodefony.kernelWatcher(this.configPath, defaultWatcher.call(this, regConfigFile), this);
        this.watcherConfig.listenWatcherConfig();
        this.watcherConfig.setSockjsServer(this.sockjs);
        this.kernel.on("onTerminate", () => {
          this.log("Watching Ended : " + this.watcherConfig.path, "INFO");
          this.watcherConfig.close();
        });
      }
      //services
      if (services) {
        this.watcherService = new nodefony.kernelWatcher(this.servicesPath, defaultWatcher.call(this, regJs), this);
        this.watcherService.listenWatcherServices();
        this.watcherService.setSockjsServer(this.sockjs);
        this.kernel.on("onTerminate", () => {
          this.log("Watching Ended : " + this.watcherService.path, "INFO");
          this.watcherService.close();
        });
      }
      //entities

    } catch (e) {
      throw e;
    }
  }

  reloadRouting(name, Path) {
    try {
      if (name === null) {
        let find = new moduleFindDependencies(Path, "routing", this);
        find.reload();
      } else {
        let fileClass = new nodefony.fileClass(Path);
        this.log("Reload Routing : " + Path);
        if (this.router) {
          this.router.reader(fileClass.path, this.name);
        }
      }
    } catch (e) {
      throw e;
    }
  }

  parseConfig(result) {
    if (result) {
      let config = null;
      for (let ele in result) {
        let ext = null;
        switch (true) {
        case this.kernel.regBundleName.test(ele):
          let myname = this.kernel.regBundleName.exec(ele);
          let name = myname[1] || myname[2];
          config = this.getParameters("bundles." + name);
          if (config) {
            ext = nodefony.extend(true, {}, config, result[ele]);
            this.log("\x1b[32m OVERRIDING\x1b[0m  CONFIG bundle  : " + name, "DEBUG");
          } else {
            ext = result[ele];
            this.log("\x1b[32m OVERRIDING\x1b[0m  CONFIG bundle  : " + name + " BUT BUNDLE " + name + " NOT YET REGISTERED ", "WARNING");
          }
          if (this.kernel.bundles[name]) {
            this.kernel.bundles[name].settings = ext;
            this.setParameters("bundles." + name, this.kernel.bundles[name].settings);
          } else {
            this.setParameters("bundles." + name, ext || {});
          }
          break;
          /*case /^version$/.test(ele):
            try {
              let res = semver.valid(result[ele]);
              if (!res) {
                this.log("Bad Bundle Semantic Versioning  : " + result[ele] + " Check  http://semver.org ", "WARNING");
              }
            } catch (e) {
              this.log(e, "ERROR");
            }
            break;*/
        case /^locale$/.test(ele):
          if (result[ele]) {
            this.locale = result[ele];
          }
          break;
        }
      }
      config = this.getParameters("bundles." + this.name);
      if (config && Object.keys(config).length) {
        this.log("\x1b[32m BUNDLE IS ALREADY OVERRIDING BY AN OTHERONE  INVERT\x1b[0m  CONFIG  " + util.inspect(config), "WARNING");
        this.settings = nodefony.extend(true, {}, result, config);
        this.setParameters("bundles." + this.name, this.settings);
      } else {
        this.settings = result;
        this.setParameters("bundles." + this.name, this.settings);
      }
      this.settings.version = this.version;
      //console.log(this.settings)
    }
  }

  log(pci, severity, msgid, msg) {
    if (!msgid) {
      msgid = "BUNDLE " + this.name;
    }
    return super.log(pci, severity, msgid, msg);
  }

  loadFile(Path, force) {
    try {
      return this.autoLoader.load(Path, force);
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  getName() {
    return this.name;
  }

  getController(name) {
    return this.controllers[name];
  }

  async registerServices() {
    let service = await this.findResult.find("services")
      .find(regService);
    if (!service.length) {
      this.log("Bundle " + this.name + " No Services Found", "DEBUG");
    }
    service.forEach((ele) => {
      try {
        this.loadService(ele);
      } catch (e) {
        this.log(e, "ERROR");
      }
    });
    return service;
  }

  loadService(ele, force) {
    try {
      let Class = this.loadFile(ele.path, force);
      if (typeof Class === "function") {
        Class.prototype.bundle = this;
        if (force) {
          if (nodefony.services[Class.name]) {
            delete nodefony.services[Class.name];
          }
        }
        nodefony.services[Class.name] = Class;
        this.log("Register Service : " + Class.name, "DEBUG");
        return Class;
      } else {
        throw new Error("Bundle Register Service : " + ele.path + "  error Service bad format " + typeof Class);
      }
    } catch (e) {
      throw e;
    }
  }

  async reloadService(name, Path, force) {
    try {
      let File = new nodefony.fileClass(Path);
      await this.reloadWatcherService(File, Path, force);
    } catch (e) {
      throw e;
    }
  }

  async reloadWatcherService(File, Path, force) {
    try {
      if (File) {
        let Class = this.loadService(File, force);
        let injector = this.injectionService.getInjector(Class.name);
        if (injector) {
          injector.getServiceClass({
            class: Class
          });
          injector.getServiceName();
          await injector.restartService();
        } else {
          let error = new Error(Class.name + " Service is not found or not register reboot server or check config file ");
          throw error;
        }
      } else {
        if (File === null) {
          let find = new moduleFindDependencies(Path, "service", this);
          find.reload();
        }
      }
    } catch (e) {
      throw e;
    }
  }

  async findControllerFiles() {
    this.controllerFiles = await this.findResult.find("controller").find(this.regController);
    if (!this.controllerFiles.length) {
      this.log("Bundle " + this.name + " controller directory not found", "DEBUG");
    }
    return this.controllerFiles;
  }

  async registerControllers(result) {
    if (result) {
      this.controllerFiles = result;
    }
    if (this.controllerFiles.length) {
      this.controllerFiles.forEach((ele) => {
        let res = this.regController.exec(ele.name);
        if (res) {
          let name = res[1];
          this.loadController(name, ele.path, false);
        }
      });
    }
  }

  reloadWatcherControleur(name, Path) {
    try {
      if (name === null) {
        let find = new moduleFindDependencies(Path, "controller", this);
        find.reload();
      } else {
        this.loadController(name, Path, true);
      }
    } catch (e) {
      throw e;
    }
  }

  loadController(name, Path, force) {
    if (this.controllers[name]) {
      delete this.controllers[name];
      this.controllers[name] = null;
    }
    let Class = null;
    try {
      Class = this.loadFile(Path, force);
      let res = regClassController.exec(Class.name);
      if (res) {
        name = res[1];
      } else {
        this.log("Controller Bad Class name :" + Class.name + " file : " + Path, "ERROR");
        this.log("Controller take the file name  !!! " + name, "WARNING");
      }
      if (typeof Class === "function") {
        Class.prototype.name = name;
        Class.prototype.path = Path;
        Class.prototype.bundle = this;
        this.controllers[name] = Class;
        Class.prototype.annotation = null;
        let severity = "DEBUG";
        if (force) {
          severity = "INFO";
        }
        this.log("Load " + name + " Controller : '" + Path + "'", severity);
        if (this.router && true /*Class.prototype.annotation*/ ) {
          this.router.reader(Path, this.name);
        }
      } else {
        throw new Error("Bundle " + this.name + " Load Controller : " + Path + " Controller bad format module.exports must return a class  ");
      }
    } catch (e) {
      throw e;
    }
    return Class;
  }

  async findViewFiles() {
    this.viewFiles = await this.resourcesFiles.find("views");
    if (!this.viewFiles.length) {
      this.log("Bundle " + this.name + " No views Found", "DEBUG");
    }
    return this.viewFiles;
  }

  async compileTemplate(file, basename, name) {
    return new Promise(async (resolve, reject) => {
      if (this.views[basename] && this.views[basename][name] && this.views[basename][name].template) {
        this.views[basename][name].template = null;
        delete this.views[basename][name].template;
      }
      let template = null;
      try {
        template = await this.serviceTemplate.compile(file);

      } catch (e) {
        return reject(e);
      }
      if (template) {
        this.views[basename][name].template = template;
        return resolve(template);
      }
      return resolve(null);
    });

  }

  setView(file) {
    let basename = path.basename(file.dirName);
    let res = null;
    let name = null;
    if (basename !== "views") {
      let dir = new nodefony.fileClass(file.dirName);
      let tab = [dir.name];
      while (path.basename(dir.dirName) !== "views") {
        dir = new nodefony.fileClass(dir.dirName);
        tab.push(dir.name);
      }
      basename = tab.reverse().join("/");
      if (!this.views[basename]) {
        this.views[basename] = {};
      }
    } else {
      basename = ".";
      if (!this.views[basename]) {
        this.views[basename] = {};
      }
    }
    res = this.regTemplateExt.exec(file.name);
    if (res) {
      name = res[1];
      if (this.views[basename][name]) {
        delete this.views[basename][name];
      }
      return this.views[basename][name] = {
        name: name,
        basename: basename,
        file: file,
        template: null
      };
    }
    return null;
  }

  async recompileTemplate(file, force) {
    return new Promise(async (resolve, reject) => {
      let bundle = this;
      // OVERRIDE VIEWS BUNDLE in APP DIRECTORY
      if (this.name === "app") {
        let pattern = null;
        if (this.kernel.platform === "win32") {
          let prefix = path.resolve(this.viewsPath);
          prefix = prefix.replace(/\\/g, "\\\\");
          pattern = prefix + "\\\\(\\w+)-bundle\\\\views\\\\(.+\\.twig)";
        } else {
          pattern = path.resolve(this.viewsPath, "(\\w+)-bundle", "views", "(.+\\.twig)");
        }
        let reg = new RegExp("^" + pattern + "$");
        let res = reg.exec(file.path);
        if (res && res[1]) {
          bundle = this.kernel.getBundle(res[1]);
          this.log(`\x1b[32m APP OVERRIDING VIEWS\x1b[0m  Bundle : ${bundle.name}  File : ${file.name}`, "DEBUG");
        }
      }
      try {
        let ele = bundle.setView(file);
        if (ele) {
          if (force) {
            await bundle.compileTemplate(ele.file, ele.basename, ele.name);
          } else {
            if (this.kernel.type !== "CONSOLE") {
              await bundle.compileTemplate(ele.file, ele.basename, ele.name);
            }
          }
        } else {
          this.log(` DROP VIEW TEMPLATE : ${file.path}`, "DEBUG");
        }
        return resolve(ele);
      } catch (e) {
        return reject(e);
      }
    });

  }

  async registerViews(result) {
    return new Promise(async (resolve, reject) => {
      let views = null;
      if (result) {
        views = await this.findViewFiles(result);
      } else {
        views = this.viewFiles;
      }
      views.getFiles().forEach(async (file) => {
        try {
          let ele = await this.recompileTemplate(file, true);
          if (ele) {
            if (ele.basename === ".") {
              this.log("Register Template   : '" + this.name + "Bundle:" + "" + ":" + ele.name + "'", "DEBUG");
            } else {
              this.log("Register Template   : '" + this.name + "Bundle:" + ele.basename + ":" + ele.name + "'", "DEBUG");
            }
          }
        } catch (e) {
          return reject(e);
          //throw e;
        }
      });
      return resolve(views);
    });
  }

  getView(viewDirectory, viewName) {
    if (this.views[viewDirectory]) {
      let res = this.regTemplateExt.exec(viewName);
      if (res) {
        let name = res[1];
        if (this.views[viewDirectory][name]) {
          return this.views[viewDirectory][name].file;
        }
        throw new Error("Bundle " + this.name + " directory : " + viewDirectory + " GET view file Name : " + viewName + " Not Found");
      } else {
        throw new Error("Bundle " + this.name + " directory : " + viewDirectory + " GET view file Name : " + viewName + " Not Found");
      }
    } else {
      throw new Error("Bundle " + this.name + " GET view directory : " + viewDirectory + " Not Found");
    }
  }

  getTemplate(viewDirectory, viewName) {
    if (this.views[viewDirectory]) {
      let res = this.regTemplateExt.exec(viewName);
      if (res) {
        let name = res[1];
        if (this.views[viewDirectory][name]) {
          return this.views[viewDirectory][name].template;
        }
        throw new Error("Bundle " + this.name + " directory : " + viewDirectory + " GET view file Name : " + viewName + " Not Found");
      } else {
        throw new Error("Bundle " + this.name + " directory : " + viewDirectory + " GET view file Name : " + viewName + " Not Found");
      }
    } else {
      throw new Error("Bundle " + this.name + " GET view directory : " + viewDirectory + " Not Found");
    }
  }

  async findI18nFiles(result) {
    let trans = null;
    if (result) {
      trans = await result.find("translations");
    } else {
      trans = await this.resourcesFiles.find("translations");
    }
    if (!trans.length || !trans[0]) {
      this.log("Bundle " + this.name + " No Translation Found", "DEBUG");
      return trans;
    }
    return trans[0].children;
  }

  getfilesByLocal(locale, dir) {
    let reg = new RegExp("^(.*)\.(" + locale + ")\.(.*)$");
    return dir.find(reg);
  }

  async registerI18n(locale, result) {

    let dir = null;
    if (result) {
      dir = await this.findI18nFiles(result);
    } else {
      dir = this.i18nFiles;
    }
    //console.trace(dir)
    if (!dir || !dir.length) {
      return;
    }
    let files = null;
    if (locale) {
      files = this.getfilesByLocal(locale, dir);
    } else {
      files = this.getfilesByLocal(this.translation.defaultLocale, dir);
      if (!files.length) {
        let bundleLocal = this.getParameters("bundles." + this.name + ".locale");
        files = this.getfilesByLocal(bundleLocal || this.translation.defaultLocale, dir);
        if (bundleLocal && !files.length) {
          this.log(`Translation File Locale : ${bundleLocal} not found`, "DEBUG");
        }
      }
    }
    files.getFiles().forEach((file) => {
      let domain = file.match[1];
      let Locale = file.match[2];
      this.log(`Read I18n file : ${file.path}`, 'DEBUG');
      this.translation.reader(file.path, this.name, Locale, domain);
    });
  }

  async registerCommand(store) {
    this.commandFiles = await this.findResult.find("Command")
      .find(regCommand);
    if (!this.commandFiles.length) {
      this.log(`Bundle ${this.name} No Command Found`, "DEBUG");
      return this.commandFiles;
    }
    let command = null;
    this.commandFiles.getFiles().forEach((file) => {
      let res = regCommand.exec(file.name);
      if (res) {
        try {
          command = this.loadFile(file.path);
          command.prototype.bundle = this;
          store.push(command);
        } catch (e) {
          throw new Error(e + "   FILE COMMAND : " + file.path);
        }
        if (!command) {
          throw new Error("Command : " + file + " BAD FORMAT");
        }
        let name = command.name || res[1];
        if (!name) {
          throw new Error("Command : " + name + "BAD FORMAT NANE ");
        }
      }
    });
  }

  async getPublicDirectory() {
    try {
      return await new nodefony.Finder2({
        excludeDir: /^docs$|^tests|^node_modules|^assets$/
      })
      .in(path.resolve(this.path, "Resources", "public"));
    } catch (e) {
      return null;
    }
    return null;
  }

  async registerEntities() {
    this.entityFiles = await this.findResult.find("Entity")
      .find(this.kernel.getOrm())
      .find(regEntity);
    if (!this.entityFiles.length) {
      this.log(`Bundle ${this.name} No Entity Found`, "DEBUG");
      return this.entityFiles;
    }
    this.entityFiles.forEach((file) => {
      let res = regEntity.exec(file.name);
      let Class = null;
      if (res) {
        try {
          Class = this.loadFile(file.path);
        } catch (e) {
          this.log("LOAD ENTITY  " + file.path, "ERROR");
          throw e;
        }
        try {
          this.entities[Class.name] = new Class(this);
          this.log("LOAD ENTITY  " + Class.name + " : " + file.name, "DEBUG");
        } catch (e) {
          this.log(e, "WARNING");
        }
      } else {
        this.log("Drop Entity file " + file.name, "WARNING");
      }
    });
  }

  getEntity(name) {
    if (this.entities[name]) {
      return this.entities[name];
    }
    return null;
  }

  getEntities() {
    if (this.entities) {
      return this.entities;
    }
    return null;
  }

  async registerFixtures() {
    this.fixtureFiles = await this.findResult.find("Fixtures")
      .find(regFixtures);
    if (!this.fixtureFiles.length) {
      this.log("Bundle " + this.name + " No Fixutures Found", "DEBUG");
      return this.entityFiles;
    }
    this.fixtureFiles.forEach((file) => {
      let res = regFixtures.exec(file.name);
      if (res) {
        let name = res[1];
        let Class = this.loadFile(file.path);
        if (typeof Class === "function") {
          Class.prototype.bundle = this;
          this.fixtures[name] = Class;
          this.log("LOAD FIXTURE : " + file.name, "DEBUG");
        } else {
          this.log("Register FIXTURE : " + name + "  error FIXTURE bad format");
        }
      }
    });
  }

  getFixture(name) {
    if (this.fixtures[name]) {
      return this.fixtures[name];
    }
    return null;
  }

  getFixtures() {
    if (this.fixtures) {
      return this.fixtures;
    }
    return null;
  }
}

nodefony.Bundle = Bundle;
module.exports = Bundle;
