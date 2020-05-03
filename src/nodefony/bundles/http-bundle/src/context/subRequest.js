module.exports = nodefony.register("subRequest", () => {

  class subRequest extends nodefony.Context {

    constructor(context, pattern, data) {
      super(context.container, null, null, context.type);
      this.parent = context;
      this.pattern = pattern;

      this.protocol = context.protocol;
      this.scheme = context.scheme;
      this.pushAllowed = context.pushAllowed;
      this.requestEnded = context.requestEnded;
      this.uploadService = context.uploadService;
      this.translation = context.translation;
      this.locale = context.locale;

      this.request = context.request;
      this.response = context.response;

      this.controllerInst = this.parent.controller;
      this.resolver = this.router.resolveName(this, pattern);
      this.response = this.createResponse();
      try {
        if (this.resolver.resolve) {
          this.controllerInst = new this.resolver.controller(this.container, this);
          if (data) {
            this.resolver.setVariables(data);
          }
        }
      } catch (e) {
        throw e;
      }

      this.method = context.method;
      this.isAjax = context.isAjax;
      this.isHtml = context.isHtml;
      this.isRedirect = context.isRedirect;
      this.sended = context.sended;
      this.showDebugBar = context.showDebugBar;
      this.timeoutExpired = context.timeoutExpired;
      this.promise = context.promise;
      this.timeoutid = context.timeoutid;
      this.profiling = context.profiling;
      this.url = context.url;
      this.port = context.port;
      this.domain = context.domain;
      this.validDomain = context.validDomain;
      this.remoteAddress = context.remoteAddress;
      this.crossDomain = context.crossDomain;
      this.proxy = context.proxy;
      this.token = context.token;
      this.user = context.user;

    }

    getMethod() {
      return this.parent.getMethod();
    }

    createResponse(response) {
      switch (this.type) {
      case "HTTP2":
        return new nodefony.http2Response(response, this.container);
      default:
        return new nodefony.Response(response, this.container);
      }
    }

    setCsrfToken(name, options) {
      this.csrf = this.csrfService.createCsrfToken(name, options, this);
      return this.csrf;
    }

    clean() {
      //this.parent.container.leaveScope(this.container);
    }

    logger(pci, severity, msgid, msg) {
      if (!msgid) {
        msgid = this.type + " SUB REQUEST";
      }
      return super.logger(pci, severity, msgid, msg);
    }

    handle(data) {
      if (data) {
        this.resolver.setVariables(data);
      }
      try {
        if (this.resolver.resolve && this.controllerInst) {
          this.fire("onSubRequest", this);
          this.result = this.resolver.action.apply(this.controllerInst, this.resolver.variables);
        }
        let res = this.resolver.returnController(this);
        //console.log(res)
        return res;
      } catch (e) {
        this.logger(e, "ERROR");
        return e.toString();
      }
    }

    send(data) {
      if (data) {
        return data.toString();
      }
      //console.trace("send subRequest : ", this.pattern, " : ", this.response.body.toString().length)
      return this.response.body.toString();
    }

  }
  return subRequest;
});
