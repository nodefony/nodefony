/*
 *
 *  WATCHER
 *
 */
const defaultWatcherSettings = {
  persistent: false,
  followSymlinks: true,
  alwaysStat: false,
  depth: 50,
  //usePolling: true,
  //interval: 500,
  //binaryInterval: 300,
  awaitWriteFinish: true,
  atomic: true // or a custom 'atomicity delay', in milliseconds (default 100)
};

class Watcher extends nodefony.Watcher {
  constructor(Path, settings, bundle) {
    super(Path, nodefony.extend(true, {}, defaultWatcherSettings, settings), bundle.container);
    if (bundle) {
      this.bundle = bundle;
      this.cwd = bundle.path;
    }
    this.injectionService = this.get("injection");
    this.webpackService = this.get("webpack");
  }

  logger(payload, severity, msgid, msg) {
    if (severity === "ERROR") {
      console.trace(payload);
    }
    if (typeof payload === "string") {
      let txt = "\x1b[36m";
      if (this.bundle) {
        txt += "BUNDLE " + this.bundle.name + "\x1b[0m ";
      }
      txt += payload;
      msgid = "\x1b[36mWATCHER EVENT " + msgid + "\x1b[0m";
      payload = txt;
    }
    return super.logger(payload, severity, msgid, msg);
  }

  setSockjsServer(server) {
    this.sockjs = server;
  }

  listenWatcherController() {
    this.on('all', (event, Path) => {
      let basename = path.basename(Path);
      let res = null;
      let name = null;
      let file = this.cwd + "/" + Path;
      switch (event) {
      case "addDir":
        this.logger(Path, "WARNING", event);
        break;
      case "add":
      case "change":
        this.logger(Path, "INFO", event);
        try {
          switch (true) {
            // controller
          case this.bundle.regController.test(basename):
            res = this.bundle.regController.exec(basename);
            if (res) {
              name = res[1];
              this.bundle.reloadWatcherControleur(name, file);
            }
            break;
          default:
            this.bundle.reloadWatcherControleur(null, Path, file);
          }
          if (this.sockjs) {
            this.sockjs.sendWatcher("change", file);
          }
        } catch (error) {
          this.logger(error, "ERROR");
          if (this.sockjs) {
            this.sockjs.sendWatcher("error", error);
          }
        }
        break;
      case "error":
        this.logger(Path, "ERROR", event);
        if (this.sockjs) {
          this.sockjs.sendWatcher("error", Path);
        }
        break;
      case "unlinkDir":
        this.logger(Path, "WARNING", event);
        break;
      case "unlink":
        this.logger(Path, "WARNING", event);
        switch (true) {
        case this.bundle.regController.test(basename):
          res = this.bundle.regController.exec(basename);
          name = res[1];
          if (this.bundle.controllers[name]) {
            this.logger("REMOVE CONTROLLER : " + Path, "INFO", event);
            delete this.bundle.controllers[name];
            this.bundle.controllers[name] = null;
          }
          break;
        }
        break;
      }
      this.fire(event, this.watcher, Path);
    });
  }

  listenWatcherView() {
    this.on('all', async (event, Path) => {
      let file = null;
      switch (event) {
      case "addDir":
        this.logger(Path, "INFO", event);
        break;
      case "add":
      case "change":
        this.logger(Path, "INFO", event);
        file = this.cwd + "/" + Path;
        try {
          let fileClass = new nodefony.fileClass(file);
          let ele = await this.bundle.recompileTemplate(fileClass);
          if (ele.basename === ".") {
            this.logger("RECOMPILE Template : '" + this.bundle.name + "Bundle:" + "" + ":" + ele.name + "'", "INFO", event);
          } else {
            this.logger("RECOMPILE Template : '" + this.bundle.name + "Bundle:" + ele.basename + ":" + ele.name + "'", "INFO", event);
          }
          if (this.sockjs) {
            switch (this.bundle.settings.type) {
            case "vue":
            case "react":
              break;
            default:
              this.sockjs.sendWatcher("change", file);
            }

          }
        } catch (e) {
          this.logger(e, "ERROR", event);
          if (this.sockjs) {
            this.sockjs.sendWatcher("error", e);
          }
        }
        break;
      case "error":
        this.logger(Path, "ERROR", event);
        if (this.sockjs) {
          this.sockjs.sendWatcher("error", Path);
        }
        break;
      case "unlinkDir":
        this.logger(Path, "INFO", event);
        break;
      case "unlink":
        this.logger(Path, "INFO", event);
        file = this.cwd + "/" + Path;
        let parse = path.parse(file);
        if (parse.ext === "." + this.bundle.serviceTemplate.extention) {
          let name = parse.name;
          let directory = path.basename(parse.dir);
          if (directory !== "views") {
            if (this.bundle.views[directory]) {
              if (this.bundle.views[directory][name]) {
                delete this.bundle.views[directory][name];
                this.logger("REMOVE TEMPLATE : " + file, "INFO", event);
              }
            }
          } else {
            if (this.bundle.views["."][name]) {
              delete this.bundle.views["."][name];
              this.logger("REMOVE TEMPLATE : " + file, "INFO", event);
            }
          }
        }
        break;
      }
      this.fire(event, this.watcher, Path);
    });
  }

