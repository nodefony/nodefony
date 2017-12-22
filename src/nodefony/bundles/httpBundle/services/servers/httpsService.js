let http2 = null;
try {
  http2 = require('http2');
} catch (e) {

}

const protocol = {
  "1.1": true,
  "2.0": true
};

module.exports = class httpsServer extends nodefony.Service {

  constructor(httpKernel) {
    super("SERVER HTTPS", httpKernel.container, httpKernel.notificationsCenter);
    this.httpKernel = httpKernel;
    this.port = this.httpKernel.kernel.httpsPort;
    this.domain = this.httpKernel.kernel.settings.system.domain;
    this.ready = false;
    this.protocol = "2.0";
    this.key = null;
    this.cert = null;
    this.ca = null;
    this.address = null;
    this.family = null;
    this.type = "HTTPS";
    this.listen(this, "onBoot", function () {
      this.bundle.listen(this, "onServersReady", function (type) {
        if (type === this.type) {
          dns.lookup(this.domain, (err, addresses, family) => {
            if (err) {
              throw err;
            }
            this.address = addresses;
            this.family = family;

          });
        }
      });
    });
  }

  getCertificats() {
    this.settings = this.getParameters("bundles.http").https || null;
    this.settings.certificats = nodefony.extend(true, {}, this.settings.certificats, this.kernel.settings.system.servers.certificats);
    let bundleOptions = this.getParameters("bundles.http").https.certificats || null;
    let opt = nodefony.extend(true, {
      keyPath: this.kernel.checkPath(this.settings.certificats.key),
      certPath: this.kernel.checkPath(this.settings.certificats.cert),
      caPath: this.kernel.checkPath(this.settings.certificats.ca),
      key: null,
      cert: null,
      ca: null
    }, bundleOptions);
    try {
      this.key = fs.readFileSync(opt.keyPath);
      opt.key = this.key;
      this.cert = fs.readFileSync(opt.certPath);
      opt.cert = this.cert;
      if (opt.caPath) {
        this.ca = fs.readFileSync(opt.caPath);
        opt.ca = this.ca;
      }
    } catch (e) {
      throw e;
    }
    return opt;
  }

  createServer() {
    if (this.kernel.settings.system.servers.protocol in protocol) {
      this.protocol = this.kernel.settings.system.servers.protocol;
    } else {
      this.logger(this.kernel.settings.system.servers.protocol + " not implemented ", 'WARNING');
      throw new Error("HTTP protocol error ");
    }
    if (!http2) {
      this.protocol = "1.1";
    }
    try {
      this.options = this.getCertificats();
      for (let ele in this.options) {
        switch (ele) {
        case "keyPath":
          this.logger(" READ CERTIFICATE KEY : " + this.options[ele], "DEBUG");
          break;
        case "certPath":
          this.logger(" READ CERTIFICATE CERT : " + this.options[ele], "DEBUG");
          break;
        case "caPath":
          if (this.options[ele]) {
            this.logger(" READ CERTIFICATE CA : " + this.options[ele], "DEBUG");
          } else {
            this.logger(" NO CERTIFICATE CA : " + this.options[ele], "WARNING");
          }
          break;
        }
      }
    } catch (e) {
      this.logger(e);
      throw e;
    }
    try {
      switch (this.protocol) {
      case "1.1":
        this.server = https.createServer(this.options);
        this.bundle.fire("onCreateServer", this.type, this);
        break;
      case "2.0":
        this.options.allowHTTP1 = true;
        this.server = http2.createSecureServer(this.options);
        this.bundle.fire("onCreateServer", this.type, this);
        break;
      default:

      }
    } catch (e) {
      this.logger(e, "CRITIC");
      throw e;
    }

    this.server.on('request', (request, response) => {
      const {
        socket: {
          alpnProtocol
        }
      } = request.httpVersion === '2.0' ?
        request.stream.session : request;
      if (alpnProtocol === "h2") {
        this.httpKernel.onHttpRequest(request, response, "HTTP2");
      } else {
        this.httpKernel.onHttpRequest(request, response, "HTTPS");
      }
    });

    if (this.settings.timeout) {
      this.server.timeout = this.settings.timeout;
    }

    if (this.settings.maxHeadersCount) {
      this.server.maxHeadersCount = this.settings.maxHeadersCount;
    }

    /*this.server.on('stream', (stream, hearder) => {
      //console.log("pass stream ")
      //this.httpKernel.onHttp2Request(request, response, this.type);
    });*/

    // LISTEN ON PORT
    this.server.listen(this.port, this.domain, () => {
      this.logger(this.type + "  Server is listening on DOMAIN : https://" + this.domain + ":" + this.port, "INFO");
      this.ready = true;
      this.bundle.fire("onServersReady", this.type, this);
    });

    this.server.on("error", (error) => {
      let httpError = "server HTTP2 Error : " + error.errno;
      switch (error.errno) {
      case "ENOTFOUND":
        this.logger(new Error(httpError + " CHECK DOMAIN IN /etc/hosts unable to connect to : " + this.domain), "CRITIC");
        break;
      case "EADDRINUSE":
        this.logger(new Error("Domain : " + this.domain + " Port : " + this.port + " ==> " + error), "CRITIC");
        setTimeout(() => {
          this.server.close();
        }, 1000);
        break;
      default:
        this.logger(new Error(httpError), "CRITIC");
      }
    });

    this.server.on("clientError", (e, socket) => {
      this.fire("onClientError", e, socket);
    });

    this.listen(this, "onTerminate", () => {
      if (this.server) {
        this.server.close(() => {
          this.logger(" SHUTDOWN HTTP2  Server is listening on DOMAIN : " + this.domain + "    PORT : " + this.port, "INFO");
        });
      }
    });
    return this.server;
  }
};