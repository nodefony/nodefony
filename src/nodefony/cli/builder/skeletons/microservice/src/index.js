const nodefony = require("nodefony");


class Cci extends nodefony.Service {
  constructor(env, debug){
    super("cci");
    this.initSyslog();
    this.log("instance", "INFO")
  }

}


module.exports = new Cci();
