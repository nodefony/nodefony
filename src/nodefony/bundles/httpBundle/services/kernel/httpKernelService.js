/*
 *
 *  HTTP KERNEL
 *
 *
 */
module.exports = class httpKernel extends nodefony.Service {

  constructor(container, serverStatics) {
    super("HTTP KERNEL", container, container.get("notificationsCenter"));
    this.reader = this.get("reader");
    this.serverStatic = serverStatics;
    this.engineTemplate = this.get("templating");
    this.domain = this.kernel.domain;
    this.httpPort = this.kernel.httpPort;
    this.httpsPort = this.kernel.httpsPort;
    this.container.addScope("request");
    this.container.addScope("subRequest");
    /*this.on("onServerRequest", (request, response, type) => {
      try {
        return this.handle(request, response, type);
      } catch (e) {
        throw e;
      }
    });*/

    // listen KERNEL EVENTS
    this.once("onBoot", () => {
      this.firewall = this.get("security");
      this.router = this.get("router");
      this.sessionService = this.get("sessions");
      this.compileAlias();
      this.sockjs = this.get("sockjs");
      this.bundleSettings = this.getParameters("bundles.http");
      this.responseTimeout = {
        HTTP: this.bundleSettings.http.responseTimeout,
        HTTPS: this.bundleSettings.https.responseTimeout,
        HTTP2: this.bundleSettings.https.responseTimeout
      };
      this.closeTimeOutWs = {
        WS: this.bundleSettings.websocket.closeTimeout,
        WSS: this.bundleSettings.websocketSecure.closeTimeout
      };
      this.translation = this.get("translation");
      this.cdn = this.setCDN();
      this.corsManager = this.get("cors");
    });

    this.on("onClientError", (e, socket) => {
      this.logger(e, "WARNING", "SOCKET CLIENT ERROR");
      socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
    });
  }

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
    try {
      let myBundle = this.kernel.getBundle(this.kernel.getBundleName(objPattern.bundle));
      if (!myBundle) {
        throw new Error("BUNDLE :" + objPattern.bundle + "NOT exist");
      }
      return myBundle.getView(objPattern.directory, objPattern.file);
    } catch (e) {
      throw e;
    }
  }

  getBundleTemplate(objPattern) {
    try {
      let myBundle = this.kernel.getBundle(this.kernel.getBundleName(objPattern.bundle));
      if (!myBundle) {
        throw new Error("BUNDLE :" + objPattern.bundle + "NOT exist");
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

  extendTemplate(param, context) {
    return nodefony.extend({}, param, {
      nodefony: {
        url: context.request.url,
        environment: this.kernel.environment,
        debug: this.kernel.debug,
        local: context.translation.defaultLocale.substr(0, 2)
      },
      getFlashBag: context.getFlashBag.bind(context),
      render: context.render.bind(context),
      controller: context.controller.bind(context),
      trans: context.translation.trans.bind(context.translation),
      getLocale: context.translation.getLocale.bind(context.translation),
      trans_default_domain: context.translation.trans_default_domain.bind(context.translation),
      getTransDefaultDomain: context.translation.getTransDefaultDomain.bind(context.translation),
      CDN: (type, nb) => {
        let cdn = this.getCDN(type, nb);
        if (cdn) {
          return context.request.url.protocol + "//" + cdn;
        }
        return "";
      },
      absolute_url: context.generateAbsoluteUrl.bind(context)
    });
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
    let next = null;
    if (context.validDomain) {
      next = 200;
    } else {
      next = 401;
    }
    switch (next) {
    case 200:
      return next;
    default:
      this.logger("\x1b[31m  DOMAIN Unauthorized \x1b[0mREQUEST DOMAIN : " + context.domain, "ERROR");
      let error = new Error("Domain : " + context.domain + " Unauthorized ");
      error.code = next;
      throw error;
      /*switch ( context.type ){
          case "HTTP":
          case "HTTPS":
            this.logger("\x1b[31m  DOMAIN Unauthorized \x1b[0mREQUEST DOMAIN : " + context.domain ,"ERROR");
            let error = new Error("Domain : "+context.domain+" Unauthorized ");
            error.code = next ;
            throw error ;
          case "WEBSOCKET":
          case "WEBSOCKET SECURE":
            context.close(3001, "DOMAIN Unauthorized "+ context.domain );
          break;
      }*/
    }
    return next;
  }

  onError(container, error) {
    let myError = null;
    let context = container.get('context');
    if (!context) {
      this.logger(error, 'ERROR');
    }
    if (error) {
      switch (nodefony.typeOf(error)) {
      case "object":
        myError = new Error();
        if (error.status) {
          myError.code = error.status;
        } else {
          if (context.response) {
            myError.code = context.response.getStatusCode();
          } else {
            myError.code = null;
          }
        }
        try {
          myError.message = JSON.stringify(error);
        } catch (e) {
          myError.message = e;
        }
        break;
      case "string":
        error = new Error(error);
        if (context.response) {
          error.code = context.response.getStatusCode();
        } else {
          error.code = null;
        }
        break;
      case "Error":
        if (!error.code) {
          if (context.response) {
            let er = context.response.getStatusCode();
            if (er === 1000 || er === 200) {
              error.code = 500;
            } else {
              error.code = er;
            }
          } else {
            if (!error.code) {
              error.code = null;
            }
          }
        }
        break;
      default:
        myError = new Error();
        myError.message = error;
        if (context.response) {
          myError.code = context.response.getStatusCode();
        } else {
          myError.code = null;
        }
      }
    } else {
      myError = new Error();
      myError.message = error;
      if (context.response) {
        myError.code = context.response.getStatusCode();
      } else {
        myError.code = null;
      }
    }
    let exception = myError || error;
    let resolver = null;
    switch (exception.code) {
    case 404:
      resolver = this.router.resolveName(context, "frameworkBundle:default:404");
      break;
    case 401:
      resolver = this.router.resolveName(context, "frameworkBundle:default:401");
      break;
    case 403:
      resolver = this.router.resolveName(context, "frameworkBundle:default:403");
      break;
    case 408:
      resolver = this.router.resolveName(context, "frameworkBundle:default:timeout");
      break;
    default:
      resolver = this.router.resolveName(context, "frameworkBundle:default:exceptions");
      if (exception.code < 400) {
        exception.code = 500;
      }
    }

    if (exception.xjson) {
      if (context.setXjson) {
        context.setXjson(exception.xjson);
      }
    }
    exception.bundle = container.get("bundle") ? container.get("bundle").name : "";
    exception.controller = container.get("controller") ? container.get("controller").name : "";
    exception.url = context.url || "";
    if (context.isJson) {
      try {
        exception.pdu = JSON.stringify(new nodefony.PDU({
          bundle: exception.bundle,
          controller: exception.controller,
          url: exception.url,
          stack: exception.stack
        }, "ERROR"));
      } catch (e) {
        this.logger(e, "WARNING");
      }
    }
    if (context.method === "WEBSOCKET" &&
      context.response &&
      !context.response.connection) {
      context.request.reject(exception.code ? exception.code : null, exception.message);
      this.logger(exception, "ERROR", context.method);
      context.fire("onFinish", context);
    }
    if (context.response) {
      let st = context.response.setStatusCode(exception.code, exception.message);
      exception.code = st.code;
      exception.message = st.message;
    } else {
      context.fire("onFinish", context);
      this.logger(exception, "ERROR", context.method);
      return;
    }
    this.logger(exception, "ERROR", context.method);
    try {
      resolver.callController(exception);
      if (context.method === "WEBSOCKET") {
        if (exception.code < 3000) {
          exception.code += 3000;
        }
        //context.close(exception.code, exception.message);
        setTimeout(() => {
          context.close(exception.code, exception.message);
        }, 500 /*(context.type === "WEBSOCKET" ? this.closeTimeOutWs.WS : this.closeTimeOutWs.WSS)*/ );
      }
    } catch (e) {
      this.logger(e, "ERROR", context.method);
      return;
    }
  }

  onHttpRequest(request, response, type) {
    if (request.url && this.sockjs && request.url.match(this.sockjs.regPrefix)) {
      this.logger("HTTP drop to sockj " + request.url, "DEBUG");
      return;
    }
    if (response.headersSent) {
      return;
    }
    response.setHeader("Server", "nodefony");
    if (this.kernel.settings.system.statics) {
      this.serverStatic.handle(request, response, (error) => {
        if (error) {
          this.logger(error, "ERROR", " STATICS SERVER");
          return;
        }
        this.fire("onServerRequest", request, response, type);
        return this.handle(request, response, type);
      });
    } else {
      this.fire("onServerRequest", request, response, type);
      return this.handle(request, response, type);
    }
  }

  handle(request, response, type) {
    // SCOPE REQUEST ;
    let container = this.container.enterScope("request");
    //if ( domain ) { domain.container = container ; }
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

  handleFrontController(context) {
    let controller = null;
    if (this.firewall) {
      context.secure = this.firewall.isSecure(context);
    }
    // FRONT ROUTER
    let resolver = this.router.resolve(context);
    if (resolver.resolve) {
      context.resolver = resolver;
      controller = resolver.newController(context.container, context);
      if (controller.sessionAutoStart) {
        context.sessionAutoStart = controller.sessionAutoStart;
      }
      return controller;
    }
    let error = new Error("Not Found");
    error.code = 404;
    throw error;
  }

  createHttpContext(container, request, response, type) {
    let context = null;
    try {
      context = new nodefony.context.http(container, request, response, type);
    } catch (e) {
      this.logger(e, "ERROR");
      throw e;
    }
    //request events
    context.once("onError", this.onError.bind(this));
    //response events
    context.response.response.once("finish", () => {
      if (context.finished) {
        return;
      }
      if (!context) {
        return;
      }
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

  handleHttp(container, request, response, type) {
    let context = null;
    let controller = null;
    try {
      context = this.createHttpContext(container, request, response, type);
      this.logger("FROM : " +
        context.remoteAddress +
        " ORIGIN : " + context.originUrl.host +
        " URL : " +
        context.url,
        "INFO",
        (context.isAjax ? context.type +
          " REQUEST AJAX " + context.method : context.type +
          " REQUEST " + context.method));

      // DOMAIN VALID
      if (this.checkValidDomain(context) !== 200) {
        return context;
      }
      controller = this.handleFrontController(context);

    } catch (e) {
      context.once('onRequestEnd', () => {
        context.fire("onError", container, e);
        return context;
      });
    }
    if (context.secure) {
      return this.firewall.handleSecurity(context);
    }
    try {
      context.once('onRequestEnd', () => {
        try {
          if (context.sessionAutoStart || context.hasSession()) {
            return this.sessionService.start(context, context.sessionAutoStart)
              .then((session) => {
                if (!(session instanceof nodefony.Session)) {
                  throw new Error("SESSION START session storage ERROR");
                }
                try {
                  if (this.firewall) {
                    this.firewall.getSessionToken(context, session);
                  }
                } catch (e) {
                  context.fire("onError", container, e);
                  return e;
                }
                return context.handle();
              }).catch((error) => {
                context.fire("onError", container, error);
                return error;
              });
          } else {
            return context.handle();
          }
        } catch (e) {
          context.fire("onError", container, e);
          return e;
        }
      });
    } catch (e) {
      context.fire("onError", container, e);
      return e;
    }
  }

  createWebsocketContext(container, request, type) {
    let context = new nodefony.context.websocket(container, request, type);
    context.listen(this, "onError", this.onError);
    context.once('onFinish', (context) => {
      this.container.leaveScope(container);
      context.clean();
      context = null;
      request = null;
      container = null;
      type = null;
    });
    context.once('onConnect', (context) => {
      if (context.security) {
        return this.firewall.handleSecurity(context);
      }
      return context.handle();
    });
    return context;
  }

  onWebsocketRequest(request, type) {
    if (request.resourceURL.path &&
      this.sockjs &&
      request.resourceURL.path.match(this.sockjs.regPrefix)
    ) {
      this.logger("websocket drop to sockjs : " + request.resourceURL.path, "DEBUG");
      //let connection = request.accept(null, request.origin);
      //connection.drop(1006, 'TCP connection lost before handshake completed.', false);
      request = null;
      //connection = null ;
      return;
    }
    this.fire("onServerRequest", request, null, type);
    return this.handle(request, null, type);
  }

  handleWebsocket(container, request, type) {
    let context = this.createWebsocketContext(container, request, type);
    this.logger("FROM : " + context.remoteAddress +
      " ORIGIN : " + context.originUrl.host +
      " URL : " + context.url, "INFO", type);
    let controller = null;
    try {
      // DOMAIN VALID
      if (this.checkValidDomain(context) !== 200) {
        return context;
      }
      controller = this.handleFrontController(context);
      if (context.secure) {
        return context.fire("connect");
      }
      try {
        if (context.sessionAutoStart || context.hasSession()) {
          return this.sessionService.start(context, context.sessionAutoStart)
            .then((session) => {
              if (!(session instanceof nodefony.Session)) {
                throw new Error("SESSION START session storage ERROR");
              }
              try {
                if (this.firewall) {
                  this.firewall.getSessionToken(context, session);
                }
              } catch (e) {
                context.fire("onError", container, e);
                return context;
              }
              context.fire("connect");
            }).catch((error) => {
              context.fire("onError", container, error);
              return context;
            });
        } else {
          context.fire("connect");
        }
      } catch (e) {
        context.fire("onError", container, e);
      }
      return context;
    } catch (e) {
      context.fire("onError", container, e);
      return context;
    }
  }
};