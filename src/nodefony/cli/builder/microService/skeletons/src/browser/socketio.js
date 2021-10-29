const nodefony = require("nodefony-client");
import { io } from "socket.io-client";

import "./index.css";
/*
 *	Class
 */
class App extends nodefony.Service {
  constructor() {
    super("App");
    this.initSyslog();
    this.log("INIT APP CLIENT");
    this.log(`Nodefony Client version : ${nodefony.version}`);
    this.init()
  }

  init(){
    const socket = io('/',{
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
  }

}

export default new App();
