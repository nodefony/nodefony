class generateProject extends nodefony.Builder {

  constructor(cli, cmd, args) {
    super(cli, cmd, args);
    this.name = null;
    this.pathSkeleton = path.resolve(__dirname, "skeletons");
    this.bundleUsersPath = path.resolve(nodefony.path, "cli", "builder", "bundles", "users-bundle");
    //this.bundlePath = path.resolve(nodefony.path, "cli", "builder", "bundles", "users-bundle");
    if (this.cmd === "create:project" || this.cmd === "create") {
      if (args && args[0]) {
        this.name = args[0];
        if (args[1]) {
          this.location = path.resolve(args[1]);
        }
      }
    }
    nodefony.extend(this.response, {
      name: this.name || "nodefony-starter",
      bundleName: "app",
      shortName: "app",
      command: "project",
      description: "Project Description",
      front: "sandbox",
      path: this.location,
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
      npm: 'npm',
      addons: {
        annotations: true,
        users: true
      }
    });
    if (!this.name) {
      this.name = this.cli.response.name;
    }
    this.path = path.resolve(this.location, this.response.name);
    this.setEnv();
  }

  generate(response) {
    return super.generate(response, true)
      .then(() => {
        if (!this.buildFront) {
          return this.response;
        }
        return this.buildFront(this.response, this.path)
          .run(this.cli.interactive)
          .then(async (project) => {
            if (this.response.addons.users) {
              try {
                await this.generateUserBundle(project);
              } catch (e) {
                this.log(e, "ERROR");
              }
            }
            return this.response;
          })
          .catch((e) => {
            throw e;
          });
      })
      .catch((e) => {
        throw e;
      });
  }

  generateUserBundle() {
    return new Promise((resolve, reject) => {
      this.log('Copy users-bundle in src/bundles', "INFO", "USERS-BUNDLE");
      try {
        let mypath = path.resolve(this.path, "src", "bundles");
        this.cli.cp('-Rf', this.bundleUsersPath, mypath);
        return this.cli.packageManager.call(this.cli, ["install"], path.resolve(mypath, "users-bundle"))
          .then((res) => {
            return resolve(res);
          });
      } catch (e) {
        return reject(e);
      }
    });
  }

  async interaction() {
    let promtOptions = [{
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
          name: "Sandbox (without Front framwork)"
        }, {
          name: "Vue.js"
        }, {
          name: "React"
        }, {
          name: "Electron",
          disabled: true
        }],
        message: 'Choose Project Application Type (Mapping Front Framework in App) :',
        filter: (value) => {
          let front = null;
          switch (value) {
            case "Sandbox (without Front framwork)":
              front = "sandbox";
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
        default: this.location,
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
        choices: ["npm", "yarn", "pnpm"],
        filter: (value) => {
          if (this.cli[value]) {
            this.cli.packageManager = this.cli[value];
          } else {
            throw new Error(`Package Manager ${value} not available ! `);
          }
          return value;
        }
      }, {
        type: 'checkbox',
        message: 'Select addons project',
        name: 'addons',
        pageSize: 10,
        choices: [{
          name: 'Users Management',
          message: "Bootstrap only",
          checked: this.response.addons.users,
          disabled: (this.cli.response.command === "bundle")
        }],
        filter: (value) => {
          return value;
        }
      }
      /*, {
              type: 'confirm',
              name: 'bundle',
              message: 'Do You Want Generate Bundle?',
              default: this.response.bundle
            }*/
    ];
    return this.cli.prompt(promtOptions)
      .then((response) => {
        let addons = {
          users: false
        };
        if (response.addons.length) {
          for (let i = 0; i < response.addons.length; i++) {
            switch (response.addons[i]) {
              case "Users Management":
                addons.users = true;
                break;
            }
          }
        }
        response.addons = addons;
        this.path = path.resolve(this.location, response.name);
        if (this.cli.exists(this.path)) {
          this.log(`${this.path} Already exist`, "WARNING");
          return this.removeInteractivePath(this.path)
            .then((myresponse) => {
              if (myresponse.remove) {
                return response;
              }
              let error = new Error(`${this.path} Already exist`);
              error.code = 0;
              throw error;
            }).catch((e) => {
              throw e;
            });
        }
        return response;
      }).catch(e => {
        throw e;
      });
  }

  getPadDate() {
    //return new Date().toISOString().split('.')[0].replace(/[^\d]/gi, '')
    return new Date().toISOString().replace(/\.\d{3}Z$/, '').replace(/\W/g, '.');
  }

  createBuilder(response) {
    try {
      return {
        name: this.response.name,
        type: "directory",
        childs: [{
          name: "package.json",
          type: "file",
          skeleton: path.resolve(this.pathSkeleton, "package.json.twig"),
          params: this.response
        }, {
          name: ".gitignore",
          type: "file",
          skeleton: path.resolve(this.pathSkeleton, "gitignore.skeleton"),
          params: this.response
        }, {
          name: ".eslintrc.js",
          type: "file",
          skeleton: path.resolve(this.pathSkeleton, "eslintrc.js.skeleton"),
          params: this.response
        }, {
          name: ".eslintignore",
          type: "file",
          skeleton: path.resolve(this.pathSkeleton, "eslintignore.skeleton"),
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
          name: "migrations",
          type: "directory",
          childs: [{
            name: "sequelize",
            type: "directory",
            childs: [{
              name: `${this.getPadDate()}-migrate-entity.js.example`,
              type: "file",
              skeleton: path.resolve(this.pathSkeleton, "migrations", "migrations.skeleton.js"),
              params: this.response
            }, {
              name: "nodefony",
              type: "directory",
              childs: [{
                name: "2022.12.25T17.37.37.entity-user.js",
                skeleton: path.resolve(this.pathSkeleton, "migrations", "2022.12.25T17.37.37.entity-user.js"),
                type: "file",
                params: this.response
              }, {
                name: "2022.12.25T17.37.38.entity-session.js",
                skeleton: path.resolve(this.pathSkeleton, "migrations", "2022.12.25T17.37.38.entity-session.js"),
                type: "file",
                params: this.response
              }, {
                name: "2022.12.25T17.37.39.entity-requests.js",
                skeleton: path.resolve(this.pathSkeleton, "migrations", "2022.12.25T17.37.39.entity-requests.js"),
                type: "file",
                params: this.response
              }, {
                name: "2022.12.25T17.37.40.entity-jwts.js",
                skeleton: path.resolve(this.pathSkeleton, "migrations", "2022.12.25T17.37.40.entity-jwts.js"),
                type: "file",
                params: this.response
              }]
            }]
          }, {
            name: "mongoose",
            type: "directory",
          }, {
            name: "seedeers",
            type: "directory",
          }]
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
          }, {
            name: "dev-deploy.sh",
            type: "file",
            chmod: 755,
            skeleton: path.resolve(this.pathSkeleton, "bin", "dev-deploy.sh"),
            params: this.response
          }, {
            name: "prod-deploy.sh",
            type: "file",
            chmod: 755,
            skeleton: path.resolve(this.pathSkeleton, "bin", "prod-deploy.sh"),
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
}

nodefony.builders.project = generateProject;
module.exports = generateProject;
