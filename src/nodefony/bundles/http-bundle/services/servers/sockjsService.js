const Sockjs = require('sockjs');

const defaultPrefix = "/sockjs-node";
//const webpack = require("webpack");

const defaultOverlay = {
  errors: true,
  warnings: false
};

const sockCompiler = class sockCompiler extends nodefony.Service {

  constructor(service, name, compiler) {
    super(name, service.container, service.notificationsCenter);
    this.service = service;
    this.webpack = this.get("webpack");
    this.initsockClient = null;
    this.clientStats = {
      errorDetails: true
    };
    this.stats = null;
    if (compiler) {
      this.compiler = compiler;

      if (this.compiler.hooks) {
        this.compiler.hooks.compile.tap('webpack-dev-server', () => {
          this.sockWrite("invalid");
        });
        this.compiler.hooks.invalid.tap('webpack-dev-server', () => {
          this.sockWrite("invalid");
        });
        this.compiler.hooks.done.tap('webpack-dev-server', (stats) => {
          this.stats = stats.toJson(this.clientStats);
          this.sendStats(this.stats);
        });
      } else {
        this.compiler.plugin("compile", () => {
          this.sockWrite("invalid");
        });
        this.compiler.plugin("invalid", () => {
          this.sockWrite("invalid");
        });
        this.compiler.plugin("done", (stats) => {
          this.stats = stats.toJson(this.clientStats);
          this.sendStats(this.stats);
        });
      }
    }
  }

  sendStats(stats, force, connection) {
    const shouldEmit = !force &&
      stats &&
      (!stats.errors || stats.errors.length === 0) &&
      (!stats.warnings || stats.warnings.length === 0) &&
      stats.assets &&
      stats.assets.every((asset) => !asset.emitted);

    if (shouldEmit) {
      this.sockWrite('still-ok', null, connection);
      return;
    }
    this.sockWrite('hash', stats.hash, connection);
    if (stats.errors.length > 0 || stats.warnings.length > 0) {
      if (stats.warnings.length > 0) {
        this.sockWrite('warnings', stats.warnings, connection);
      }
      if (stats.errors.length > 0) {
        this.sockWrite('errors', stats.errors, connection);
      }
    } else {
      this.sockWrite('ok', null, connection);
    }
  }

  clean() {
    if (this.initsockClient) {
      try {
        this.service.removeListener("onConnection", this.initsockClient);
      } catch (e) {
        throw e;
      }
    }
  }

  sockWrite(type, data, connection) {
    return this.service.sockWrite(type, data, connection);
  }

  log(pci, severity, msgid, msg) {
    if (!msgid) {
      msgid = "WEBPACK COMPILER " + this.name.toUpperCase();
    }
    return super.log(pci, severity, msgid, msg);
  }
};

