class Vue extends nodefony.builders.sandbox {
  constructor(cli, cmd, args, options) {
    super(cli, cmd, args, nodefony.extend(true, {}, options, {
      typescript: false,
      addons: {
        webpack: false,
        bootstrap: false,
        vuetify: true,
        i18n: true,
        apollo:false
      }
    }));
    this.pathSkeleton = path.resolve(__dirname, "skeletons");
    this.cliVue = this.getCli();
    this.vueLocation = null;
  }

  run() {
    return super.run(true).
      then(async (res)=>{
        if(this.response.addons.i18n){
          try{
            await this.addI18n();
          }catch(e){
            this.log(e, "WARNING");
          }
        }
        return res;
      });
  }

  async interaction() {
    this.cli.reset();
    await this.cli.showAsciify("Vue");
    let promtOptions = [{
      type: 'checkbox',
      message: 'Select vue addons',
      name: 'addons',
      pageSize: 10,
      choices: [{
        name: "vuetify",
        checked: this.response.addons.vuetify
      }, {
        name: 'i18n',
        checked: this.response.addons.i18n
      }/*, {
        name: 'apollo-client',
        checked: this.response.addons.apollo
      }*/]
    }];
    return this.cli.prompt(promtOptions)
      .then((response) => {
        let addons = {
          vuetify: false,
          i18n: false,
          apollo:false
        };
        for (let i = 0; i < response.addons.length; i++) {
          switch (response.addons[i]) {
          case "vuetify":
            addons.vuetify = true;
            break;
          case "i18n":
            addons.i18n = true;
            break;
          case "apollo-client":
            addons.apollo = true;
            break;
          }
        }
        delete response.addons;
        response.addons = addons;
        return response;
      });
  }

  generate(response, force) {
    return this.builVue()
      .then((location) => {
        return this.checkTypeScript()
          .then(async () => {
            let packages = ["clean-webpack-plugin"];
            let packagesDev = ["@vue/cli","webpack-dev-server@3.11.2"];
            await this.addPackage(packages, false);
            await this.addPackage(packagesDev, true);
            if(this.response.addons.vuetify){
              await this.addVuetify();
            }
            if(this.response.addons.apollo){
              await this.addApolloClient();
            }
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

  async addPackage(name, env = null, location = this.vueLocation) {
    let args = [];
    let packageManager = null;
    let command = null ;
    switch( nodefony.typeOf(name) ){
      case "array":
        args = name;
      break;
      case "string":
        args.push(name);
      break;
      default:
        return location;
    }
    switch (nodefony.packageManager) {
    case 'yarn':
      packageManager = this.cli.yarn.bind(this.cli);
      command = ["add"].concat(args);
      break;
    default:
      packageManager = this.cli.npm.bind(this.cli);
      command = ["install"].concat(args) ;
    }
    if(env){
       command.push("-D") ;
    }
    await packageManager(command, location);
    return location;
  }

  addVuePlugin(args = [], location = this.vueLocation){
    return new Promise(async (resolve, reject) => {
      this.log("install Vue plugin : " + args.join(" "));
      let cmd = null;
      try {
        cmd = await this.cli.spawn("npx", args, {
          cwd: location,
          env: process.env,
          stdio: "inherit"
        }, (code) => {
          if (code === 1) {
            this.log( new Error(`install Vue cli new error : ${code} ${args}`) ,"ERROR")
            //return reject(new Error("install Vue cli new error : " + code));
            return resolve(cmd);
          }
          return resolve(cmd);
        });
        return resolve(cmd);
      } catch (e) {
        this.log(e, "ERROR");
        return reject(e);
      }
    });
  }

  addVuetify(location = this.vueLocation) {
    let args = ["vue", "add", "vuetify"];
    return this.addVuePlugin(args, location);
  }

  addI18n(location = this.vueLocation) {
    let args = ["vue", "add", "i18n"];
    return this.addVuePlugin(args, location);
  }

  // TODO: apollo
  async addApolloClient(location = this.vueLocation) {
    let packages = [
      "apollo-cache-inmemory",
      "apollo-client",
      "apollo-link",
      "apollo-link-context",
      "apollo-link-http"]
    await this.addPackage(packages);
    return Promise.resolve(this.vueLocation)
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

  getLocation(){
    switch (this.cli.response.command) {
      case "bundle":
        return this.cli.response.location;
      default:
        return this.location;
    }
  }

  builVue() {
    let name = null;
    let location = this.getLocation();
    switch (this.cli.response.command) {
    case "project":
      name = "app";
      break;
    case "bundle":
      name = this.cli.response.bundleName;
      break;
    }
    this.vueLocation = path.resolve(location, name);
    return new Promise((resolve, reject) => {
      let args = ["create", "-n", name];
      this.log("install Vue cli : vue " + args.join(" "));
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
        this.log(e, "ERROR");
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
          this.generateConfig(false, true),
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
