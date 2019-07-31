class Vue extends nodefony.builders.sandbox {
  constructor(cli, cmd, args, options) {
    super(cli, cmd, args, nodefony.extend(true, {}, options, {
      typescript: false,
      addons: {
        webpack: false,
        bootstrap: false
      }
    }));
    this.pathSkeleton = path.resolve(__dirname, "skeletons");
    this.cliVue = this.getCli();
  }

  run() {
    return super.run(false);
  }

  generate(response, force) {
    return this.builVue()
      .then(() => {
        return this.checkTypeScript()
          .then(() => {
            return super.generate(response, force)
              .then(() => {
                return this.response;
              })
              .catch((e) => {
                throw e;
              });
          })
          .catch((e) => {
            throw e;
          });
      })
      .catch((e) => {
        throw e;
      });
  }

  checkTypeScript() {
    return new Promise((resolve) => {
      try {
        if (this.response.command === "project") {

          new nodefony.fileClass(path.resolve(this.location, "app", "src", "main.ts"));
          this.response.typescript = true;
          //let skelete = path.resolve(this.pathSkeleton, "vue.config.js.ts");
          //this.cli.cp("-f", skelete, path.resolve(this.location, "app", "vue.config.js"));
        } else {
          new nodefony.fileClass(path.resolve(this.location, "src", "main.ts"));
          this.response.typescript = true;
          //let skelete = path.resolve(this.pathSkeleton, "vue.config.js.ts");
          //this.cli.cp("-f", skelete, path.resolve(this.location, "vue.config.js"));
        }

        return resolve(true);
      } catch (e) {
        this.response.typescript = false;
        return resolve(true);
      }
    });
  }

  getCli() {
    let cliPath = null;
    try {
      cliPath = path.resolve(__dirname, "..", "..", "..", "node_modules", ".bin", "vue");
      new nodefony.fileClass(cliPath);
      return cliPath;
    } catch (e) {}
    try {
      cliPath = path.resolve(process.cwd(), "node_modules", ".bin", "vue");
      new nodefony.fileClass(cliPath);
      return cliPath;
    } catch (e) {}
    try {
      cliPath = path.resolve(nodefony.autoloader, "node_modules", ".bin", "vue");
    } catch (e) {}
    try {
      new nodefony.fileClass(cliPath);
    } catch (e) {
      throw new Error("Vue.js CLI not found ");
    }
    return cliPath;
  }



  builVue() {
    let name = null;
    let location = null;
    switch (this.cli.response.command) {
      case "project":
        name = "app";
        location = this.location;
        break;
      case "bundle":
        name = this.cli.response.bundleName;
        location = this.cli.response.location;
        break;
    }
    return new Promise((resolve, reject) => {
      let args = ["create", "-n", name];
      this.logger("install Vue cli : vue " + args.join(" "));
      let cmd = null;
      try {
        cmd = this.cli.spawn(this.cliVue, args, {
          cwd: location,
          env: process.env,
          stdio: "inherit"
        }, (code) => {
          if (code === 1) {
            return reject(new Error("install Vue cli new error : " + code));
          }
          return resolve(path.resolve(this.location, this.response.name));
        });
      } catch (e) {
        this.logger(e, "ERROR");
        return reject(e);
      }
    });
  }

  builderProject() {
    try {
      return {
        name: "app",
        type: "directory",
        childs: [{
            name: "appKernel.js",
            type: "file",
            skeleton: path.resolve(this.globalSkeleton, "app", "appKernel.js"),
            params: this.response
          }, {
            name: "vue.config.js",
            type: "file",
            skeleton: path.resolve(this.pathSkeleton, "vue.config.js"),
            params: this.response
          },
          this.generateController(),
          this.generateConfig(),
          this.generateRessources()
        ]
      };
    } catch (e) {
      throw e;
    }
  }

  builderBundle() {
    let bundle = [];
    bundle.push({
      name: `${this.response.name}Bundle.js`,
      type: "file",
      skeleton: path.resolve(this.globalSkeleton, "bundle", "bundleClass.js"),
      params: this.response
    });
    bundle.push({
      name: "vue.config.js",
      type: "file",
      skeleton: path.resolve(this.pathSkeleton, "vue.config.js"),
      params: this.response
    });
    bundle.push(this.generateController());
    //bundle.push(this.generateConfig(this.response.addons.webpack));
    bundle.push(this.generateRessources());
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
      resources.childs.push(this.generateConfig());
    }
    // views
    resources.childs.push(this.generateViews());
    // public
    resources.childs.push(this.generatePublic());
    //translations
    resources.childs.push({
      name: "translations",
      type: "copy",
      path: path.resolve(this.pathSkeleton, "Resources", "translations"),
      params: {
        recurse: true
      }
    });
    return resources;
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
      path: path.resolve(this.globalSkeleton, "Resources", "public", "favicon.ico"),
    });
    publicWeb.childs.push({
      name: "images",
      type: "directory",
      childs: [{
        name: this.cli.response.command === "project" ? "app-logo.png" : `${this.response.shortName}-logo.png`,
        type: "copy",
        path: path.resolve(this.globalSkeleton, "Resources", "public", "images", "app-logo.png"),
      }]
    });
    return publicWeb;
  }

  generateViews() {
    let views = {
      name: "views",
      type: "directory",
      childs: []
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

}
nodefony.builders.vue = Vue;
module.exports = Vue;
