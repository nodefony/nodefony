const Webpack = require("webpack");


//https://webpack.js.org/api/node/
module.exports = class webpack extends nodefony.Service {

  constructor(container) {
    super("WEBPACK", container);
    this.webpack = Webpack;
    this.production = (this.kernel.environment === "prod") ? true : false;
    this.pathCache = this.kernel.cacheWebpack;
    this.socksSettings = this.kernel.getBundle("http").settings.sockjs;
    this.host = this.socksSettings.protocol + "://" + this.socksSettings.hostname + ":" + this.socksSettings.port;
    this.version = this.getWebpackVersion();
    this.nbCompiler = 0;
    this.nbCompiled = 0;
    this.sockjs = this.get("sockjs");
    if (this.production) {
      try {
        if (!fs.existsSync(this.pathCache)) {
          fs.mkdirSync(this.pathCache);
        }
      } catch (e) {
        this.logger(e.message, "WARNING");
      }
      if (!this.production) {
        this.kernel.listen(this, "onTerminate", () => {
          let res = fs.readdirSync(this.pathCache);
          if (res && res.length) {
            for (let i = 0; i < res.length; i++) {
              fs.rmdirSync(path.resolve(this.pathCache, res[i]));
            }
          }
        });
      }
    }
  }

  getWebpackVersion() {
    return process.env.WEBPACK_VERSION;
  }

  loggerStat(err, stats, bundle, file, watcher) {
    if (err) {
      throw err;
    }
    const info = stats.toJson();
    let error = stats.hasErrors();
    if (error) {
      this.logger(info.errors, "ERROR");
    } else {
      if (bundle) {
        if (watcher) {
          this.logger("Bundle : " + bundle + " WATCHER IN CONFIG   ", "INFO");
        } else {
          this.logger("COMPILE SUCCESS BUNDLE : " + bundle + " " + file, "INFO");
        }
      }
      if (watcher) {
        this.logger(stats.toString({
          // Add console colors
          colors: true,
          verbose: true
        }), "INFO");
      }
      if (stats.hasWarnings()) {
        this.logger(info.warnings, "WARNING");
      }
    }
  }

  checkNotEmptyEntry(config) {
    let size = null;
    switch (nodefony.typeOf(config.entry)) {
    case 'object':
      size = Object.keys(config.entry).length;
      if (size === 0) {
        return false;
      }
      return true;
    case "array":
    case "string":
      size = config.entry.length;
      if (size === 0) {
        return false;
      }
      return true;
    default:
      console.trace(config);
      throw new Error("Webpack Entry configuration  that does not match the API schema");
    }
  }

  loadConfig(file, bundle) {
    try {
      if (!(file instanceof nodefony.fileClass)) {
        file = new nodefony.fileClass(file);
      }
    } catch (e) {
      throw e;
    }
    let Path = bundle.path;
    let type = bundle.settings.type;
    let publicPath = bundle.publicPath;
    let config = null;
    let basename = bundle.bundleName;
    let watch = null;
    let compiler = null;
    let watchOptions = {};
    try {
      switch (type) {
      case "angular":
        publicPath = path.resolve("/", bundle.bundleName, "dist");
        shell.cd(Path);
        config = require(file.path);
        config.context = Path;
        //if (config.output.path === undefined) {
        config.output.path = path.resolve("Resources", "public", "dist");
        //}
        if (config.output.publicPath === undefined) {
          if (publicPath) {
            config.output.publicPath = publicPath + "/";
          } else {
            config.output.publicPath = "/" + path.basename(file.dirName) + "/dist/";
          }
        }
        if (!this.production) {
          //config.entry.hmr = ["webpack-dev-server/client?" + this.host + "/"]
          config.entry.main.unshift("webpack-dev-server/client?" + this.host + "/");
        }
        break;
      case "react":
        publicPath = path.resolve("/", bundle.bundleName, "dist");
        shell.cd(Path);
        process.env.PUBLIC_URL = publicPath;
        process.env.HOST = this.socksSettings.hostname + ":" + this.socksSettings.port;
        process.env.HTTPS = true;
        config = require(file.path);
        config.context = Path;
        config.output.path = path.resolve("Resources", "public", "dist");
        if (publicPath) {
          config.output.publicPath = publicPath + "/";
        } else {
          config.output.publicPath = "/" + path.basename(file.dirName) + "/dist/";
        }
        watchOptions = {
          ignored: new RegExp(
            `^(?!${path
              .normalize(Path + '/')
              .replace(/[\\]+/g, '\\\\')}).+[\\\\/]node_modules[\\\\/]`,
            'g'
          )
        };
        break;
      default:
        config = require(file.path);
      }
      config.name = file.name || basename;
      try {
        let ret = this.checkNotEmptyEntry(config);
        if (!ret) {
          this.logger("Empty entry webpack bundle :  " + bundle.bundleName, "WARNING");
          return null;
        }
      } catch (e) {
        shell.cd(this.kernel.rootDir);
        throw e;
      }
      //console.log(config.name)
      compiler = this.webpack(config);
      if (this.kernel.type === "CONSOLE") {
        return compiler;
      }
      compiler.plugin("done", () => {
        this.nbCompiled++;
        if (this.nbCompiled === this.nbCompiler) {
          this.fire("onWebpackFinich", this);
          shell.cd(this.kernel.rootDir);
        }
      });
      this.nbCompiler++;
    } catch (e) {
      shell.cd(this.kernel.rootDir);
      throw e;
    }
    // WATCH
    if (config.watch === undefined) {
      watch = bundle.webpackWatch;
      config.watch = watch ||  false;
    } else {
      watch = config.watch;
    }
    if (this.production) {
      watch = false;
    } else {
      if (watch && this.sockjs && compiler) {
        this.sockjs.addCompiler(compiler, basename);
      }
    }
    try {
      let idfile = basename + "_" + file.name;
      let watching = null;
      if (watch) {
        watching = compiler.watch(watchOptions, (err, stats) => {
          if (!err) {
            this.logger("BUNDLE : " + basename + " WACTHER WEBPACK COMPILE  : \n" + this.displayConfigTable(config), "DEBUG");
          }
          this.loggerStat(err, stats, basename, file.name, true);
        });
        this.kernel.listen(this, "onTerminate", () => {
          watching.close(() => {
            this.logger("Watching Ended  " + config.context + " : " + util.inspect(config.entry), "INFO");
          });
        });
      } else {
        if ((this.kernel.environment === "dev") && (basename in this.kernel.bundlesCore) && (!this.kernel.isCore)) {
          return compiler;
        }
        this.runCompiler(compiler, idfile, basename, file.name);
      }
    } catch (e) {
      shell.cd(this.kernel.rootDir);
      throw e;
    }
    return compiler;
  }

  runCompiler(compiler, id, bundle, file) {
    try {
      if (this.production) {
        let pathCache = path.resolve(this.pathCache, id);
        if (fs.existsSync(pathCache)) {
          return;
        }
        try {
          fs.mkdirSync(pathCache);
        } catch (e) {}
      }
      return new Promise((resolve /*, reject*/ ) => {
        this.logger("BUNDLE : " + bundle + " WEBPACK COMPILE : " + file + "\n" + this.displayConfigTable(compiler.options), "DEBUG");
        compiler.run((err, stats) => {
          this.loggerStat(err, stats,  bundle, file);
          return resolve(err, stats);
        });
      });
    } catch (e) {
      throw e;
    }
  }

  displayConfigTable(config) {
    let options = {
      head: [
        "ENTRY NAME [name]",
        "ENTRY",
        "OUTPUT FILE NAME",
        "OUTPUT LIBRARY NANE",
        "OUTPUT TARGET",
        "PUBLIC PATH",
        "WATCHER"
      ]
    };
    let table = this.kernel.cli.displayTable(null, options);
    try {
      for (let ele in config.entry) {
        table.push([
          ele,
          config.entry[ele].toString(),
          config.output.filename,
          config.output.library,
          config.output.libraryTarget,
          config.output.path,
          config.watch || ""
        ]);
      }
      return table.toString();
    } catch (e) {
      this.logger(e, "ERROR");
    }
  }
};