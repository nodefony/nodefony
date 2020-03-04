const nodefony = require("nodefony");
//const http = require(path.resolve(__dirname,"..","servers", "http.js"));
const socketio = require('socket.io');

class SocketIo extends nodefony.Service {
  constructor(service){
    super("Socket", service.container);
    this.service = service ;
    this.http = this.get("http");
    if (! this.http){
      this.service.createHttpServer();
      this.http = this.get("http");
    }
  }

  start(){
    return new Promise((resolve, reject)=>{
      this.io = socketio(this.http.server);
      this.log(`Server socketio running at ws://${this.http.settings.hostname}:${this.http.settings.port}/`);
      this.io.on('connection', client => {
        client.on('event', data => {
          this.log(data);
        });
        client.on('disconnect', () => {
          this.log("disconnect");
        });
      });
      return resolve(this.io) ;
    });
  }

}


module.exports = SocketIo ;
