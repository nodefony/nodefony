/*
 *
 *  HTTP KERNEL
 *
 *
 */
const clientErrorExclude = /SSL alert number 46|SSL alert number 48/;

class httpKernel extends nodefony.Service {
  constructor (container, serverStatics) {
    super("HTTP KERNEL", container, container.get("notificationsCenter"));
    this.reader = this.get("reader");
    this.serverStatic = serverStatics;
    this.engineTemplate = this.get("templating");
    this.domain = this.kernel.domain;
    this.httpPort = this.kernel.httpPort;
    this.httpsPort = this.kernel.httpsPort;
    this.container.addScope("request");

    // listen KERNEL EVENTS
    this.once("onBoot", async () => {
      this.firewall = this.get("security");
      this.router = this.get("router");
      this.sessionService = this.get("sessions");
      this.csrfService = this.get("csrf");
      this.compileAlias();
      this.sockjs = this.get("sockjs");
      this.socketio = this.get("socketio");
      this.settings = this.getParameters("bundles.http");
      this.responseTimeout = {
        HTTP: this.settings.http.responseTimeout,
        HTTPS: this.settings.https.responseTimeout,
        HTTP2: this.settings.https.responseTimeout
      };
      this.closeTimeOutWs = {
        WS: this.settings.websocket.closeTimeout,
        WSS: this.settings.websocketSecure.closeTimeout
      };
      this.translation = this.get("translation");
      this.cdn = this.setCDN();
      this.corsManager = this.get("cors");
      this.frameworkBundle = this.kernel.getBundle("framework");
      this.monitoringBundle = this.kernel.getBundle("monitoring");
      if (this.monitoringBundle) {
        this.profiler = this.monitoringBundle.settings.profiler;
        this.forceDebugBarProd = this.monitoringBundle.settings.forceDebugBarProd;
      } else {
        this.profiler = {
          active: false
        };
        this.forceDebugBarProd = false;
      }
    });

    this.once("onReady", async () => {
      if (this.monitoringBundle) {
        this.debugView = this.getTemplate("monitoringBundle::debugBar.html.twig");
      }
    });

    this.on("onClientError", (e, socket) => {
      const exclude = clientErrorExclude.test(e.message);
      if (!exclude) {
        this.log(e, "WARNING", "SOCKET CLIENT ERROR");
      }
      socket.end("HTTP/1.1 400 Bad Request\r\n\r\n");
    });
  }

  // EVENTS DISPATCHER
  async onError (container, error) {
    let context = null;
    try {
      context = container.get("context");
      if (!context || context.sended) {
        this.log(error, "ERROR");
        return Promise.reject(error);
      }
    } catch (e) {
      this.log(error, "ERROR");
      return Promise.reject(error);
    }
    let httpError = null;
    try {
      let result = null;
      const errorType = nodefony.isError(error);
      switch (errorType) {
      case "securityError":
      case "httpError":
        httpError = error;
        break;
      default:
        if (context.response && context.response.statusCode === 200) {
          httpError = new nodefony.httpError(error, 500, container);
        } else {
          httpError = new nodefony.httpError(error, null, container);
        }
      }
      if (context.listenerCount("onError")) {
        return context.handle(error)
          .then((ret) => {
            if (context) {
              if (context.notificationsCenter) {
                context.removeAllListeners("onError");
              }
              context.logRequest(httpError);
            }
            return ret;
          })
          .catch((e) => {
            if (!(e instanceof nodefony.Resolver)) {
              this.log(e, "ERROR");
            }
            if (context) {
              if (context.notificationsCenter) {
                context.removeAllListeners("onError");
              }
            }
            return this.onError(container, error);
          });
        // context.logRequest(httpError);
        // return httpError.resolver.callController(httpError);
      }
      if (!httpError.context) {
        httpError.context = context;
        httpError.resolve(true);
      }
      context = httpError.context;
      context.resolver = httpError.resolver;
      context.logRequest(httpError);
      if (context.method === "WEBSOCKET" &&
        context.response &&
        !context.response.connection) {
        if (!context.rejected) {
          context.request.reject(httpError.code ? httpError.code : null, httpError.message);
          context.rejected = true;
        }
        context.fire("onFinish", context);
        return context;
      }
      if (!context.response) {
        context.fire("onFinish", context);
        return httpError.resolver;
      }
      result = httpError.resolver.callController(httpError);
      if (!context.requested) {
        context.fire("onRequest", context, httpError.resolver);
        this.kernel.fire("onRequest", context, httpError.resolver);
      }
      if (context.method === "WEBSOCKET") {
        if (httpError.code < 3000) {
          httpError.code += 3000;
        }
        setTimeout(() => {
          context.close(httpError.code, httpError.message);
        }, 500 /* (context.type === "WEBSOCKET" ? this.closeTimeOutWs.WS : this.closeTimeOutWs.WSS)*/);
      }
      return result;
    } catch (e) {
      if (error) {
        this.log(error, "ERROR");
      }
      if (httpError) {
        httpError.log(e, "ERROR");
      } else {
        this.log(e, "ERROR");
      }
      throw e;
    }
  }

