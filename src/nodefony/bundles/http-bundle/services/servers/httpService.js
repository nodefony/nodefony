const http = require("http");

module.exports = class httpServer extends nodefony.Service {
  constructor (httpKernel, options) {
    super("HTTP", httpKernel.container, httpKernel.notificationsCenter, options);
    this.httpKernel = httpKernel;
    this.port = this.httpKernel.kernel.httpPort;
    this.domain = this.httpKernel.kernel.settings.system.domain;
    this.ready = false;
    this.type = "HTTP";
    this.protocol = "1.1";
    this.address = null;
    this.family = null;
    this.server = null;
    this.once("onBoot", async () => {
      this.bundle = this.kernel.getBundles("http");
      this.bundle.on("onServersReady", (type) => {
        if (type === this.type) {
          const addr = this.server.address();
          this.domain = addr.address;
          this.kernel.hostname = addr.address;
          this.port = addr.port;
          this.kernel.httpPort = addr.port;
          this.kernel.hostHttp = `${this.kernel.hostname}:${addr.port}`;
          this.family = addr.family;
          this.log(`Listening on DOMAIN : http://${this.domain}:${this.port}`, "INFO");

          /* dns.lookup(this.domain, (err, addresses, family) => {
            if (err) {
              throw err;
            }
            this.address = addresses;
            this.family = family;
          });*/
        }
      });
    });
  }

  createServer () {
    this.settings = this.getParameters("bundles.http").http || null;
    try {
      this.server = http.createServer();
      this.bundle.fire("onCreateServer", this.type, this);
    } catch (e) {
      this.log(e, "CRITIC");
      throw e;
    }

    this.server.on("request", (request, response) => this.httpKernel.onHttpRequest(request, response, this.type));

    if (this.settings.timeout) {
      this.server.timeout = this.settings.timeout;
    }

    if (this.settings.maxHeadersCount) {
      this.server.maxHeadersCount = this.settings.maxHeadersCount;
    }

    // LISTEN ON PORT
    this.server.listen(this.port, this.domain, () => {
      this.ready = true;
      this.bundle.fire("onServersReady", this.type, this);
    });

    this.server.on("error", (error) => {
      const myError = new nodefony.Error(error);
      const txtError = typeof error.code === "string" ? error.code : error.errno;
      switch (txtError) {
      case "ENOTFOUND":
        this.log(`CHECK DOMAIN IN /etc/hosts or config unable to connect to : ${this.domain}`, "ERROR");
        this.log(myError, "CRITIC");
        break;
      case "EADDRINUSE":
        this.log(`Domain : ${this.domain} Port : ${this.port} ==> ALREADY USE `, "ERROR");
        this.log(myError, "CRITIC");
        this.server.close();
        setTimeout(() => this.kernel.terminate(1), 1000);
        break;
      default:
        this.log(myError, "CRITIC");
      }
    });

    this.once("onTerminate", () => new Promise((resolve, reject) => {
      if (this.server) {
        this.server.closeAllConnections();
        this.server.close(() => {
          this.log(`${this.type} SHUTDOWN Server is listening on DOMAIN : ${this.domain}    PORT : ${this.port}`, "INFO");
          return resolve(true);
        });
        return;
      }
      return resolve(true);
    }));

    this.server.on("clientError", (e, socket) => {
      this.fire("onClientError", e, socket);
    });

    return this.server;
  }
};
