module.exports = nodefony.registerBundle("security", function () {

  const security = class security extends nodefony.Bundle {
    constructor(name, kernel, container) {
      super(name, kernel, container);
      nodefony.security = {
        factory: {},
        providers: {},
        tokens: {}
      };
      // load bundle library
      this.autoLoader.loadDirectory(this.path + "/core");
    }
  };
  return security;
});
