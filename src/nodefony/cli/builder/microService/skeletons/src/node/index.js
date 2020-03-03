const nodefony = require("nodefony");
const path = require("path");
const config = require(path.resolve("config", "config.js"));

// examples services
const Server = require(path.resolve(__dirname, "services", "servers", "http.js"));
const Worker = require(path.resolve(__dirname, "services", "worker", "worker.js"));
const Socket = require(path.resolve(__dirname, "services", "socketio", "socketio.js"));
const Markdown = require(path.resolve(__dirname, "services", "markdown", "markdown.js"));
const Syscall = require(path.resolve(__dirname, "services", "syscall", "syscall.js"));

class Service extends nodefony.Service {
  constructor(env= "production", debug = false){
    super("My Microservice");

    // init logger
    this.initSyslog();
    this.env = env ;
    this.debug = debug;
    this.log(`Environment = ${env}   Debug = ${debug}`);
    this.settings = config ;

    /**
     *  examples services
     */
    // Simple Markdown parser
    this.createMarkdownService();
    // SIMPLE  HTTP  SERVER
    this.createHttpServer();
    // SocketIo for websocket connections
    this.createSocketIoServer();
    // node.js worker (multi threading)
    this.createWorker();
    //  Syscall  (Spawn)
    this.createSyscall();
  }

  createHttpServer(){
    const http = new Server(this);
    // add in service container
    this.set("http", http);
    return http.start();
  }

  createSocketIoServer(){
    const socket = new Socket(this);
    // add in service container
    this.set("socketio", socket);
    return socket.start();
  }

  createWorker(){
    const myworker = new Worker(this);
    // add in service container
    this.set("myworker", myworker);
    return myworker ;
  }

  createMarkdownService(){
    const mk = new Markdown(this);
    // add in service container
    this.set("markdown", mk);
    return mk ;
  }

  createSyscall(){
    const sys = new Syscall(this);
    // add in service container
    this.set("syscall", sys);
  }

  terminate(code, quiet){
    if (this.debug) {
      console.trace(code);
    }
    if (code === undefined) {
      code = 0;
    }
    process.nextTick(() => {
      this.log("Life Cycle Terminate CODE : " + code, "INFO");
      try {
        if (quiet) {
          return code;
        }
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
