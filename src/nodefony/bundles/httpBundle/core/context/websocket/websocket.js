nodefony.register.call(nodefony.context, "websocket", function () {

  const onClose = function (reasonCode, description) {
    if (!this.request) {
      this.logger('CLOSE : ' + this.remoteAddress + " " + reasonCode + " " + description, "INFO");
    } else {
      this.logger('CLOSE : ' + this.remoteAddress + " ORIGIN : " + this.origin + " " + reasonCode + " " + description, "INFO");
    }
    if (this.connection.state !== "closed") {
      try {
        this.response.drop(reasonCode, description);
      } catch (e) {
        this.logger('CLOSE : ' + this.remoteAddress + " ORIGIN : " + this.origin + " " + e.message, "ERROR");
      }
      this.fire("onClose", reasonCode, description, this.connection);
    } else {
      this.fire("onClose", reasonCode, description, this.connection);
    }
    this.fire("onFinish", this, reasonCode, description);
  };

  const websocket = class websocket extends nodefony.Service {

    constructor(container, request, type) {
      super("WEBSOCKET CONTEXT", container);
      this.type = type;
      this.protocol = (type === "WEBSOCKET SECURE") ? "wss" : "ws";
      this.isJson = true;
      this.kernelHttp = this.get("httpKernel");
      //I18n
      this.translation = this.kernelHttp.translation.createTranslation(this);
      this.set("translation", this.translation);
      this.kernelHttp = this.container.get("httpKernel");
      this.request = request;
      this.acceptedProtocol = request.httpRequest.headers["sec-websocket-protocol"] || null;
      this.method = "WEBSOCKET";
      this.request.method = "WEBSOCKET";
      this.remoteAddress = this.request.remoteAddress;
      this.origin = request.origin;
      this.request.url = url.parse(this.protocol + "://" + this.request.host);
      this.request.url.hash = this.request.resourceURL.hash;
      this.request.url.search = this.request.resourceURL.search;
      this.request.url.query = this.request.resourceURL.query;
      this.request.url.pathname = this.request.resourceURL.pathname;
      this.request.url.path = this.request.resourceURL.path;
      this.url = url.format(this.request.url);
      this.port = this.request.url.port;
      this.domain = this.request.url.hostname;
      this.router = this.get("router");
      try {
        this.originUrl = url.parse(request.origin);
      } catch (e) {
        this.originUrl = url.parse(this.url);
      }
      this.secureArea = null;
      this.domain = this.getHostName();
      this.validDomain = this.isValidDomain();
      this.logger("FROM : " + this.remoteAddress + " ORIGIN : " + this.originUrl.host + " URL : " + this.url, "INFO");
      // session
      this.session = null;
      this.sessionService = this.get("sessions");
      this.sessionAutoStart = this.sessionService.settings.start;
      //parse cookies
      this.cookies = {};
      this.parseCookies();
      this.cookieSession = this.getCookieSession(this.sessionService.settings.name);
      this.security = null;
      this.user = null;
      this.resolver = null;
      this.nbCallController = 0;
      // LISTEN EVENTS
      this.listen(this, "onView", (result) => {
        if (this.response) {
          this.response.body = result;
        }
      });
      this.listen(this, "onResponse", this.send);
      this.listen(this, "onRequest", this.handle);
      this.listen(this, "connect", () => {
        this.connect(this.resolver.acceptedProtocol);
      });
      //case proxy
      this.proxy = null;
      if (this.request.httpRequest.headers["x-forwarded-for"]) {
        this.proxy = {
          proxyServer: this.request.httpRequest.headers["x-forwarded-server"],
          proxyProto: this.request.httpRequest.headers["x-forwarded-proto"],
          proxyPort: this.request.httpRequest.headers["x-forwarded-port"],
          proxyFor: this.request.httpRequest.headers["x-forwarded-for"],
          proxyHost: this.request.httpRequest.headers["x-forwarded-host"],
          proxyVia: this.request.httpRequest.headers.via
        };
        this.logger("PROXY WEBSOCKET REQUEST x-forwarded VIA : " + this.proxy.proxyVia, "DEBUG");
      }
      this.crossDomain = this.isCrossDomain();
    }

    connect(acceptedProtocol) {
      this.connection = this.request.accept(acceptedProtocol || null, this.origin);
      this.response = new nodefony.wsResponse(this.connection, this.container, this.type);
      this.fire("onConnect", this, this.connection);
      this.logger("Connection origin : " + this.originUrl.host + " Protocol : " + acceptedProtocol || "Not Defined", "DEBUG");
      // LISTEN EVENTS SOCKET
      this.connection.on('message', this.handleMessage.bind(this));
      this.connection.on('close', onClose.bind(this));
    }

    getCookieSession(name) {
      if (this.cookies[name]) {
        return this.cookies[name];
      }
      return null;
    }

    isValidDomain() {
      return this.kernelHttp.isValidDomain(this);
    }

    isCrossDomain() {
      return this.kernelHttp.corsManager.isCrossDomain(this);
    }

    getRemoteAddress() {
      return this.remoteAddress;
    }

    getHost() {
      return this.request.httpRequest.headers.host;
    }

    getHostName() {
      return this.domain;
      //return this.originUrl.hostname ;
    }

    getUserAgent() {
      return this.request.httpRequest.headers['user-agent'];
    }

    getMethod() {
      return "WEBSOCKET";
    }

    getUser() {
      return this.user ||  null;
    }

    addCookie(cookie) {
      if (cookie instanceof nodefony.cookies.cookie) {
        this.cookies[cookie.name] = cookie;
      } else {
        throw new Error("Response addCookies not valid cookies");
      }
    }

    parseCookies() {
      return nodefony.cookies.cookiesParser(this);
    }

    clean() {
      //delete this.request ;
      this.request = null;
      if (this.response) {
        this.response.clean();
      }
      //delete  this.response ;
      this.response = null;
      //delete   this.notificationsCenter ;
      this.notificationsCenter = null;
      //delete this.cookies ;
      this.cookies = null;
      if (this.translation) {
        delete this.translation;
      }
      if (this.cookieSession) {
        delete this.cookieSession;
      }
    }

    flashTwig(key) {
      if (this.session) {
        return this.session.getFlashBag(key);
      }
      return null;
    }

    extendTwig(param) {
      return nodefony.extend({}, param, {
        nodefony: {
          url: this.request.url,
          environment: this.kernel.environment,
          debug: this.kernel.debug
        },
        getFlashBag: this.flashTwig.bind(this),
        render: this.render.bind(this),
        controller: this.controller.bind(this),
        trans: this.translation.trans.bind(this.translation),
        getLocale: this.translation.getLocale.bind(this.translation),
        trans_default_domain: this.translation.trans_default_domain.bind(this.translation),
        getTransDefaultDomain: this.translation.getTransDefaultDomain.bind(this.translation)
      });
    }

    controller(pattern, data) {
      let container = this.kernelHttp.container.enterScope("subRequest");
      container.set("context", this);
      container.set("translation", this.translation);
      let control = null;
      let resolver = null;
      try {
        resolver = this.router.resolveName(this, pattern);
      } catch (e) {
        return this.fire("onError", this.container, e);
      }
      if (!resolver.resolve) {
        let error = new Error(pattern);
        error.code = 404;
        return this.fire("onError", this.container, error);
      }
      try {
        control = new resolver.controller(container, this);
        control.response = new nodefony.Response(null, container, this.type);
        if (data) {
          Array.prototype.shift.call(arguments);
          for (let i = 0; i < arguments.length; i++) {
            resolver.variables.push(arguments[i]);
          }
        }
      } catch (e) {
        return this.fire("onError", this.container, e);
      }
      return {
        resolver: resolver,
        controller: control,
        response: resolver.action.apply(control, resolver.variables)
      };
    }

    render(subRequest) {
      this.removeListener("onView", subRequest.controller.response.setBody);
      this.kernelHttp.container.leaveScope(subRequest.controller.container);
      switch (true) {
      case subRequest.response instanceof nodefony.Response:
      case subRequest.response instanceof nodefony.wsResponse:
        return subRequest.response.body;
      case subRequest.response instanceof Promise:
      case subRequest.response instanceof BlueBird:
        if (subRequest.controller.response.body === "") {
          let txt = "nodefony TWIG function render can't resolve async Call in Twig Template ";
          this.logger(txt, "ERROR");
          return txt;
        }
        return subRequest.controller.response.body;
      case nodefony.typeOf(subRequest.response) === "object":
        if (subRequest.resolver.defaultView) {
          return this.render({
            resolver: subRequest.resolver,
            controller: subRequest.controller,
            response: subRequest.controller.render(subRequest.resolver.defaultView, subRequest.response)
          });
        } else {
          throw new Error("default view not exist");
        }
        break;
      case typeof subRequest.response === "string":
        return subRequest.response;
      default:
        this.logger("nodefony TWIG function render can't resolve async Call in Twig Template ", "WARNING");
        return this.response.body;
      }
    }

    handleMessage(message) {
      this.response.body = message;
      try {
        if (!this.resolver) {
          this.resolver = this.router.resolve(this);
        } else {
          try {
            this.resolver.match(this.resolver.route, this);
          } catch (e) {
            this.request.reject();
            this.fire("onError", this.container, e);
            return;
          }
        }
        this.fire("onMessage", message, this, "RECEIVE");
        if (this.resolver.resolve) {
          return this.resolver.callController(message);
        } else {
          this.request.reject();
        }
      } catch (e) {
        this.fire("onError", this.container, e);
      }
    }

    handle(data) {
      try {
        this.translation.handle();
        if (!this.resolver) {
          this.resolver = this.router.resolve(this);
        } else {
          try {
            this.resolver.match(this.resolver.route, this);
          } catch (e) {
            this.request.reject();
            throw e;
          }
        }
        //WARNING EVENT KERNEL
        this.kernel.fire("onRequest", this, this.resolver);
        if (this.resolver.resolve) {
          return this.resolver.callController(data || null);
        } else {
          this.request.reject();
        }
      } catch (e) {
        this.fire("onError", this.container, e);
      }
    }

    handleError(container, error) {
      this.logger("Message : " + error.message, "ERROR");
    }

    logger(pci, severity, msgid, msg) {
      if (!msgid) {
        msgid = this.type + " REQUEST";
      }
      return super.logger(pci, severity, msgid, msg);
    }

    send(data, type) {
      let myData = null;
      if (this.response) {
        if (data instanceof nodefony.wsResponse) {
          myData = this.response.body;
        } else {
          myData = data;
        }
        this.fire("onMessage", myData, this, "SEND");
        this.fire("onSend", this.response, this);
        return this.response.send(myData, type);
      }
      return null;
    }

    close(reasonCode, description) {
      return this.response.close(reasonCode, description);
    }

    drop(reasonCode, description) {
      return this.response.drop(reasonCode, description);
    }
  };
  return websocket;
});
