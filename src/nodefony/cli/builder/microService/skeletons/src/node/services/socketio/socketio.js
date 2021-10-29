const nodefony = require("nodefony");
const Server = require("socket.io");

class SocketIo extends nodefony.Service {
  constructor(service) {
    super("socket-io", service.container);
    this.service = service;
    this.http = this.getHttp();
  }

  getHttp() {
    let http = this.get("http");
    if (!http) {
      this.service.createHttpServer();
      http = this.get("http");
    }
    return http;
  }

  start() {
    return new Promise((resolve, reject) => {
      try {
        this.io = Server(this.service.settings.socketio);
        this.io.serveClient(true);
        this.io.attach(this.http.server);

        this.log(`Server ${this.name} running at ws://${this.http.settings.hostname}:${this.http.settings.port}/`);
        this.io.on('connection', client => {
          this.log(`connection : ${client.id}`);
          client.on('microservice', data => {
            this.log(data);
          });
          client.on('disconnect', () => {
            this.log(`disconnect : ${client.id}`);
          });
          this.io.emit("microservice", 'DEMO SOCKET IO MICROSERVICE');
        });
        return resolve(this.io);
      } catch (e) {
        return reject(e);
      }
    });
  }
}

module.exports = SocketIo;
