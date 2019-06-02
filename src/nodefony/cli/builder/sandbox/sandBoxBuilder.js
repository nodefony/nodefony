class SandBox extends nodefony.Builder {
  constructor(cli, cmd, args) {
    super(cli, cmd, args);
    this.log("Build Sandbox Project");
    this.pathSkeleton = path.resolve(__dirname, "skeletons");
    this.force = true;
    this.response = nodefony.extend(true, {}, this.cli.response, {
      addons: {
        webpack: true,
        bootstrap: true,
        workbox: false,
        annotations: true,
        binding: false
      }
    });
  }

  async interaction() {
    this.cli.reset();
    await this.cli.showAsciify("SandBox");
    return this.cli.prompt([{
      type: 'checkbox',
      message: 'Select addons',
      name: 'addons',
      pageSize: 10,
      choices: [{
        name: "Annotations",
        message: "Add routing annotions in controller",
        checked: true
      }, {
        name: "Webpack",
        checked: true
      }, {
        name: 'Bootstrap',
        checked: true
      }, {
        name: 'Progressive Web App (PWA) Workbox'
      }, {
        name: 'Build Matrice C++ Binding'
      }]
    }]).then((response) => {
      if (response.addons.length) {
        for (let i = 0; i < response.addons.length; i++) {
          switch (response.addons[i]) {
          case "Bootstrap":
            this.response.addons.bootstrap = true;
            break;
          case "Annotations":
            this.response.addons.annotations = true;
            break;
          case "Progressive Web App (PWA) Workbox":
            this.response.addons.workbox = true;
            break;
          case "Build Matrice C++ Binding":
            this.response.addons.binding = true;
            break;
          case "Webpack":
            this.response.addons.webpack = true;
            break;
          }
        }
      }
      if (this.response.addons.bootstrap) {
        this.response.addons.webpack = true;
      }
      return this.response ;
    });
  }

  createBuilder(response) {
    switch (this.cli.response.command) {
    case "project":
      this.suffix = "app";
      this.response.packageName = "app";
      nodefony.extend(true, this.cli.response, response);
      return this.builderProject(response);
    default:
      this.response.packageName = this.response.name;
      this.response.shortName = this.response.name;
      nodefony.extend(true, this.cli.response, response);
      return this.builderBundle(response);
    }
  }

  builderProject(response) {
    console.log(this.response)
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
        this.generateRessources()
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
      return obj;
    } catch (e) {
      throw e;
    }
  }

  builderBundle(response) {
    console.log(this.response)
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
    bundle.push(this.generateConfig(this.response.addons.webpack));
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
    return bundle;
  }

  generateController() {
    let controller = {
      name: "controller",
      type: "directory",
      childs: []
    };

    if (this.suffix === "app") {
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

  generateRessources() {
    let resources = {
      name: "Resources",
      type: "directory",
      childs: []
    };
    if (this.suffix === "app") {
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
      resources.childs.push(this.generateConfig(true));
    }
    // views
    resources.childs.push(this.generateViews());
    //translations
    resources.childs.push({
      name: "translations",
      type: "copy",
      path: path.resolve(this.pathSkeleton, "Resources", "translations"),
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
        name: this.suffix === "app" ? "app.js" : `${this.response.name}.js`,
        type: "file",
        skeleton: path.resolve(this.pathSkeleton, "Resources", "js", "entry.js"),
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
          skeleton: path.resolve(this.pathSkeleton, "workbox", "templates", "index.html.twig"),
          params: this.response
        }]
      });
      resources.childs.push({
        name: "workers",
        type: "directory",
        childs: [{
          name: `service-worker.js`,
          type: "file",
          skeleton: path.resolve(this.pathSkeleton, "workbox", "workers", "service-worker.js"),
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
        skeleton: path.resolve(this.pathSkeleton, "Resources", "views", "base.html.twig"),
        params: this.response
      }, {
        name: "index.html.twig",
        type: "file",
        skeleton: path.resolve(this.pathSkeleton, "Resources", "views", "index.html.twig"),
        params: this.response
      }]
    };
    if (this.suffix === "app") {
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
          path: path.resolve(this.pathSkeleton, "bootstrap", "awesome"),
          params: {
            recurse: true
          }
        }]
      };
      scss.childs.push({
        name: this.suffix === "app" ? "app.scss" : `${this.response.name}.scss`,
        type: "file",
        skeleton: path.resolve(this.pathSkeleton, "bootstrap", "entry.scss"),
        params: this.response
      });
      scss.childs.push({
        name: "custom.scss",
        type: "file",
        skeleton: path.resolve(this.pathSkeleton, "bootstrap", "custom.scss"),
        params: this.response
      });
      return scss;
    } else {
      let css = {
        name: "css",
        type: "directory",
        childs: [{
          name: this.suffix === "app" ? "app.css" : `${this.response.name}.css`,
          type: "file",
          skeleton: path.resolve(this.pathSkeleton, "Resources", "css", "entry.css"),
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
      path: path.resolve(this.pathSkeleton, "Resources", "public", "favicon.ico"),
    });
    if (this.response.addons.workbox) {
      publicWeb.childs.push({
        name: "manifest.json",
        type: "file",
        skeleton: path.resolve(this.pathSkeleton, "Resources", "public", "manifest.json"),
        params: this.response
      });
    }
    publicWeb.childs.push({
      name: "images",
      type: "directory",
      childs: [{
        name: this.suffix === "app" ? "app-logo.png" : `${this.response.shortName}-logo.png`,
        type: "copy",
        path: path.resolve(this.pathSkeleton, "Resources", "public", "images", "app-logo.png"),
      }]
    });
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

module.exports = SandBox;
