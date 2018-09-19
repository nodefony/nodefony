const Webpack = require("webpack");
//const MemoryFS = require("memory-fs");

//https://webpack.js.org/api/node/
module.exports = class webpack extends nodefony.Service {

  constructor(container) {
    super("WEBPACK", container);
    this.webpack = Webpack;
    this.production = (this.kernel.environment === "prod") ? true : false;
    this.pathCache = this.kernel.cacheWebpack;
    this.kernel.on("onBoot", () => {
      this.socksSettings = this.kernel.getBundle("http").settings.sockjs;
      this.host = this.socksSettings.protocol + "://" + this.socksSettings.hostname + ":" + this.socksSettings.port;
      this.webPackSettings = this.kernel.getBundle("framework").settings.webpack;
      this.outputFileSystem = this.setFileSystem();
    });

    this.version = this.getWebpackVersion();
    this.nbCompiler = 0;
    this.nbCompiled = 0;
    this.nbWatched = 0;
    this.sockjs = this.get("sockjs");
    this.tabPromise = [];
    this.kernel.once("onReady", () => {
      for (let bundle in this.kernel.bundles) {
        this.tabPromise.push(this.kernel.bundles[bundle]);
      }
    });

    let event = null;
    if (this.kernel.type === "CONSOLE") {
      event = "onReady";
    } else {
      event = "onPostReady";
    }
    this.kernel.once(event, () => {
      return this.compile()
        .then((ele) => {
          shell.cd(this.kernel.rootDir);
          if (this.kernel.type !== "CONSOLE") {
            this.logger("WEBPACK COMPILE FINISH");
          } else {
            if (this.kernel.cli.command === "webpack") {
              this.logger("WEBPACK COMPILE FINISH");
            }
          }
          this.tabPromise = [];
          return ele;
        }).catch(e => {
          this.logger(e, "ERROR");
          shell.cd(this.kernel.rootDir);
        });
    });

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

  compile() {
    let bundle = this.tabPromise.shift();
    if (!bundle) {
      return Promise.resolve();
    }
    if (this.kernel.type === "CONSOLE" && this.kernel.cli.command !== "webpack") {
      return Promise.resolve();
    } else {
      if (this.kernel.isCore) {
        this.logger(`WEBAPCK Compile Bundle ${bundle.name}`, "INFO");
      } else {
        if (!this.kernel.isBundleCore(bundle.name)) {
          this.logger(`WEBAPCK Compile Bundle ${bundle.name}`, "INFO");
        }
      }
      shell.cd(bundle.path);
      return bundle.initWebpack.call(bundle)
        .then(() => {
          if (this.tabPromise.length) {
            return this.compile();
          }
          return Promise.resolve();
        });
    }
  }


  setFileSystem() {
    switch (this.webPackSettings.outputFileSystem) {
    case "memory-fs":
      return null;
      //return new MemoryFS();
    default:
      return null;
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
      if (info.errors && nodefony.typeOf(info.errors) === "array") {
        this.logger(info.errors.join("\n"), "ERROR");
        console.trace(info.errors);
      } else {
        this.logger(info.errors, "ERROR");
      }
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

  setDevServer(config, watch) {
    let options = {
      watch: false
    };
    if (this.production) {
      return options;
    }
    let addEntry = false;
    if (config.watch === undefined) {
      addEntry = watch;
    } else {
      addEntry = config.watch;
    }
    if (addEntry) {
      options = nodefony.extend({
        inline: this.sockjs.settings.inline,
        hot: this.sockjs.hot,
        hotOnly: this.sockjs.hotOnly,
        watch: addEntry
      }, (config.devServer || {}));
    }
    return options;
  }

  addDevServerEntrypoints(config, watch) {
    let options = this.setDevServer(config, watch);
    if (options.watch) {
      let devClient = [];
      if (options.inline) {
        if (options.hotOnly) {
          devClient.push("webpack/hot/only-dev-server");
        } else {
          if (options.hot) {
            devClient.push("webpack/hot/dev-server");
          }
        }
        //devClient.push(`webpack-dev-server/client?${this.sockjs.protocol}://${this.kernel.hostHttps}`);
        devClient.push(`webpack-dev-server/client?${this.sockjs.protocol}://${this.kernel.domain}:${this.kernel.httpsPort}`);
        const prependDevClient = (entry) => {
          switch (nodefony.typeOf(entry)) {
          case "function":
            return () => Promise.resolve(entry()).then(prependDevClient);
          case 'object':
            const entryClone = {};
            Object.keys(entry).forEach((key) => {
              entryClone[key] = devClient.concat(entry[key]);
            });
            return entryClone;
          default:
            return devClient.concat(entry);
          }
        };
        [].concat(config).forEach((wpOpt) => {
          wpOpt.entry = prependDevClient(wpOpt.entry);
        });
      }
    }
    return options;
  }

  loadConfig(file, bundle, reload) {
    return new Promise((resolve, reject) => {
      try {
        if (!(file instanceof nodefony.fileClass)) {
          file = new nodefony.fileClass(file);
        }
      } catch (e) {
        return reject(e);
      }
      let Path = bundle.path;
      let type = bundle.settings.type;
      let publicPath = bundle.publicPath;
      let config = null;
      let basename = bundle.bundleName;
      let watch = bundle.webpackWatch || false;
      let devServer = null;
      let watchOptions = {};
      shell.cd(Path);
      let webpack = null;
      try {
        webpack = require(path.resolve(bundle.path, "node_modules", "webpack"));
      } catch (e) {
        webpack = this.webpack;
      }
      try {
        switch (type) {
        case "angular":
          publicPath = path.resolve("/", bundle.bundleName, "dist");
          config = require(file.path);
          config.context = Path;
          config.output.path = path.resolve(bundle.path, "Resources", "public", "dist");
          if (config.output.publicPath === undefined) {
            if (publicPath) {
              config.output.publicPath = publicPath + "/";
            } else {
              config.output.publicPath = "/" + path.basename(file.dirName) + "/dist/";
            }
          }
          if (!this.production) {
            watchOptions = {
              ignoreInitial: false,
              persistent: true,
              followSymlinks: false,
              depth: 0,
              atomic: false,
              alwaysStat: true,
              ignorePermissionErrors: true,
            };
          }
          break;
        case "react":
          publicPath = path.resolve("/", bundle.bundleName, "dist");
          process.env.PUBLIC_URL = publicPath;
          process.env.PUBLIC_PATH = publicPath;
          process.env.HOST = this.socksSettings.hostname + ":" + this.socksSettings.port;
          process.env.HTTPS = true;
          config = require(file.path);
          config.context = Path;
          config.output.path = path.resolve(bundle.path, "Resources", "public", "dist");
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
          watchOptions = nodefony.extend({
            ignored: /node_modules/
          }, this.webPackSettings.watchOptions);
        }

        try {
          devServer = this.addDevServerEntrypoints(config, watch);
        } catch (e) {
          shell.cd(this.kernel.rootDir);
          return reject(e);
        }
        //context
        if (!config.context) {
          config.context = Path;
        }
        if (!config.name) {
          config.name = file.name || basename;
        }
        if (config.cache === undefined) {
          config.cache = this.webPackSettings.cache;
        }
        bundle.webPackConfig = config;
        bundle.webpackCompiler = webpack(config);
        this.nbCompiler++;
        if (this.kernel.type === "CONSOLE" && this.kernel.cli.command !== "webpack") {
          return resolve(bundle.webpackCompiler);
        }
        if (bundle.webpackCompiler.hooks) {
          bundle.webpackCompiler.hooks.done.tap("done", () => {
            bundle.fire("onWebpackDone", bundle.webpackCompiler, reload);
            this.nbCompiled++;
            if (this.nbCompiled === this.nbCompiler) {
              this.nbCompiled = 0;
              this.fire("onWebpackFinich", this, reload);
              shell.cd(this.kernel.rootDir);
            }
            return resolve(bundle.webpackCompiler);
          });
          bundle.webpackCompiler.hooks.failed.tap("failed", (e) => {
            this.logger(e, "ERROR");
            return reject(e);
          });
        } else {
          bundle.webpackCompiler.plugin("done", () => {
            bundle.fire("onWebpackDone", bundle.webpackCompiler, reload);
            this.nbCompiled++;
            if (this.nbCompiled === this.nbCompiler) {
              this.nbCompiled = 0;
              this.fire("onWebpackFinich", this, reload);
              shell.cd(this.kernel.rootDir);
            }
            return resolve(bundle.webpackCompiler);
          });

          bundle.webpackCompiler.plugin("failed", (e) => {
            this.logger(e, "ERROR");
            return reject(e);
          });
        }
      } catch (e) {
        this.logger(e, 'ERROR');
        shell.cd(this.kernel.rootDir);
        return reject(e);
      }
      try {
        // WATCH
        if (this.production) {
          watch = false;
        } else {
          if (config.watch === undefined) {
            config.watch = watch;
          } else {
            watch = config.watch;
          }
          if (watch && this.sockjs && bundle.webpackCompiler) {
            this.sockjs.addCompiler(bundle.webpackCompiler, basename, devServer);
          }
        }
        if (watch) {
          if (!this.production && this.outputFileSystem) {
            bundle.webpackCompiler.outputFileSystem = this.outputFileSystem;
          }
          if (this.nbWatched > 1) {
            this.logger("Warning only 1 webpack bundle watcher can be use with nodefony framework !!! ", "WARNING");
          }
          this.nbWatched++;
          bundle.watching = null;
          bundle.watching = bundle.webpackCompiler.watch(watchOptions, (err, stats) => {
            this.logger("BUNDLE : " + basename + " WACTHER WEBPACK COMPILE  ");
            if (!err) {
              this.logger("\n" + this.displayConfigTable(config), "DEBUG");
            }
            this.loggerStat(err, stats, basename, file.name, true);
          });
          this.kernel.listen(this, "onTerminate", () => {
            if (bundle.watching) {
              bundle.watching.close(() => {
                this.logger("Watching Ended  " + config.context + " : " + util.inspect(config.entry), "INFO");
              });
            }
          });
        } else {
          if (!this.kernel.isCore) {
            if (this.kernel.isBundleCore(basename)) {
              return resolve(bundle.webpackCompiler);
            }
          }
          let idfile = basename + "_" + file.name;
          this.runCompiler(bundle.webpackCompiler, idfile, basename, file.name);
        }
      } catch (e) {
        shell.cd(this.kernel.rootDir);
        return reject(e);
      }
    });
  }

  runCompiler(compiler, id, bundle, file) {
    return new Promise((resolve, reject) => {
      try {
        if (this.production) {
          let pathCache = path.resolve(this.pathCache, id);
          if (fs.existsSync(pathCache)) {
            return resolve(true);
          }
          try {
            fs.mkdirSync(pathCache);
          } catch (e) {}
        }
        this.logger("BUNDLE : " + bundle + " WEBPACK COMPILE : " + file, "DEBUG");
        this.logger("\n" + this.displayConfigTable(compiler.options), "DEBUG");
        compiler.run((err, stats) => {
          this.loggerStat(err, stats, bundle, file);
          if (err) {
            return reject(err);
          }
          return resolve(compiler);
        });
      } catch (e) {
        throw e;
      }
    });
  }

  displayConfigTable(config) {
    let options = {
      head: [
        "ENTRY NAME [name]",
        "ENTRY",
        "OUTPUT FILE NAME",
        "OUTPUT LIBRARY NANE",
        "LIBRARY TARGET",
        "PUBLIC PATH",
        "WATCHER"
      ]
    };
    let table = this.kernel.cli.displayTable(null, options);
    try {
      for (let ele in config.entry) {
        if (config.output) {
          table.push([
            ele,
            config.entry[ele].toString(),
            config.output.filename || "",
            config.output.library || "",
            config.output.libraryTarget || "var",
            config.output.path || "",
            config.watch || ""
          ]);
        }
      }
      return table.toString();
    } catch (e) {
      this.logger(e, "ERROR");
    }
  }
};