  // HTTP ENTRY POINT
  onHttpRequest (request, response, type) {
    if (this.sockjs && request.url && request.url.match(this.sockjs.regPrefix)) {
      this.log(`HTTP drop to sockj ${request.url}`, "DEBUG");
      return;
    }
    if (response.headersSent) {
      return;
    }
    response.setHeader("Server", "nodefony");
    if (this.kernel.settings.system.servers.statics || this.kernel.settings.system.statics) {
      return this.serverStatic.handle(request, response)
        .then((res) => {
          if (res) {
            this.fire("onServerRequest", request, response, type);
            return this.handle(request, response, type);
          }
          throw new Error("Bad request");
        })
        .catch((e) => {
          if (e) {
            this.log(e, "ERROR", "STATICS SERVER");
          }
          return e;
        });
    }
    this.fire("onServerRequest", request, response, type);
    return this.handle(request, response, type);
  }

  // WEBSOCKET ENTRY POINT
  onWebsocketRequest (request, type) {
    if (this.sockjs &&
      request.resourceURL.path &&
      request.resourceURL.path.match(this.sockjs.regPrefix)
    ) {
      this.log(`websocket drop to sockjs : ${request.resourceURL.path}`, "DEBUG");
      // let connection = request.accept(null, request.origin);
      // connection.drop(1006, 'TCP connection lost before handshake completed.', false);
      request = null;
      // connection = null ;
      return;
    }
    if (this.socketio &&
      request.resourceURL.path &&
      this.socketio.checkPath(request.resourceURL.path)
    ) {
      this.fire("onServerRequest", request, null, type);
      this.log(`websocket drop to socket.io : ${request.resourceURL.path}`, "DEBUG");
      request = null;
      return;
    }
    this.fire("onServerRequest", request, null, type);
    return this.handle(request, null, type);
  }

  handle (request, response, type) {
    // SCOPE REQUEST ;
    let log = null;
    const container = this.container.enterScope("request");
    switch (type) {
    case "HTTP":
    case "HTTPS":
    case "HTTP2":
      log = clc.cyan.bgBlue(`${request.url}`);
      this.log(`REQUEST HANDLE ${type} : ${log}`, "DEBUG");
      return this.handleHttp(container, request, response, type);
    case "WEBSOCKET":
    case "WEBSOCKET SECURE":
      log = clc.cyan.bgBlue(`${request.resource}`);
      this.log(`REQUEST HANDLE ${type} : ${log}`, "DEBUG");
      return this.handleWebsocket(container, request, type);
    }
  }

