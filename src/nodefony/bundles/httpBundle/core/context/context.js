nodefony.register("Context", () => {


  const Context = class Context extends nodefony.Service {

    constructor(container, request, response, type) {
      super(type + " CONTEXT", container);
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
    }

    logger(pci, severity, msgid, msg) {
      if (!msgid) {
        msgid = this.type + " REQUEST";
      }
      return super.logger(pci, severity, msgid, msg);
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
        control = resolver.newController(container, this); //new resolver.controller(container, this);
        if (this.type === "HTTP2") {
          control.response = new nodefony.Response2(null, container);
        } else {
          control.response = new nodefony.Response(null, container);
        }
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
      case subRequest.response instanceof nodefony.Response2:
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
          throw {
            status: 500,
            message: "default view not exist"
          };
        }
        break;
      case typeof subRequest.response === "string":
        return subRequest.response;
      default:
        this.logger("nodefony TWIG function render can't resolve async Call in Twig Template ", "WARNING");
        return this.response.body;
      }
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

  };
  return Context;
});