/*
 *
 *  HTTP KERNEL
 *
 *
 */
const clientErrorExclude = /SSL alert number 46|SSL alert number 48/;

class httpKernel extends nodefony.Service {

  constructor(container, serverStatics) {
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
      let exclude = clientErrorExclude.test(e.message);
      if (!exclude) {
        this.logger(e, "WARNING", "SOCKET CLIENT ERROR");
      }
      socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
    });
  }

  // EVENTS DISPATCHER
  async onError(container, error) {
    let context = container.get("context");
    if (context.sended) {
      this.log(error, "ERROR");
      return;
    }
    let httpError = null;
    let result = null;
    try {
      let errorType = nodefony.isError(error);
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
        context.logRequest(httpError);
        return context.resolver.callController(httpError);
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
        context.request.reject(httpError.code ? httpError.code : null, httpError.message);
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
        }, 500 /*(context.type === "WEBSOCKET" ? this.closeTimeOutWs.WS : this.closeTimeOutWs.WSS)*/ );
      }
      return result;
    } catch (e) {
      if (httpError) {
        httpError.logger(e, "ERROR");
      } else {
        this.logger(e, "ERROR");
      }
      throw e;
    }
  }

  //HTTP ENTRY POINT
  onHttpRequest(request, response, type) {
    if (this.sockjs && request.url && request.url.match(this.sockjs.regPrefix)) {
      this.logger("HTTP drop to sockj " + request.url, "DEBUG");
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
        .catch(e => {
          if (e) {
            this.logger(e, "ERROR", "STATICS SERVER");
          }
          return e;
        });
    } else {
      this.fire("onServerRequest", request, response, type);
      return this.handle(request, response, type);
    }
  }

  //WEBSOCKET ENTRY POINT
  onWebsocketRequest(request, type) {
    if (this.sockjs &&
      request.resourceURL.path &&
      request.resourceURL.path.match(this.sockjs.regPrefix)
    ) {
      this.logger("websocket drop to sockjs : " + request.resourceURL.path, "DEBUG");
      //let connection = request.accept(null, request.origin);
      //connection.drop(1006, 'TCP connection lost before handshake completed.', false);
      request = null;
      //connection = null ;
      return;
    }
    if (this.socketio &&
      request.resourceURL.path &&
      this.socketio.checkPath(request.resourceURL.path)
    ) {
      this.fire("onServerRequest", request, null, type);
      this.logger("websocket drop to socket.io : " + request.resourceURL.path, "DEBUG");
      request = null;
      return;
    }
    this.fire("onServerRequest", request, null, type);
    return this.handle(request, null, type);
  }

  handle(request, response, type) {
    // SCOPE REQUEST ;
    let container = this.container.enterScope("request");
    switch (type) {
    case "HTTP":
    case "HTTPS":
    case "HTTP2":
      return this.handleHttp(container, request, response, type);
    case "WEBSOCKET":
    case "WEBSOCKET SECURE":
      return this.handleWebsocket(container, request, type);
    }
  }

  //FRONT CONTROLLER
  handleFrontController(context, checkFirewall = true) {
    return new Promise((resolve, reject) => {
      let controller = null;
      if (this.firewall && checkFirewall) {
        context.secure = this.firewall.isSecure(context);
      }
      // FRONT ROUTER
      try {
        let resolver = this.router.resolve(context);
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
        } else {
          if (resolver.exception) {
            return reject(resolver.exception);
          }
          let error = new nodefony.httpError("Not Found", 404, context.container);
          return reject(error);
        }
      } catch (e) {
        if (e instanceof nodefony.Resolver) {
          if (e.exception) {
            controller = e.newController(context.container, context);
            return reject(e.exception);
          } else {
            return reject(new nodefony.httpError("Not Found", 404, context.container));
          }
        }
        return reject(e);
      }
    });
  }

  // HTTP  ENTRY POINT
  handleHttp(container, request, response, type) {
    return new Promise(async (resolve, reject) => {
      let context = null;
      let error = null;
      try {
        context = this.createHttpContext(container, request, response, type);
        context.translation.extendTemplate();
      } catch (e) {
        error = e;
      }
      try {
        let ctx = await this.onRequestEnd(context, error);
        if (ctx instanceof nodefony.Context) {
          return resolve(await ctx.handle());
        }
        return resolve(context);
      } catch (e) {
        return this.onError(container, e)
          .then(res => {
            return resolve(res);
          })
          .catch(e => {
            return reject(e);
          });
      }
    });
  }

  onRequestEnd(context, error = null) {
    return new Promise((resolve, reject) => {
      // EVENT
      if (!context) {
        return reject(new nodefony.Error(`Bad context`, 500));
      }
      context.once('onRequestEnd', async () => {
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
          await this.handleFrontController(context);
          // FIREWALL
          if (context.secure || context.isControlledAccess) {
            let res = await this.firewall.handleSecurity(context);
            // CSRF TOKEN
            if (context.csrf) {
              let token = await this.csrfService.handle(context);
              if (token) {
                this.logger(`CSRF TOKEN OK`, "DEBUG");
              }
            }
            return resolve(res);
          }
          // SESSIONS
          if (context.sessionAutoStart || context.hasSession()) {
            let session = await this.sessionService.start(context, context.sessionAutoStart);
            if (!(session instanceof nodefony.Session)) {
              this.logger(new Error("SESSION START session storage ERROR"), "WARNING");
            }
            if (this.firewall) {
              this.firewall.getSessionToken(context, session);
            }
          }
          // CSRF TOKEN
          if (context.csrf) {
            let token = await this.csrfService.handle(context);
            if (token) {
              this.logger(`CSRF TOKEN OK`, "DEBUG");
            }
          }
          return resolve(context);
        } catch (e) {
          return reject(e);
        }
      });
    });
  }

  createHttpContext(container, request, response, type) {
    let context = null;
    try {
      context = new nodefony.context.http(container, request, response, type);
    } catch (e) {
      this.logger(e, "ERROR");
      throw e;
    }
    //response events
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
  handleWebsocket(container, request, type) {
    return new Promise(async (resolve, reject) => {
      let context = null;
      let error = null;
      try {
        context = this.createWebsocketContext(container, request, type);
        context.translation.extendTemplate();
      } catch (e) {
        error = e;
      }
      try {
        let connection = await this.onConnect(context, error);
        if (context.secure || context.isControlledAccess) {
          return resolve(await this.firewall.handleSecurity(context, connection));
        }
        return resolve(await context.handle());
      } catch (e) {
        return this.onError(container, e)
          .then(res => {
            return resolve(res);
          })
          .catch(e => {
            return reject(e);
          });
      }
    });
  }

  onConnect(context, error = null) {
    // EVENT
    return new Promise(async (resolve, reject) => {
      if (!context) {
        return reject(new nodefony.Error(`Bad context`, 500));
      }
      try {
        if (error) {
          throw error;
        }
        // DOMAIN VALID
        if (this.kernel.domainCheck) {
          this.checkValidDomain(context);
        }
        // FRONT CONTROLLER
        await this.handleFrontController(context);
        if (context.secure || context.isControlledAccess) {
          return resolve(await context.connect());
        }
        // SESSIONS
        if (context.sessionAutoStart || context.hasSession()) {
          let session = await this.sessionService.start(context, context.sessionAutoStart);
          if (!(session instanceof nodefony.Session)) {
            this.logger(new Error("SESSION START session storage ERROR"), "WARNING");
          }
          if (this.firewall) {
            this.firewall.getSessionToken(context, session);
          }
        }
        return resolve(await context.connect());
      } catch (e) {
        return reject(e);
      }
    });
  }

  createWebsocketContext(container, request, type) {
    let context = new nodefony.context.websocket(container, request, type);
    context.once('onFinish', (context) => {
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

  //TOOLS
  compileAlias() {
    let str = "";
    if (!this.kernel.domainAlias) {
      str = "^" + this.kernel.domain + "$";
      this.regAlias = new RegExp(str);
      return;
    }
    try {
      let alias = [];
      switch (nodefony.typeOf(this.kernel.domainAlias)) {
      case "string":
        alias = this.kernel.domainAlias.split(" ");
        Array.prototype.unshift.call(alias, "^" + this.kernel.domain + "$");
        for (let i = 0; i < alias.length; i++) {
          if (i === 0) {
            str = alias[i];
          } else {
            str += "|" + alias[i];
          }
        }
        break;
      case "object":
        let first = true;
        for (let myAlias in this.kernel.domainAlias) {
          if (first) {
            first = false;
            str = this.kernel.domainAlias[myAlias];
          } else {
            str += "|" + this.kernel.domainAlias[myAlias];
          }
        }
        break;
      case "array":
        str = "^" + this.kernel.domain + "$";
        for (let i = 0; i < this.kernel.domainAlias.length; i++) {
          str += "|" + this.kernel.domainAlias[i];
        }
        break;
      default:
        throw new Error("Config file bad format for domain alias must be a string ");
      }
      if (str) {
        this.regAlias = new RegExp(str);
      } else {
        str = "^" + this.kernel.domain + "$";
        this.regAlias = new RegExp(str);
      }
    } catch (e) {
      throw e;
    }
  }

  isValidDomain(context) {
    return this.regAlias.test(context.domain);
  }

  getEngineTemplate(name) {
    return nodefony.templatings[name];
  }

  parseViewPattern(pattern) {
    if (pattern && typeof pattern === "string") {
      let tab = pattern.split(":");
      if (tab.length !== 3) {
        throw new Error("Not valid Pattern View bundle:directory:filename ==> " + pattern);
      }
      return {
        bundle: tab[0],
        directory: tab[1] || ".",
        file: tab[2]
      };
    }
    throw new Error("Not valid Pattern View bundle:directory:filename ==> " + pattern);
  }

  getBundleView(objPattern) {
    let name = null;
    try {
      name = this.kernel.getBundleName(objPattern.bundle);
    } catch (e) {
      name = objPattern.bundle;
    }
    try {
      let myBundle = this.kernel.getBundle(name);
      if (!myBundle) {
        throw new Error("Resolver Pattern View Bundle : " + objPattern.bundle + " NOT exist");
      }
      return myBundle.getView(objPattern.directory, objPattern.file);
    } catch (e) {
      throw e;
    }
  }

  getBundleTemplate(objPattern) {
    let name = null;
    try {
      name = this.kernel.getBundleName(objPattern.bundle);
    } catch (e) {
      name = objPattern.bundle;
    }
    try {
      let myBundle = this.kernel.getBundle(name);
      if (!myBundle) {
        throw new Error("Resolver Pattern Template Bundle :" + objPattern.bundle + " NOT exist");
      }
      return myBundle.getTemplate(objPattern.directory, objPattern.file);
    } catch (e) {
      throw e;
    }
  }

  getView(name) {
    try {
      return this.getBundleView(this.parseViewPattern(name));
    } catch (e) {
      throw e;
    }
  }

  getTemplate(name) {
    try {
      return this.getBundleTemplate(this.parseViewPattern(name));
    } catch (e) {
      throw e;
    }
  }

  extendTemplate(param = {}, context = null) {
    if (param && typeof param !== "object") {
      throw new Error(`bad paramaters : ${param} must be an object`);
    }
    /*return nodefony.extend(param, {
      nodefony: {
        name: nodefony.projectName,
        version: nodefony.version,
        projectVersion: nodefony.projectVersion,
        url: context.request.url,
        environment: this.kernel.environment,
        debug: this.kernel.debug,
        local: context.translation.defaultLocale.substr(0, 2),
        core: this.kernel.isCore
      },
      getFlashBag: context.getFlashBag.bind(context),
      render: context.render.bind(context),
      controller: context.controller.bind(context),
      trans: context.translation.trans.bind(context.translation),
      getLocale: context.translation.getLocale.bind(context.translation),
      trans_default_domain: context.translation.trans_default_domain.bind(context.translation),
      getTransDefaultDomain: context.translation.getTransDefaultDomain.bind(context.translation),
      getUser: context.getUser.bind(context),
      CDN: (type, nb) => {
        let cdn = this.getCDN(type, nb);
        let res = `${context.request.url.protocol}//`;
        if (cdn) {
          return `${res}${cdn}`;
        } else {
          return `${res}${context.request.url.host}`;
        }

      },
      absolute_url: context.generateAbsoluteUrl.bind(context),
      is_granted: context.is_granted.bind(context)
    });*/
    param.nodefony = {
      name: nodefony.projectName,
      version: nodefony.version,
      projectVersion: nodefony.projectVersion,
      url: context.request.url,
      environment: this.kernel.environment,
      debug: this.kernel.debug,
      local: context.translation.defaultLocale.substr(0, 2),
      core: this.kernel.isCore
    };
    try {
      param.getFlashBag = context.getFlashBag.bind(context);
      param.render = context.render.bind(context);
      param.controller = context.controller.bind(context);
      param.trans = context.translation.trans.bind(context.translation);
      param.getLocale = context.translation.getLocale.bind(context.translation);
      param.trans_default_domain = context.translation.trans_default_domain.bind(context.translation);
      param.getTransDefaultDomain = context.translation.getTransDefaultDomain.bind(context.translation);
      param.getUser = context.getUser.bind(context);
      param.CDN = (type, nb) => {
        let cdn = this.getCDN(type, nb);
        let res = `${context.request.url.protocol}//`;
        if (cdn) {
          return `${res}${cdn}`;
        } else {
          return `${res}${context.request.url.host}`;
        }
      };
      param.absolute_url = context.generateAbsoluteUrl.bind(context);
      param.is_granted = context.is_granted.bind(context);
      return param;
    } catch (e) {
      console.log(e);
    }
  }

  generateUrl(name, variables, host) {
    try {
      return this.router.generatePath.call(this.router, name, variables, host);
    } catch (e) {
      throw e;
    }
  }

  setCDN() {
    return this.kernel.settings.CDN;
  }

  getCDN(type, nb) {
    let wish = 0;
    if (nb) {
      try {
        wish = parseInt(wish, 10);
      } catch (e) {
        this.logger("CDN CONFIG ERROR  : ", "ERROR");
        this.logger(e, "ERROR");
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
        let txt = "CDN ERROR getCDN bad argument type  ";
        this.logger(txt, "ERROR");
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
      let txt = "CDN CONFIG ERROR ";
      this.logger(txt, "ERROR");
      throw new Error(txt);
    }
  }

  checkValidDomain(context) {
    if (context.validDomain) {
      return 200;
    } else {
      let error = `DOMAIN Unauthorized : ${context.domain}`;
      throw new nodefony.Error(error, 401);
    }
  }

}

module.exports = httpKernel;
