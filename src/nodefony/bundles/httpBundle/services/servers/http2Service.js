const http2 = require('http2');

module.exports = class http2Server extends nodefony.Service {

  constructor(httpKernel) {
    super("HTTP2 SERVER", httpKernel.container, httpKernel.notificationsCenter);
    this.httpKernel = httpKernel;
    this.port = this.httpKernel.kernel.http2Port;
    this.domain = this.httpKernel.kernel.settings.system.domain;
    this.ready = false;

    this.key = null;
    this.cert = null;
    this.ca = null;
    this.address = null;
    this.family = null;
    this.type = "HTTP2";
    this.listen(this, "onBoot", function () {
      this.bundle = this.kernel.getBundles("http");
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
    var bundleOptions = this.getParameters("bundles.http").https.certificats || null;
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
      this.options.allowHTTP1 = true;
      this.server = http2.createSecureServer(this.options);
      this.bundle.fire("onCreateServer", this.type, this);
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
        this.httpKernel.onHttpRequest(request, response, this.type);
      } else {
        this.httpKernel.onHttpRequest(request, response, "HTTPS");
      }
    });

    this.server.on('stream', (stream, hearder) => {
      console.log("pass stream ")
      //this.httpKernel.onHttp2Request(request, response, this.type);
    });

    // LISTEN ON PORT
    this.server.listen(this.port, this.domain, () => {
      this.logger(this.type + "  Server is listening on DOMAIN : https://" + this.domain + ":" + this.port, "INFO");
      this.ready = true;
      this.bundle.fire("onServersReady", this.type, this);
    });

  }
};
