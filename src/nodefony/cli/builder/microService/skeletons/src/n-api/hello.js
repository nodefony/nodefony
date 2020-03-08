const nodefony = require("nodefony");
const addon = require('bindings')('hello');

class Hello extends nodefony.Service {

  constructor(service){
      super("n-api", service.container);
      this.service = service ;
      this.log("Running");
  }

  start(){
    try{
      let res = addon.hello();
      this.log(res);
    }catch(e){
      this.log(e, "ERROR");
      throw e ;
    }
  }
}

module.exports = Hello ;
