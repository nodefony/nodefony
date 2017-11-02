const Routing = class Routing {
  constructor(cli, builder) {
    this.cli = cli;
    this.type = builder.type;
    this.bundleType = builder.bundleType;
    this.params = builder.params;
    this.name = "routing." + this.type;
    this.skeletonPath = builder.skeletonPath;
    this.skeleton = path.resolve(this.skeletonPath, this.bundleType, "routing." + this.type + ".skeleton");
  }
  createBuilder() {
    return {
      name: this.name,
      type: "file",
      skeleton: this.skeleton,
      params: this.params
    };
  }
  addConfigRoute() {

  }
};

module.exports = Routing;
