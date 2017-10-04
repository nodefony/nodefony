module.exports = nodefony.registerBundle("http", function () {

  const httpBundle = class httpServer extends nodefony.Bundle {
    constructor(name, kernel, container) {
      super(name, kernel, container);
      this.autoLoader.loadDirectory(path.resolve(this.path, "core"));
    }
  };
  return httpBundle;
});
