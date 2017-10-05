module.exports = nodefony.registerBundle("realTime", function () {

  const realTime = class realTime extends nodefony.Bundle {

    constructor(name, kernel, container) {
      super(name, kernel, container);
      // load bundle library
      this.autoLoader.loadDirectory(this.path + "/core");
    }
  };
  return realTime;
});
