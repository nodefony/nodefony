/*
 *
 *
 *
 */
const generater = require("./builder/bundle.js");

module.exports = nodefony.registerCommand("generate", function () {


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
      let project = null;
      switch (cmd[1]) {
      case "bundle":
        if (command[1]) {
          try {
            if (!cmd[2]) {
              project = new generater.bundle(this, "js");
              let result = project.createBuilder(args[0], args[1]);
              project.build(result, project.location);
              project.install();
              this.terminate(0);
              return;
            } else {
              switch (cmd[2]) {
              case "angular":
                project = new generater.angular(this, "js");
                project.generateProject(args[0], args[1], interactive).then((builder) => {
                  builder.build(builder.createBuilder(), builder.location, true);
                  builder.install();
                  this.terminate(0);
                });
                break;
              case "react":
                project = new generater.react(this, "js");
                project.generateProject(args[0], args[1], interactive).then((builder) => {
                  builder.build(builder.createBuilder(), builder.location, true);
                  builder.install();
                  //let src = path.resolve(project.bundlePath, "public");
                  //let dest = path.resolve(project.bundlePath, "Resources", "public", "dist");
                  //this.logger("ln -s " + src + " " + dest);
                  //shell.ln('-sf', src, dest);
                  this.terminate(0);
                });
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
            this.logger(e, "ERROR");
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
      let project = new generater.bundle(this, "js");
      let file = null;
      try {
        file = new nodefony.fileClass(Path);
        Path = file.shortName;
      } catch (e) {}
      try {
        project.getBundle(Path);
      } catch (e) {
        this.logger(e, "ERROR");
        throw e;
      }
      try {
        project.controller.generateController(name);
      } catch (e) {
        throw e;
      }
    }

    generateCommand(name, Path) {
      this.logger("GENERATE Command : " + name + " LOCATION : " + Path + "Command");
    }

  };

  return {
    name: "generate",
    commands: {
      bundle: ["generate:bundle nameBundle path", "Generate a nodefony Bundle  Example : nodefony generate:bundle myBundle ./src/bundles"],
      bundleAngular: ["generate:bundle:angular nameBundle path", "Generate a Angular Bundle  Example : nodefony generate:bundle:angular myBundle ./src/bundles"],
      //bundleReact: ["generate:bundle:react nameBundle path", "Generate a React Bundle Example : nodefony generate:bundle:react myBundle ./src/bundles"],
      controller: ["generate:controller  nameController bundlePath", "Generate a controller Example : nodefony generate:controller myController ./src/bundles/myBundle"],
      //command: ["generate:command nameCommand path", "Generate a command js file in bundle path"]
      //service:["generate:service nameService path" ,"Generate a service js file in bundle path"]
    },
    cli: generate
  };
});