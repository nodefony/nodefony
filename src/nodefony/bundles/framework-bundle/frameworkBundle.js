module.exports = class frameworkBundle extends nodefony.Bundle {
  constructor (name, kernel, container) {
    super(name, kernel, container);
    // load bundle library
    this.autoLoader.loadDirectory(path.resolve(this.path, "src"));
  }
};
