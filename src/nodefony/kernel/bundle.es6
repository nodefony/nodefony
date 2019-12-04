const Module = require("module");

module.exports = nodefony.register("Bundle", function () {

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
          this.bundle.logger("Reload " + this.type + " Dependency : " + this.childs[i]);
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

  /*
   *  BUNDLE CLASS
   */
  class Bundle extends nodefony.Service {
    constructor(name, kernel, container) {
      super(name, container);
      this.logger("\x1b[36m REGISTER BUNDLE : " + this.name + "   \x1b[0m", "DEBUG", this.kernel.cli.clc.magenta("KERNEL"));
      this.bundleName = path.basename(this.path);
      this.location = path.dirname(this.path);
      this.publicPath = path.resolve(this.path, "Resources", "public");
      this.environment = this.kernel.environment;
      this.waitBundleReady = false;
      this.locale = this.kernel.settings.system.locale;
      this.setParameters("bundles." + this.name, this.getParameters("bundles." + this.name) || {});
      this.production = (this.kernel.environment === "prod") ? true : false;
      this.package = require(path.resolve(this.path, "package.json"));
      this.version = this.package.version;
      this.packageName = this.package.name;
      this.isCore = this.kernel.isBundleCore(this.name);
      try {
        this.finder = new nodefony.finder({
          path: this.path,
          exclude: /^tests$|^public$|^node_modules$|^nodefony-core$|^\.git$/,
        });
      } catch (e) {
        this.logger(e, "ERROR");
      }
      this.sockjs = this.get("sockjs");
      this.translation = this.get("translation");
      this.injectionService = this.get("injection");
      this.reader = this.kernel.reader;
      // webpack
      this.webPackConfig = null;
      this.webpackWatch = false;
      // controllers
      this.controllersPath = path.resolve(this.path, "controller");
      this.findControllerFiles();
      this.controllers = {};
      this.watcherController = null;
      this.regController = regController;
      // views
      this.serviceTemplate = this.get("templating");
      this.regTemplateExt = new RegExp("^(.+)\." + this.serviceTemplate.extention + "$");
      this.viewsPath = path.resolve(this.path, "Resources", "views");
      this.viewFiles = this.findViewFiles(this.finder.result);
      this.views = {};
      this.views["."] = {};
      this.watcherView = null;
      // config
      this.regConfigFile = regConfigFile;
      this.configPath = path.resolve(this.path, "Resources", "config");
      // others
      this.entities = {};
      this.fixtures = {};
      try {
        this.resourcesFiles = this.finder.result.findByNode("Resources");
      } catch (e) {
        this.logger(e, "ERROR");
        this.logger("Bundle " + this.name + " Resources directory not found", "DEBUG");
      }
      // I18n
      this.i18nPath = path.resolve(this.path, "Resources", "translations");
      this.i18nFiles = this.findI18nFiles(this.resourcesFiles);
      this.watcherI18n = null;
      this.regI18nFile = regI18nFile;
      // Register Service
      this.servicesPath = path.resolve(this.path, "services");
      this.watcherServices = null;
      this.regService = regService;
      this.registerServices();
      // read config files
      this.kernel.readConfig.call(this, null, this.resourcesFiles.findByNode("config"), (result) => {
        this.parseConfig(result);
      });

      this.regRoutingFile = regRoutingFile;
      this.regWebpackCongig = regWebpackCongig;

      // router
      this.router = this.get("router");
      this.kernel.once("onBoot", () => {
        // WATCHERS
        if (this.kernel.environment === "dev" && this.settings.watch && this.kernel.type !== "CONSOLE") {
          this.initWatchers();
        }
      });
      // WEBPACK SERVICE
      this.webpackService = this.get("webpack");
      this.webpackCompiler = null;
      this.webPackConfig = null;
      this.watching = null;
      this.fire("onRegister", this);
    }

    clean() {
      this.webPackConfig = null;
      delete this.webPackConfig;
      this.webpackCompiler = null;
      delete this.webpackCompiler;
      this.watching = null;
      delete this.watching;
    }

    fire() {
      this.logger(`${colorLogEvent} ${arguments[0]}`, "DEBUG");
      return super.fire.apply(this, arguments);
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
                this.logger(`MEMORY clean webpack compile bundle : ${this.name}`, "DEBUG");
              }
              this.webPackConfig = null;
              delete this.webPackConfig;
              this.webpackCompiler = null;
              delete this.webpackCompiler;
              return Promise.resolve(compiler);
            }
          })
          .catch((e) => {
            this.logger(e, "ERROR");
            throw e;
          });
      } catch (e) {
        this.logger(e, "ERROR");
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
            res = this.finder.result.getFile("webpack.config.js", true);
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
            this.webpackConfigFile = this.finder.result.getFile("webpack.config.js", true);
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
      let regJs = new RegExp(".*\.js$|.*\.es6$|.*\.es7$");
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
          this.logger("BAD CONFIG WATCHER  ", "WARNING");
          return;
        }
        // controllers
        if (controllers) {
          this.watcherController = new nodefony.kernelWatcher(this.controllersPath, defaultWatcher.call(this, regJs), this);
          this.watcherController.setSockjsServer(this.sockjs);
          this.watcherController.listenWatcherController();
          this.kernel.on("onTerminate", () => {
            this.logger("Watching Ended : " + this.watcherController.path, "INFO");
            this.watcherController.close();
          });
        }
        // views
        if (views) {
          this.watcherView = new nodefony.kernelWatcher(this.viewsPath, defaultWatcher.call(this, this.regTemplateExt), this);
          this.watcherView.listenWatcherView();
          this.watcherView.setSockjsServer(this.sockjs);
          this.kernel.on("onTerminate", () => {
            this.logger("Watching Ended : " + this.watcherView.path, "INFO");
            this.watcherView.close();
          });
        }
        // I18n
        if (i18n) {
          this.watcherI18n = new nodefony.kernelWatcher(this.i18nPath, defaultWatcher.call(this, regI18nFile), this);
          this.watcherI18n.listenWatcherI18n();
          this.watcherI18n.setSockjsServer(this.sockjs);
          this.kernel.on("onTerminate", () => {
            this.logger("Watching Ended : " + this.watcherI18n.path, "INFO");
            this.watcherI18n.close();
          });
        }
        // config
        if (config) {
          this.watcherConfig = new nodefony.kernelWatcher(this.configPath, defaultWatcher.call(this, regConfigFile), this);
          this.watcherConfig.listenWatcherConfig();
          this.watcherConfig.setSockjsServer(this.sockjs);
          this.kernel.on("onTerminate", () => {
            this.logger("Watching Ended : " + this.watcherConfig.path, "INFO");
            this.watcherConfig.close();
          });
        }
        //services
        if (services) {
          this.watcherService = new nodefony.kernelWatcher(this.servicesPath, defaultWatcher.call(this, regJs), this);
          this.watcherService.listenWatcherServices();
          this.watcherService.setSockjsServer(this.sockjs);
          this.kernel.on("onTerminate", () => {
            this.logger("Watching Ended : " + this.watcherService.path, "INFO");
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
          this.logger("Reload Routing : " + Path);
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
              this.logger("\x1b[32m OVERRIDING\x1b[0m  CONFIG bundle  : " + name, "DEBUG");
            } else {
              ext = result[ele];
              this.logger("\x1b[32m OVERRIDING\x1b[0m  CONFIG bundle  : " + name + " BUT BUNDLE " + name + " NOT YET REGISTERED ", "DEBUG");
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
                  this.logger("Bad Bundle Semantic Versioning  : " + result[ele] + " Check  http://semver.org ", "WARNING");
                }
              } catch (e) {
                this.logger(e, "ERROR");
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
          this.logger("\x1b[32m BUNDLE IS ALREADY OVERRIDING BY AN OTHERONE  INVERT\x1b[0m  CONFIG  " + util.inspect(config), "WARNING");
          this.settings = nodefony.extend(true, {}, result, config);
          this.setParameters("bundles." + this.name, this.settings);
        } else {
          this.settings = result;
          this.setParameters("bundles." + this.name, this.settings);
        }
        this.settings.version = this.version;
      }
    }

    logger(pci, severity, msgid, msg) {
      if (!msgid) {
        msgid = "BUNDLE " + this.name;
      }
      return super.logger(pci, severity, msgid, msg);
    }

    loadFile(Path, force) {
      try {
        return this.autoLoader.load(Path, force);
      } catch (e) {
        this.logger(e, "ERROR");
        throw e;
      }
    }

    async boot() {
      return new Promise(async (resolve, reject) => {
        try {
          this.fire("onBoot", this);
          // Register Controller
          this.registerControllers(this.controllerFiles);
          // Register Views
          await this.registerViews();
          // Register internationalisation
          if (this.translation) {
            this.locale = this.translation.defaultLocal;
          }
          this.registerI18n(this.locale);
          // Register Entity
          this.registerEntities();
          // Register Fixtures
          if (this.kernel.type === "CONSOLE") {
            this.registerFixtures();
          }
        } catch (e) {
          return reject(e);
        }
        if (this.waitBundleReady === false) {
          this.fire("onReady", this);
        }
        return resolve(this);
      });
    }

    getName() {
      return this.name;
    }

    getController(name) {
      return this.controllers[name];
    }

    registerServices() {
      // find  controler files
      let services = this.finder.result.findByNode("services");
      services.forEach((ele) => {
        let res = regService.exec(ele.name);
        if (res) {
          try {
            this.loadService(ele);
          } catch (e) {
            this.logger(e, "ERROR");
          }
        }
      });
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
          this.logger("Register Service : " + Class.name, "DEBUG");
          return Class;
        } else {
          throw new Error("Bundle Register Service : " + ele.path + "  error Service bad format " + typeof Class);
        }
      } catch (e) {
        throw e;
      }
    }

    reloadService(name, Path, force) {
      try {
        let File = new nodefony.fileClass(Path);
        this.reloadWatcherService(File, Path, force);
      } catch (e) {
        throw e;
      }
    }

    reloadWatcherService(File, Path, force) {
      try {
        if (File) {
          let Class = this.loadService(File, force);
          let injector = this.injectionService.getInjector(Class.name);
          if (injector) {
            injector.getServiceClass({
              class: Class
            });
            injector.getServiceName();
            injector.restartService();
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

    findControllerFiles(result) {
      if (!result) {
        try {
          this.controllerFiles = new nodefony.finder({
            path: this.controllersPath
          }).result;
        } catch (e) {
          this.logger("Bundle " + this.name + " controller directory not found", "DEBUG");
        }
      } else {
        // find  views files
        this.controllerFiles = result.findByNode("controller");
      }
      return this.controllerFiles;
    }

    registerControllers(result) {
      if (result) {
        this.controllerFiles = result;
      }
      if (this.controllerFiles) {
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
          this.logger("Controller Bad Class name :" + Class.name + " file : " + Path, "ERROR");
          this.logger("Controller take the file name  !!! " + name, "WARNING");
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
          this.logger("Load " + name + " Controller : '" + Path + "'", severity);
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

    findViewFiles(result) {
      let views = null;
      if (!result) {
        try {
          views = new nodefony.finder({
            path: this.viewsPath,
          }).result;
        } catch (e) {
          this.logger("Bundle " + this.name + " views directory not found", "DEBUG");
        }
      } else {
        // find  views files
        views = result.findByNode("views");
      }
      return views;
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
            this.logger(`\x1b[32m APP OVERRIDING VIEWS\x1b[0m  Bundle : ${bundle.name}  File : ${file.name}`, "DEBUG");
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
          views = this.findViewFiles(result);
        } else {
          views = this.viewFiles;
        }
        views.getFiles().forEach(async (file) => {
          try {
            let ele = await this.recompileTemplate(file, true);
            if (ele) {
              if (ele.basename === ".") {
                this.logger("Register Template   : '" + this.name + "Bundle:" + "" + ":" + ele.name + "'", "DEBUG");
              } else {
                this.logger("Register Template   : '" + this.name + "Bundle:" + ele.basename + ":" + ele.name + "'", "DEBUG");
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

    findI18nFiles(result) {
      let i18n = null;
      if (!result) {
        try {
          i18n = new nodefony.finder({
            path: this.i18nPath
          }).result;
        } catch (e) {
          this.logger("Bundle " + this.name + " I18n directory not found", "DEBUG");
        }

      } else {
        // find  i18n files
        i18n = result.findByNode("translations");
      }
      return i18n;
    }

    getfilesByLocal(locale) {
      let reg = new RegExp("^(.*)\.(" + locale + ")\.(.*)$");
      return this.i18nFiles.match(reg);
    }

    registerI18n(locale, result) {
      if (!this.translation) {
        this.translation = this.get("translation");
        if (this.translation) {
          this.locale = this.translation.defaultLocal;
        } else {
          return;
        }
      }
      if (result) {
        this.i18nFiles = this.findI18nFiles(result);
      }
      if (!this.i18nFiles.length()) {
        return;
      }
      let files = null;
      if (locale) {
        files = this.getfilesByLocal(locale);
      } else {
        files = this.getfilesByLocal(this.translation.defaultLocale);
        if (!files.length()) {
          let bundleLocal = this.getParameters("bundles." + this.name + ".locale");
          files = this.getfilesByLocal(bundleLocal || this.translation.defaultLocale);
          if (bundleLocal && !files.length()) {
            this.logger(Error("Error Translation file locale: " + bundleLocal + " don't exist"), "WARNING");
          }
        }
      }
      files.getFiles().forEach((file) => {
        let domain = file.match[1];
        let Locale = file.match[2];
        this.translation.reader(file.path, this.name, Locale, domain);
      });
    }

    registerCommand(store) {
      // find command files
      this.commandFiles = this.finder.result.findByNode("Command");
      let command = null;
      this.commandFiles.getFiles().forEach((file) => {
        let res = regCommand.exec(file.name);
        if (res) {
          try {
            command = this.loadFile(file.path);
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

    getPublicDirectory() {
      let res = null;
      try {
        res = new nodefony.finder({
          path: path.resolve(this.path, "Resources", "public"),
          exclude: /^docs$|^tests|^node_modules|^assets$/
        });
      } catch (e) {
        return res;
      }
      return res.result;
    }

    registerEntities() {
      const entity = this.finder.result.findByNode("Entity");
      this.entityFiles = entity.findByNode(this.kernel.getOrm());
      if (this.entityFiles.length()) {
        this.entityFiles.getFiles().forEach((file) => {
          let res = regEntity.exec(file.name);
          let Class = null;
          if (res) {
            try {
              Class = this.loadFile(file.path);
            } catch (e) {
              this.logger("LOAD ENTITY  " + file.path, "ERROR");
              throw e;
            }
            try {
              this.entities[Class.name] = new Class(this);
              this.logger("LOAD ENTITY  " + Class.name + " : " + file.name, "DEBUG");
            } catch (e) {
              this.logger(e, "WARNING");
            }
          } else {
            this.logger("Drop Entity file " + file.name, "WARNING");
          }
        });
      }
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

    registerFixtures() {
      this.fixtureFiles = this.finder.result.findByNode("Fixtures");
      if (this.fixtureFiles.length()) {
        this.fixtureFiles.getFiles().forEach((file) => {
          let res = regFixtures.exec(file.name);
          if (res) {
            let name = res[1];
            let Class = this.loadFile(file.path);
            if (typeof Class.fixture === "function") {
              Class.fixture.prototype.bundle = this;
              this.fixtures[name] = Class;
              this.logger("LOAD FIXTURE : " + file.name, "DEBUG");
            } else {
              this.logger("Register FIXTURE : " + name + "  error FIXTURE bad format");
            }
          }
        });
      }
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
  return Bundle;
});
