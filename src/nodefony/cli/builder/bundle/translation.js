const Transalation = class Translation {
  constructor(cli, builder) {
    this.cli = cli;
    this.type = builder.type;
    this.bundleType = builder.bundleType;
    this.skeletonPath = builder.skeletonPath;
    this.name = "translations";
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
module.exports = Transalation;