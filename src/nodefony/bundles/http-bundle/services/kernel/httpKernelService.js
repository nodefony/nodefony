/*
 *
 *  HTTP KERNEL
 *
 *
 */
const clientErrorExclude = /SSL alert number 46|SSL alert number 48/;

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

    // listen KERNEL EVENTS
    this.once("onBoot", () => {
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

    this.once("onReady", () => {
      this.debugView = this.getTemplate("monitoringBundle::debugBar.html.twig");
      //console.log(this.debugView)
    });

    this.on("onClientError", (e, socket) => {
      let exclude = clientErrorExclude.test(e.message);
      if (!exclude) {
        this.logger(e, "WARNING", "SOCKET CLIENT ERROR");
      }
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
        throw new Error("Resolver Pattern Template Bundle :" + objPattern.bundle + "NOT exist");
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
    let context = container.get("context");
    let httpError = null;
    let result = null;
    try {
      switch (true) {
        case (error instanceof nodefony.securityError):
        case (error instanceof nodefony.httpError):
          httpError = error;
          break;
        default:
          if (context.response && context.response.statusCode === 200) {
            httpError = new nodefony.httpError(error, 500, container);
          } else {
            httpError = new nodefony.httpError(error, null, container);
          }
      }
      if (!httpError.context) {
        httpError.context = context;
        httpError.resolve(true);
      }
      context = httpError.context;
      context.resolver = httpError.resolver;
      httpError.logger();
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
      context.fire("onRequest", context, httpError.resolver);
      this.kernel.fire("onRequest", context, httpError.resolver);
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
      return context;
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
    if (this.kernel.settings.system.servers.statics || this.kernel.settings.system.statics) {
      return this.serverStatic.handle(request, response)
        .then((res) => {
          if (res) {
            this.fire("onServerRequest", request, response, type);
            return this.handle(request, response, type)
            .catch(e => {
              this.logger(e, "ERROR");
            });
          }
          throw new Error("Bad request");
        })
        .catch(e => {
          if (e) {
            this.logger(e, "ERROR", " STATICS SERVER");
          }
          return e;
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
      if (!context) {
        return;
      }
      if (context.finished) {
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

  handleFrontController(context, checkFirewall = true) {
    return new Promise((resolve, reject) => {
      let controller = null;
      if (this.firewall && checkFirewall) {
        context.secure = this.firewall.isSecure(context);
      }
      // FRONT ROUTER
      try{
        let resolver = this.router.resolve(context);
        if (resolver.resolve) {
          context.resolver = resolver;
          controller = resolver.newController(context.container, context);
          if (controller.sessionAutoStart) {
            context.sessionAutoStart = controller.sessionAutoStart;
            if (context.csrf) {
              context.once("onSessionStart", () => {
                return this.csrfService.handle(context)
                  .then((token) => {
                    if (token) {
                      this.logger(`Check CSRF TOKEN : ${token.name} OK`);
                    }
                    return resolve(controller);
                  })
                  .catch(e => {
                    return reject(e);
                  });
              });
            }
          } else {
            if (context.csrf) {
              return this.csrfService.handle(context)
                .then((token) => {
                  if (token) {
                    this.logger(`Check CSRF TOKEN : ${token.name} OK`);
                  }
                  return resolve(controller);
                })
                .catch(e => {
                  return reject(e);
                });
            }
          }
          return resolve(controller);
        }
        let error = new Error("Not Found");
        error.code = 404;
        return reject(error);
      }catch(e){
        return reject(e);
      }
    });
  }

  requestEnd(context, controller, error = null) {
    return new Promise((resolve, reject) => {
      try {
        if (!context) {
          if (error) {
            return reject(error);
          }
          return reject(new Error(`Bad context`));
        }
        if (context.requestEnded) {
          try {
            if (context.translation) {
              context.locale = context.translation.handle();
            }
          } catch (err) {
            this.logger(err, "WARNING");
            if (error) {
              return reject(error);
            }
            return reject(err);
          }
          if (error) {
            return reject(error);
          }
          return reject(new Error(`Request already Ended`));
        }

        if (this.settings[context.scheme].headers) {
          context.response.setHeaders(this.settings[context.scheme].headers);
        }
        if (context.secure || context.isControlledAccess) {
          return this.firewall.handleSecurity(context)
          .then(()=>{
            return resolve(null);
          })
          .catch(e =>{
            return reject(e);
          });
          //return resolve(this.firewall.handleSecurity(context));
        }
        context.once('onRequestEnd', () => {
          try {
            if (context.sessionAutoStart || context.hasSession()) {
              return this.sessionService.start(context, context.sessionAutoStart)
                .then((session => {
                  if (!(session instanceof nodefony.Session)) {
                    this.logger(new Error("SESSION START session storage ERROR"), "WARNING");
                  }
                  if (controller) {
                    controller.session = session;
                  }
                  if (this.firewall) {
                    this.firewall.getSessionToken(context, session);
                  }
                  if (error) {
                    return reject(error);
                  }
                  return resolve(context);
                }));
            } else {
              if (error) {
                return reject(error);
              }
              return resolve(context);
            }
          } catch (e) {
            return reject(e);
          }
        });
      } catch (e) {
        return reject(e);
      }
    });
  }

  handleHttp(container, request, response, type) {
    return new Promise((resolve, reject) => {
      let context = null;
      try {
        context = this.createHttpContext(container, request, response, type);
        this.logger(`FROM : ${context.remoteAddress} ORIGIN : ${context.originUrl.host} URL : ${context.url}`,
          "INFO",
          (context.isAjax ? `${context.type} AJAX REQUEST ${context.method}` : `${context.type} REQUEST ${context.method}`));
        // DOMAIN VALID
        if (this.kernel.domainCheck) {
          if (this.checkValidDomain(context) !== 200) {
            return context;
          }
        }
      } catch (e) {
        return this.requestEnd(context, null, e)
          .catch(e => {
            context.fire("onError", container, e);
            return reject(e);
          });
      }
      return this.handleFrontController(context)
        .then((controller) => {
          return this.requestEnd(context, controller, null)
            .then((ctx) => {
              if ( ctx instanceof nodefony.Context){
                return ctx.handle()
                  .then(() => {
                    return resolve(context);
                  })
                  .catch(e => {
                    context.fire("onError", container, e);
                    return reject(e);
                  });
              }
              return resolve(context);
            })
            .catch(e => {
              context.fire("onError", container, e);
              return reject(e);
            });
        })
        .catch(e => {
          return this.requestEnd(context, null, e)
            .catch(e => {
              context.fire("onError", container, e);
              return reject(e);
            });
        });
    });
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
      if (context.security || context.isControlledAccess) {
        return this.firewall.handleSecurity(context);
      }
      return context.handle();
    });
    return context;
  }

  handleWebsocket(container, request, type) {
    let context = null;
    try {
      context = this.createWebsocketContext(container, request, type);
      this.logger("FROM : " + context.remoteAddress +
        " ORIGIN : " + context.originUrl.host +
        " URL : " + context.url, "INFO", type);

      if (this.kernel.domainCheck) {
        // DOMAIN VALID
        if (this.checkValidDomain(context) !== 200) {
          return Promise.resolve(context);
        }
      }
    } catch (e) {
      if (context) {
        context.fire("onError", container, e);
        return Promise.resolve(context);
      } else {
        return Promise.reject(e);
      }
    }
    return this.handleFrontController(context)
      .then((controller) => {
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
                controller.session = session;
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
      }).catch(e => {
        context.fire("onError", container, e);
        return context;
      });
  }

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


};
