nodefony.register.call(nodefony.context, "http", function() {

  const Http = class httpContext extends nodefony.Context {

    constructor(container, request, response, type) {
      super(container, request, response, type);
      this.uploadService = this.get("upload");
      this.requestSettings = this.kernelHttp.bundleSettings.request;
      this.queryStringParser = this.kernelHttp.bundleSettings.queryString;
      this.isElectron = this.kernel.isElectron;
      this.protocol = (type === "HTTP2") ? "2.0" : "1.1";
      this.scheme = (type === "HTTPS" || type === "HTTP2") ? "https" : "http";
      this.pushAllowed = false;
      if (this.type === "HTTP2") {
        this.request = new nodefony.http2Request(request, this);
        this.response = new nodefony.http2Response(response, container);
      } else {
        this.request = new nodefony.Request(request, this);
        this.response = new nodefony.Response(response, container);
      }
      this.parseCookies();
      this.cookieSession = this.getCookieSession(this.sessionService.settings.name);
      this.once("onRequestEnd", () => {
        try {
          if (this.isRedirect) {
            return this.send();
          }
        } catch (e) {
          this.fire("onError", this.container, e);
        }
      });
      this.method = this.request.getMethod();
      this.isAjax = this.request.isAjax();
      this.isHtml = this.request.acceptHtml;
      this.setDefaultContentType();
      this.isRedirect = false;
      this.sended = false;
      this.showDebugBar = true;
      this.timeoutExpired = false;
      this.promise = null;
      this.timeoutid = null;
      this.profiling = null;

      this.url = url.format(this.request.url);

      if (this.request.url.port) {
        this.port = this.request.url.port;
      } else {
        this.port = this.scheme === "https" ? 443 : 80;
      }
      try {
        this.originUrl = url.parse(this.request.origin);
      } catch (e) {
        this.originUrl = url.parse(this.url);
      }
      // domain
      this.domain = this.getHostName();
      this.validDomain = this.isValidDomain();
      this.remoteAddress = this.request.remoteAddress;
      this.once("onTimeout", () => {
        let error = null;
        if (this.response.stream) {
          // traff 408 reload page htpp2 loop
          error = new nodefony.httpError("Gateway Timeout", 504, this.container);
        } else {
          error = new nodefony.httpError("Request Timeout", 408, this.container);
        }
        this.fire("onError", this.container, error);
      });
      //case proxy
      this.proxy = null;
      if (request.headers["x-forwarded-for"]) {
        if (request.headers["x-forwarded-proto"]) {
          this.type = request.headers["x-forwarded-proto"].toUpperCase();
        }
        this.proxy = {
          proxyServer: request.headers["x-forwarded-server"],
          proxyProto: request.headers["x-forwarded-proto"],
          proxyPort: request.headers["x-forwarded-port"],
          proxyFor: request.headers["x-forwarded-for"],
          proxyHost: request.headers["x-forwarded-host"],
          proxyVia: request.headers.via
        };
        this.logger("PROXY REQUEST x-forwarded VIA : " + this.proxy.proxyVia, "DEBUG");
      }
      if (this.security) {
        this.crossDomain = this.isCrossDomain();
      }
    }

    getRemoteAddress() {
      return this.request.getRemoteAddress();
    }

    getHost() {
      return this.request.getHost();
    }

    getHostName() {
      return this.request.getHostName();
    }

    getUserAgent() {
      return this.request.getUserAgent();
    }

    getMethod() {
      return this.request.getMethod();
    }

    handle(data) {
      try {
        if (this.isRedirect) {
          return this.send();
        }
        this.setParameters("query.get", this.request.queryGet);
        if (this.request.queryPost) {
          this.setParameters("query.post", this.request.queryPost);
        }
        if (this.request.queryFile) {
          this.setParameters("query.files", this.request.queryFile);
        }
        this.setParameters("query.request", this.request.query);
        this.locale = this.translation.handle();
        if (!this.resolver) {
          this.resolver = this.router.resolve(this);
        }
        //WARNING EVENT KERNEL
        this.fire("onRequest", this, this.resolver);
        this.kernel.fire("onRequest", this, this.resolver);
        if (this.resolver.resolve) {
          let ret = this.resolver.callController(data);
          // timeout response after  callController (to change timeout in action )
          if (this.response.response) {
            if (this.response.stream) {
              this.timeoutid = this.response.stream.setTimeout(this.response.timeout, () => {
                this.timeoutExpired = true;
                this.fire("onTimeout", this);
                /*this.once("onFinish", () => {
                  this.response.stream.close();
                });*/
              });
            } else {
              this.timeoutid = this.response.response.setTimeout(this.response.timeout, () => {
                this.timeoutExpired = true;
                this.fire("onTimeout", this);
              });
            }
          }
          return ret;
        }
        let error = new Error("");
        error.code = 404;
        throw error;
      } catch (e) {
        this.fire("onError", this.container, e);
      }
    }

    clean() {
      if (this.timeoutid !== null) {
        clearTimeout(this.timeoutid);
      }
      this.request.clean();
      this.response.clean();
      this.request = null;
      this.response = null;
      delete this.response;
      delete this.request;
      this.proxy = null;
      delete this.proxy;
      this.uploadService = null;
      delete this.uploadService;
      this.container.clean();
      super.clean();
    }

    send(data, type) {
      if (this.sended || this.finished) {
        return new Promise((resolve, reject) => {
          reject(new Error("Already sended"));
        });
      }
      return this.saveSession()
        .then((session) => {
          if (session) {
            this.logger("SAVE SESSION ID : " + session.id, "DEBUG");
          }
          this.fire("onSend", this.response, this);
          this.writeHead();
          if (!this.isRedirect) {
            return this.write(data, type);
          }
          return this.response.end();
        })
        .catch((error) => {
          this.logger(error, "ERROR");
          if (this.session) {
            this.session.destroy(true);
          }
          this.writeHead();
          this.write(data, type);
          return error;
        });
    }

    writeHead() {
      // cookies
      if (this.response) {
        this.response.setCookies();
        this.response.writeHead();
      }
    }

    write(data, encoding) {
      if (this.finished) {
        return;
      }
      if (!this.profiler) {
        if (this.profiling) {
          this.fire("onSendMonitoring", this.response, this);
        }
        /*
         * WRITE RESPONSE
         */
        this.sended = true;
        this.response.send(data, encoding);
        // END REQUEST
        return this.close();
      }
      this.fire("onSendMonitoring", this.response, this);
      return this;
    }

    flush(data, encoding) {
      return this.response.flush(data, encoding);
    }

    close() {
      this.fire("onClose", this);
      // END REQUEST
      this.profiling = null;
      delete this.profiling;
      return this.response.end();
    }

    redirect(Url, status, headers) {
      if (typeof Url === "object") {
        return this.response.redirect(url.format(Url), status, headers);
      } else {
        return this.response.redirect(Url, status, headers);
      }
    }

    redirectHttps(status, headers) {
      if (this.session) {
        this.session.setFlashBag("redirect", "HTTPS");
      }
      let urlExtend = null;
      if (this.proxy) {
        urlExtend = {
          protocol: "https",
          href: "",
          host: ""
        };
      } else {
        urlExtend = {
          protocol: "https",
          port: this.kernelHttp.httpsPort || 443,
          href: "",
          host: ""
        };
      }
      let urlChange = nodefony.extend({}, this.request.url, urlExtend);
      let newUrl = url.format(urlChange);
      return this.redirect(newUrl, status, headers);
    }

    redirectHttp(status, headers) {
      if (this.session) {
        this.session.setFlashBag("redirect", "HTTP");
      }
      let urlExtend = null;
      if (this.proxy) {
        urlExtend = {
          protocol: "http",
          href: "",
          host: ""
        };
      } else {
        urlExtend = {
          protocol: "http",
          port: this.kernelHttp.httpPort || 80,
          href: "",
          host: ""
        };
      }
      let urlChange = nodefony.extend({}, this.request.url, urlExtend);
      let newUrl = url.format(urlChange);
      return this.redirect(newUrl, status, headers);
    }

    setXjson(xjson) {
      switch (nodefony.typeOf(xjson)) {
        case "object":
          this.response.setHeader("X-Json", JSON.stringify(xjson));
          return xjson;
        case "string":
          this.response.setHeader("X-Json", xjson);
          return JSON.parse(xjson);
        case "Error":
          if (typeof xjson.message === "object") {
            this.response.setHeader("X-Json", JSON.stringify(xjson.message));
            return xjson.message;
          } else {
            this.response.setHeader("X-Json", xjson.message);
            return {
              error: xjson.message
            };
          }
          break;
      }
    }

    setDefaultContentType() {
      if (this.isHtml) {
        this.response.setContentType("html", "utf-8");
      } else {
        if (this.request.accepts("json")) {
          this.isJson = true;
          this.response.setContentType("json", "utf-8");
        }
      }
    }

  };
  return Http;
});