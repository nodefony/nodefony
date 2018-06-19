const command = require(path.resolve(__dirname, "command.js"));
const controller = require(path.resolve(__dirname, "controller.js"));
const service = require(path.resolve(__dirname, "service.js"));
const tests = require(path.resolve(__dirname, "test.js"));
const resources = require(path.resolve(__dirname, "resources.js"));
const documentation = require(path.resolve(__dirname, "documentation.js"));
const View = require(path.resolve(__dirname, "view.js"));
const Translation = require(path.resolve(__dirname, "translation.js"));
const routing = require(path.resolve(__dirname, "routing.js"));
const generateReactCli = require(path.resolve(__dirname, "react", "reactBuilder.js"));
const generateAngularCli = require(path.resolve(__dirname, "angular", "angularBuilder.js"));

// mother class bundle
const Bundle = class Bundle extends nodefony.Builder {
  constructor(cli, type, bundleType) {
    super(cli);
    this.type = type;
    this.kernel = this.cli.kernel;
    this.bundleType = bundleType || "";
    nodefony.extend(this.cli.response, {
      module: this.cli.config.App.projectName,
      projectName: this.cli.config.App.projectName,
      authorName: this.cli.config.App.authorName,
      authorEmail: this.cli.config.App.authorMail,
      projectYear: this.cli.config.App.projectYear,
      domain: this.cli.configKernel.system.domain,
      local: this.cli.config.App.locale,
      projectYearNow: new Date().getFullYear()
    });

    this.skeletonPath = path.resolve(__dirname, "skeletons");
    this.skeleton = path.resolve(this.skeletonPath, "bundleClass.skeleton");
    this.packageSkeleton = path.resolve(this.skeletonPath, "package.skeleton");
    this.bindingSkeleton = path.resolve(this.skeletonPath, "binding", "binding.skeleton");
    this.bindingcodeSkeleton = path.resolve(this.skeletonPath, "binding", "binding.cc.skeleton");
    this.command = new command(this.cli, this);
    this.controller = new controller(this.cli, this);
    this.service = new service(this.cli, this);
    this.tests = new tests(this.cli, this);
    this.view = new View(this.cli, this);
    this.routing = new routing(this.cli, this);
    this.translation = new Translation(this.cli, this);
    this.resources = new resources(this.cli, this);
    this.documentation = new documentation(this.cli, this);

  }

  /*interaction() {

  }*/

  checkPath(name, Path) {
    if (!name) {
      throw new Error("No bundle name");
    }
    let bundle = this.checkExist(name);
    if (bundle) {
      throw new Error("Bundle already exist " + name);
    }
    if (!Path) {
      Path = path.resolve("src", "bundles");
    }
    let res = this.kernel.regBundleName.exec(this.name);
    if (res) {
      throw new Error("Bad bundle   name :" + this.name);
    }
    this.cli.logger("GENERATE bundle : " + name + " LOCATION : " + path.resolve(Path));
    this.shortName = name;
    this.name = name + "-bundle";
    res = this.kernel.regBundleName.exec(this.name);
    if (res) {
      this.shortName = res[1];
    } else {
      throw new Error("Bad bundle   name :" + this.name);
    }
    try {
      this.setPath(Path);
    } catch (e) {
      this.cli.logger(e, "ERROR");
      throw e;
    }
  }

  setPath(Path, bundle) {
    if (bundle) {
      this.name = bundle.bundleName;
      this.shortName = bundle.name;
      this.location = bundle.location;
      this.bundlePath = bundle.path;
      this.bundleFile = path.resolve(this.bundlePath, this.shortName + "Bundle.js");
    } else {
      this.location = new nodefony.fileClass(path.resolve(Path));
      this.bundlePath = path.resolve(this.location.path, this.name);
      this.bundleFile = path.resolve(this.bundlePath, this.shortName + "Bundle.js");
    }
    nodefony.extend(this.cli.response, {
      bundleName: this.name,
      name: this.shortName,
      title: this.shortName,
      location: this.location.path
    });
  }

  checkExist(name) {
    let bundle = this.cli.kernel.getBundle(name);
    if (bundle) {
      return bundle;
    }
    try {
      let bundleName = this.cli.kernel.getBundleName(name);
      if (bundleName) {
        return this.cli.kernel.getBundle(bundleName);
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  getBundle(name) {
    let bundle = this.checkExist(name);
    if (!bundle) {
      throw new Error("bundle " + name + " don't exist ");
    }
    this.setPath(null, bundle);
    return bundle;
  }

  createBuilder(name, location) {
    this.checkPath(name, location);
    return {
      name: this.name,
      type: "directory",
      childs: [
        this.controller.createBuilder("defaultController"),
        this.resources.createBuilder(),
        this.tests.createBuilder(),
        this.command.createBuilder(),
        this.service.createBuilder(),
        this.documentation.createBuilder(),
        {
          name: this.shortName + "Bundle.js",
          type: "file",
          skeleton: this.skeleton,
          params: this.cli.response
        }, {
          name: "readme.md",
          type: "file"
        }, {
          name: "src",
          type: "directory",
          childs: [{
            name: "addon",
            type: "directory",
            childs: [{
              name: this.shortName + ".cc",
              type: "file",
              skeleton: this.bindingcodeSkeleton,
              params: this.cli.response
            }]
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
          params: this.cli.response
        }, {
          name: "binding.gyp",
          type: "file",
          skeleton: this.bindingSkeleton,
          params: this.cli.response
        }, {
          name: "build",
          type: "directory",
          childs: [{
            name: ".gitignore",
            type: "file"
          }]
        }
      ]
    };
  }

  install() {
    try {
      let json = this.cli.kernel.readGeneratedConfig();

      if (json) {
        if (json.system && json.system.bundles) {
          json.system.bundles[this.name] = this.bundlePath;
        } else {
          if (json.system) {
            json.system.bundles = {};
          } else {
            json.system = {
              bundles: {}
            };
          }
          json.system.bundles[this.name] = this.bundlePath;
        }
      } else {
        json = {
          system: {
            bundles: {}
          }
        };
        json.system.bundles[this.name] = this.bundlePath;
      }
      fs.writeFileSync(this.cli.kernel.generateConfigPath, yaml.safeDump(json), {
        encoding: 'utf8'
      });
      let file = new nodefony.fileClass(this.bundleFile);
      this.cli.kernel.loadBundle(file);
      //this.cli.assetInstall(this.name);
      return this.cli.npmInstall(this.bundlePath);
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
};

const React = class React extends Bundle {
  constructor(cli, type) {
    super(cli, type || "js", "react");
    this.generateReactCli = new generateReactCli(this);
  }
  generateProject(name, location, interactive) {
    try {
      return this.generateReactCli.generateProject(name, location, interactive);
    } catch (e) {
      throw e;
    }
  }
  createBuilder() {
    return {
      name: this.name,
      type: "directory",
      childs: [
        this.controller.createBuilder("defaultController"),
        this.resources.createBuilder(),
        this.tests.createBuilder(),
        this.command.createBuilder(),
        this.service.createBuilder(),
        this.documentation.createBuilder(),
        {
          name: this.shortName + "Bundle.js",
          type: "file",
          skeleton: this.skeleton,
          params: this.cli.response
        }, {
          name: "readme.md",
          type: "file"
        }, {
          name: "Entity",
          type: "directory",
          childs: [{
            name: ".gitignore",
            type: "file"
          }]
        }
      ]
    };
  }
};

const Angular = class Angular extends Bundle {
  constructor(cli, type) {
    super(cli, type || "js", "angular");
    this.angularCli = new generateAngularCli(this);
  }
  generateProject(name, location, interactive) {
    try {
      return this.angularCli.generateProject(name, location, interactive);
    } catch (e) {
      throw e;
    }
  }
  createBuilder() {
    return {
      name: this.name,
      type: "directory",
      childs: [
        this.controller.createBuilder("defaultController"),
        this.resources.createBuilder(),
        this.tests.createBuilder(),
        this.command.createBuilder(),
        this.service.createBuilder(),
        this.documentation.createBuilder(),
        {
          name: this.shortName + "Bundle.js",
          type: "file",
          skeleton: this.skeleton,
          params: this.cli.response
        }, {
          name: "readme.md",
          type: "file"
        }, {
          name: "Entity",
          type: "directory",
          childs: [{
            name: ".gitignore",
            type: "file"
          }]
        }
      ]
    };
  }
};

module.exports = {
  nodefony: Nodefony,
  angular: Angular,
  react: React
};