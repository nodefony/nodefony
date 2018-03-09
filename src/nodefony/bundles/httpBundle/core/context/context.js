nodefony.register("Context", () => {


  const Context = class Context extends nodefony.Service {

    constructor(container, request, response, type) {
      super(type + " CONTEXT", container);
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
      //parse cookies
      this.cookies = {};
      this.crossDomain = null;
      this.secureArea = null;
      this.security = null;
      this.metaSecurity = null;
      this.user = null;
      this.token = null;
      this.secure = false;
      this.isJson = false;
    }

    logger(pci, severity, msgid, msg) {
      if (!msgid) {
        msgid = this.type + " REQUEST";
      }
      return super.logger(pci, severity, msgid, msg);
    }


    controller() {
      let pattern = Array.prototype.shift.call(arguments);
      let data = Array.prototype.slice.call(arguments);
      return new nodefony.subRequest(this, pattern, data);
    }

    render(subRequest) {
      return subRequest.handle();
    }

    clean() {
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
      super.clean();
    }

    getRequest() {
      return this.request;
    }

    getResponse() {
      return this.response;
    }

    addCookie(cookie) {
      if (cookie instanceof nodefony.cookies.cookie) {
        this.cookies[cookie.name] = cookie;
      } else {
        let error = new Error("addCookie cookie not valid !!");
        this.logger(cookie, "ERROR");
        throw error;
      }
    }

    parseCookies() {
      return nodefony.cookies.cookiesParser(this);
    }

    getSession() {
      return this.session;
    }

    saveSession() {
      return this.sessionService.saveSession(this);
    }

    getCookieSession(name) {
      if (this.cookies[name]) {
        return this.cookies[name];
      }
      return null;
    }
    hasSession() {
      return (!!this.cookieSession);
    }

    isValidDomain() {
      return this.kernelHttp.isValidDomain(this);
    }
    isCrossDomain() {
      return this.kernelHttp.corsManager.isCrossDomain(this);
    }

    getUser() {
      return this.user ||  null;
    }

    getToken() {
      return this.token || null;
    }

    generateAbsoluteUrl(name, variables) {
      try {
        let host = this.request.url.protocol + "//" + this.request.url.host;
        return this.router.generatePath.call(this.router, name, variables, host);
      } catch (e) {
        throw e;
      }
    }

    getFlashBag(key) {
      if (this.session) {
        return this.session.getFlashBag(key);
      }
      return null;
    }

    setCookie(cookie) {
      if (cookie) {
        return this.response.addCookie(cookie);
      }
    }

    createCookie(name, value, settings) {
      try {
        let cookie = new nodefony.cookies.cookie(name, value, settings);
        return this.setCookie(cookie);
      } catch (e) {
        throw e;
      }
    }

    displayDebugBar() {
      if (!this.isJson && this.showDebugBar) {
        if (!this.timeoutExpired) {
          if (this.response) {
            let bool = true;
            switch (true) {
            case this.response.body instanceof Buffer:
              this.response.body = this.response.body.toString(this.response.encoding);
              break;
            case (typeof this.response.body === "string"):
              break;
            default:
              bool = false;
            }
            let xml = (this.response.getHeader('Content-Type').indexOf("xml") >= 0);
            if ((!xml) && bool && (this.response.body.indexOf("</body>") >= 0)) {
              try {
                let result = this.kernelHttp.debugView.render(this.kernelHttp.extendTemplate(this.profiling, this));
                this.response.body = this.response.body.replace("</body>", result + "\n </body>");
                if (this.type === "HTTP2") {
                  this.pushAsset();
                }
              } catch (e) {
                throw e;
              }
            }
          }
        }
      }
      this.profiling = null;
      delete this.profiling;
    }
    pushAsset() {
      let publicPath = this.kernelHttp.monitoringBundle.publicPath;
      let bundleName = this.kernelHttp.monitoringBundle.bundleName;
      this.response.push(path.resolve(publicPath, "assets", "js", "debugBar.js"), {
        path: "/" + bundleName + "/assets/js/debugBar.js"
      });
      this.response.push(path.resolve(publicPath, "assets", "css", "debugBar.css"), {
        path: "/" + bundleName + "/assets/css/debugBar.css"
      });
      this.response.push(path.resolve(publicPath, "images", "http2.png"), {
        path: "/" + bundleName + "/images/http2.png"
      });
      this.response.push(path.resolve(publicPath, "images", "nodejs_logo.png"), {
        path: "/" + bundleName + "/images/nodejs_logo.png"
      });
      this.response.push(path.resolve(publicPath, "images", "window-close.ico"), {
        path: "/" + bundleName + "/images/window-close.ico"
      });
      this.response.push(path.resolve(this.kernelHttp.frameworkBundle.publicPath, "images", "nodefony-logo.png"), {
        path: "/" + this.kernelHttp.frameworkBundle.bundleName + "/images/nodefony-logo.png"
      });
    }

  };
  return Context;
});