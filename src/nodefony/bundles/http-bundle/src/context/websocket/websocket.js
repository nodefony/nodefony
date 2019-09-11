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

  const websocket = class websocketContext extends nodefony.Context {

    constructor(container, request, type) {
      super(container, request, null, type);
      this.protocol = (type === "WEBSOCKET SECURE") ? "wss" : "ws";
      this.scheme = (type === "WEBSOCKET SECURE") ? "wss" : "ws";
      this.isJson = true;
      this.method = this.getMethod();
      this.response = new nodefony.wsResponse(null, this.container, this.type);
      this.request = request;
      this.request.method = this.method;
      this.remoteAddress = this.request.remoteAddress;
      this.origin = this.request.origin;
      this.acceptedProtocol = request.httpRequest.headers["sec-websocket-protocol"] || null;
      this.request.url = url.parse(this.scheme + "://" + this.request.host);
      this.request.url.hash = this.request.resourceURL.hash;
      this.request.url.search = this.request.resourceURL.search;
      this.request.url.query = this.request.resourceURL.query;
      this.request.url.pathname = this.request.resourceURL.pathname;
      this.request.url.path = this.request.resourceURL.path;
      this.url = url.format(this.request.url);
      this.port = this.request.url.port;

      this.parseCookies();
      this.cookieSession = this.getCookieSession(this.sessionService.settings.name);

      try {
        this.originUrl = url.parse(this.request.origin);
      } catch (e) {
        this.originUrl = url.parse(this.url);
      }
      // domain
      this.domain = this.getHostName();
      this.validDomain = this.isValidDomain();
      // LISTEN EVENTS
      /*this.on("onView", (result) => {
        if (this.response) {
          this.response.body = result;
        }
      });*/
      //this.listen(this, "onResponse", this.send);
      //this.once("onRequest", this.handle.bind(this));
      this.once("connect", () => {
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
      this.connection = this.request.accept(acceptedProtocol || null, this.origin /*, this.request.cookies || null*/ );
      this.response.setConnection(this.connection);
      this.connection.on('close', onClose.bind(this));
      this.requestEnded = true;
      this.fire("onConnect", this, this.connection);
      this.logger("Connection origin : " + this.originUrl.host + " Protocol : " + acceptedProtocol || "Not Defined", "DEBUG");
      // LISTEN EVENTS SOCKET
      this.connection.on('message', this.handleMessage.bind(this));
    }

    getRemoteAddress() {
      return this.remoteAddress;
    }

    getHost() {
      return this.request.httpRequest.headers.host;
    }

    getHostName() {
      return this.request.url.hostname;
    }

    getUserAgent() {
      return this.request.httpRequest.headers['user-agent'];
    }

    getMethod() {
      return "WEBSOCKET";
    }

    clean() {
      this.request = null;
      delete this.request;
      if (this.response) {
        this.response.clean();
      }
      this.response = null;
      this.container.clean();
      super.clean();
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
        this.locale = this.translation.handle();
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
        this.fire("onRequest", this, this.resolver);
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

    send(data, type) {
      if (this.response) {
        if (!data) {
          data = this.response.body;
        }
        if (data) {
          this.fire("onMessage", data, this, "SEND");
          this.fire("onSend", data, this);
          return this.response.send(data, type);
        }
      }
      return null;
    }

    close(reasonCode, description) {
      if (this.response) {
        return this.response.close(reasonCode, description);
      }
    }

    drop(reasonCode, description) {
      return this.response.drop(reasonCode, description);
    }
  };
  return websocket;
});
