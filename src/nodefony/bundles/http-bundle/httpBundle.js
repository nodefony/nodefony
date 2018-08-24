module.exports = class httpBundle extends nodefony.Bundle {
  constructor(name, kernel, container) {
    super(name, kernel, container);
    this.autoLoader.loadDirectory(path.resolve(this.path, "src"));
  }
};