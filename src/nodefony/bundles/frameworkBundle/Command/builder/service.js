const Service = class Service {
  constructor(cli, builder) {
    this.cli = cli;
    this.type = builder.type;
    this.params = builder.params;
    this.bundleType = builder.bundleType;
    this.skeletonPath = builder.skeletonPath;
    this.name = "services";
  }
  createBuilder() {
    return {
      name: this.name,
      type: "directory",
      childs: [{
        name: ".gitignore",
        type: "file"
      }]
    };
  }
};

module.exports = Service;
