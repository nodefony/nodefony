const mime = require("mime");

// eslint-disable-next-line max-lines-per-function
nodefony.register.call(nodefony.context, "http", () => {
  const Http = class httpContext extends nodefony.Context {
    constructor (container, request, response, type) {
      super(container, request, response, type);
      this.uploadService = this.get("upload");
      this.requestSettings = this.kernelHttp.settings.request;
      this.queryStringParser = this.kernelHttp.settings.queryString;
      this.isElectron = this.kernel.isElectron;
      this.protocol = type === "HTTP2" ? "2.0" : "1.1";
      this.pushAllowed = false;
      if (this.type === "HTTP2") {
        this.request = new nodefony.http2Request(request, this);
        this.response = new nodefony.http2Response(response, container);
      } else {
        this.request = new nodefony.Request(request, this);
        this.response = new nodefony.Response(response, container);
      }
      this.csrf = null;
      this.parseCookies();
      this.cookieSession = this.getCookieSession(this.sessionService.settings.name);
      this.once("onRequestEnd", () => {
        try {
          if (this.isRedirect) {
            return this.send();
          }
        } catch (e) {
          return this.kernelHttp.onError(this.container, e);
          // this.fire("onError", this.container, e);
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
      this.scheme = this.request.url.protocol.replace(":", "");
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
        return this.kernelHttp.onError(this.container, error);
        // this.fire("onError", this.container, error);
      });
      // case proxy
      this.proxy = null;
      if (request.headers["x-forwarded-for"]) {
        if (request.headers["x-forwarded-proto"]) {
          this.type = request.headers["x-forwarded-proto"].toUpperCase();
        }
        this.proxy = {
          proxyServer: request.headers["x-forwarded-server"] || "unknown",
          proxyProto: request.headers["x-forwarded-proto"],
          proxyScheme: request.headers["x-forwarded-scheme"],
          proxyPort: request.headers["x-forwarded-port"],
          proxyFor: request.headers["x-forwarded-for"],
          proxyHost: request.headers["x-forwarded-host"],
          proxyUri: request.headers["x-original-uri"],
          proxyRealIp: request.headers["x-real-ip"],
          proxyVia: request.headers.via || "unknown"
        };
        this.log(`PROXY REQUEST x-forwarded VIA : ${this.proxy.proxyVia}`, "DEBUG");
      }

      /* if (this.security) {
        this.crossDomain = this.isCrossDomain();
      }*/
    }

    getRemoteAddress () {
      return this.request.getRemoteAddress();
    }

    getHost () {
      return this.request.getHost();
    }

    getHostName () {
      return this.request.getHostName();
    }

    getUserAgent () {
      return this.request.getUserAgent();
    }

    getMethod () {
      return this.request.getMethod();
    }

    setCsrfToken (name, options) {
      this.csrf = this.csrfService.createCsrfToken(name, options, this);
      return this.csrf;
    }

    handle (data) {
      return new Promise((resolve, reject) => {
        try {
          if (this.isRedirect) {
            return resolve(this.send());
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
          // WARNING EVENT KERNEL
          this.fire("onRequest", this, this.resolver);
          this.kernel.fire("onRequest", this, this.resolver);
          if (this.resolver.resolve) {
            const ret = this.resolver.callController(data);
            // timeout response after  callController (to change timeout in action )
            if (this.timeoutid !== null) {
              this.timeoutExpired = false;
              clearTimeout(this.timeoutid);
            }
            if (this.response.response) {
              if (this.response.stream) {
                this.timeoutid = this.response.response.setTimeout(this.response.timeout, () => {
                  this.timeoutExpired = true;
                  this.fire("onTimeout", this);
                });
              } else {
                this.timeoutid = this.response.response.setTimeout(this.response.timeout, () => {
                  this.timeoutExpired = true;
                  this.fire("onTimeout", this);
                });
              }
            }
            return resolve(ret);
          }
          const error = new Error("");
          error.code = 404;
          return reject(error);
        } catch (e) {
          return reject(e);
        }
      });
    }

    clean () {
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

    send (data, type) {
      if (this.sended || this.finished) {
        return new Promise((resolve, reject) => {
          reject(new Error("Already sended"));
        });
      }
      return this.saveSession()
        .then(async (session) => {
          if (session) {
            this.log(`SAVE SESSION ID : ${session.id}`, "DEBUG");
          }
          await this.fireAsync("onSend", this.response, this);
          this.writeHead();
          if (!this.isRedirect) {
            return this.write(data, type);
          }
          return this.response.end();
        })
        .catch(async (error) => {
          this.log(error, "ERROR");
          this.writeHead(error.code || 500);
          this.write(data, type);
          return error;
        });
    }

    writeHead (statusCode, headers) {
      // cookies
      if (this.response) {
        this.response.setCookies();
        this.response.writeHead(statusCode, headers);
      }
    }

    async write (data, encoding) {
      if (this.finished || this.sended) {
        return;
      }
      if (!this.profiler) {
        if (this.profiling) {
          await this.fireAsync("onSendMonitoring", this.response, this);
        }

        /*
         * WRITE RESPONSE
         */
        this.sended = true;
        this.response.send(data, encoding);
        // END REQUEST
        return this.close();
      }
      await this.fireAsync("onSendMonitoring", this.response, this);
      return this;
    }

    flush (data, encoding) {
      return this.response.flush(data, encoding);
    }

    async close () {
      await this.fireAsync("onClose", this);
      // END REQUEST
      this.profiling = null;
      delete this.profiling;
      return this.response.end();
    }

    redirect (Url, status, headers) {
      if (typeof Url === "object") {
        return this.response.redirect(url.format(Url), status, headers);
      }
      return this.response.redirect(Url, status, headers);
    }

    redirectHttps (status, headers) {
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
      const urlChange = nodefony.extend({}, this.request.url, urlExtend);
      const newUrl = url.format(urlChange);
      return this.redirect(newUrl, status, headers);
    }

    redirectHttp (status, headers) {
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
      const urlChange = nodefony.extend({}, this.request.url, urlExtend);
      const newUrl = url.format(urlChange);
      return this.redirect(newUrl, status, headers);
    }

    setContextJson (encoding) {
      if (!encoding) {
        encoding = "charset=utf-8";
      } else {
        encoding = `charset=${encoding}`;
      }
      this.isJson = true;
      const type = mime.getType("json");
      if (this.method !== "websoket") {
        if (this.response) {
          this.response.setHeader("Content-Type", `${type}; ${encoding}`);
        }
      }
    }

    setContextHtml (encoding) {
      if (!encoding) {
        encoding = "charset=utf-8";
      } else {
        encoding = `charset=${encoding}`;
      }
      this.isJson = false;
      const type = mime.getType("html");
      if (this.method !== "websoket") {
        if (this.response) {
          this.response.setHeader("Content-Type", `${type}; ${encoding}`);
        }
      }
    }

    setXjson (xjson) {
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
        }
        this.response.setHeader("X-Json", xjson.message);
        return {
          error: xjson.message
        };

        break;
      }
    }

    setDefaultContentType () {
      if (this.isHtml) {
        this.response.setContentType("html", "utf-8");
      } else if (this.request.accepts("json")) {
        this.isJson = true;
        this.response.setContentType("json", "utf-8");
      }
    }
  };
  return Http;
});
