const regController = /^(.*)Controller$/;

const Controller = class Controller {
  constructor(cli, builder) {
    this.cli = cli;
    this.builder = builder;
    this.type = builder.type;
    this.params = builder.params;
    this.bundleType = builder.bundleType;
    this.skeletonPath = builder.skeletonPath;
    this.skeletonController = path.resolve(this.skeletonPath, this.bundleType, "controllerClass.skeleton");
    this.directory = "controller";
  }
  createBuilder(name, directory) {
    this.checkName(name);
    nodefony.extend(this.params, {
      controllerName: this.name,
      controllerShortName: this.shortName,
      directory: directory || ""
    });
    return {
      name: directory || this.directory,
      type: "directory",
      childs: [this.createFile(this.name)]
    };
  }

  createFile(name) {
    return {
      name: name + ".js",
      type: "file",
      skeleton: this.skeletonController,
      params: this.params
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

  generateController(name) {
    try {
      this.checkName(name);
      let Path = path.resolve(this.builder.bundlePath, this.directory);
      let result = this.createBuilder(name, this.shortName);
      this.builder.build(result, new nodefony.fileClass(Path));
      this.builder.routing.addConfigRoute(this.shortName);
      result = this.builder.view.createBuilder(this.shortName, "index.html.twig");
      Path = path.resolve(this.builder.bundlePath, "Resources", this.builder.view.directory);
      this.builder.build(result, new nodefony.fileClass(Path));
    } catch (e) {
      throw e;
    }


  }
};

module.exports = Controller;