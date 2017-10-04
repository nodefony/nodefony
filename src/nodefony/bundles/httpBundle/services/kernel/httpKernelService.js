module.exports = nodefony.registerService("httpKernel", function () {

  /*
   *
   *  HTTP KERNEL
   *
   *
   */
  const httpKernel = class httpKernel extends nodefony.Service {

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
      this.listen(this, "onServerRequest", (request, response, type) => {
        try {
          this.handle(request, response, type);
        } catch (e) {
          throw e;
        }
      });

      // listen KERNEL EVENTS
      this.listen(this, "onBoot", () => {
        this.firewall = this.get("security");
        this.router = this.get("router");
        this.sessionService = this.get("sessions");
        this.compileAlias();
        this.sockjs = this.get("sockjs");
        this.bundleSettings = this.getParameters("bundles.http");
        this.responseTimeout = {
          HTTP: this.bundleSettings.http.responseTimeout,
          HTTPS: this.bundleSettings.https.responseTimeout
        };
        this.closeTimeOutWs = {
          WS: this.bundleSettings.websocket.closeTimeout,
          WSS: this.bundleSettings.websocketSecure.closeTimeout
        };
        this.translation = this.get("translation");
        this.cdn = this.setCDN();
      });

      this.listen(this, "onClientError", (e, socket) => {
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

    isCrossDomain(context) {
      // request origin
      let URL = context.originUrl;
      let hostnameOrigin = URL.hostname;
      let portOrigin = URL.port;

      // request server
      let requestProto = context.protocol;
      let requestPort = context.port;
      let protocolOrigin = null;

      if (context.session) {
        let redirect = context.session.getFlashBag("redirect");
        if (redirect) {
          return false;
        }
      }
      //console.log( "prototcol ::::" + URL.protocol )
      if (!portOrigin) {
        if (URL.protocol === "http:") {
          URL.port = 80;
          portOrigin = 80;
        }
        if (URL.protocol === "https:") {
          URL.port = 443;
          portOrigin = 443;
        }
      }
      //console.log( "portOrigin ::::" + portOrigin )
      if (context.proxy) {
        requestProto = context.proxy.proxyProto;
        requestPort = context.proxy.proxyPort;
      }

      //console.log( "requestProto : " + requestProto)
      switch (requestProto) {
      case "http":
      case "https":
        protocolOrigin = URL.protocol;
        break;
      case "ws":
      case "wss":
        if (URL.protocol === "http:") {
          protocolOrigin = "ws:";
        }
        if (URL.protocol === "https:") {
          protocolOrigin = "wss:";
        }
        break;
      }

      //console.log( "check domain Request:" + this.regAlias.test( hostnameOrigin ) +" Origin : "+hostnameOrigin)
      //check domain
      if (!this.regAlias.test(hostnameOrigin)) {
        return true;
      }

      //console.log( "check protocol Request:" + requestProto +" Origin : "+protocolOrigin)
      // check protocol
      if (requestProto + ":" !== protocolOrigin) {
        return true;
      }

      //console.log( "check port Request:" + requestPort +" Origin : "+portOrigin)
      // check port
      if (requestPort != portOrigin) {
        return true;
      }
      return false;
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
          myError.message = error;
          if (error.status) {
            myError.code = error.status;
          } else {
            if (context.response) {
              myError.code = context.response.getStatusCode();
            } else {
              myError.code = (context.method === "WEBSOCKET") ? 1006 : 500;
            }
          }
          break;
        case "string":
          error = new Error(error);
          if (context.response) {
            error.code = context.response.getStatusCode();
          } else {
            error.code = (context.method === "WEBSOCKET") ? 1006 : 500;
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
                error.code = (context.method === "WEBSOCKET") ? 1006 : 500;
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
            myError.code = (context.method === "WEBSOCKET") ? 1006 : 500;
          }
        }
      } else {
        myError = new Error();
        myError.message = error;
        if (context.response) {
          myError.code = context.response.getStatusCode();
        } else {
          myError.code = (context.method === "WEBSOCKET") ? 1006 : 500;
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
          exception.code = (context.method === "WEBSOCKET") ? 1006 : 500;
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
      if (context.response) {
        let st = context.response.setStatusCode(exception.code, exception.message);
        exception.code = st.code;
        exception.message = st.message;
      } else {
        this.logger(exception, "ERROR", context.method);
        if (context.method === "WEBSOCKET") {
          // hanshake error ;
          context.request.reject(exception.code, exception.message);
          context.fire("onClose", exception.code, exception.message);
          return;
        }
        context.fire("onFinish", context, exception.code, exception.message);
        return;
      }
      this.logger(exception, "ERROR", context.method);

      try {
        resolver.callController(exception);
        if (context.method === "WEBSOCKET") {
          if (exception.code < 3000) {
            exception.code += 3000;
          }
          context.close(exception.code, exception.message);
          /*setTimeout (() =>{
              if ( exception.code < 3000 ){
                  exception.code +=3000 ;
              }
              context.drop(exception.code, exception.message);
          }, ( context.type === "WEBSOCKET" ? this.closeTimeOutWs.WS : this.closeTimeOutWs.WSS ) );*/
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
        this.serverStatic.handle(request, response, () => {
          this.fire("onServerRequest", request, response, type);
        });
      } else {
        this.fire("onServerRequest", request, response, type);
      }
    }

    handle(request, response, type) {
      // SCOPE REQUEST ;
      let container = this.container.enterScope("request");
      //if ( domain ) { domain.container = container ; }
      switch (type) {
      case "HTTP":
      case "HTTPS":
        return this.handleHttp(container, request, response, type);
      case "WEBSOCKET":
      case "WEBSOCKET SECURE":
        return this.handleWebsocket(container, request, type);
      }
    }

    handleHttp(container, request, response, type) {
      let context = new nodefony.context.http(container, request, response, type);
      //request events
      context.listen(this, "onError", this.onError);
      let resolver = null;
      let next = null;
      //response events
      context.response.response.on("finish", () => {
        context.fire("onFinish", context);
        this.container.leaveScope(container);
        context.clean();
        context = null;
        request = null;
        response = null;
        container = null;
        resolver = null;
        type = null;
        next = null;
      });

      try {
        // DOMAIN VALID
        next = this.checkValidDomain(context);
        if (next !== 200) {
          return;
        }
        // FRONT ROUTER
        resolver = this.router.resolve(context);
        if (resolver.resolve) {
          context.resolver = resolver;
        } else {
          let error = new Error("Not Found");
          error.code = 404;
          throw error;
        }
        if ((!this.firewall) || resolver.bypassFirewall) {
          request.on('end', () => {
            try {
              if (context.sessionAutoStart === "autostart") {
                this.sessionService.start(context, "default").then((session) => {
                  if (!(session instanceof nodefony.Session)) {
                    throw new Error("SESSION START session storage ERROR");
                  }
                  this.logger("AUTOSTART SESSION", "DEBUG");
                  context.fire("onRequest");
                }).catch((error) => {
                  throw error;
                });
              } else {
                context.fire("onRequest");
              }
            } catch (e) {
              return context.fire("onError", container, e);
            }
          });
          return;
        }
        this.fire("onSecurity", context);
      } catch (e) {
        return context.fire("onError", container, e);
      }
    }

    onWebsocketRequest(request, type) {
      if (request.resourceURL.path && this.sockjs && request.resourceURL.path.match(this.sockjs.regPrefix)) {
        this.logger("websocket drop to sockjs : " + request.resourceURL.path, "DEBUG");
        //let connection = request.accept(null, request.origin);
        //connection.drop(1006, 'TCP connection lost before handshake completed.', false);
        request = null;
        //connection = null ;
        return;
      }
      this.fire("onServerRequest", request, null, type);
    }

    handleWebsocket(container, request, type) {
      let context = new nodefony.context.websocket(container, request, type);
      container.set("context", context);
      context.listen(this, "onError", this.onError);
      let resolver = null;
      let next = null;

      context.listen(this, "onClose", (reasonCode, description) => {
        context.fire("onFinish", context, reasonCode, description);
        context.clean();
        context = null;
        request = null;
        container = null;
        type = null;
        next = null;
        resolver = null;
      });

      try {
        // FRONT ROUTER
        resolver = this.router.resolve(context);
        if (resolver.resolve) {
          context.resolver = resolver;
          // DOMAIN VALID
          next = this.checkValidDomain(context);
          if (next !== 200) {
            return;
          }
        } else {
          let error = new Error("Not Found");
          error.code = 404;
          throw error;
        }
        if ((!this.firewall) || resolver.bypassFirewall) {
          try {
            if (context.sessionAutoStart === "autostart") {
              this.sessionService.start(context, "default").then((session) => {
                if (!(session instanceof nodefony.Session)) {
                  throw new Error("SESSION START session storage ERROR");
                }
                this.logger("AUTOSTART SESSION", "DEBUG");
                context.fire("onRequest");
              }).catch((error) => {
                return error;
              });
            } else {
              context.fire("onRequest");
            }
          } catch (e) {
            context.fire("onError", container, e);
          }
          return;
        }
        this.fire("onSecurity", context);
      } catch (e) {
        return context.fire("onError", container, e);
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
  };
  return httpKernel;
});
