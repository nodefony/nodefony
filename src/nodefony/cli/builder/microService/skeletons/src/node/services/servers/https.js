const nodefony = require("nodefony");
const https = require('https');
const serveStatic = require('serve-static');
const dist = path.resolve("dist");
const serve = serveStatic(dist, {
  index: false
});


class Server extends nodefony.Service {
  constructor(service){
    super("HTTPS Server", service.container);
    this.service = service;
    this.started = false;
    this.settings = this.service.settings.https;
  }

  start(settings){
    if (settings) {
      this.settings = settings;
    }
    return new Promise((resolve, reject) => {
      this.log("Starting Server HTTPS", "INFO");
      this.server = https.createServer(this.settings.certificates, (req, res) => {
        return serve(req, res, () => {
          return this.fire("request", req, res);
        });
      });

      this.server.listen(this.settings.port, this.settings.hostname, () => {
        this.started = true;
        this.log(`Server running at https://${this.settings.hostname}:${this.settings.port}/`);
        return resolve(this.server);
      });

      this.server.on("error", (error) => {
        this.log(error, "ERROR");
        return reject(error);
      });
    });
  }
}

module.exports = Server ;
