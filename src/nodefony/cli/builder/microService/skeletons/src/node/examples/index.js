const nodefony = require("nodefony");
const path = require("path");
const config = require(path.resolve("config", "config.js"));

// examples services
const Server = require(path.resolve("src", "node", "services", "servers", "http.js"));
const Worker = require(path.resolve("src", "node", "services", "worker", "worker.js"));
const Socket = require(path.resolve("src", "node", "services", "socketio", "socketio.js"));
const Syscall = require(path.resolve("src", "node", "services", "syscall", "syscall.js"));
const Napi = require("hello_world");

class Service extends nodefony.Service {
  constructor(env= "production", debug = false){
    super("Microservice");
    // init logger
    this.initSyslog();
    this.env = env ;
    this.debug = debug;
    this.log(`Environment = ${env}   Debug = ${debug}`);
    this.settings = config ;
    // start
    this.start();
  }

  async start(){
    /**
     *  examples services
     */
    // SIMPLE  HTTP  SERVER
    await this.createHttpServer();
    // SocketIo for websocket connections
    await this.createSocketIoServer();

    //  Syscall  (Spawn)
    await this.createSyscall();

    // Hello C N-api
    this.napi();

    // node.js worker (multi threading)
    //await this.createWorker();
  }

  async createHttpServer(){
    const http = new Server(this);
    // add in service container
    this.set("http", http);
    http.on("request", async (request, response) => {
      response.statusCode = 200;
      response.setHeader('Content-Type', 'text/html');
      http.log(` ${response.statusCode} url : http://${http.settings.hostname}:${http.settings.port}/`);
      response.end(await this.renderHtml());
    });
    return await http.start(this.settings.examples.http);
  }

  async createSocketIoServer(){
    const socket = new Socket(this);
    // add in service container
    this.set("socketio", socket);
    return await socket.start();
  }

  createWorker(){
    const myworker = new Worker(this);
    // add in service container
    this.set("myworker", myworker);
    return myworker ;
  }

  async createSyscall(){
    const sys = new Syscall(this);
    // add in service container
    this.set("syscall", sys);
    return await sys.start();
  }

  napi(){
    const hello = new Napi(this);
    // add in service container
    this.set("n-api", hello);
    return hello.start();
  }

  async renderHtml() {
    return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Nodefony Microservice</title>
  <style>
    body { font: 13px Helvetica, Arial; }
  </style>
</head>
<body>
  <p align="center">
    <img src="https://github.com/nodefony/nodefony-core/raw/master/src/nodefony/bundles/framework-bundle/Resources/public/images/nodefony-logo.png"><br>
  </p>
  <h1 align="center">NODEFONY V6 Micro Service</h1>
  <h2 align="center">Socket Io <h2>

  <script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.3.0/socket.io.dev.js"></script>
  <script
  src="https://code.jquery.com/jquery-3.4.1.min.js"
  integrity="sha256-CSXorXvZcTkaix6Yvo6HppcZGetbYMGWSFlBw8HfCJo="
  crossorigin="anonymous"></script>

  <script>
    var socket = io('/',{
      transports: [ 'websocket' ],
      forceNew: true
    });

    socket.on("connect_error", function(e){
      console.error(e);
    });

    socket.on('connect', function(){
      console.log("connect", socket.connected);
      setTimeout(()=>{
        socket.emit("microservice", "send after 5 s");
      }, 5000);

    });

    socket.on('microservice', function(data){
      console.log(data);
    });

    socket.on('disconnect', function(){
      console.log("disconnect");
    });
  </script>
</body>
</html>
    `;
  }

  terminate(code){
    if (this.debug) {
      console.trace(code);
    }
    if (code === undefined) {
      code = 0;
    }
    process.nextTick(() => {
      this.log("Life Cycle Terminate CODE : " + code, "INFO");
      try {
        if (code === 0) {
          process.exitCode = code;
        }
        return process.exit(code);
      } catch (e) {
        this.log(e, "ERROR");
      }
    });
  }
}

module.exports = new Service(process.env.NODE_ENV, process.env.DEBUG);