  // FRONT CONTROLLER
  handleFrontController (context, checkFirewall = true) {
    return new Promise((resolve, reject) => {
      let controller = null;
      if (this.firewall && checkFirewall) {
        context.secure = this.firewall.isSecure(context);
      }
      if (context.security) {
        const res = this.firewall.handleCrossDomain(context);
        if (context.crossDomain && context.method === "OPTIONS") {
          if (res === 204) {
            return resolve(res);
          }
        }
      }
      // FRONT ROUTER
      try {
        const resolver = this.router.resolve(context);
        if (resolver.resolve && !resolver.exception) {
          context.resolver = resolver;
          controller = resolver.newController(context.container, context);
          if (controller.sessionAutoStart) {
            context.sessionAutoStart = controller.sessionAutoStart;
          }
          context.once("onSessionStart", (session) => {
            controller.session = session;
          });
          return resolve(controller);
        }
        if (resolver.exception) {
          return reject(resolver.exception);
        }
        const error = new nodefony.httpError("Not Found", 404, context.container);
        return reject(error);
      } catch (e) {
        if (e instanceof nodefony.Resolver) {
          if (e.exception) {
            controller = e.newController(context.container, context);
            return reject(e.exception);
          }
          return reject(new nodefony.httpError("Not Found", 404, context.container));
        }
        return reject(e);
      }
    });
  }

  // HTTP  ENTRY POINT
  handleHttp (container, request, response, type) {
    return new Promise(async (resolve, reject) => {
      let context = null;
      let error = null;
      try {
        context = this.createHttpContext(container, request, response, type);
      } catch (e) {
        error = e;
      }
      try {
        const ctx = await this.onRequestEnd(context, error);
        if (ctx instanceof nodefony.Context) {
          if (ctx.secure || ctx.isControlledAccess) {
            return resolve(context);
          }
          return resolve(await ctx.handle());
        }
        return resolve(context);
      } catch (e) {
        return this.onError(container, e)
          .then((res) => resolve(res))
          .catch((e) => reject(e));
      }
    });
  }


  startSession (context) {
    if (context.sessionAutoStart || context.hasSession()) {
      return this.sessionService.start(context, context.sessionAutoStart)
        .then((session) => {
          if (this.firewall) {
            this.firewall.getSessionToken(context, session);
          }
          return session;
        })
        .catch((e) => {
          throw e;
        });
    }
  }


  onRequestEnd (context, error = null) {
    return new Promise((resolve, reject) => {
      // EVENT
      if (!context) {
        return reject(new nodefony.Error("Bad context", 500));
      }
      context.once("onRequestEnd", async () => {
        try {
          if (error) {
            throw error;
          }
          // ADD HEADERS CONFIG
          if (this.settings[context.scheme].headers) {
            context.response.setHeaders(this.settings[context.scheme].headers);
          }
          // DOMAIN VALID
          if (this.kernel.domainCheck) {
            this.checkValidDomain(context);
          }
          // FRONT CONTROLLER
          const ret = await this.handleFrontController(context)
            .catch((e) => {
              throw e;
            });
          if (ret === 204) {
            return resolve(ret);
          }
          // FIREWALL
          if (context.secure || context.isControlledAccess) {
            const res = await this.firewall.handleSecurity(context);
            // CSRF TOKEN
            if (context.csrf) {
              const token = await this.csrfService.handle(context);
              if (token) {
                this.log("CSRF TOKEN OK", "DEBUG");
              }
            }
            return resolve(res);
          }
          // SESSIONS
          try {
            await this.startSession(context);
            // CSRF TOKEN
            if (context.csrf) {
              const token = await this.csrfService.handle(context);
              if (token) {
                this.log("CSRF TOKEN OK", "DEBUG");
              }
            }
            return resolve(context);
          } catch (e) {
            return reject(e);
          }
        } catch (e) {
          return reject(e);
        }
      });
    });
  }

  createHttpContext (container, request, response, type) {
    let context = null;
    try {
      context = new nodefony.context.http(container, request, response, type);
    } catch (e) {
      this.log(e, "ERROR");
      throw e;
    }
    // response events
    context.response.response.once("finish", () => {
      if (!context) {
        return;
      }
      if (context.finished) {
        return;
      }
      context.logRequest();
      context.fire("onFinish", context);
      context.finished = true;
      this.container.leaveScope(container);
      context.clean();
      context = null;
      request = null;
      response = null;
      container = null;
    });
    return context;
  }

