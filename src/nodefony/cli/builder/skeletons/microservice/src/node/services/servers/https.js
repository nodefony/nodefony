const nodefony = require("nodefony");
const https = require('https');

class Server extends nodefony.Service {
  constructor(service){
    super("HTTPS Server", service.container);
    this.service = service ;
  }

  start(){
    this.log("Starting Server", "INFO");
    const hostname = '127.0.0.1';
    const port = 3443;
    const server = https.createServer((req, res) => {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/plain');
      this.log(` ${res.statusCode} url : http://${hostname}:${port}/`);
      res.end(`Hello Word ${this.service.name}`);
    });

    server.listen(port, hostname, () => {
      this.log(`Server running at https://${hostname}:${port}/`);
    });
    return server ;
  }

}


module.exports = Server ;
