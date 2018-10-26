nodefony.register.call(nodefony.context, "socket", function () {

  const socket = class socketContext extends nodefony.Context {

    constructor(container, client, type) {
      super(container, client.conn.request, null, "socket");

      //this.response = new nodefony.wsResponse(null, this.container, this.type);
      this.protocol = (type === "HTTPS") ? "wss" : "ws";
      this.scheme = (type === "HTTPS") ? "wss" : "ws";
      this.isJson = true;
      this.method = this.getMethod();
      this.request = client.conn.request;

      this.method = this.method;
      this.urlP = url.parse(this.scheme + "://" + this.request.headers.host + this.request.url);
      this.remoteAddress = this.request.remoteAddress;

      this.url = url.format(this.url);
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

    getHostName() {
      return this.request.url.hostname;
    }

    getMethod() {
      return "WEBSOCKET";
    }

  };

  return socket;
});