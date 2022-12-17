let http2 = null;
const https = require('https');
try {
  http2 = require('http2');
} catch (e) {
  http2 = null;
}

let quic = null;
try {
  quic = require('net').createQuicSocket;
} catch (e) {
  quic = null;
}

const protocol = {
  "1.1": https,
  "2.0": http2,
  "3.0": quic
};

module.exports = class httpsServer extends nodefony.Service {

  constructor(httpKernel) {
    super("HTTPS", httpKernel.container, httpKernel.notificationsCenter);
    this.httpKernel = httpKernel;
    this.port = this.httpKernel.kernel.httpsPort;
    this.domain = this.httpKernel.kernel.settings.system.domain;
    this.ready = false;
    this.protocol = "2.0";
    this.key = null;
    this.cert = null;
    this.ca = null;
    this.family = null;
    this.type = "HTTPS";
    this.server = null;
    this.once("onBoot", async () => {
      this.bundle.on("onServersReady", (type) => {
        if (type === this.type) {
          let addr = this.server.address();
          this.domain = addr.address;
          this.kernel.hostname = addr.address;
          this.port = addr.port;
          this.kernel.httpsPort = addr.port;
          this.kernel.hostHttps = this.kernel.hostname + ":" + addr.port;
          this.family = addr.family;
          this.log("Listening on DOMAIN : https://" + this.domain + ":" + this.port, "INFO");
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
        this.log(this.kernel.settings.system.servers.protocol + " not implemented ", 'WARNING');
      } else {
        this.log("BAD config servers https protocol not defined !! check framework config", 'WARNING');
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
          this.log(" READ CERTIFICATE KEY : " + this.options[ele], "DEBUG");
          break;
        case "certPath":
          this.log(" READ CERTIFICATE CERT : " + this.options[ele], "DEBUG");
          break;
        case "caPath":
          if (this.options[ele]) {
            this.log(" READ CERTIFICATE CA : " + this.options[ele], "DEBUG");
          } else {
            this.log(" NO CERTIFICATE CA : " + this.options[ele], "WARNING");
          }
          break;
        }
      }
    } catch (e) {
      this.log(e);
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
          this.log(error, "ERROR", "HTTP2 Server sessionError");
        });
        this.server.on("streamError", (error) => {
          this.log(error, "ERROR", "HTTP2 Server streamError");
        });
        break;
      default:
      }
    } catch (e) {
      this.log(e, "CRITIC");
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
        return this.httpKernel.onHttpRequest(request, response, "HTTP2");
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
      const txtError = typeof error.code=== 'string'? error.code : error.errno ;
      switch (txtError) {
      case "ENOTFOUND":
        this.log("CHECK DOMAIN IN /etc/hosts or config unable to connect to : " + this.domain, "ERROR");
        this.log(myError, "CRITIC");
        break;
      case "EADDRINUSE":
        this.log("Domain : " + this.domain + " Port : " + this.port + " ==> ALREADY USE ", "ERROR");
        this.log(myError, "CRITIC");
        this.server.close();
        setTimeout(() => {
          return this.kernel.terminate(1)
        }, 1000);
        throw error
        break;
      default:
        this.log(myError, "CRITIC");
      }
    });

    this.server.on("clientError", (e, socket) => {
      this.fire("onClientError", e, socket);
    });

    this.once("onTerminate", () => {
      return new Promise((resolve, reject)=>{
        if (this.server) {
          if(this.protocol  === "2.0"){
            this.server.close(() => {
              this.log(this.type + " SHUTDOWN Server HTTP2 is listening on DOMAIN : " + this.domain + "    PORT : " + this.port, "INFO");
              //return resolve(true)
            });
            return resolve(true)
          }else{
            this.server.closeAllConnections()
            this.server.close(() => {
              this.log(this.type + " SHUTDOWN Server HTTPS is listening on DOMAIN : " + this.domain + "    PORT : " + this.port, "INFO");
              return resolve(true)
            });
          }
          return ;
        }
        return resolve(true)
      })
    });
    return this.server;
  }
};
