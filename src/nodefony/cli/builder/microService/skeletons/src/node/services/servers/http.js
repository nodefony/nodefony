const nodefony = require("nodefony");
const http = require('http');
const path = require("path");

class Server extends nodefony.Service {
  constructor(service) {
    super("HTTP Server", service.container);
    this.service = service;
    this.started = false;
    this.settings = this.service.settings.http;
  }

  start(settings = null) {
    if (settings) {
      this.settings = settings;
    }
    return new Promise((resolve, reject) => {
      this.log("Starting Server", "INFO");
      this.server = http.createServer((req, res) => {
        return this.fire("request", req, res);
      });

      this.server.listen(this.settings.port, this.settings.hostname, () => {
        this.started = true;
        this.log(`Server running at http://${this.settings.hostname}:${this.settings.port}/`);
        return resolve(this.server);
      });
      
      this.server.on("error", (error) => {
        this.log(error, "ERROR");
        return reject(error);
      });
    });
  }
}

module.exports = Server;
