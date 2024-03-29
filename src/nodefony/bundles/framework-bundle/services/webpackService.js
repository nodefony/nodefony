const Webpack = require("webpack");
// const MemoryFS = require("memory-fs");
const semver = require("semver");

// https://webpack.js.org/api/node/
module.exports = class webpack extends nodefony.Service {
  constructor (container) {
    super("WEBPACK", container);
    this.webpack = Webpack;
    this.production = this.kernel.environment === "prod";
    this.pathCache = this.kernel.cacheWebpack;
    this.kernel.once("onBoot", async () => {
      this.socksSettings = this.kernel.getBundle("http").settings.sockjs;
      this.webPackSettings = this.kernel.getBundle("framework").settings.webpack;
      this.outputFileSystem = this.setFileSystem();
      return this;
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
      if (!this.sockjs) {
        this.sockjs = this.get("sockjs");
      }
      if (this.kernel.environment === "dev") {
        this.log("Start WEBPACK Compiler");
        return this.compile()
          .then((ele) => {
            shell.cd(this.kernel.rootDir);
            if (this.kernel.type !== "CONSOLE") {
              this.log("WEBPACK COMPILE FINISH");
            } else if (this.kernel.cli.command === "webpack") {
              this.log("WEBPACK COMPILE FINISH");
            }
            this.fire("onWebpackFinich", this);
            // console.log(ele)
            return ele;
          })
          .catch((e) => {
            this.log(e, "ERROR");
            shell.cd(this.kernel.rootDir);
          });
      }
      return this;
    });

    if (this.production) {
      try {
        if (!fs.existsSync(this.pathCache)) {
          fs.mkdirSync(this.pathCache);
        }
      } catch (e) {
        this.log(e.message, "WARNING");
      }
      if (!this.production) {
        this.kernel.once("onTerminate", () => {
          const res = fs.readdirSync(this.pathCache);
          if (res && res.length) {
            for (let i = 0; i < res.length; i++) {
              fs.rmdirSync(path.resolve(this.pathCache, res[i]));
            }
          }
        });
      }
    }
  }

  compile () {
    return new Promise(async (resolve, reject) => {
      const tab = [];
      try {
        for (const bundle in this.kernel.bundles) {
          if (this.kernel.isBundleCore(bundle) && !this.kernel.isCore) {
            continue;
          }
          const myBundle = this.kernel.bundles[bundle];
          shell.cd(myBundle.path);
          const res = await myBundle.initWebpack.call(myBundle);
          shell.cd(this.kernel.rootDir);
          tab.push(res);
        }
        return resolve(tab);
      } catch (e) {
        return reject(e);
      }
    });
  }

  setFileSystem () {
    switch (this.webPackSettings.outputFileSystem) {
    case "memory-fs":
      return null;
      // return new MemoryFS();
    default:
      return null;
    }
  }

  getWebpackVersion () {
    return process.env.WEBPACK_VERSION;
  }

  loggerError (errors) {
    if (nodefony.isArray(errors)) {
      errors.forEach((item) => {
        if (this.kernel.debug) {
          if (item.details) {
            this.logger(item.details);
          }
          if (item.stack) {
            this.logger(item.stack);
          }
        }
        if (item.moduleName) {
          this.log(item.moduleIdentifier, "ERROR");
          this.log(item.moduleName, "ERROR");
        }
        if (item.message) {
          this.log(item.message, "ERROR");
        } else {
          console.error(item);
        }
      });
    } else {
      return this.loggerError([errors]);
    }
  }

  loggerStat (err, stats, bundle, file, watcher, config = {}) {
    if (err) {
      throw err;
    }
    const info = stats.toJson();
    const error = stats.hasErrors();
    if (error) {
      if (info.errors) {
        this.log(`Webpack bundle ${bundle} config : ${file}`, "ERROR");
        this.loggerError(info.errors);
      }
    } else {
      if (bundle) {
        if (watcher) {
          this.log(`Bundle : ${bundle} WATCHER IN CONFIG   `, "INFO");
        } else {
          this.log(`COMPILE SUCCESS BUNDLE : ${bundle} ${file}`, "INFO");
        }
      }
      if (watcher && this.sockjs) {
        this.log(stats.toString(this.webPackSettings.stats), "INFO");
        if (this.kernel.getBundle(bundle) &&
          this.kernel.getBundle(bundle).settings &&
          this.kernel.getBundle(bundle).settings.devServer) {
          if (!this.kernel.getBundle(bundle).settings.devServer.hot) {
            this.sockjs.sendWatcher("change");
          }
        } else if (!config.hot) {
          this.sockjs.sendWatcher("change");
        }
      }
      if (stats.hasWarnings()) {
        if (info.warnings.length) {
          info.warnings.map((warn) => {
            if (warn.message) {
              this.log(warn.message, "DEBUG");
            }
          });
        }
      }
    }
  }

  isWebpack5 (webpack) {
    try {
      return semver.gte(webpack.version, "5.0.0");
    } catch (e) {
      this.log(e, "ERROR");
      return false;
    }
  }

  setDevServer (config, watch, bundleSettings = {}, webpack5) {
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
        options = nodefony.extend({}, config.devServer || {}, bundleSettings.devServer || {});
      } else {
        options = nodefony.extend({
          hot: this.sockjs.hot,
          logging: this.sockjs.logging,
          watch: addEntry,
          protocol: this.sockjs.protocol,
          domain: this.sockjs.settings.domain || this.kernel.domain,
          port: this.sockjs.settings.port || this.kernel.httpsPort
        }, config.devServer || {}, bundleSettings.devServer || {});
      }
    }
    return options;
  }

  addDevServerEntrypoints (config, watch, type, bundle, webpack) {
    const webpack5 = this.isWebpack5(webpack);
    const options = this.setDevServer(config, watch, bundle.settings, webpack5);
    const devClient = [];
    if (type !== "react") {
      devClient.push(`webpack-dev-server/client?${options.protocol}://${options.domain}:${options.port}`);
    }
    if (options.hot) {
      if (type === "react") {
        devClient.push("react-hot-loader/patch");
      } else if (options.hot === "only") {
        config.plugins.push(new webpack.HotModuleReplacementPlugin({
          // Options...
        }));
        devClient.push("webpack/hot/only-dev-server");
      } else {
        config.plugins.push(new webpack.HotModuleReplacementPlugin({
          // Options...
        }));
        devClient.push("webpack/hot/dev-server");
      }
    }
    const prependDevClient = (entry) => {
      switch (nodefony.typeOf(entry)) {
      case "function":
        return () => Promise.resolve(entry()).then(prependDevClient);
      case "object":
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
    return options;
  }


  initHMR (options, watch, type, bundle, webpack) {
    const webpack5 = this.isWebpack5(webpack);
    const devClient = [];
    if (options.hot) {
      if (type !== "react") {
        const HMRPluginExists = bundle.webpackCompiler.options.plugins.find((p) => p.constructor === webpack.HotModuleReplacementPlugin);
        if (HMRPluginExists) {
          this.log("\"hot: true\" automatically applies HMR plugin, you don't have to add it manually to your webpack configuration.", "WARNING");
        } else {
          // apply the HMR plugin
          const plugin = new webpack.HotModuleReplacementPlugin({
            title: `Hot Module Replacement ${bundle.name}`
          });
          plugin.apply(bundle.webpackCompiler);
        }
      } else {
        // react-hot-loader/patch
        devClient.push(require.resolve("react-hot-loader/patch", {
          paths: [bundle.path]
        }));
      }
    }

    if (type !== "react") {
      if (options.hot === "only") {
        devClient.push(require.resolve("webpack/hot/only-dev-server", {
          paths: [bundle.path]
        }));
      }
      if (options.hot === true) {
        devClient.push(require.resolve("webpack/hot/dev-server", {
          paths: [bundle.path]
        }));
      }
      const SockJSClient = require.resolve("webpack-dev-server/client/clients/SockJSClient", {
        paths: [bundle.path]
      });
      const ProvidePlugin = new webpack.ProvidePlugin({
        __webpack_dev_server_client__: SockJSClient
      });
      ProvidePlugin.apply(bundle.webpackCompiler);

      if (webpack5) {
        const searchParams = new URLSearchParams();
        searchParams.set("protocol", options.protocol);
        searchParams.set("hostname", options.domain);
        searchParams.set("port", options.port);
        searchParams.set("pathname", options.pathname || "/sockjs-node");
        if (options.username) {
          searchParams.set("username", options.username);
        }
        if (options.password) {
          searchParams.set("password", options.password);
        }
        searchParams.set("logging", options.logging);
        searchParams.set("hot", options.hot);
        searchParams.set("live-reload", true);
        devClient.push(`${require.resolve("webpack-dev-server/client", {
          paths: [bundle.path]
        })}?${searchParams.toString()}`);
      }
      if (typeof webpack.EntryPlugin !== "undefined") {
        for (const additionalEntry of devClient) {
          new webpack.EntryPlugin(bundle.webpackCompiler.context, additionalEntry, {
            // eslint-disable-next-line no-undefined
            name: undefined
          }).apply(bundle.webpackCompiler);
        }
      }

      /* else {
           let i = 0;
           for (const additionalEntry of devClient) {
             const plugin = new webpack.SingleEntryPlugin(bundle.webpackCompiler.context, additionalEntry, `hmr-${bundle.bundleName}-${i++}`);
             //const plugin = new webpack.SingleEntryPlugin(bundle.webpackCompiler.context, additionalEntry, `hmr-${bundle.bundleName}`);
             plugin.apply(bundle.webpackCompiler);
             //bundle.webpackCompiler.apply(plugin)
           }
         }*/
    }
  }

  loadConfig (file, bundle, reload) {
    return new Promise(async (resolve, reject) => {
      try {
        if (!(file instanceof nodefony.fileClass)) {
          file = new nodefony.fileClass(file);
        }
      } catch (e) {
        return reject(e);
      }
      const Path = bundle.path;
      const {type} = bundle.settings;
      let {publicPath} = bundle;
      let config = null;
      const basename = bundle.bundleName;
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
        case "react":
          publicPath = path.resolve("/", bundle.bundleName, "dist");
          process.env.PUBLIC_URL = basename;
          process.env.PUBLIC_PATH = publicPath;
          process.env.HOST = `${this.socksSettings.domain}:${this.socksSettings.port}`;
          process.env.HTTPS = true;
          config = require(file.path)(process.env.NODE_ENV);
          config.context = Path;
          config.output.path = path.resolve(bundle.path, "Resources", "public", "dist");
          if (publicPath) {
            config.output.publicPath = `${publicPath}/`;
          } else {
            config.output.publicPath = `/${path.basename(file.dirName)}/dist/`;
          }

          /* watchOptions = {
              ignored: new RegExp(
                `^(?!${path
                .normalize(Path + '/')
                .replace(/[\\]+/g, '\\\\')}).+[\\\\/]node_modules[\\\\/]`,
                'g'
              )
            };*/
          break;
        default:
          if (type === "vue") {
            process.VUE_CLI_SERVICE = null;
          }
          config = require(file.path);
        }
        watchOptions = nodefony.extend({}, this.webPackSettings.watchOptions, config.watchOptions || {});
        const webpack5 = this.isWebpack5(webpack);
        try {
          if (webpack5) {
            devServer = this.setDevServer(config, watch, bundle.settings, webpack5);
          } else {
            devServer = this.addDevServerEntrypoints(config, watch, type, bundle, webpack);
          }
        } catch (e) {
          return reject(e);
        }
        // context
        if (!config.context) {
          config.context = Path;
        }
        if (!config.name) {
          config.name = file.name || basename;
        }
        if (config.cache === undefined) {
          if (this.production) {
            config.cache = false;
          } else {
            config.cache = this.webPackSettings.cache;
          }
        }
        bundle.webPackConfig = config;
        // console.log(config)
        // this.log(config, "DEBUG");
        this.log(`Webpack (${webpack.version}) Compile bundle :  ${bundle.name}  `);
        try {
          bundle.webpackCompiler = webpack(config);
        } catch (e) {
          return reject(e);
        }
        // HMR
        if (devServer.watch) {
          this.initHMR(devServer, watch, type, bundle, webpack);
        }

        if (this.kernel.isCore) {
          this.nbCompiler++;
        } else if (!bundle.isCore) {
          this.nbCompiler++;
        }
        if (this.kernel.type === "CONSOLE" && this.kernel.cli.command !== "webpack") {
          return resolve(bundle.webpackCompiler || false);
        }
        if (bundle.webpackCompiler.hooks) {
          bundle.webpackCompiler.hooks.beforeCompile.tap("beforeCompile", () => {
            shell.cd(Path);
          });

          /* bundle.webpackCompiler.hooks.run.tap("run", () => {
            console.log("run");
          });
          bundle.webpackCompiler.hooks.beforeRun.tap("beforeRun", () => {
            console.log("beforeRun");
          });
          bundle.webpackCompiler.hooks.compile.tap("compile", () => {
            console.log("compile");
          });
          bundle.webpackCompiler.hooks.afterCompile.tap("afterCompile", (compilation) => {
            console.log("afterCompile", compilation.namedChunks);
          });
          bundle.webpackCompiler.hooks.invalid.tap("invalid", (filename, changeTime) => {
            this.log('INVALID HOOK WEBPACK', "DEBUG");
            this.log(filename, "DEBUG");
            this.log(changeTime, "DEBUG");
          });*/
          bundle.webpackCompiler.hooks.done.tap("done", () => {
            bundle.fire("onWebpackDone", bundle.webpackCompiler, reload);
            this.nbCompiled++;
            return resolve(bundle.webpackCompiler);
          });
          bundle.webpackCompiler.hooks.failed.tap("failed", (e) => {
            this.log(e, "ERROR");
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
            this.log(e, "ERROR");
            return reject(e);
          });
        }
      } catch (e) {
        this.log(`Error webpack ${bundle.name}`, "ERROR");
        this.trace(e);
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
            this.log("Warning only 1 webpack bundle watcher can be use with nodefony framework !!! ", "WARNING");
          }
          this.nbWatched++;
          bundle.watching = null;
          bundle.watching = bundle.webpackCompiler.watch(watchOptions, (err, stats) => {
            this.log(`BUNDLE : ${basename} WACTHER WEBPACK COMPILE  `);
            if (!err) {
              this.log(`\n${this.displayConfigTable(config)}`, "DEBUG");
            }
            this.loggerStat(err, stats, basename, file.name, true, devServer);
            if (this.kernel.environment !== "prod") {
              bundle.lastWebpackStats = stats;
            }
          });
          this.kernel.once("onTerminate", () => {
            if (bundle.watching) {
              bundle.watching.close(() => {
                this.log(`Watching Ended  ${config.context} : ${util.inspect(config.entry)}`, "INFO");
              });
            }
          });
        } else {
          if (!this.kernel.isCore) {
            if (this.kernel.isBundleCore(basename)) {
              return resolve(bundle.webpackCompiler || true);
            }
          }
          const idfile = `${basename}_${file.name}`;
          await this.runCompiler(bundle.webpackCompiler, idfile, basename, file.name, devServer, bundle);
        }
      } catch (e) {
        return reject(e);
      }
    });
  }

  runCompiler (compiler, id, bundleBase, file, devServer, bundle) {
    return new Promise((resolve, reject) => {
      try {
        if (this.production) {
          const pathCache = path.resolve(this.pathCache, id);
          if (fs.existsSync(pathCache)) {
            return resolve(true);
          }
          try {
            fs.mkdirSync(pathCache);
          } catch (e) {}
        }
        // this.log("BUNDLE : " + bundle + " WEBPACK COMPILE : " + file, "DEBUG");
        this.log(`Webpack Compile ${bundleBase} :  ${file}\n${this.displayConfigTable(compiler.options)}`, "DEBUG");
        compiler.run((err, stats) => {
          if (this.kernel.environment !== "prod") {
            bundle.lastWebpackStats = stats;
          }
          this.loggerStat(err, stats, bundleBase, file, false, devServer);
          compiler.close((closeErr) => {
            if (closeErr) {
              this.log(closeErr, "ERROR");
            }
            return resolve(compiler);
          });
          if (err) {
            console.trace(err);
            throw err;
            // return reject(err);
          }
          // return resolve(compiler);
        });
      } catch (e) {
        console.trace(e);
        this.log(e, "ERROR");
        return resolve(compiler);
      }
    });
  }

  displayConfigTable (config) {
    const options = {
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
    const table = this.kernel.cli.displayTable([], options);
    try {
      for (const ele in config.entry) {
        const entry = config.entry[ele].import ? config.entry[ele].import.toString() : config.entry[ele];
        const lib = config.output.library && config.output.library.name ? config.output.library.name : config.output.library;
        if (config.output) {
          table.push([
            ele,
            entry,
            config.output.filename || "",
            lib || "",
            config.output.libraryTarget || "var",
            config.output.path || "",
            config.watch || ""
          ]);
        }
      }
      return table.toString();
    } catch (e) {
      this.log(e, "ERROR");
    }
  }
};
