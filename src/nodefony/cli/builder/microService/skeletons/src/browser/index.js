const nodefony = require("nodefony");
const io = require('socket.io-client');

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
    this.io = io();
  }
}

export default new App();