  listenWatcherI18n() {
    this.on('all', (event, Path) => {
      let file = null;
      switch (event) {
      case "addDir":
        this.logger(Path, "INFO", event);
        break;
      case "add":
      case "change":
        this.logger(Path, "INFO", event);
        file = this.cwd + "/" + Path;
        try {
          const fileClass = new nodefony.fileClass(file);
          fileClass.matchName(this.bundle.regI18nFile);
          let domain = fileClass.match[1];
          let Locale = fileClass.match[2];
          //console.log(`${file} : ${domain} : ${Locale}`)
          this.bundle.translation.reader(fileClass.path, this.bundle, Locale, domain);
          if (this.sockjs) {
            this.sockjs.sendWatcher("change", file);
          }
        } catch (e) {
          this.logger(e, "ERROR", event);
          if (this.sockjs) {
            this.sockjs.sendWatcher("error", e);
          }
        }
        break;
      case "error":
        this.logger(Path, "ERROR", event);
        if (this.sockjs) {
          this.sockjs.sendWatcher("error", Path);
        }
        break;
      case "unlinkDir":
        this.logger(Path, "INFO", event);
        break;
      case "unlink":
        this.logger(Path, "INFO", event);
        break;
      }
    });
  }
  listenWatcherConfig() {
    this.on('all', (event, Path) => {
      let file = null;
      switch (event) {
      case "addDir":
        this.logger(Path, "INFO", event);
        break;
      case "add":
      case "change":
        this.logger(Path, "INFO", event);
        let basename = path.basename(Path);
        let name = null;
        let res = null;
        file = this.cwd + "/" + Path;
        switch (true) {
        case this.bundle.regRoutingFile.test(basename):
          res = this.bundle.regRoutingFile.exec(basename);
          try {
            if (res) {
              name = res[1];
              this.bundle.reloadRouting(name, file);
            } else {
              this.bundle.reloadRouting(null, file);
            }
            if (this.sockjs) {
              this.sockjs.sendWatcher("change", file);
            }
          } catch (e) {
            this.logger(e, "ERROR", event);
            if (this.sockjs) {
              this.sockjs.sendWatcher("error", e);
            }
          }
          break;
        case this.bundle.regWebpackCongig.test(basename):
          let myPath = path.resolve(this.bundle.path, Path);
          delete require.cache[myPath];
          if (!this.bundle.webpackConfigFile) {
            return;
          }
          delete require.cache[this.bundle.webpackConfigFile.path];
          if (this.bundle.watching) {
            this.bundle.watching.close(() => {
              this.logger("CLOSE OLD WATCHER", "DEBUG", "watcher");
              this.bundle.clean();
              if (this.sockjs.compilers[this.bundle.bundleName]) {
                this.sockjs.compilers[this.bundle.bundleName].clean();
                delete this.sockjs.compilers[this.bundle.bundleName];
              }
              this.webpackService.loadConfig(this.bundle.webpackConfigFile, this.bundle, true)
                .then(() => {
                  if (this.sockjs) {
                    this.sockjs.sendWatcher("change", file);
                  }
                });
            });
          }

          break;
        default:
          try {
            this.bundle.reloadRouting(null, file);
            if (this.sockjs) {
              this.sockjs.sendWatcher("change", file);
            }
          } catch (e) {
            this.logger(e, "ERROR", event);
            if (this.sockjs) {
              this.sockjs.sendWatcher("error", e);
            }
          }
        }
        break;
      case "error":
        this.logger(Path, "ERROR", event);
        if (this.sockjs) {
          this.sockjs.sendWatcher("error", Path);
        }
        break;
      case "unlinkDir":
        this.logger(Path, "INFO", event);
        break;
      case "unlink":
        this.logger(Path, "INFO", event);
        /*file = this.cwd + "/" + Path ;
          try{
          const fileClass = new nodefony.fileClass(file);
          this.router.removeRoutes(fileClass.path);
        }catch(e){
        this.logger(e, "ERROR", event);
      }*/
        break;
      }
    });
  }
  listenWatcherServices() {
    this.on('all', (event, Path) => {
      switch (event) {
      case "addDir":
        this.logger(Path, "INFO", event);
        this.logger("Reboot Server to add services ", "WARNING");
        break;
      case "add":
        this.logger(Path, "INFO", event);
        this.logger("Reboot Server to add services ", "WARNING");
        break;
      case "change":
        try {
          this.logger(Path, "INFO", event);
          let file = this.cwd + "/" + Path;
          let basename = path.basename(file);
          switch (true) {
            // service
          case this.bundle.regService.test(basename):
            let File = new nodefony.fileClass(file);
            this.bundle.reloadWatcherService(File, file, true);
            break;
          default:
            this.bundle.reloadWatcherService(null, file);
          }
          if (this.sockjs) {
            this.sockjs.sendWatcher("change", file);
          }
        } catch (e) {
          this.logger(e, "ERROR");
          if (this.sockjs) {
            this.sockjs.sendWatcher("error", e);
          }
        }
        break;
      case "error":
        this.logger(Path, "ERROR", event);
        if (this.sockjs) {
          this.sockjs.sendWatcher("error", Path);
        }
        break;
      case "unlinkDir":
        this.logger(Path, "INFO", event);
        break;
      case "unlink":
        this.logger(Path, "INFO", event);
        this.logger("Reboot Server to delete services ", "WARNING");
        break;
      }
    });
  }
}

nodefony.kernelWatcher = Watcher;
module.exports = Watcher;