module.exports = class sockjs extends nodefony.Service {

  constructor(httpKernel) {
    super("SOCKJS", httpKernel.container, httpKernel.notificationsCenter);
    this.compilers = {};
    this.sockets = [];
    this.kernel.once("onBoot", async () => {
      this.settings = nodefony.extend(this.bundle.settings.sockjs, kernel.settings.system.devServer);
      if (this.bundle.settings.sockjs) {
        if (this.settings.overlay) {
          if (this.settings.overlay === true) {
            this.clientOverlay = defaultOverlay;
          } else {
            this.clientOverlay = this.settings.overlay;
          }
        } else {
          this.clientOverlay = false;
        }
        this.hot = this.settings.hot || false;
        this.progress = this.settings.progress || false;
        this.logging = this.settings.logging || "none";
        this.websocket = this.settings.websocket;
        this.protocol = this.settings.protocol.toLowerCase();
        this.setPrefix(this.settings.prefix || defaultPrefix);
      }
    });
    if (this.kernel.environment === "dev") {
      this.bundle.on('onCreateServer', (type, service) => {
        //this[type] = service ;
        switch (type) {
          case "HTTP":
          case "HTTPS":
            let proto = type.toLowerCase();
            if (proto === this.protocol) {
              this.createServer(service, proto);
              if (type === "HTTP") {
                this.websocketServer = this.get("websocketServer");
              }
              if (type === "HTTPS") {
                this.websocketServer = this.get("websocketServerSecure");
              }
              this.fire("onCreateSockServer", this[proto], service);
            }
            break;
        }
      });
    }
  }

  setPrefix(prefix) {
    this.prefix = prefix;
    this.regPrefix = new RegExp('^' + this.prefix + '([/].+|[/]?)$');
  }

  addCompiler(compiler, basename, config = {}) {
    this.compilers[basename] = new sockCompiler(this, "SOCKJS_" + basename, compiler);
    this.log("Add sock-js compiler  : " + "SOCKJS_" + basename, "DEBUG");
    this.log(config, "DEBUG");
    if (this.compilers[basename].initsockClient) {
      this.removeListener("onConnection", this.compilers[basename].initsockClient);
    }
    let progress = config.progress || this.progress;
    if (progress && config.watch) {
      const {
        ProgressPlugin
      } = compiler.webpack || require("webpack");
      const progressPlugin = new ProgressPlugin((percent, msg, addInfo, pluginName) => {
        percent = Math.floor(percent * 100);
        if (percent === 100) {
          msg = 'Compilation completed';
        }
        if (addInfo) {
          msg = `${msg} (${addInfo})`;
        }
        this.compilers[basename].log(`${percent} % : ${msg}`, "INFO", `WEBPACK ${this.compilers[basename].name} Progress`);
        this.sockWrite('progress-update', {
          percent,
          msg,
          pluginName
        });

      });
      try {
        progressPlugin.apply(compiler);
      } catch (e) {
        this.log(e, "ERROR");
      }
    }
    this.compilers[basename].initsockClient = (conn /*, server, index*/ ) => {
      let overlay = config.overlay || this.clientOverlay;
      if (overlay) {
        this.sockWrite("overlay", overlay, conn);
      }
      let hot = (config.hot) || (this.hot);
      if (hot) {
        this.sockWrite("hot", null, conn);
      } else {
        this.sockWrite("liveReload", null, conn);
      }

      if (config.logging || this.logging) {
        this.sockWrite("logging", (config.logging || this.logging), conn);
      }
      if (this.compilers[basename].stats) {
        this.compilers[basename].sendStats(this.compilers[basename].stats, false, conn);
        this.compilers[basename].stats = null;
      }
      if (progress) {
        this.sockWrite('progress', progress, conn);
      }
    };
    this.on("onConnection", this.compilers[basename].initsockClient);
    return this.compilers[basename];
  }

  createServer(service, protocol) {
    try {
      this.log(" Create sockjs server :   " + service.type);
      this[protocol] = Sockjs.createServer({
        sockjs_url: '/__webpack_dev_server__/sockjs.bundle.js',
        websocket: this.websocket,
        prefix: this.prefix,
        log: (severity, line) => {
          if (severity === "error") {
            this.log(severity + " " + line, "ERROR");
          } else {
            this.log(severity + " " + line, "DEBUG");
          }
        }
      });

      this[protocol].on('connection', (conn) => {
        if (!conn) {
          return;
        }
        if (conn.url.indexOf("xhr_streaming") < 0) {
          let index = this.sockets.push(conn);
          this.fire("onConnection", conn, this[protocol], index);
        }
        conn.on("close", () => {
          this.log(" Close Connection " + this.name, "DEBUG");
          if (this.websocketServer) {
            this.websocketServer.removePendingRequests(conn.url);
          }
          const connIndex = this.sockets.indexOf(conn);
          if (connIndex >= 0) {
            this.sockets.splice(connIndex, 1);
          }
        });
      });
      this[protocol].installHandlers(service.server);
      return this[protocol];
    } catch (e) {
      this.log(e, "ERROR");
      throw e;
    }
  }

  sendWatcher(type, data /*, force*/ ) {
    switch (type) {
      case "error":
        let myError = null;
        if (data.stack) {
          myError = data.stack;
        } else {
          myError = util.inspect(data);
        }
        return this.sockWrite("errors", [myError]);
      case "change":
        return this.sockWrite("static-changed", data);
      default:
        return;
    }
  }

  sockWrite(type, data, connection) {
    try {
      if ((!data && !type)) {
        return
      }
      let msg = null;
      if (!data) {
        msg = JSON.stringify({
          type
        });
      } else {
        msg = JSON.stringify({
          type,
          data
        });
      }
      if (connection) {
        if (type !== "progress-update") {
          this.log(type, "DEBUG");
        }
        return connection.write(msg);
      }
      this.sockets.forEach((sock) => {
        if (type !== "progress-update") {
          this.log(type, "DEBUG");
        }
        sock.write(msg);
      });
    } catch (e) {
      this.log(e, "ERROR");
      throw e;
    }
  }
};
