const Test = class Test {
  constructor(cli, builder) {
    this.cli = cli;
    this.type = builder.type;
    this.params = builder.params;
    this.bundleType = builder.bundleType;
    this.skeletonPath = builder.skeletonPath;
    this.name = "tests";
    this.skeletonTest = path.resolve(this.skeletonPath, "testFile.skeleton");
  }
  createBuilder() {
    return {
      name: this.name,
      type: "directory",
      childs: [{
        name: this.params.name + "Test.js",
        type: "file",
        skeleton: this.skeletonTest,
        params: this.params
      }]
    };
  }
};

module.exports = Test;
