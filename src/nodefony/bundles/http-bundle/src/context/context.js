// eslint-disable-next-line max-lines-per-function
nodefony.register("Context", () => {
  const colorLogEvent = clc.cyan.bgBlue("EVENT CONTEXT");
  const Context = class Context extends nodefony.Service {
    constructor (container, request, response, type) {
      super(`${type} CONTEXT`, container);
      this.container.addScope("subRequest");
      this.type = type;
      this.set("context", this);
      this.kernelHttp = this.get("httpKernel");
      this.router = this.get("router");
      this.translation = this.kernelHttp.translation.createTranslation(this);
      this.set("translation", this.translation);
      this.resolver = null;
      this.nbCallController = 0;
      this.requestEnded = false;
      // session
      this.session = null;
      this.sessionService = this.get("sessions");
      this.sessionAutoStart = this.sessionService.sessionAutoStart;
      // CSRF
      this.csrfService = this.get("csrf");
      // parse cookies
      this.cookies = {};
      this.crossDomain = null;
      this.secureArea = null;
      this.security = null;
      this.metaSecurity = null;
      this.user = null;
      this.token = null;
      this.secure = false;
      this.isJson = false;
      this.waitAsync = false;
      this.requested = false;
      this.profiler = this.kernelHttp.profiler.active;
      // Authorisation
      this.accessControl = null;
      this.isControlledAccess = false;
      this.contentLength = false;
      this.cleaned = false;
      this.once("onRequest", () => {
        this.requested = true;
      });
    }

    log (pci, severity, msgid, msg) {
      if (!msgid) {
        msgid = this.type;
      }
      return super.log(pci, severity, msgid, msg);
    }

    logRequest (httpError) {
      try {
        const txt = `${clc.cyan("URL")} : ${this.url} ${clc.cyan("FROM")} : ${this.remoteAddress} ${clc.cyan("ORIGIN")} : ${this.originUrl.host}`;
        let mgid = "";
        if (httpError) {
          this.errorLog = true;
          mgid = `${this.type} ${clc.magenta(this.response.statusCode)} ${clc.red(this.method)}`;
          if (kernel && kernel.environment === "prod") {
            return this.log(`${txt} ${httpError.toString()}`, "ERROR", mgid);
          }
          return this.log(`${txt}
          ${httpError.toString()}`, "ERROR", mgid);
        }
        if (!this.errorLog) {
          mgid = `${this.type} ${clc.magenta(this.response.statusCode)} ${this.method}`;
          return this.log(txt, "INFO", mgid);
        }
      } catch (e) {}
    }

    fire () {
      this.log(`${colorLogEvent} ${arguments[0]}`, "DEBUG");
      return super.emit.apply(this, arguments);
    }

    fireAsync () {
      this.log(`${colorLogEvent} ${arguments[0]}`, "DEBUG");
      return super.emitAsync.apply(this, arguments);
    }

    emit () {
      this.log(`${colorLogEvent} ${arguments[0]}`, "DEBUG");
      return super.emit.apply(this, arguments);
    }

    emitAsync () {
      this.log(`${colorLogEvent} ${arguments[0]}`, "DEBUG");
      return super.emitAsync.apply(this, arguments);
    }

    controller () {
      const pattern = Array.prototype.shift.call(arguments);
      const data = Array.prototype.slice.call(arguments);
      return new nodefony.subRequest(this, pattern, data);
    }

    render (subRequest) {
      return subRequest.handle();
    }

    getRoute () {
      return this.resolver.getRoute();
    }

    clean () {
      this.cleaned = true;
      this.kernelHttp = null;
      delete this.kernelHttp;
      this.router = null;
      delete this.router;
      this.crossDomain = null;
      delete this.crossDomain;
      this.secureArea = null;
      delete this.secureArea;
      this.security = null;
      delete this.security;
      this.metaSecurity = null;
      delete this.metaSecurity;
      this.user = null;
      delete this.user;
      this.token = null;
      delete this.token;
      if (this.resolver) {
        this.resolver.clean();
      }
      this.resolver = null;
      delete this.resolver;
      this.promise = null;
      delete this.promise;
      this.session = null;
      delete this.session;
      this.translation = null;
      delete this.translation;
      this.cookies = null;
      delete this.cookies;
      this.cookieSession = null;
      delete this.cookieSession;
      this.accessControl = null;
      delete this.accessControl;
      this.isControlledAccess = null;
      delete this.isControlledAccess;
      super.clean();
    }

    getRequest () {
      return this.request;
    }

    getResponse () {
      return this.response;
    }

    addCookie (cookie) {
      if (cookie instanceof nodefony.cookies.cookie) {
        this.cookies[cookie.name] = cookie;
      } else {
        const error = new Error("addCookie cookie not valid !!");
        this.log(cookie, "ERROR");
        throw error;
      }
    }

    getCookies () {
      const tab = [];
      for (const cookie in this.cookies) {
        tab.push(this.cookies[cookie]);
      }
      return tab;
    }

    parseCookies () {
      return nodefony.cookies.cookiesParser(this);
    }

    getSession () {
      return this.session;
    }

    saveSession () {
      return this.sessionService.saveSession(this);
    }

    getCookieSession (name) {
      if (this.cookies[name]) {
        return this.cookies[name];
      }
      return null;
    }

    hasSession () {
      return Boolean(this.cookieSession);
    }

    isValidDomain () {
      return this.kernelHttp.isValidDomain(this);
    }

    isCrossDomain () {
      return this.kernelHttp.corsManager.isCrossDomain(this);
    }

    getUser () {
      return this.user || null;
    }

    getToken () {
      return this.token || null;
    }

    generateAbsoluteUrl (name, variables) {
      try {
        const host = `${this.request.url.protocol}//${this.request.url.host}`;
        return this.router.generatePath.call(this.router, name, variables, host);
      } catch (e) {
        throw e;
      }
    }

    is_granted (role) {
      if (!this.token) {
        // throw new nodefony.Error(`is_granted method No token found !! `);
        return false;
      }
      if (typeof role === "string") {
        return this.token.hasRole(role);
      }
      throw new nodefony.Error(`is_granted Bad role type you must give role example "ROLE_USER" actually : ${role}`);
    }

    getFlashBag (key) {
      if (this.session) {
        const res = this.session.getFlashBag(key);
        return res;
      }
      return null;
    }

    setCookie (cookie) {
      if (cookie) {
        return this.response.addCookie(cookie);
      }
    }

    setContextJson () {}

    createCookie (name, value, settings) {
      try {
        const cookie = new nodefony.cookies.cookie(name, value, settings);
        return this.setCookie(cookie);
      } catch (e) {
        throw e;
      }
    }

    canDisplayBar () {
      if (!this.kernelHttp.monitoringBundle) {
        return false;
      }
      if (!this.kernelHttp.monitoringBundle.settings.debugBar) {
        return false;
      }
      if (this.kernel.environment === "prod" && !this.kernelHttp.forceDebugBarProd) {
        return false;
      }
      if (!this.showDebugBar) {
        return false;
      }
      if (!this.response) {
        return false;
      }
      if (!this.response.isHtml()) {
        return false;
      }
      if (this.timeoutExpired) {
        return false;
      }

      /* if (!this.resolver.route) {
        return false;
      }
      if (!this.resolver.resolve) {
        return false;
      }*/
      switch (true) {
      case this.response.body instanceof Buffer:
        this.response.body = this.response.body.toString(this.response.encoding);
        break;
      case typeof this.response.body === "string":
        break;
      default:
        return false;
      }
      if (this.response.body.indexOf("</body>") >= 0) {
        return this.showDebugBar;
      }
      return false;
    }

    displayDebugBar (/* data*/) {
      if (this.canDisplayBar()) {
        try {
          if (this.kernelHttp.debugView) {
            const result = this.kernelHttp.debugView.render(this.kernelHttp.extendTemplate(this.profiling, this));
            this.response.body = this.response.body.replace("</body>", `${result}\n </body>`);
          }
          if (this.type === "HTTP2" && this.pushAllowed) {
            // this.pushAsset();
          }
        } catch (e) {
          throw e;
        }
      }
    }

    pushAsset () {
      const {publicPath} = this.kernelHttp.monitoringBundle;
      const {bundleName} = this.kernelHttp.monitoringBundle;
      return this.response.push(path.resolve(publicPath, "assets", "js", "debugBar.js"), {
        path: `/${bundleName}/assets/js/debugBar.js`
      })
        .then(() => this.response.push(path.resolve(publicPath, "assets", "css", "debugBar.css"), {
          path: `/${bundleName}/assets/css/debugBar.css`
        }))
        .then(() => this.response.push(path.resolve(publicPath, "images", "http2.png"), {
          path: `/${bundleName}/images/http2.png`
        }))
        .then(() => this.response.push(path.resolve(publicPath, "images", "nodejs_logo.png"), {
          path: `/${bundleName}/images/nodejs_logo.png`
        }))
        .then(() => this.response.push(path.resolve(publicPath, "images", "window-close.ico"), {
          path: `/${bundleName}/images/window-close.ico`
        }))
        .then(() => this.response.push(path.resolve(this.kernelHttp.frameworkBundle.publicPath, "images", "nodefony-logo.png"), {
          path: `/${this.kernelHttp.frameworkBundle.bundleName}/images/nodefony-logo.png`
        }))
        .catch(() => {
          Promise.resolve();
        });
    }

    saveProfile () {
      if (this.profiling) {

      }
      return new Promise((resolve /* , reject*/) => resolve(this));
    }
  };
  return Context;
});
