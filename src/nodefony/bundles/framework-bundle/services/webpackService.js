const Webpack = require("webpack");
//const MemoryFS = require("memory-fs");

//https://webpack.js.org/api/node/
module.exports = class webpack extends nodefony.Service {

  constructor(container) {
    super("WEBPACK", container);
    this.webpack = Webpack;
    this.production = (this.kernel.environment === "prod") ? true : false;
    this.pathCache = this.kernel.cacheWebpack;
    this.kernel.once("onBoot", async () => {
      this.socksSettings = this.kernel.getBundle("http").settings.sockjs;
      this.webPackSettings = this.kernel.getBundle("framework").settings.webpack;
      this.outputFileSystem = this.setFileSystem();
      return this ;
    });

    this.version = this.getWebpackVersion();
    this.nbCompiler = 0;
    this.nbCompiled = 0;
    this.nbWatched = 0;
    this.sockjs = this.get("sockjs");

    let event = null;
    if (this.kernel.type === "CONSOLE") {
      event = "onReady";
    } else {
      event = "onPostReady";
    }
    this.kernel.once(event, async () => {
      if (this.kernel.type === "CONSOLE" && this.kernel.cli.command !== "webpack") {
        return;
      }
      if (this.kernel.environment === "dev") {
        this.logger("Start WEBPACK Compiler");
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
            this.fire("onWebpackFinich", this);
            //console.log(ele)
            return ele;
          }).catch(e => {
            this.logger(e, "ERROR");
            shell.cd(this.kernel.rootDir);
          });
      }
      return this ;
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
        this.kernel.once("onTerminate", () => {
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
    return new Promise(async (resolve, reject) => {
      let tab = [];
      try {
        for (let bundle in this.kernel.bundles) {
          let myBundle = this.kernel.bundles[bundle];
          shell.cd(myBundle.path);
          let res = await myBundle.initWebpack.call(myBundle);
          shell.cd(this.kernel.rootDir);
          tab.push(res);
        }
        return resolve(tab);
      } catch (e) {
        return reject(e);
      }
    });
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
      if (watcher && this.sockjs) {
        this.logger(stats.toString(this.webPackSettings.stats), "INFO");
        if (this.kernel.getBundle(bundle) &&
          this.kernel.getBundle(bundle).settings &&
          this.kernel.getBundle(bundle).settings.devServer) {
          if (!this.kernel.getBundle(bundle).settings.devServer.hot) {
            this.sockjs.sendWatcher("change");
          }
        } else {
          this.sockjs.sendWatcher("change");
        }
      }
      if (stats.hasWarnings()) {
        if (info.warnings.length) {
          this.logger(info.warnings, "WARNING");
        }
      }
    }
  }

  setDevServer(config, watch, bundleSettings = {}) {
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
      if (!this.sockjs) {
        options = nodefony.extend({}, (config.devServer || {}), (bundleSettings.devServer || {}));
      } else {
        options = nodefony.extend({
          inline: this.sockjs.settings.inline,
          hot: this.sockjs.hot,
          hotOnly: this.sockjs.hotOnly,
          watch: addEntry,
          protocol: this.sockjs.protocol,
          domain: this.sockjs.settings.domain || this.kernel.domain,
          port: this.sockjs.settings.port || this.kernel.httpsPort
        }, (config.devServer || {}), (bundleSettings.devServer || {}));
      }
    }
    return options;
  }

  addDevServerEntrypoints(config, watch, type, bundle) {
    let options = this.setDevServer(config, watch, bundle.settings);
    /*switch (type) {
    case "react":
      return options;
    }*/
    if (options.watch) {
      let devClient = [];
      if (options.inline) {
        if (type !== "react") {
          devClient.push(`webpack-dev-server/client?${options.protocol}://${options.domain}:${options.port}`);
        }
        if (options.hotOnly) {
          if (type !== "react") {
            config.plugins.push(new this.webpack.HotModuleReplacementPlugin({
              // Options...
            }));
            devClient.push("webpack/hot/only-dev-server");
          } else {
            //react-hot-loader/patch
            devClient.push("react-hot-loader/patch");
          }
        } else {
          if (options.hot) {
            if (type !== "react") {
              config.plugins.push(new this.webpack.HotModuleReplacementPlugin({
                // Options...
              }));
              devClient.push("webpack/hot/dev-server");
            } else {
              //react-hot-loader/patch
              devClient.push("react-hot-loader/patch");
            }
          }
        }
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
    //console.log(options)
    return options;
  }

  loadConfig(file, bundle, reload) {
    return new Promise(async (resolve, reject) => {
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
          /*case "angular":
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
            break;*/
        case "react":
          publicPath = path.resolve("/", bundle.bundleName, "dist");
          process.env.PUBLIC_URL = basename;
          process.env.PUBLIC_PATH = publicPath;
          process.env.HOST = this.socksSettings.domain + ":" + this.socksSettings.port;
          process.env.HTTPS = true;
          config = require(file.path)(process.env.NODE_ENV);
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
          devServer = this.addDevServerEntrypoints(config, watch, type, bundle);
        } catch (e) {
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
          if (this.production) {
            config.cache = this.webPackSettings.cache;
          } else {
            config.cache = false;
          }
        }
        bundle.webPackConfig = config;
        //this.log(config, "DEBUG");
        //console.log(config)
        //console.log(devServer)
        try {
          bundle.webpackCompiler = webpack(config);
        } catch (e) {
          return reject(e);
        }
        if (this.kernel.isCore) {
          this.nbCompiler++;
        } else {
          if (!bundle.isCore) {
            this.nbCompiler++;
          }
        }
        if (this.kernel.type === "CONSOLE" && this.kernel.cli.command !== "webpack") {
          return resolve(bundle.webpackCompiler || false);
        }
        if (bundle.webpackCompiler.hooks) {
          bundle.webpackCompiler.hooks.beforeCompile.tap("beforeCompile", () => {
            shell.cd(Path);
          });
          bundle.webpackCompiler.hooks.done.tap("done", () => {
            bundle.fire("onWebpackDone", bundle.webpackCompiler, reload);
            this.nbCompiled++;
            return resolve(bundle.webpackCompiler);
          });
          bundle.webpackCompiler.hooks.failed.tap("failed", (e) => {
            this.logger(e, "ERROR");
            return reject(e);
          });
        } else {
          bundle.webpackCompiler.plugin("beforeCompile", () => {
            shell.cd(Path);
          });
          bundle.webpackCompiler.plugin("done", () => {
            bundle.fire("onWebpackDone", bundle.webpackCompiler, reload);
            this.nbCompiled++;
            return resolve(bundle.webpackCompiler);
          });
          bundle.webpackCompiler.plugin("failed", (e) => {
            this.logger(e, "ERROR");
            return reject(e);
          });
        }
      } catch (e) {
        this.logger(e, 'ERROR');
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
          this.kernel.once("onTerminate", () => {
            if (bundle.watching) {
              bundle.watching.close(() => {
                this.logger("Watching Ended  " + config.context + " : " + util.inspect(config.entry), "INFO");
              });
            }
          });
        } else {
          if (!this.kernel.isCore) {
            if (this.kernel.isBundleCore(basename)) {
              return resolve(bundle.webpackCompiler || true);
            }
          }
          let idfile = basename + "_" + file.name;
          //return resolve( this.runCompiler(bundle.webpackCompiler, idfile, basename, file.name) );
          await this.runCompiler(bundle.webpackCompiler, idfile, basename, file.name);
        }
      } catch (e) {
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
        //this.logger("BUNDLE : " + bundle + " WEBPACK COMPILE : " + file, "DEBUG");
        this.logger(`BUNDLE : ${bundle} WEBPACK COMPILE ${file}\n` + this.displayConfigTable(compiler.options), "INFO");
        compiler.run((err, stats) => {
          this.loggerStat(err, stats, bundle, file);
          if (err) {
            throw err;
            //return reject(err);
          }
          return resolve(compiler);
        });
      } catch (e) {
        this.logger(e, 'ERROR');
        return resolve(compiler);
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
