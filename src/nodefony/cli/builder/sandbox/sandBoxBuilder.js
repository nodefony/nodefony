class SandBox extends nodefony.Builder {
  constructor(cli, cmd, args, options = {}) {
    super(cli, cmd, args);
    this.sandboxSkeleton = path.resolve(__dirname, "skeletons");
    this.force = true;
    nodefony.extend(true, this.response, {
      addons: {
        webpack: true,
        bootstrap: false,
        command: false,
        unittest: false,
        workbox: false,
        annotations: true,
        binding: false
      }
    }, options);
    this.setEnv("development");
  }

  async interaction() {
    this.cli.reset();
    await this.cli.showAsciify("SandBox");
    let promtOptions = [{
      type: 'checkbox',
      message: 'Select addons',
      name: 'addons',
      pageSize: 10,
      choices: [{
        name: "Annotations",
        message: "Add routing annotions in controller",
        checked: this.response.addons.annotations
      }, {
        name: "Webpack",
        checked: this.response.addons.webpack
      }, {
        name: 'Bootstrap',
        checked: this.response.addons.bootstrap
      }, {
        name: "Command",
        message: "Add Cli Command Matrice",
        checked: this.response.addons.command
      }, {
        name: "Unit Tests",
        message: "Add Unit Tests Matrice",
        checked: this.response.addons.unittest
      }, {
        name: 'Progressive Web App (PWA) Workbox',
        checked: this.response.addons.workbox
      }, {
        name: 'Build Matrice C++ Binding',
        checked: this.response.addons.binding
      }]
    }];
    return this.cli.prompt(promtOptions)
      .then((response) => {
        let addons = {
          webpack: false,
          bootstrap: false,
          command: false,
          unittest: false,
          workbox: false,
          annotations: false,
          binding: false
        };
        if (response.addons.length) {
          for (let i = 0; i < response.addons.length; i++) {
            switch (response.addons[i]) {
              case "Bootstrap":
                addons.bootstrap = true;
                break;
              case "Annotations":
                addons.annotations = true;
                break;
              case "Command":
                addons.command = true;
                break;
              case "Unit Tests":
                addons.unittest = true;
                break;
              case "Progressive Web App (PWA) Workbox":
                addons.workbox = true;
                break;
              case "Build Matrice C++ Binding":
                addons.binding = true;
                break;
              case "Webpack":
                addons.webpack = true;
                break;
            }
          }
        }
        if (addons.bootstrap) {
          addons.webpack = true;
        }
        delete response.addons;
        response.addons = addons;
        return response;
      });
  }

  createBuilder(response) {
    switch (this.cli.response.command) {
      case "project":
        this.response.packageName = "app";
        this.response.shortName = "app";
        return this.builderProject(response);
      default:
        if (!this.response.bundle) {
          this.cli.response.command = "project";
          return this.createBuilder(response);
        }
        this.response.packageName = this.response.name;
        this.response.shortName = this.response.name;
        return this.builderBundle(response);
    }
  }

  builderProject() {
    try {
      let obj = {
        name: "app",
        type: "directory",
        childs: [{
            name: "package.json",
            type: "file",
            skeleton: path.resolve(this.globalSkeleton, "package.json"),
            params: this.response
          }, {
            name: "appKernel.js",
            type: "file",
            skeleton: path.resolve(this.globalSkeleton, "app", "appKernel.js"),
            params: this.response
          }, {
            name: "Entity",
            type: "directory",
            childs: [{
              name: ".gitignore",
              type: "file"
            }]
          },
          this.generateController(),
          this.generateConfig(this.response.addons.webpack),
          this.generateRessources(),
          this.generateCommand(),
          this.generateUnitTest()
        ]
      };
      if (this.response.addons.binding) {
        obj.childs.push({
          name: "build",
          type: "directory",
        });
        obj.childs.push({
          name: "binding.gyp",
          type: "file",
          skeleton: path.resolve(this.globalSkeleton, "binding", "binding.skeleton"),
          params: this.response
        });
      }
      obj.childs.push(this.generateBinding());
      obj.childs.push(this.generateDoc());
      return obj;
    } catch (e) {
      throw e;
    }
  }

  builderBundle() {
    let bundle = [];
    bundle.push({
      name: "package.json",
      type: "file",
      skeleton: path.resolve(this.globalSkeleton, "package.json"),
      params: this.response
    });
    bundle.push({
      name: `${this.response.name}Bundle.js`,
      type: "file",
      skeleton: path.resolve(this.globalSkeleton, "bundle", "bundleClass.js"),
      params: this.response
    });
    bundle.push(this.generateController());
    bundle.push(this.generateDoc());
    bundle.push(this.generateRessources());
    if (this.response.addons.binding) {
      bundle.push({
        name: "build",
        type: "directory",
      });
      bundle.push({
        name: "binding.gyp",
        type: "file",
        skeleton: path.resolve(this.globalSkeleton, "binding", "binding.skeleton"),
        params: this.response
      });
    }
    bundle.push(this.generateBinding());
    bundle.push({
      name: "Entity",
      type: "directory",
      childs: [{
        name: ".gitignore",
        type: "file"
      }]
    });
    bundle.push(this.generateCommand());
    bundle.push(this.generateUnitTest());
    return bundle;
  }

  generateDoc() {
    let doc = {
      name: "doc",
      type: "directory",
      childs: []
    };
    return doc;
  }

  generateConfig(webpack = false) {
    let config = {
      name: "config",
      type: "directory",
      childs: [{
        name: "config.js",
        type: "file",
        skeleton: path.resolve(this.globalSkeleton, "config", "config.js"),
        params: this.response
      }, {
        name: "routing.js",
        type: "file",
        skeleton: path.resolve(this.globalSkeleton, "config", "routing.js"),
        params: this.response
      }, {
        name: "security.js",
        type: "file",
        skeleton: path.resolve(this.globalSkeleton, "config", "security.js"),
        params: this.response
      }, {
        name: "services.js",
        type: "copy",
        path: path.resolve(this.globalSkeleton, "config", "services.js")
      }]
    };
    if (webpack) {
      config.childs.push({
        name: "webpack.config.js",
        type: "file",
        skeleton: path.resolve(this.globalSkeleton, "config", "webpack.config.js"),
        params: this.response
      });
      config.childs.push({
        name: "webpack",
        type: "copy",
        path: path.resolve(this.globalSkeleton, "config", "webpack"),
        params: {
          recurse: true
        }
      });
    }
    return config;
  }

  generateController(directory = "controller") {
    let controller = {
      name: directory,
      type: "directory",
      childs: []
    };

    if (this.cli.response.command === "project") {
      this.response.controllerName = "appController";
      controller.childs.push({
        name: `appController.js`,
        type: "file",
        skeleton: path.resolve(this.globalSkeleton, "controller", "controllerClass.js"),
        params: this.response
      });
    } else {
      if (!this.response.controllerName) {
        this.response.controllerName = "defaultController";
      }
      controller.childs.push({
        name: `${this.response.controllerName}.js`,
        type: "file",
        skeleton: path.resolve(this.globalSkeleton, "controller", "controllerClass.js"),
        params: this.response
      });
    }
    return controller;
  }

  generateCommand() {
    let command = {
      name: "Command",
      type: "directory",
      childs: []
    };
    if (this.response.addons.command) {
      let name = null;
      if (this.cli.response.command === "project") {
        name = "app";
      } else {
        name = this.response.name;
      }
      this.response.commandName = name;
      command.childs.push({
        name: name + "Command.js",
        type: "file",
        skeleton: path.resolve(this.globalSkeleton, "command", "commandClass.js"),
        params: this.response
      });
      command.childs.push({
        name: name + "Task.js",
        type: "file",
        skeleton: path.resolve(this.globalSkeleton, "command", "taskClass.js"),
        params: this.response
      });
    }
    return command;
  }

  generateUnitTest() {
    let unit = {
      name: "tests",
      type: "directory",
      childs: []
    };
    let name = null;
    if (this.cli.response.command === "project") {
      name = "app";
      this.response.routeName = "";
    } else {
      name = this.response.name;
      this.response.routeName = name;
    }
    this.response.testName = name;
    if (this.response.addons.unittest) {
      unit.childs.push({
        name: name + "Test.js",
        type: "file",
        skeleton: path.resolve(this.globalSkeleton, "unittest", "testFile.js"),
        params: this.response
      });
    }
    return unit;
  }

  generateRessources() {
    let resources = {
      name: "Resources",
      type: "directory",
      childs: []
    };
    if (this.cli.response.command === "project") {
      // databases
      resources.childs.push({
        name: "databases",
        type: "copy",
        path: path.resolve(this.globalSkeleton, "Resources", "databases"),
        params: {
          recurse: true
        }
      });
    } else {
      // config
      resources.childs.push(this.generateConfig(this.response.addons.webpack));
    }
    // views
    resources.childs.push(this.generateViews());
    //translations
    resources.childs.push({
      name: "translations",
      type: "copy",
      path: path.resolve(this.sandboxSkeleton, "Resources", "translations"),
      params: {
        recurse: true
      }
    });
    //public
    resources.childs.push(this.generatePublic());
    //js
    resources.childs.push({
      name: "js",
      type: "directory",
      childs: [{
        name: this.cli.response.command === "project" ? "app.js" : `${this.response.name}.js`,
        type: "file",
        skeleton: path.resolve(this.sandboxSkeleton, "Resources", "js", "entry.js"),
        params: this.response
      }]
    });
    //css
    resources.childs.push(this.generateCss());

    if (this.response.addons.workbox) {
      resources.childs.push({
        name: "templates",
        type: "directory",
        childs: [{
          name: `index.html.twig`,
          type: "file",
          skeleton: path.resolve(this.sandboxSkeleton, "workbox", "templates", "index.html.twig"),
          params: this.response
        }]
      });
      resources.childs.push({
        name: "workers",
        type: "directory",
        childs: [{
          name: `service-worker.js`,
          type: "file",
          skeleton: path.resolve(this.sandboxSkeleton, "workbox", "workers", "service-worker.js"),
          params: this.response
        }]
      });
    }
    return resources;
  }

  generateViews() {
    let views = {
      name: "views",
      type: "directory",
      childs: [{
        name: "base.html.twig",
        type: "file",
        skeleton: path.resolve(this.sandboxSkeleton, "Resources", "views", "base.html.twig"),
        params: this.response
      }, {
        name: "index.html.twig",
        type: "file",
        skeleton: path.resolve(this.sandboxSkeleton, "Resources", "views", "index.html.twig"),
        params: this.response
      }]
    };
    if (this.cli.response.command === "project") {
      views.childs.push({
        name: "framework-bundle",
        type: "copy",
        path: path.resolve(this.globalSkeleton, "Resources", "views", "framework-bundle"),
        params: {
          recurse: true
        }
      });
    }
    return views;
  }

  generateCss() {
    if (this.response.addons.bootstrap) {
      let scss = {
        name: "scss",
        type: "directory",
        childs: [{
          name: "awesome",
          type: "copy",
          path: path.resolve(this.sandboxSkeleton, "bootstrap", "awesome"),
          params: {
            recurse: true
          }
        }]
      };
      scss.childs.push({
        name: this.cli.response.command === "project" ? "app.scss" : `${this.response.name}.scss`,
        type: "file",
        skeleton: path.resolve(this.sandboxSkeleton, "bootstrap", "entry.scss"),
        params: this.response
      });
      scss.childs.push({
        name: "custom.scss",
        type: "file",
        skeleton: path.resolve(this.sandboxSkeleton, "bootstrap", "custom.scss"),
        params: this.response
      });
      return scss;
    } else {
      let css = {
        name: "css",
        type: "directory",
        childs: [{
          name: this.cli.response.command === "project" ? "app.css" : `${this.response.name}.css`,
          type: "file",
          skeleton: path.resolve(this.sandboxSkeleton, "Resources", "css", "entry.css"),
          params: this.response
        }]
      };
      return css;
    }
  }

  generatePublic() {
    let publicWeb = {
      name: "public",
      type: "directory",
      childs: []
    };
    publicWeb.childs.push({
      name: "favicon.ico",
      type: "copy",
      path: path.resolve(this.sandboxSkeleton, "Resources", "public", "favicon.ico"),
    });
    if (this.response.addons.workbox) {
      publicWeb.childs.push({
        name: "manifest.json",
        type: "file",
        skeleton: path.resolve(this.sandboxSkeleton, "Resources", "public", "manifest.json"),
        params: this.response
      });
    }
    publicWeb.childs.push({
      name: "images",
      type: "directory",
      childs: [{
        name: this.cli.response.command === "project" ? "app-logo.png" : `${this.response.shortName}-logo.png`,
        type: "copy",
        path: path.resolve(this.sandboxSkeleton, "Resources", "public", "images", "app-logo.png"),
      }]
    });
    if (!this.response.addons.webpack) {
      publicWeb.childs.push({
        name: "js",
        type: "directory",
        childs: [{
          name: `${this.response.shortName}.js`,
          type: "file",
          skeleton: path.resolve(this.sandboxSkeleton, "Resources", "js", "entry.js"),
          params: this.response
        }]
      });
      publicWeb.childs.push({
        name: "css",
        type: "directory",
        childs: [{
          name: `${this.response.shortName}.css`,
          type: "file",
          skeleton: path.resolve(this.sandboxSkeleton, "Resources", "css", "entry.css"),
          params: this.response
        }]
      });
      publicWeb.childs.push({
        name: "fonts",
        type: "directory"
      });
    }
    return publicWeb;
  }

  generateBinding() {
    let src = {
      name: "src",
      type: "directory",
      childs: []
    };
    if (this.response.addons.binding) {
      src.childs.push({
        name: "addon",
        type: "directory",
        childs: [{
          name: this.response.shortName + ".cc",
          type: "file",
          skeleton: path.resolve(this.globalSkeleton, "binding", "binding.cc"),
          params: this.response
        }]
      });
    }
    return src;
  }
}
nodefony.builders.sandbox = SandBox;
module.exports = SandBox;
