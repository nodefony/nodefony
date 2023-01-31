nodefony.register.call(nodefony.context, "websocket", () => {
  const onClose = function (reasonCode, description) {
    this.log(
      `${clc.cyan("URL")} : ${this.url}  ${clc.cyan("FROM")} : ${this.remoteAddress} ${clc.cyan("ORIGIN")} : ${this.originUrl.host} ${clc.cyan("Description")} : ${description} `,
      "INFO",
      `${this.type} ${clc.magenta(reasonCode)} CLOSE ${this.method}`
    );

    if (this.connection.state !== "closed") {
      try {
        this.response.drop(reasonCode, description);
      } catch (e) {
        // this.log('CLOSE : ' + this.remoteAddress + " ORIGIN : " + this.origin + " " + e.message, "ERROR");
        this.log(
          `${clc.cyan("URL")} : ${this.url}  ${clc.cyan("FROM")} : ${this.remoteAddress} ${clc.cyan("ORIGIN")} : ${this.originUrl.host} ${clc.cyan("error")} : ${e.message} `,
          "ERROR",
          `${this.type} CLOSE ${clc.red(this.method)}`
        );
      }
      this.fire("onClose", reasonCode, description, this.connection);
    } else {
      this.fire("onClose", reasonCode, description, this.connection);
    }
    this.fire("onFinish", this, reasonCode, description);
  };

  const websocket = class websocketContext extends nodefony.Context {
    constructor (container, request, type) {
      super(container, request, null, type);
      this.protocol = type === "WEBSOCKET SECURE" ? "wss" : "ws";
      this.scheme = type === "WEBSOCKET SECURE" ? "wss" : "ws";
      this.isJson = true;
      this.method = this.getMethod();
      this.response = new nodefony.wsResponse(null, this.container, this.type);
      this.request = request;
      this.request.method = this.method;
      this.remoteAddress = this.request.remoteAddress;
      this.origin = this.request.origin;
      this.acceptedProtocol = request.httpRequest.headers["sec-websocket-protocol"] || null;
      this.request.url = url.parse(`${this.scheme}://${this.request.host}`);
      this.request.url.hash = this.request.resourceURL.hash;
      this.request.url.search = this.request.resourceURL.search;
      this.request.url.query = this.request.resourceURL.query;
      this.request.query = this.request.resourceURL.query;
      this.request.url.pathname = this.request.resourceURL.pathname;
      this.request.url.path = this.request.resourceURL.path;
      this.url = url.format(this.request.url);
      this.port = this.request.url.port;
      // this.nodefonyId = null;
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
      this.rejected = false;
      this.request.on("requestRejected", () => {
        this.rejected = true;
      });
      // case proxy
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
        this.log(`PROXY WEBSOCKET REQUEST x-forwarded VIA : ${this.proxy.proxyVia}`, "DEBUG");
      }
      this.crossDomain = this.isCrossDomain();
    }

    logRequest (httpError, acceptedProtocol) {
      if (httpError) {
        // return httpError.logger();
        return this.log(
          `${clc.cyan("URL")} : ${this.url}  ${clc.cyan("FROM")} : ${this.remoteAddress} ${clc.cyan("ORIGIN")} : ${this.originUrl.host}
        ${httpError.toString()}`,
          "ERROR",
          `${this.type} ${clc.magenta(this.response.statusCode)} ${clc.red(this.method)}`
        );
      }
      return this.log(
        `${clc.cyan("URL")} : ${this.url} ${clc.cyan("Accept-Protocol")} : ${acceptedProtocol || "*"} ${clc.cyan("FROM")} : ${this.remoteAddress} ${clc.cyan("ORIGIN")} : ${this.originUrl.host}`,
        "INFO",
        `${this.type} ${clc.magenta(this.response.statusCode)} ${this.method}`
      );

      /* return this.log(`FROM : ${this.remoteAddress} ORIGIN : ${this.originUrl.host} URL : ${this.url}`,
        "INFO",
        (this.isAjax ? `${this.type} AJAX REQUEST ${this.method}` : `${this.type} ${this.method}`));*/
    }

    connect () {
      return new Promise((resolve, reject) => {
        try {
          if (this.rejected) {
            return;
          }
          let acceptedProtocol = null;
          if (this.resolver) {
            acceptedProtocol = this.resolver.acceptedProtocol;
          }
          this.response.setCookies();
          this.connection = this.request.accept(acceptedProtocol, this.origin, this.response.cookiesToSet);
          this.response.setConnection(this.connection);
          this.connection.on("close", onClose.bind(this));
          this.requestEnded = true;
          this.fire("onConnect", this, this.connection);
          // LISTEN EVENTS SOCKET
          this.connection.on("message", this.handleMessage.bind(this));
          this.logRequest(null, acceptedProtocol);
          return resolve(this.connection);
        } catch (e) {
          return reject(e);
        }
      });
    }

    getRemoteAddress () {
      return this.remoteAddress;
    }

    getHost () {
      return this.request.httpRequest.headers.host;
    }

    getHostName () {
      return this.request.url.hostname;
    }

    getUserAgent () {
      return this.request.httpRequest.headers["user-agent"];
    }

    getMethod () {
      return "WEBSOCKET";
    }

    clean () {
      this.request = null;
      delete this.request;
      if (this.response) {
        this.response.clean();
      }
      this.response = null;
      this.container.clean();
      super.clean();
    }

    handleMessage (message) {
      this.response.body = message;
      try {
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
        this.fire("onMessage", message, this, "RECEIVE");
        if (this.resolver.resolve) {
          /* try {
            if( message.utf8Data){
              let result = JSON.parse(message.utf8Data);
              if (result.nodefonyId) {
                this.nodefonyId = {
                  id: result.nodefonyId,
                  timeout: result.timeout,
                  timeoutid: result.timeoutid
                }
                delete result.nodefonyId;
                delete result.timeout;
                delete result.timeoutid;
                message.utf8Data = result.stringify(result);
                return this.resolver.callController(message);
              }
            }
          } catch (e) {
            return this.resolver.callController(message);
          }*/
          return this.resolver.callController(message);
        } else if (!this.rejected) {
          this.request.reject();
          this.rejected = true;
        }
      } catch (e) {
        throw e;
      }
    }

    handle (data) {
      if (this.rejected) {
        return;
      }
      try {
        this.locale = this.translation.handle();
        if (!this.resolver) {
          this.resolver = this.router.resolve(this);
        } else {
          try {
            this.resolver.match(this.resolver.route, this);
          } catch (e) {
            if (!this.rejected) {
              this.request.reject();
              this.rejected = true;
            }
            throw e;
          }
        }
        // WARNING EVENT KERNEL
        this.fire("onRequest", this, this.resolver);
        this.kernel.fire("onRequest", this, this.resolver);
        if (this.resolver.resolve) {
          return this.saveSession()
            .then((session) => {
              if (session) {
                this.log(`SAVE SESSION ID : ${session.id}`, "DEBUG");
              }
              return this.resolver.callController(data || null);
            })
            .catch((error) => {
              if (!this.rejected) {
                if (this.request) {
                  if (this.request._resolved) {
                    return this.close(parseInt(error.code, 10) + 3000, error.message);
                  }
                  this.request.reject();
                }
                this.rejected = true;
              }
            });
        } else if (!this.rejected) {
          this.request.reject();
          this.rejected = true;
        }
      } catch (e) {
        throw e;
      }
    }

    handleError (container, error) {
      this.log(`Message : ${error.message}`, "ERROR");
    }

    send (data, type) {
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

    broadcast (data, type) {
      if (this.response) {
        if (!data) {
          data = this.response.body;
        }
        if (data) {
          this.fire("onMessage", data, this, "BROADCAST");
          this.fire("onBroadcast", data, this);
          return this.response.broadcast(data, type);
        }
      }
      return null;
    }

    close (reasonCode, description) {
      if (this.response) {
        return this.response.close(reasonCode, description);
      }
    }

    drop (reasonCode, description) {
      return this.response.drop(reasonCode, description);
    }
  };
  return websocket;
});
