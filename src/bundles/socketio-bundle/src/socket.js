nodefony.register.call(nodefony.context, "socket", function() {

  const socket = class socketContext extends nodefony.Context {

    constructor(container, socket, type) {
      super(container, socket.conn.request, null, "socket");
      this.request = socket.conn.request;
      this.type = type;
      this.socket = socket;
      this.protocol = (type === "WEBSOCKET SECURE") ? "wss" : "ws";
      this.scheme = (type === "WEBSOCKET SECURE") ? "wss" : "ws";
      this.isJson = true;
      this.method = this.getMethod();

      this.remoteAddress = socket.conn.remoteAddress;
      this.response = new nodefony.socketResponse(this.socket, this.container, this.type);

      if (typeof this.request.url === "string") {
        let href = `${this.scheme}://${this.request.headers.host}${this.request.url}`;
        this.urlP = url.parse(href);
        this.request.url = this.urlP;
      } else {
        if (!this.request.url.host) {
          let path = `${this.scheme}://${this.request.handshake.headers.host}${this.request.resourceURL.path}`;
          this.urlP = url.parse(path);
          this.request.url = this.urlP;
        } else {
          this.urlP = this.request.url;
        }
        /*if (!this.request.url.host || this.request.url.host === "undefined") {
          //console.log(this.request.headers["referer"], this.request.headers.referer)
          this.urlP = url.parse(this.request.headers.referer);
          this.request.url = this.urlP;
        } else {
          this.urlP = this.request.url;
        }*/
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

      this.once("connect", (socket) => {
        this.handle(socket);
      });

      this.socket.on('disconnect', (err) => {
        this.logger(err, "ERROR");
        let res = this.handleMessage(["disconnect", err]);
        if (nodefony.isPromise(res)) {
          return res.then((ele) => {
            return this.close(ele);
          });
        }
        this.close(err);
      });

      // middleware use
      this.socket.use((packet, next) => {
        let result = null;
        try {
          result = this.handleMessage.call(this, packet);
        } catch (e) {
          this.logger(e, "ERROR");
          return next(e);
        }
        if (nodefony.isPromise(result)) {
          return result
            .then((data) => {
              next();
              return data;
            })
            .catch((e) => {
              this.logger(e, "ERROR");
              next(e);
            });
        }
        return next();
      });

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

    handle(socket) {
      try {
        this.locale = this.translation.handle();
        //WARNING EVENT KERNEL
        this.fire("onRequest", this, this.resolver);
        this.kernel.fire("onRequest", this, this.resolver);
        return this.handleMessage(["connect", socket]);
      } catch (e) {
        console.log(e);
        this.fire("onError", this.container, e);
      }
    }

    handleMessage(message) {
      //console.log(message)
      this.response.body = message;
      try {
        if (!this.resolver) {
          this.resolver = this.router.resolve(this);
        } else {
          try {
            this.resolver.match(this.resolver.route, this);
          } catch (e) {
            this.logger(e, "ERROR");
            this.socket.disconnect();
            this.fire("onError", this.container, e);
            return;
          }
        }
        this.fire("onMessage", message, this, "RECEIVE");
        if (this.resolver.resolve) {
          return this.resolver.callController(message);
        } else {
          this.socket.disconnect();
        }
      } catch (e) {
        this.logger(e, "ERROR");
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

  };

  return socket;
});