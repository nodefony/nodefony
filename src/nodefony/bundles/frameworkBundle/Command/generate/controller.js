const regController = /^(.*)Controller$/;

const Controller = class Controller {
  constructor(cli, builder) {
    this.cli = cli;
    this.type = builder.type;
    this.params = builder.params;
    this.bundleType = builder.bundleType;
    this.skeletonPath = builder.skeletonPath;
    this.skeletonController = path.resolve(this.skeletonPath, this.bundleType, "controllerClass.skeleton");
  }
  createBuilder(name, directory) {
    this.checkName(name);
    nodefony.extend(this.params, {
      controllerName: this.name
    });
    return {
      name: directory,
      type: "directory",
      childs: [{
        name: this.name + ".js",
        type: "file",
        skeleton: this.skeletonController,
        params: this.params
      }]
    };
  }

  checkName(name) {
    let res = regController.exec(name);
    this.shortName = null;
    if (res) {
      this.name = name;
      this.shortName = res[1];
    } else {
      throw new Error("Bad controller name : " + name);
    }
  }
};

module.exports = Controller;
