module.exports = class httpBundle extends nodefony.Bundle {
  constructor (name, kernel, container) {
    super(name, kernel, container);
    this.autoLoader.loadDirectory(path.resolve(this.path, "src"), /errors/);
    this.autoLoader.load(path.resolve(this.path, "src", "errors", "httpError.js"));
    this.autoLoader.load(path.resolve(this.path, "src", "errors", "errorRequest.js"));
  }
};
