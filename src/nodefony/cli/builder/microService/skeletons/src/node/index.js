const nodefony = require("nodefony");
const path = require("path");
const Server = require(path.resolve("src", "node", "services", "servers", "http.js"));
const ServerSecure = require(path.resolve("src", "node", "services", "servers", "https.js"));
const Markdown = require(path.resolve("src", "node", "services", "markdown", "markdown.js"));
const ejs = require('ejs');

class Service extends nodefony.Service {

  constructor(environment = "production", debug = false) {
    super("Microservice");
    this.environment = environment;
    this.debug = debug;
    // init logger
    this.initSyslog();
    this.log(`Environment = ${environment}   Debug = ${debug}`);
    this.settings = require(path.resolve("config", "config.js"));
    this.markdown = this.getMarkdown();
    // start
    this.start();
  }

  async start() {
    await this.startHttpServer();
    await this.startHttpsServer();
    return this;
  }

  async startHttpServer() {
    const http = new Server(this);
    // add in service container
    this.set("http", http);
    await http.start();
    http.on("request", async (request, response) => {
      //response.statusCode = 200;
      //response.setHeader('Content-Type', 'text/html');
      response.writeHead(200, {
        'Content-Type': 'text/html;charset=utf-8'
      })
      http.log(` ${response.statusCode} url : http://${http.settings.hostname}:${http.settings.port}/`);
      response.end(await this.renderHtml());
    });
    return http;
  }

  async startHttpsServer() {
    const https = new ServerSecure(this);
    // add in service container
    this.set("https", https);
    await https.start();
    https.on("request", async (request, response) => {
      //response.statusCode = 200;
      //response.setHeader('Content-Type', 'text/html');
      response.writeHead(200, {
        'Content-Type': 'text/html;charset=utf-8'
      })
      https.log(` ${response.statusCode} url : https://${https.settings.hostname}:${https.settings.port}/`);
      response.end(await this.renderHtml());
    });
    return https;
  }

  async renderHtml() {
    const readme = path.resolve("README.md");
    const md = await this.markdown.fileToMarkdown(readme);
    const filename = path.resolve("dist", "index.ejs")
    const res = await ejs.renderFile(filename, {
      body: md
    }, {
      async: true
    });
    return res;
  }

  getMarkdown() {
    let markdown = this.get("markdown");
    if (!markdown) {
      markdown = new Markdown(this);
      this.set("markdown", markdown);
    }
    return markdown;
  }

  stop(code) {
    return new Promise((resolve, reject) => {
      process.nextTick(() => {
        this.log("Life Cycle Terminate");
        try {
          if (code === 0) {
            process.exitCode = code;
          }
          return resolve(process.exit(code));
        } catch (e) {
          this.log(e, "ERROR");
          return reject(e);
        }
      });
    });
  }
}

module.exports = new Service(process.env.NODE_ENV, process.env.DEBUG);
