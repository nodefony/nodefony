/*
 *
 *
 *
 */
const generater = require("./builder/bundle.js");

module.exports = nodefony.registerCommand("generate", function () {
  /*
   *  Bundle generator
   */
  const regBundle = /^(.*)[Bb]undle$/;
  const regController = /^(.*)Controller$/;



  const reactBundle = function (Path, name, type, location, force) {
    let realName = null;
    let res = regBundle.exec(name);
    if (res) {
      realName = res[1];
    } else {
      throw new Error("Bad bundle name");
    }
    var param = {
      bundleName: name,
      name: realName,
      module: this.config.App.projectName,
      projectName: this.config.App.projectName,
      authorName: this.config.App.authorName,
      authorEmail: this.config.App.authorMail,
      projectYear: this.config.App.projectYear,
      projectYearNow: new Date().getFullYear()
    };

    return this.build({
      name: name,
      type: "directory",
      childs: [
        Command,
        controller.call(this, name, "controller", "defaultController", null, location, path.resolve(this.kernel.autoLoader.dirname, "bundles", "frameworkBundle", "Command", "skeletons", "react", "controllerClass.skeleton")),
        manager,
        tests.call(this, param),
        Resources.call(this, name, type, location, "react"),
        documentation.call(this, param, location),
        core,
        entity,
        {
          name: name + ".js",
          type: "file",
          skeleton: path.resolve(this.kernel.autoLoader.dirname, "bundles", "frameworkBundle", "Command", "skeletons", "bundleClass.skeleton"),
          params: param
        }, {
          name: "readme.md",
          type: "file"
        }
      ]
    }, Path, force);

  };



  // ROUTING
  const routing = function (obj, type, bundleType) {
    return {
      name: "routing." + type,
      type: "file",
      skeleton: path.resolve(this.kernel.autoLoader.dirname, "bundles/frameworkBundle/Command/skeletons/" + bundleType + "/routing." + type + ".skeleton"),
      params: obj
    };
  };
  routing.addConfigRoute = function (file, type, route, nameController, bundleName, bundle) {
    let routingFile = new nodefony.fileClass(file);
    switch (type) {
    case "js":
      let json = require(routingFile.path);
      json[route.name] = {
        pattern: "/" + bundle + "/" + route.name,
        defaults: {
          controller: bundleName + ":" + nameController + ":index"
        }
      };
      this.buildSkeleton(path.resolve(this.kernel.autoLoader.dirname, "bundles/frameworkBundle/Command/skeletons/route." + type + ".skeleton"), true, {
        routes: JSON.stringify(json, null, 2)
      }, function (error, data) {
        if (error) {
          throw error;
        }
        try {
          fs.writeFileSync(routingFile.path, data, {
            mode: "777"
          });
        } catch (e) {
          throw e;
        }
      });
      break;
    case "yml":
      this.buildSkeleton(path.resolve(this.kernel.autoLoader.dirname, "bundles/frameworkBundle/Command/skeletons/route." + type + ".skeleton"), true, {
        controller: nameController,
        name: route.name,
        bundleName: bundleName
      }, function (error, data) {
        if (error) {
          throw error;
        }
        try {
          fs.writeFileSync(routingFile.path, routingFile.content() + data, {
            mode: "777"
          });
        } catch (e) {
          throw e;
        }
      });
      break;
    default:
      throw new Error("Type generator don't exist");
    }
  };



  const service = function (obj, type) {
    let file = [{
      name: "service." + type,
      type: "file",
      skeleton: path.resolve(this.kernel.autoLoader.dirname, "bundles/frameworkBundle/Command/skeletons/service." + type + ".skeleton"),
      params: obj
    }];
    return file;
  };

  service.addConfigService = function () {

  };


  /*
   *  controller generator
   *
   */

  const controller = function (bundleName, directory, controllerName, viewDir, location, skeleton) {
    let res = regController.exec(controllerName);
    let realName = null;
    if (res) {
      realName = res[1];
    } else {
      throw new Error("Bad controller name");
    }
    let obj = {
      name: directory,
      type: "directory"
    };
    let nameBundle = null;
    try {
      res = regBundle.exec(bundleName)[1];
    } catch (e) {
      throw e;
    }

    if (!skeleton) {
      skeleton = path.resolve(this.kernel.autoLoader.dirname, "bundles/frameworkBundle/Command/skeletons/controllerClass.skeleton");
    }
    let file = [{
      name: controllerName + ".js",
      type: "file",
      skeleton: skeleton,
      params: {
        bundleName: bundleName,
        smallName: nameBundle,
        controllerName: controllerName,
        name: realName,
        directory: viewDir || "",
        module: viewDir || this.config.App.projectName,
        authorName: this.config.App.name,
        authorEmail: this.config.App.email,
        projectName: this.config.App.projectName,
        projectYear: this.config.App.projectYear,
        projectYearNow: new Date().getFullYear(),
        location: location
      }
    }];
    obj.childs = file;
    return obj;
  };

  const controllers = function (bundlePath, controllerName, type) {
    let res = regController.exec(controllerName);
    let realName = null;
    let bundleName = null;
    if (res) {
      realName = res[1];
    } else {
      throw new Error("Bad controller name");
    }

    bundlePath.matchName(regBundle);
    if (bundlePath.match) {
      bundleName = bundlePath.match[0];
    } else {
      throw new Error("Bad bundle name");
    }

    let bundleDirectoryController = new nodefony.fileClass(bundlePath.path + "/controller");
    let bundleDirectoryview = new nodefony.fileClass(bundlePath.path + "/Resources/views");
    let name = regBundle.exec(bundleName)[1];
    try {
      this.build(controller.call(this, bundlePath.name, realName, controllerName, realName), bundleDirectoryController);
      this.build(views.call(this, realName, "index.html.twig", {
        name: name,
        bundleName: bundleName
      }), bundleDirectoryview);
      let route = new nodefony.Route(realName);
      route.addDefault("controller", bundleName + ":" + realName + ":index");
      //console.log(route)
      routing.addConfigRoute.call(this, bundlePath.path + "/Resources/config/routing." + type, type, route, realName, bundleName, name);
    } catch (e) {
      this.logger(e, "ERROR");
    }
  };

  /*
   *
   */
  const generate = class generate extends nodefony.cliKernel {

    constructor(container, command, options) {

      super("generate", container, container.get("notificationsCenter"), options);

      this.config = this.container.getParameters("bundles.App");
      this.configKernel = this.container.getParameters("kernel");
      let cmd = command[0].split(":");
      let args = command[1];
      let interactive = command[2].interactive;
      switch (cmd[1]) {
      case "bundle":
        if (command[1]) {
          try {
            if (!cmd[2]) {
              let project = new generater.bundle(this, "js");
              let result = project.createBuilder(args[0], args[1]);
              project.build(result, project.location);
              project.install();
              this.terminate(0);
              return;
            } else {
              switch (cmd[2]) {
              case "angular":
                let project = new generater.angular(this, "js");
                project.generateProject(args[0], args[1], interactive).then((builder) => {
                  builder.build(builder.createBuilder(), builder.location, true);
                  builder.install();
                  this.terminate(0);
                });
                break;
              case "react":
                let generateReactCli = require("./react/reactCli.js");
                try {
                  let reactCli = new generateReactCli(this);
                  reactCli.generateProject(args[0], args[1], interactive).then((obj) => {
                    try {
                      let file = new nodefony.fileClass(obj.path);
                      reactBundle.call(this, file, obj.name, "yml", obj.path, true);
                      this.installBundle(obj.name, obj.path);
                      let src = path.resolve(reactCli.bundlePath, reactCli.bundleName + "bundle", "public");
                      let dest = path.resolve(reactCli.bundlePath, reactCli.bundleName + "bundle", "Resources", "public", "dist");
                      this.logger("ln -s " + src + " " + dest);
                      shell.ln('-sf', src, dest);
                      this.terminate(0);
                    } catch (e) {
                      throw e;
                    }
                  }).catch((e) => {
                    throw e;
                  });
                } catch (e) {
                  throw e;
                }
                break;
              case "test":

                break;
              }
            }
          } catch (e) {
            this.logger(e, "ERROR");
            this.terminate(1);
            return;
          }
        } else {
          this.showHelp();
          this.terminate(1);
          return;
        }
        break;
      case "controller":
        switch (command.length) {
        case 1:
          this.showHelp();
          break;
        case 2:
          this.showHelp();
          break;
        case 3:
          try {
            this.generateController(args[0], args[1]);
          } catch (e) {
            this.terminate(1);
            return;
          }
          break;
        }
        break;
      case "command":
        try {
          this.generateCommand(args[0], args[1]);
        } catch (e) {
          this.terminate(1);
          return;
        }
        break;
      case "service":
        try {
          this.generateService(interactive);
        } catch (e) {
          this.terminate(1);
          return;
        }
        break;
      default:
        this.showHelp();
        this.terminate(0);
      }
    }

    generateController(name, Path) {
      this.logger("GENERATE controller : " + name + " BUNDLE LOCATION : " + Path);
      try {
        let file = new nodefony.fileClass(Path);
        return controllers.call(this, file, name, "js");
      } catch (e) {
        this.logger(e, "ERROR");
        throw e;
      }
    }

    generateCommand(name, Path) {
      this.logger("GENERATE Command : " + name + " LOCATION : " + Path + "Command");
      try {
        let file = new nodefony.fileClass(Path);
        return commands.call(this, file, name);
      } catch (e) {
        this.logger(e, "ERROR");
        throw e;
      }
    }

    /*generateService (interactive, name, Path){

    }*/
  };

  return {
    name: "generate",
    commands: {
      bundle: ["generate:bundle nameBundle path", "Generate a nodefony Bundle  Example : nodefony generate:bundle myBundle ./src/bundles"],
      bundleAngular: ["generate:bundle:angular nameBundle path", "Generate a Angular Bundle  Example : nodefony generate:bundle:angular myBundle ./src/bundles"],
      //bundleReact: ["generate:bundle:react nameBundle path", "Generate a React Bundle Example : nodefony generate:bundle:react myBundle ./src/bundles"],
      //controller: ["generate:controller  nameController bundlePath", "Generate a controller Example : nodefony generate:controller myController ./src/bundles/myBundle"],
      //command: ["generate:command nameCommand path", "Generate a command js file in bundle path"]
      //service:["generate:service nameService path" ,"Generate a service js file in bundle path"]
    },
    cli: generate
  };
});
