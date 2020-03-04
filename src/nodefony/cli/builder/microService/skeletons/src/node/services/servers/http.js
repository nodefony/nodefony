const nodefony = require("nodefony");
const http = require('http');
const path = require("path");


class Server extends nodefony.Service {
  constructor(service){
    super("HTTP Server", service.container);
    this.service = service ;
    this.started = false ;
    this.markdown = this.get("markdown");
    this.settings = this.service.settings.http ;
  }

  start(){
    return new Promise((resolve, reject)=>{
      this.log("Starting Server", "INFO");
      this.server = http.createServer(async (req, res) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html');
        this.log(` ${res.statusCode} url : http://${this.settings.hostname}:${this.settings.port}/`);
        const readme = path.resolve("README.md");
        res.end(await this.markdown.fileToMarkdown(readme) );
        //res.end(`Hello Word ${this.service.name}`);
      });
      this.server.listen(this.settings.port, this.settings.hostname, () => {
        this.started = true ;
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

module.exports = Server ;
