const nodefony = require("nodefony");

/*
 *	Class
 */
class App extends nodefony.Service {
  constructor() {
    super("App");
    this.initSyslog();
    this.log("INIT APP CLIENT");
    this.log(`Nodefony Client version : ${nodefony.version}`);
  }
}

export default new App();
