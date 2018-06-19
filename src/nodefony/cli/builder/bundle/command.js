const Command = class Command {
  constructor(cli, builder) {
    this.cli = cli;
    this.type = builder.type;
    this.bundleType = builder.bundleType;
    this.skeletonPath = builder.skeletonPath;
    this.name = "Command";
    this.skeletonCommand = path.resolve(this.skeletonPath, "commandClass.skeleton");
  }
  createBuilder() {
    return {
      name: this.name,
      type: "directory",
      childs: [{
        name: this.cli.response.name + "Command.js",
        type: "file",
        skeleton: this.skeletonCommand,
        params: this.cli.response
      }]
    };
  }
};

module.exports = Command;