  // WEBSOCKET ENTRY POINT
  handleWebsocket (container, request, type) {
    return new Promise(async (resolve, reject) => {
      let context = null;
      let error = null;
      try {
        context = this.createWebsocketContext(container, request, type);
      } catch (e) {
        error = e;
      }
      try {
        const connection = await this.onConnect(context, error);
        // FIREWALL
        if (context.secure || context.isControlledAccess) {
          return resolve(await this.firewall.handleSecurity(context, connection));
        }
        return resolve(await context.handle());
      } catch (e) {
        return this.onError(container, e)
          .then((res) => resolve(res))
          .catch((e) => reject(e));
      }
    });
  }

  onConnect (context, error = null) {
    // EVENT
    return new Promise(async (resolve, reject) => {
      if (!context) {
        return reject(new nodefony.Error("Bad context", 500));
      }
      try {
        if (error) {
          return reject(error);
        }
        // DOMAIN VALID
        if (this.kernel.domainCheck) {
          this.checkValidDomain(context);
        }
        // FRONT CONTROLLER
        try {
          const ret = await this.handleFrontController(context)
            .catch((e) => {
              throw e;
            });
          if (ret === 204) {
            return resolve(ret);
          }
        } catch (e) {
          if (e.code && e.code === 404 || context.resolver) {
            return reject(e);
          }
          this.log(e, "ERROR");
          // continue
        }

        if (context.secure || context.isControlledAccess) {
          return resolve(await context.connect());
        }
        // SESSIONS
        if (!context.sessionStarting && (context.sessionAutoStart || context.hasSession())) {
          try {
            const session = await this.sessionService.start(context, context.sessionAutoStart)
              .catch((error) => reject(error));
            if (!(session instanceof nodefony.Session)) {
              this.log(new Error("SESSION START session storage ERROR"), "WARNING");
            }
            if (this.firewall) {
              this.firewall.getSessionToken(context, session);
            }
          } catch (e) {
            throw e;
          }
        }
        return resolve(await context.connect());
      } catch (e) {
        return reject(e);
      }
    });
  }

  createWebsocketContext (container, request, type) {
    const context = new nodefony.context.websocket(container, request, type);
    context.once("onFinish", (context) => {
      if (!context) {
        return;
      }
      if (context.finished) {
        return;
      }
      this.container.leaveScope(container);
      context.clean();
      context.finished = true;
      context = null;
      request = null;
      container = null;
      type = null;
    });
    return context;
  }

  // TOOLS
  compileAlias () {
    let str = "";
    if (!this.kernel.domainAlias) {
      str = `^${this.kernel.domain}$`;
      this.regAlias = new RegExp(str);
      return;
    }
    try {
      let alias = [];
      switch (nodefony.typeOf(this.kernel.domainAlias)) {
      case "string":
        alias = this.kernel.domainAlias.split(" ");
        Array.prototype.unshift.call(alias, `^${this.kernel.domain}$`);
        for (let i = 0; i < alias.length; i++) {
          if (i === 0) {
            str = alias[i];
          } else {
            str += `|${alias[i]}`;
          }
        }
        break;
      case "object":
        let first = true;
        for (const myAlias in this.kernel.domainAlias) {
          if (first) {
            first = false;
            str = this.kernel.domainAlias[myAlias];
          } else {
            str += `|${this.kernel.domainAlias[myAlias]}`;
          }
        }
        break;
      case "array":
        str = `^${this.kernel.domain}$`;
        for (let i = 0; i < this.kernel.domainAlias.length; i++) {
          str += `|${this.kernel.domainAlias[i]}`;
        }
        break;
      default:
        throw new Error("Config file bad format for domain alias must be a string ");
      }
      if (str) {
        this.regAlias = new RegExp(str);
      } else {
        str = `^${this.kernel.domain}$`;
        this.regAlias = new RegExp(str);
      }
    } catch (e) {
      throw e;
    }
  }

