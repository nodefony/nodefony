module.exports = nodefony.register("kernelWatcher", function () {

  /*
   *
   *  WATCHER
   *
   */
  const defaultWatcherSettings = {
    persistent: true,
    followSymlinks: true,
    alwaysStat: false,
    depth: 50,
    //usePolling: true,
    //interval: 100,
    //binaryInterval: 300,
    atomic: true // or a custom 'atomicity delay', in milliseconds (default 100)
  };

  const Watcher = class Watcher extends nodefony.watcher {
    constructor(Path, settings, bundle) {

      super(Path, nodefony.extend(true, {}, defaultWatcherSettings, settings), bundle.container);

      if (bundle) {
        this.bundle = bundle;
        this.cwd = bundle.path;
      }
      this.router = this.get("router");
    }

    logger(payload, severity, msgid, msg) {
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
        let basename = null;
        let res = null;
        let name = null;
        let file = null;
        switch (event) {
        case "addDir":
          this.logger(Path, "WARNING", event);
          break;
        case "add":
        case "change":
          this.logger(Path, "INFO", event);
          try {
            basename = path.basename(Path);
            res = this.bundle.regController.exec(basename);
            if (res) {
              name = res[1];
              file = this.cwd + "/" + Path;
              this.bundle.reloadWatcherControleur(name, file);
            } else {
              this.bundle.reloadWatcherControleur(null, Path);
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
            this.sockjs.sendWatcher("error", event);
          }
          break;
        case "unlinkDir":
          this.logger(Path, "WARNING", event);
          break;
        case "unlink":
          this.logger(Path, "WARNING", event);
          basename = path.basename(Path);
          res = this.bundle.regController.exec(basename);
          name = res[1];
          if (this.bundle.controllers[name]) {
            this.logger("REMOVE CONTROLLER : " + Path, "INFO", event);
            delete this.bundle.controllers[name];
            this.bundle.controllers[name] = null;
          }
          break;
        }
        this.fire(event, this.watcher, Path);
      });
    }

    listenWatcherView() {
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
            let fileClass = new nodefony.fileClass(file);
            let ele = this.bundle.recompileTemplate(fileClass);
            if (ele.basename === ".") {
              this.logger("RECOMPILE Template : '" + this.bundle.name + "Bundle:" + "" + ":" + ele.name + "'", "INFO", event);
            } else {
              this.logger("RECOMPILE Template : '" + this.bundle.name + "Bundle:" + ele.basename + ":" + ele.name + "'", "INFO", event);
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
        case "error":
          this.logger(Path, "ERROR", event);
          if (this.sockjs) {
            this.sockjs.sendWatcher("error", event);
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
            var name = parse.name;
            var directory = path.basename(parse.dir);
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
            var fileClass = new nodefony.fileClass(file);
            fileClass.matchName(this.bundle.regI18nFile);
            let domain = fileClass.match[1];
            let Locale = fileClass.match[2];
            this.bundle.translation.reader(fileClass.path, Locale, domain);
            if (this.sockjs) {
              this.sockjs.sendWatcher("change", file);
            }
          } catch (e) {
            this.logger(e, "ERROR", event);
          }
          break;
        case "error":
          this.logger(Path, "ERROR", event);
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
          file = this.cwd + "/" + Path;
          try {
            var fileClass = new nodefony.fileClass(file);
            this.router.reader(fileClass.path);
          } catch (e) {
            this.logger(e, "ERROR", event);
          }
          break;
        case "error":
          this.logger(Path, "ERROR", event);
          break;
        case "unlinkDir":
          this.logger(Path, "INFO", event);
          break;
        case "unlink":
          this.logger(Path, "INFO", event);
          /*file = this.cwd + "/" + Path ;
          try{
          var fileClass = new nodefony.fileClass(file);
          this.router.removeRoutes(fileClass.path);
        }catch(e){
        this.logger(e, "ERROR", event);
      }*/
          break;
        }
      });
    }
  };
  return Watcher;
});
