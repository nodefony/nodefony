let http2 = null;
const https = require('https');
try {
  http2 = require('http2');
} catch (e) {
  http2 = null;
}

const protocol = {
  "1.1": https,
  "2.0": http2
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
    this.server = null;
    this.once("onBoot", () => {
      this.bundle.on("onServersReady", (type) => {
        if (type === this.type) {
          let addr = this.server.address();
          this.domain = addr.address;
          this.kernel.hostname = addr.address;
          this.port = addr.port;
          this.kernel.httpsPort = addr.port;
          this.kernel.hostHttps = this.kernel.hostname + ":" + addr.port;
          this.family = addr.family;
          this.logger("Listening on DOMAIN : https://" + this.domain + ":" + this.port, "INFO");
          /*dns.lookup(this.domain, (err, addresses, family) => {
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
      if (this.kernel.settings.system.servers.protocol) {
        this.logger(this.kernel.settings.system.servers.protocol + " not implemented ", 'WARNING');
      } else {
        this.logger("BAD config servers https protocol not defined !! check framework config", 'WARNING');
      }
      this.protocol = "1.1";
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
        this.settings2 = this.getParameters("bundles.http").http2 || {};
        let buf = http2.getPackedSettings(this.settings2);
        this.defaultSetting2 = nodefony.extend({}, http2.getDefaultSettings(), http2.getUnpackedSettings(buf) || {});
        this.server = http2.createSecureServer(this.options);
        this.bundle.fire("onCreateServer", this.type, this);
        this.server.on("sessionError", (error) => {
          this.logger(error, "ERROR", "HTTP2 Server sessionError");
        });
        this.server.on("streamError", (error) => {
          this.logger(error, "ERROR", "HTTP2 Server streamError");
        });
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
        return this.httpKernel.onHttpRequest(request, response, this.type);
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
    });*/

    // LISTEN ON PORT
    this.server.listen(this.port, this.domain, () => {
      this.ready = true;
      this.bundle.fire("onServersReady", this.type, this);
    });

    this.server.on("error", (error) => {
      let myError = new nodefony.Error(error);
      switch (error.errno) {
      case "ENOTFOUND":
        this.logger("CHECK DOMAIN IN /etc/hosts or config unable to connect to : " + this.domain, "ERROR");
        this.logger(myError, "CRITIC");
        break;
      case "EADDRINUSE":
        this.logger("Domain : " + this.domain + " Port : " + this.port + " ==> ALREADY USE ", "ERROR");
        this.logger(myError, "CRITIC");
        setTimeout(() => {
          this.server.close();
        }, 1000);
        break;
      default:
        this.logger(myError, "CRITIC");
      }
    });

    this.server.on("clientError", (e, socket) => {
      this.fire("onClientError", e, socket);
    });

    this.on("onTerminate", () => {
      if (this.server) {
        this.server.close(() => {
          this.logger(this.type + " SHUTDOWN Server is listening on DOMAIN : " + this.domain + "    PORT : " + this.port, "INFO");
        });
      }
    });
    return this.server;
  }
};