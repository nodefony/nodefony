nodefony.register.call(nodefony.context, "socket", function() {

  const socket = class socketContext extends nodefony.Context {

    constructor(container, socket, type) {
      super(container, socket.conn.request, null, "socket");
      this.request = socket.conn.request;
      this.type = type;
      this.socket = socket;
      this.protocol = (type === "HTTPS") ? "wss" : "ws";
      this.scheme = (type === "HTTPS") ? "wss" : "ws";
      this.isJson = true;
      this.method = this.getMethod();

      this.remoteAddress = socket.conn.remoteAddress;
      this.response = new nodefony.socketResponse(this.socket, this.container, this.type);

      if (typeof this.request.url === "string") {
        let href = `${this.scheme}://${this.request.headers.host}${this.request.url}`;
        this.urlP = url.parse(href);
        this.request.url = this.urlP;
      } else {
        this.urlP = this.request.url;
      }
      if (this.socket.nsp && this.socket.nsp.name) {
        if (this.socket.nsp.name !== "/") {
          let href = `${this.urlP.host}${this.urlP.pathname}${this.socket.nsp.name}${this.urlP.search}`;
          if (this.urlP.hash) {
            href += this.urlP.hash;
          }
          href = href.replace(/\/\//, "/");
          href = `${this.urlP.protocol}//${href}`;
          this.urlP = url.parse(href);
          this.request.url = this.urlP;
        }
      }
      //console.log(this.urlP)
      this.url = url.format(this.urlP);
      //console.log(this.url)
      this.port = this.urlP.port;
      this.parseCookies();
      this.cookieSession = this.getCookieSession(this.sessionService.settings.name);
      try {
        this.originUrl = url.parse(this.request.headers.origin);
      } catch (e) {
        this.originUrl = url.parse(this.url);
      }
      // domain
      this.domain = this.getHostName();
      this.validDomain = this.isValidDomain();

      this.once("connect", () => {
        this.handle(this.resolver.acceptedProtocol);
      });

      this.socket.on('disconnect', (err) => {
        this.logger(err, "ERROR");
        this.close(err);
      });

      this.socket.on('event', this.handleMessage.bind(this));

      //case proxy
      this.proxy = null;
      if (this.request.headers["x-forwarded-for"]) {
        this.proxy = {
          proxyServer: this.request.headers["x-forwarded-server"],
          proxyProto: this.request.headers["x-forwarded-proto"],
          proxyPort: this.request.headers["x-forwarded-port"],
          proxyFor: this.request.headers["x-forwarded-for"],
          proxyHost: this.request.headers["x-forwarded-host"],
          proxyVia: this.request.headers.via
        };
        this.logger("PROXY WEBSOCKET REQUEST x-forwarded VIA : " + this.proxy.proxyVia, "DEBUG");
      }
      this.crossDomain = this.isCrossDomain();
    }

    handle(data) {

      try {
        this.locale = this.translation.handle();
        if (!this.resolver) {
          this.resolver = this.router.resolve(this);
        } else {
          //console.log(this.resolver.route)
          try {
            this.resolver.match(this.resolver.route, this);
          } catch (e) {
            console.log(e)
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
        console.log(e)
        this.fire("onError", this.container, e);
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

    handleError(container, error) {
      this.logger("Message : " + error.message, "ERROR");
    }

    clean() {
      this.socket = null;
      delete this.socket;
      this.request = null;
      delete this.request;
      if (this.response) {
        this.response.clean();
      }
      this.response = null;
      this.container.clean();
      super.clean();
    }

    getHostName() {
      return this.request.url.hostname;
    }

    getMethod() {
      return "WEBSOCKET";
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

    close(description) {
      if (this.response) {
        return this.response.close(description);
      }
    }

    drop(reasonCode, description) {
      //return this.response.drop(reasonCode, description);
    }

  };

  return socket;
});