  isValidDomain (context) {
    return this.regAlias.test(context.domain);
  }

  getEngineTemplate (name) {
    return nodefony.templatings[name];
  }

  parseViewPattern (pattern) {
    if (pattern && typeof pattern === "string") {
      const tab = pattern.split(":");
      if (tab.length !== 3) {
        throw new Error(`Not valid Pattern View bundle:directory:filename ==> ${pattern}`);
      }
      return {
        bundle: tab[0],
        directory: tab[1] || ".",
        file: tab[2]
      };
    }
    throw new Error(`Not valid Pattern View bundle:directory:filename ==> ${pattern}`);
  }

  getBundleView (objPattern) {
    let name = null;
    try {
      name = this.kernel.getBundleName(objPattern.bundle);
    } catch (e) {
      name = objPattern.bundle;
    }
    try {
      const myBundle = this.kernel.getBundle(name);
      if (!myBundle) {
        throw new Error(`Resolver Pattern View Bundle : ${objPattern.bundle} NOT exist`);
      }
      return myBundle.getView(objPattern.directory, objPattern.file);
    } catch (e) {
      throw e;
    }
  }

  getBundleTemplate (objPattern) {
    let name = null;
    try {
      name = this.kernel.getBundleName(objPattern.bundle);
    } catch (e) {
      name = objPattern.bundle;
    }
    try {
      const myBundle = this.kernel.getBundle(name);
      if (!myBundle) {
        throw new Error(`Resolver Pattern Template Bundle :${objPattern.bundle} NOT exist`);
      }
      return myBundle.getTemplate(objPattern.directory, objPattern.file);
    } catch (e) {
      throw e;
    }
  }

  getView (name) {
    try {
      return this.getBundleView(this.parseViewPattern(name));
    } catch (e) {
      throw e;
    }
  }

  getTemplate (name) {
    try {
      return this.getBundleTemplate(this.parseViewPattern(name));
    } catch (e) {
      throw e;
    }
  }

  extendTemplate (param = {}, context = null) {
    if (!param) {
      param = {};
    }
    if (param && typeof param !== "object") {
      throw new Error(`bad paramaters : ${param} must be an object`);
    }
    param.nodefony = {
      name: nodefony.projectName,
      version: nodefony.version,
      projectVersion: nodefony.projectVersion,
      url: context.request.url,
      environment: this.kernel.environment,
      debug: this.kernel.debug,
      local: context.translation.defaultLocale.substr(0, 2),
      core: this.kernel.isCore,
      route: context.resolver.getRoute(),
      getContext: () => context
    };
    return param;
  }

  generateUrl (name, variables, host) {
    try {
      return this.router.generatePath.call(this.router, name, variables, host);
    } catch (e) {
      throw e;
    }
  }

  setCDN () {
    return this.kernel.settings.CDN;
  }

  getCDN (type, nb) {
    let wish = 0;
    if (nb) {
      try {
        wish = parseInt(wish, 10);
      } catch (e) {
        this.log("CDN CONFIG ERROR  : ", "ERROR");
        this.log(e, "ERROR");
      }
    }
    switch (typeof this.cdn) {
    case "object":
      if (!this.cdn) {
        return "";
      }
      if (this.cdn.global) {
        return this.cdn.global;
      }
      if (!type) {
        const txt = "CDN ERROR getCDN bad argument type  ";
        this.log(txt, "ERROR");
        throw new Error(txt);
      }
      if (type in this.cdn) {
        if (this.cdn[type][wish]) {
          return this.cdn[type][wish];
        }
      }
      return "";
    case "string":
      return this.cdn || "";
    default:
      const txt = "CDN CONFIG ERROR ";
      this.log(txt, "ERROR");
      throw new Error(txt);
    }
  }

  checkValidDomain (context) {
    if (context.validDomain) {
      return 200;
    }
    const error = `DOMAIN Unauthorized : ${context.domain}`;
    throw new nodefony.Error(error, 401);
  }
}

module.exports = httpKernel;
