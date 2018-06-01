module.exports = class realTimeBundle extends nodefony.Bundle {

  constructor(name, kernel, container) {
    super(name, kernel, container);
    // load bundle library
    //this.autoLoader.loadDirectory(this.path + "/core");
  }
};