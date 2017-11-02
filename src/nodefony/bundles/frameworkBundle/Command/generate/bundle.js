const command = require("./command.js");
const controller = require("./controller.js");
const service = require("./service.js");
const tests = require("./test.js");
const resources = require("./resources.js");
const regBundle = /^(.*)[Bb]undle$/;
const generateReactCli = require("../react/reactCli.js");
const generateAngularCli = require("../angular/angularCli.js");

// mother class bundle
const Bundle = class Bundle {
  constructor(cli, type, bundleType) {
    this.cli = cli;
    this.type = type;
    this.bundleType = bundleType;
    this.params = {
      module: this.cli.config.App.projectName,
      projectName: this.cli.config.App.projectName,
      authorName: this.cli.config.App.authorName,
      authorEmail: this.cli.config.App.authorMail,
      projectYear: this.cli.config.App.projectYear,
      domain: this.cli.configKernel.system.domain,
      local: this.cli.config.App.locale,
      projectYearNow: new Date().getFullYear()
    };
    this.skeletonPath = path.resolve(this.cli.kernel.autoLoader.dirname, "bundles", "frameworkBundle", "Command", "skeletons");
    this.skeleton = path.resolve(this.skeletonPath, "bundleClass.skeleton");
    this.packageSkeleton = path.resolve(this.skeletonPath, "package.skeleton");
    this.command = new command(this.cli, this);
    this.controller = new controller(this.cli, this);
    this.service = new service(this.cli, this);
    this.tests = new tests(this.cli, this);
    this.resources = new resources(this.cli, this);

  }
  checkPath(name, Path) {
    if (!name) {
      throw new Error("Bad bundle name");
    }
    if (!Path) {
      Path = path.resolve("src", "bundles");
    }
    this.cli.logger("GENERATE bundle : " + name + " LOCATION : " + path.resolve(Path));
    this.shortName = null;
    this.name = name;
    let res = regBundle.exec(this.name);
    if (res) {
      this.shortName = res[1];
    } else {
      throw new Error("Bad bundle name :" + this.name);
    }
    try {
      this.location = new nodefony.fileClass(path.resolve(Path));

    } catch (e) {
      this.cli.logger(e, "ERROR");
      throw e;
    }
  }

  createBuilder(name, location) {
    this.checkPath(name, location);
    nodefony.extend(this.params, {
      bundleName: this.name,
      name: this.shortName,
      title: this.shortName,
      location: this.location.path
    });
    return {
      name: this.name,
      type: "directory",
      childs: [
        this.controller.createBuilder(this.shortName + "Controller", "controller"),
        this.resources.createBuilder(),
        //this.command.createBuilder(),
        //this.services.createBuilder(),
        //this.tests.createBuilder(),
        //this.documentation.createBuilder(),
        {
          name: this.name + ".js",
          type: "file",
          skeleton: this.skeleton,
          params: this.params
        }, {
          name: "readme.md",
          type: "file"
        }, {
          name: "core",
          type: "directory",
          childs: [{
            name: ".gitignore",
            type: "file"
          }]
        }, {
          name: "Entity",
          type: "directory",
          childs: [{
            name: ".gitignore",
            type: "file"
          }]
        }, {
          name: "package.json",
          type: "file",
          skeleton: this.packageSkeleton,
          params: this.params
        }
      ]
    };
  }

  build(obj, location, force) {
    try {
      return this.cli.build.call(this.cli, obj, location, force);
    } catch (e) {
      throw e;
    }
  }
};

// Bundle type Nodefony Standard
const Nodefony = class Nodefony extends Bundle {
  constructor(cli, type) {
    super(cli, type || "js", "");
  }
  build(name, location, force) {
    try {
      let res = super.createBuilder(name, location);
      return super.build(res, this.location, force);
    } catch (e) {
      throw e;
    }
  }
};


const React = class React extends Bundle {

  constructor(cli) {
    super(cli);
  }
  builder() {

  }
};

const Angular = class Angular extends Bundle {

  constructor(cli) {
    super(cli);
  }
  builder() {}
};

module.exports = {
  bundle: Nodefony,
  angular: Angular,
  react: React
};
