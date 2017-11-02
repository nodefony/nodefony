/*
 *
 *
 *
 */

module.exports = nodefony.registerCommand("generate", function () {

  /*
   *  Bundle generator
   *
   */
  const regBundle = /^(.*)[Bb]undle$/;
  const regController = /^(.*)Controller$/;

  const angularBundle = function (Path, name, type, location, force) {
    var realName = null;
    var res = regBundle.exec(name);
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
        controller.call(this, name, "controller", "defaultController", null, location, path.resolve(this.kernel.autoLoader.dirname, "bundles", "frameworkBundle", "Command", "skeletons", "angular", "controllerClass.skeleton")),
        manager,
        tests.call(this, param),
        Resources.call(this, name, type, location, "angular"),
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

  const nodefonyBundle = function (Path, name, type, location, force) {

    let realName = null;
    let res = regBundle.exec(name);
    if (res) {
      realName = res[1];
    } else {
      throw new Error("Bad bundle name");
    }
    let param = {
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
        controller.call(this, name, "controller", "defaultController", null, location),
        manager,
        tests.call(this, param),
        Resources.call(this, name, type, location, ""),
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
          type: "symlink",
          params: {
            source: "doc/default/readme.md",
            dest: "readme.md"
          }
        }, {
          name: "package.json",
          type: "file",
          skeleton: path.resolve(this.kernel.autoLoader.dirname, "bundles", "frameworkBundle", "Command", "skeletons", "package.skeleton"),
          params: param
        }
      ]
    }, Path, force);
  };

  const documentation = function (param, location) {
    return {
      name: "doc",
      type: "directory",
      childs: [{
        name: "default",
        type: "directory",
        childs: [{
          name: "readme.md",
          type: "file",
          skeleton: path.resolve(this.kernel.autoLoader.dirname, "bundles/frameworkBundle/Command/skeletons/readme.skeleton"),
          params: nodefony.extend(param, {
            path: location
          })
        }]
      }]
    };
  };

  const webpack = function (obj, type, bundleType) {
    switch (bundleType) {
      //case "angular":
      //case "react":
      //  return {};
      default: return {
        name: "webpack",
        type: "directory",
        childs: [{
          name: "webpack.dev.config.js",
          type: "file",
          skeleton: path.resolve(this.kernel.autoLoader.dirname, "bundles/frameworkBundle/Command/skeletons/webpack/webpack.dev.skeleton"),
          params: obj
        }, {
          name: "webpack.prod.config.js",
          type: "file",
          skeleton: path.resolve(this.kernel.autoLoader.dirname, "bundles/frameworkBundle/Command/skeletons/webpack/webpack.prod.skeleton"),
          params: obj
        }]
      };
    }
  };

  const Resources = function (name, type, location, bundleType) {
    var Name = regBundle.exec(name)[1];
    var param = {
      name: Name,
      title: Name,
      bundleName: name,
      local: this.config.App.locale,
      projectName: this.config.App.projectName,
      authorName: this.config.App.name,
      authorEmail: this.config.App.email,
      projectYear: this.config.App.projectYear,
      projectYearNow: new Date().getFullYear(),
      domain: this.configKernel.system.domain,
      location: location
    };

    return {
      name: "Resources",
      type: "directory",
      childs: [{
          name: "config",
          type: "directory",
          childs: [{
              name: "config." + type,
              type: "file",
              skeleton: path.resolve(this.kernel.autoLoader.dirname, "bundles/frameworkBundle/Command/skeletons/" + bundleType + "/config." + type + ".skeleton"),
              params: param
            }, {
              name: "webpack.js",
              type: "file",
              skeleton: path.resolve(this.kernel.autoLoader.dirname, "bundles/frameworkBundle/Command/skeletons/webpack/webpack.common.skeleton"),
              params: param
            },
            routing.call(this, param, "js", bundleType),
            webpack.call(this, param, type, bundleType),
            security.call(this, param, type, bundleType)
          ]
        },
        public.call(this, param),
        translations,
        views.call(this, "views", "index.html.twig", param)
      ]
    };
  };

  const Command = {
    name: "Command",
    type: "directory",
    childs: [{
      name: ".gitignore",
      type: "file"
    }]
  };

  const viewString = function (param) {
    return "{% extends '/app/Resources/views/base.html.twig' %}\n\
\n\
{% block title %}Welcome {{kernel.name}}! {% endblock %}\n\
{% block stylesheets %}\n\
  {{ parent() }}\n\
  <!-- WEBPACK BUNDLE -->\n\
  <link rel='stylesheet' href='" + param.CDN_stylesheet + "/" + param.bundleName + "/assets/css/" + param.name + ".css' />\n\
{% endblock %}\n\
{% block body %}\n\
      <img class='displayed' src='" + param.CDN_image + "/frameworkBundle/images/nodefony-logo-white.png'>\n\
      <h1 class='success'>\n\
        <a href='{{url('documentation')}}'>\n\
          <strong style='font-size:45px'>NODEFONY</strong>\n\
        </a>\n\
        <p>{{trans('welcome')}} " + param.name + "</p>\n\
      </h1>\n\
{% endblock %}\n\
\n\
{% block javascripts %}\n\
  {{ parent() }}\n\
  <!-- WEBPACK BUNDLE -->\n\
  <script src='" + param.CDN_javascript + "/" + param.bundleName + "/assets/js/" + param.name + ".js'></script>\n\
{% endblock %}";
  };

  const views = function (directory, name, params) {
    let obj = {
      name: directory,
      type: "directory"
    };
    params.CDN_stylesheet = '{{CDN("stylesheet")}}';
    params.CDN_javascript = '{{CDN("javascript")}}';
    params.CDN_image = '{{CDN("image")}}';

    params.myview = viewString(params);
    let file = [{
      name: name,
      type: "file",
      parse: true,
      skeleton: path.resolve(this.kernel.autoLoader.dirname, "bundles/frameworkBundle/Command/skeletons/bundleView.skeleton"),
      params: params || {}
    }];
    obj.childs = file;
    return obj;
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

  const security = function (obj, type, bundleType) {
    return {
      name: "security." + type,
      type: "file",
      skeleton: path.resolve(this.kernel.autoLoader.dirname, "bundles/frameworkBundle/Command/skeletons/" + bundleType + "/security." + type + ".skeleton"),
      params: obj
    };
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

  const manager = {
    name: "services",
    type: "directory",
    childs: [{
      name: ".gitignore",
      type: "file"
    }]
  };

  const tests = function (param) {
    return {
      name: "tests",
      type: "directory",
      childs: [{
        name: param.bundleName + "Test.js",
        type: "file",
        skeleton: path.resolve(this.kernel.autoLoader.dirname, "bundles/frameworkBundle/Command/skeletons/testFile.skeleton"),
        params: param
      }]
    };
  };

  const core = {
    name: "core",
    type: "directory",
    childs: [{
      name: ".gitignore",
      type: "file"
    }]
  };
  const translations = {
    name: "translations",
    type: "directory",
    childs: [{
      name: ".gitignore",
      type: "file"
    }]
  };
  const entity = {
    name: "Entity",
    type: "directory",
    childs: [{
      name: ".gitignore",
      type: "file"
    }]
  };

  const public = function (param) {
    return {
      name: "public",
      type: "directory",
      childs: [{
        name: "js",
        type: "directory",
        childs: [{
          name: param.name + ".js",
          type: "file",
          skeleton: path.resolve(this.kernel.autoLoader.dirname, "bundles/frameworkBundle/Command/skeletons/webpackEntryPoint.skeleton"),
          params: param
        }]
      }, {
        name: "css",
        type: "directory",
        childs: [{
          name: param.name + ".css",
          type: "file",
          skeleton: path.resolve(this.kernel.autoLoader.dirname, "bundles/frameworkBundle/Command/skeletons/webpackCss.skeleton"),
          params: param
        }]
      }, {
        name: "images",
        type: "directory",
        childs: [{
          name: ".gitignore",
          type: "file"
        }]
      }, {
        name: "assets",
        type: "directory",
        childs: [{
          name: "js",
          type: "directory",
          childs: [{
            name: ".gitignore",
            type: "file"
          }]
        }, {
          name: "css",
          type: "directory",
          childs: [{
            name: ".gitignore",
            type: "file"
          }]
        }, {
          name: "fonts",
          type: "directory",
          childs: [{
            name: ".gitignore",
            type: "file"
          }]
        }, {
          name: "images",
          type: "directory",
          childs: [{
            name: ".gitignore",
            type: "file"
          }]
        }]
      }]
    };
  };

  /*
   *  commands generator
   *
   *
   */
  //TODO
  const commands = function (bundlePath, name) {
    bundlePath.matchName(regBundle);
    if (bundlePath.match) {
      //var bundleName = bundlePath.match[0] ;
    } else {
      throw new Error("Bad bundle name");
    }
    name = name.replace("Command", "");

    let file = {
      name: name + "Command.js",
      type: "file",
      skeleton: path.resolve(this.kernel.autoLoader.dirname, "bundles/frameworkBundle/Command/skeletons/commandClass.skeleton"),
      params: {
        name: name
      }
    };
    this.build(file, new nodefony.fileClass(bundlePath.path + "/Command"));
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
              this.generateBundle(args[0], args[1]);
              this.installBundle(args[0], args[1]);
              this.terminate(0);
              return;
            } else {
              switch (cmd[2]) {
              case "angular":
                let generateAngularCli = require("./angular/angularCli.js");
                try {
                  let ngCli = new generateAngularCli(this);
                  ngCli.generateProject(args[0], args[1], interactive).then((obj) => {
                    try {
                      let file = new nodefony.fileClass(obj.path);
                      angularBundle.call(this, file, obj.name, "yml", obj.path, true);
                      this.installBundle(obj.name, obj.path);
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
                let generater = require("./generate/bundle.js");
                let project = new generater.bundle(this, "js");
                project.build(args[0], args[1]);
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
      //this.terminate(0);
    }

    installBundle(bundleName, Path) {
      try {
        let name = bundleName.match(regBundle)[1];
        let json = this.kernel.readGeneratedConfig();
        let bundleFile = Path + "/" + bundleName + "/" + bundleName + ".js";
        let bundlePath = Path + "/" + bundleName;

        if (json) {
          if (json.system && json.system.bundles) {
            json.system.bundles[name] = bundlePath;
          } else {
            if (json.system) {
              json.system.bundles = {};
            } else {
              json.system = {
                bundles: {}
              };
            }
            json.system.bundles[name] = bundlePath;
          }
        } else {
          json = {
            system: {
              bundles: {}
            }
          };
          json.system.bundles[name] = bundlePath;
        }
        fs.writeFileSync(this.kernel.generateConfigPath, yaml.safeDump(json), {
          encoding: 'utf8'
        });
        let file = new nodefony.fileClass(bundleFile);
        this.kernel.loadBundle(file);
        this.assetInstall(name);
      } catch (e) {
        throw e;
      }
    }

    generateBundle(name, Path) {
      this.logger("GENERATE bundle : " + name + " LOCATION : " + path.resolve(Path));
      try {
        let file = new nodefony.fileClass(path.resolve(Path));
        return nodefonyBundle.call(this, file, name, "yml", path.resolve(Path));
      } catch (e) {
        this.logger(e, "ERROR");
        throw e;
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
      bundleReact: ["generate:bundle:react nameBundle path", "Generate a React Bundle Example : nodefony generate:bundle:react myBundle ./src/bundles"],
      controller: ["generate:controller  nameController bundlePath", "Generate a controller Example : nodefony generate:controller myController ./src/bundles/myBundle"],
      command: ["generate:command nameCommand path", "Generate a command js file in bundle path"]
      //service:["generate:service nameService path" ,"Generate a service js file in bundle path"]
    },
    cli: generate
  };
});
