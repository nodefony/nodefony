const net = require('net');


const defaultOptions = {
  allowHalfOpen: true,
  //highWaterMark:16384*2
  highWaterMark: 1024 * 64,
  //readable: true,
  //writable: true
}

class TcpSocket extends nodefony.Service{

  constructor(options = defaultOptions, service) {
    super("TcpSocket", service.container);
    this.socket = this.create(options);
  }

  create(options = defaultOptions) {
    return new net.Socket(options);
  }

  connect(port, domain, data){
    return new Promise((resolve, reject)=>{
      this.socket.connect(port, domain, (...args) =>{
        return resolve(this.socket)
      });
    });
  }
}

/*client.on("timeout",function(buffer){
console.log("PASS event timeout")
});*/


module.exports = TcpSocket
