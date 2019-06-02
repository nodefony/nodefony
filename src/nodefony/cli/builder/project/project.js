
module.exports = class generateProject extends nodefony.Builder {

  constructor(cli, cmd, args) {
    super(cli, cmd, args);
    this.name = null;
    this.location = null;
    this.pathSkeleton = path.resolve(__dirname, "skeletons");
    if (this.cmd === "create:project" || this.cmd === "create") {
      if (args && args[0]) {
        this.name = args[0];
        this.location = args[1] || path.resolve(".");
      }
    }
    this.response = nodefony.extend(true, {}, this.cli.response, {
      name: this.name || "nodefony-starter",
      bundleName:"app",
      shortName:"app",
      description: "Project Description",
      front: "sandbox",
      path: this.location || path.resolve("."),
      authorFullName: "admin",
      authorName: "admin",
      authorMail: "admin@nodefony.com",
      domain: "0.0.0.0",
      portHttp: "5151",
      portHttps: "5152",
      bundle: false,
      version: nodefony.version,
      year: new Date().getFullYear(),
      orm: "sequelize",
      npm: 'npm'
    });
    if (!this.name) {
      this.name = this.cli.response.name;
    }
    this.setEnv();
  }

  setEnv() {
    process.env.NODE_ENV = "development";
  }

  generate(response) {
    return super.generate(response, true)
      .then(() => {
        return this.buildFront(this.cli.response, this.path)
          .run(true)
          .then((project) => {
            return this.cli.installProject(this.path)
            .then(()=>{
              if ( project.response.bundle){
                this.cli.response.project = true;
                this.cli.response.config = {
                  App: {
                    projectName: project.response.name,
                    authorName: project.response.authorFullName,
                    authorMail: project.response.authorMail,
                    local: project.response.locale,
                    projectYear: project.response.year
                  }
                };
                this.cli.response.configKernel = {
                  system: {
                    domain: project.response.domain
                  }
                };
                let bundle = new nodefony.builders.bundle(this.cli, this.cmd, this.args );
                console.log(this.cli.interactive)
                return bundle.run(true)
                .then(()=>{
                    return project.response;
                });
              }
              return project.response;
            })
            .catch((e) => {
              this.logger(e, "ERROR");
            });


          })
          .catch((e) => {
            throw e;
          });
      });
  }

  async interaction() {
    return this.cli.prompt([{
        type: 'input',
        name: 'name',
        default: this.response.name,
        message: 'Enter Nodefony Project Name',
        validate: (value) => {
          if (value && value !== "nodefony") {
            this.name = value;
            nodefony.projectName = value;
            return true;
          }
          return `${value} Unauthorised Please enter a valid project name`;
        }
      }, {
        type: 'input',
        name: 'description',
        message: 'Enter short description',
        default: "Project Description",
        validate: (value) => {
          if (!value) {
            this.cli.response.description = `${this.response.description} ${this.name}`;
          }
          return true;
        },
        filter: (value) => {
          if (!value) {
            return this.response.description;
          }
          if (value === "Project Description") {
            return this.response.description;
          }
          return value;
        }
      }, {
        type: 'list',
        name: 'front',
        default: 0,
        pageSize: 5,
        choices: [{
          name:"Sandbox (without Front framwork)"
        },{
          name:"Vue.js"
        },{
          name:"React"
        },{
          name:"Demo",
        },{
          name:"Electron",
          disabled:true
        }],
        //choices: ["Sandbox (without Front framwork)", "Vue.js", "React", "Demo"],
        message: 'Choose Project Application Type (Mapping Front Framework in App) :',
        filter: (value) => {
          let front = null;
          switch (value) {
            case "Sandbox (without Front framwork)":
              front = "sandbox";
              break;
            case "Demo":
              front = 'demo';
              break;
            case "Vue.js":
              front = "vue";
              break;
            case "React":
              front = 'react';
              break;
            case "Electron":
              front = 'electron';
              break;
            default:
              front = value;
          }
          return front;
        }
      }, {
        type: 'input',
        name: 'path',
        default: this.response.path,
        message: 'Project Path',
        validate: (value) => {
          let myPath = null;
          try {
            myPath = new nodefony.fileClass(path.resolve(value));
          } catch (e) {
            return e.message;
          }
          let res = nodefony.isNodefonyTrunk(myPath.path);
          if (res) {
            return "You can't install project in nodefony Trunk project !";
          }
          if (value) {
            this.location = value;
            return true;
          }
          return 'Please enter a valid project Path';
        }
      }, {
        type: 'input',
        name: 'authorFullName',
        default: this.response.authorFullName,
        message: 'Please Enter Author Full Name',
        filter: (value) => {
          if (!value) {
            this.response.authorName = this.response.authorFullName;
            return this.response.authorFullName;
          }
          return value;
        }
      }, {
        type: 'input',
        name: 'authorMail',
        default: this.response.authorMail,
        message: 'Please Enter Email Author ',
        filter: (value) => {
          if (!value) {
            return this.response.authorMail;
          }
          return value;
        }
      }, {
        type: 'input',
        name: 'domain',
        default: this.response.domain,
        message: 'Enter Server Domain :',
      }, {
        type: 'input',
        name: 'portHttp',
        default: this.response.portHttp,
        message: 'Enter server Domain http Port  :',
      }, {
        type: 'input',
        name: 'portHttps',
        default: this.response.portHttps,
        message: 'Enter Server Secure Domain https Port  :',
      }, {
        type: 'list',
        name: 'orm',
        default: 0,
        pageSize: 2,
        choices: ["sequelize", "mongoose"],
        message: 'Choose default ORM  (Mapping Objet Relationnel) :'
      }, {
        type: 'list',
        name: 'packageManager',
        message: 'Choose a default Package Manager : ',
        default: 0,
        pageSize: 2,
        choices: ["npm", "yarn"],
        filter: (value) => {
          if (this.cli[value]) {
            this.cli.packageManager = this.cli[value];
          } else {
            throw new Error(`Package Manager ${value} not available ! `);
          }
          return value;
        }
      }, {
        type: 'confirm',
        name: 'bundle',
        message: 'Do You Want Generate Bundle?',
        default: this.response.bundle
      }])
      .then((response) => {
        nodefony.extend(this.response, response);
        this.path = path.resolve(this.location, response.name);
        if (this.cli.exists(this.path)) {
          this.logger(`${this.path} Already exist`, "WARNING");
          return this.removeInteractivePath(this.path)
            .then((response) => {
              nodefony.extend(this.response, response);
              if (response.remove) {
                return this.response;
              }
              let error = new Error(`${this.path} Already exist`);
              error.code = 0;
              throw error;
            }).catch((e) => {
              throw e;
            });
        }
        return this.response;
      }).catch(e => {
        throw e;
      });
  }

  createBuilder(response) {
    nodefony.extend(this.cli.response, response);
    try {
      return {
        name: this.response.name,
        type: "directory",
        childs: [{
          name: "package.json",
          type: "file",
          skeleton: path.resolve(this.pathSkeleton, "package.json.skeleton"),
          params: this.response
        }, {
          name: ".gitignore",
          type: "file",
          skeleton: path.resolve(this.pathSkeleton, "gitignore.skeleton"),
          params: this.response
        }, {
          name: ".jshintrc",
          type: "file",
          skeleton: path.resolve(this.pathSkeleton, "jshintrc.skeleton"),
          params: this.response
        }, {
          name: ".jshintignore",
          type: "file",
          skeleton: path.resolve(this.pathSkeleton, "jshintignore.skeleton"),
          params: this.response
        }, {
          name: ".editorconfig",
          type: "file",
          skeleton: path.resolve(this.pathSkeleton, "editorconfig.skeleton"),
          params: this.response
        }, {
          name: "web",
          type: "directory"
        }, {
          name: "tmp",
          type: "directory"
        }, {
          name: "config",
          type: "directory",
          childs: [{
            name: "certificates",
            type: "directory"
          }, {
            name: "openssl",
            type: "directory",
            childs: [{
              name: "ca",
              type: "directory",
              childs: [{
                name: "openssl.cnf",
                type: "file",
                skeleton: path.resolve(this.pathSkeleton, "config", "openssl", "ca", "openssl.cnf.skeleton"),
                params: this.response
              }]
            }, {
              name: "ca_intermediate",
              type: "directory",
              childs: [{
                name: "openssl.cnf",
                type: "file",
                skeleton: path.resolve(this.pathSkeleton, "config", "openssl", "ca_intermediate", "openssl.cnf.skeleton"),
                params: this.response
              }]
            }]
          }, {
            name: "config.js",
            type: "file",
            skeleton: path.resolve(this.pathSkeleton, "config", "config.js.skeleton"),
            params: this.response
          }, {
            name: "pm2.config.js",
            type: "file",
            skeleton: path.resolve(this.pathSkeleton, "config", "pm2.config.js.skeleton"),
            params: this.response
          }]
        }, {
          name: "bin",
          type: "directory",
          childs: [{
            name: "generateCertificates.sh",
            type: "file",
            chmod: 755,
            skeleton: path.resolve(this.pathSkeleton, "bin", "generateCertificates.sh.skeleton"),
            params: this.response
          }]
        }, {
          name: "src",
          type: "directory",
          childs: [{
            name: "bundles",
            type: "directory"
          }]
        }, {
          name: "doc",
          type: "directory",
          childs: [{
            name: "index.html.twig",
            type: "copy",
            path: path.resolve(this.pathSkeleton, "documentation.html.twig")
          }]
        }, {
          name: "README.md",
          type: "copy",
          path: path.resolve(this.pathSkeleton, "README.md")
        }]
      };
    } catch (e) {
      throw e;
    }
  }
};
