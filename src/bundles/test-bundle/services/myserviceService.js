const myClass = require("./myDeps.js");
module.exports = class myservice extends nodefony.Service {
  constructor (container, router, httpKernel, domain) {
    super("myservice", container);
    this.router = router;
    this.httpKernel = httpKernel;
    this.domain = domain;
    this.calldomain = null;
    this.https = null;
    this.ele = null;
    this.ele2 = null;
    this.ele3 = null;
    this.myClass = new myClass("cci@gmail.com");
  }

  boot (domain, ele, https) {
    this.ele = ele;
    this.calldomain = domain;
    this.https = https;
  }

  boot2 (ele2, ele3, ele4) {
    this.ele2 = ele2;
    this.ele3 = ele3;
    this.http = ele4;
  }

  clean () {
    this.clean = true;
    super.clean();
  }
};
