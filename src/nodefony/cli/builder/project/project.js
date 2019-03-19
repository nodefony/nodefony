module.exports = class generateProject extends nodefony.Builder {

  constructor(cli, cmd, args) {
    super(cli, cmd, args);
    this.name = null;
    this.location = null;
    if (this.cmd === "create:project" || this.cmd === "create") {
      if (args && args[0]) {
        this.name = args[0];
        this.location = args[1] || path.resolve(".");
      }
    }
    nodefony.extend(this.cli.response, {
      name: this.name || "nodefony-starter",
      description: "description nodefony-starter",
      path: this.location || path.resolve("."),
      authorFullName: "admin",
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

    this.pathSkeleton = path.resolve(__dirname, "skeletons");
  }

  interaction() {
    return this.cli.prompt([{
        type: 'input',
        name: 'name',
        default: this.cli.response.name,
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
        default: this.cli.response.description,
        filter: (value) => {
          if (value === "description project") {
            return `Project ${this.name}`;
          }
          return value;
        }
      }, {
        type: 'input',
        name: 'path',
        default: this.cli.response.path,
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
        default: this.cli.response.authorFullName,
        message: 'Please Enter Author Full Name',
      }, {
        type: 'input',
        name: 'authorMail',
        default: this.cli.response.authorMail,
        message: 'Please Enter Email Author ',
      }, {
        type: 'input',
        name: 'domain',
        default: this.cli.response.domain,
        message: 'Enter Server Domain :',
      }, {
        type: 'input',
        name: 'portHttp',
        default: this.cli.response.portHttp,
        message: 'Enter server Domain http Port  :',
      }, {
        type: 'input',
        name: 'portHttps',
        default: this.cli.response.portHttps,
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
        default: this.cli.response.bundle
      }])
      .then((response) => {
        nodefony.extend(this.cli.response, response);
        this.path = path.resolve(this.location, response.name);
        if (this.cli.exists(this.path)) {
          this.logger(`${this.path} Already exist`, "WARNING");
          return this.removeInteractivePath(this.path).then((response) => {
            nodefony.extend(this.cli.response, response);
            if (response.remove) {
              return this.cli.response;
            }
            let error = new Error(`${this.path} Already exist`);
            error.code = 0;
            throw error;
          }).catch((e) => {
            throw e;
          });
        }
        return this.cli.response;
      });
  }

  createBuilder() {
    try {
      return {
        name: this.cli.response.name,
        type: "directory",
        childs: [{
          name: "app",
          type: "directory",
          childs: [{
            name: "appKernel.js",
            type: "file",
            skeleton: path.resolve(this.pathSkeleton, "app", "appKernel.js.skeleton"),
            params: this.cli.response
          }, {
            name: "package.json",
            type: "file",
            skeleton: path.resolve(this.pathSkeleton, "app", "package.json.skeleton"),
            params: this.cli.response
          }, {
            name: "doc",
            type: "directory",
            childs: [{
              name: "index.html.twig",
              type: "copy",
              path: path.resolve(this.pathSkeleton, "app", "doc", "app.html.twig")
            }]
          }, {
            name: "README.md",
            type: "copy",
            path: path.resolve(this.pathSkeleton, "app", "README.md")
          }, {
            name: "services",
            type: "directory"
          }, {
            name: "Resources",
            type: "directory",
            childs: [{
              name: "views",
              type: "copy",
              path: path.resolve(this.pathSkeleton, "app", "Resources", "views"),
              params: {
                recurse: true
              }
            }, {
              name: "translations",
              type: "copy",
              path: path.resolve(this.pathSkeleton, "app", "Resources", "translations"),
              params: {
                recurse: true
              }
            }, {
              name: "scss",
              type: "copy",
              path: path.resolve(this.pathSkeleton, "app", "Resources", "scss"),
              params: {
                recurse: true
              }
            }, {
              name: "js",
              type: "copy",
              path: path.resolve(this.pathSkeleton, "app", "Resources", "js"),
              params: {
                recurse: true
              }
            }, {
              name: "databases",
              type: "copy",
              path: path.resolve(this.pathSkeleton, "app", "Resources", "databases"),
              params: {
                recurse: true
              }
            }, {
              name: "public",
              type: "directory",
              childs: [{
                name: "manifest.json",
                type: "file",
                skeleton: path.resolve(this.pathSkeleton, "app", "Resources", "public", "manifest.json"),
                params: this.cli.response
              }, {
                name: "favicon.ico",
                type: "copy",
                path: path.resolve(this.pathSkeleton, "app", "Resources", "public", "favicon.ico")
              }, {
                name: "robots.txt",
                type: "copy",
                path: path.resolve(this.pathSkeleton, "app", "Resources", "public", "robots.txt")
              }, {
                name: "css",
                type: "copy",
                path: path.resolve(this.pathSkeleton, "app", "Resources", "public", "css"),
                params: {
                  recurse: true
                }
              }, {
                name: "images",
                type: "copy",
                path: path.resolve(this.pathSkeleton, "app", "Resources", "public", "images"),
                params: {
                  recurse: true
                }
              }, {
                name: "js",
                type: "copy",
                path: path.resolve(this.pathSkeleton, "app", "Resources", "public", "js"),
                params: {
                  recurse: true
                }
              }]
            }]
          }, {
            name: "config",
            type: "directory",
            childs: [{
              name: "webpack",
              type: "copy",
              path: path.resolve(this.pathSkeleton, "app", "config", "webpack"),
              params: {
                recurse: true
              }
            }, {
              name: "webpack.config.js",
              type: "copy",
              path: path.resolve(this.pathSkeleton, "app", "config", "webpack.config.js"),
            }, {
              name: "config.js",
              type: "file",
              skeleton: path.resolve(this.pathSkeleton, "app", "config", "config.js.skeleton"),
              params: this.cli.response
            }, {
              name: "routing.js",
              type: "copy",
              path: path.resolve(this.pathSkeleton, "app", "config", "routing.js")
            }, {
              name: "services.js",
              type: "copy",
              path: path.resolve(this.pathSkeleton, "app", "config", "services.js")
            }, {
              name: "security.yml",
              type: "copy",
              path: path.resolve(this.pathSkeleton, "app", "config", "security.yml")
            }]
          }, {
            name: "controller",
            type: "directory",
            childs: [{
              name: "appController.js",
              type: "copy",
              path: path.resolve(this.pathSkeleton, "app", "controller", "appController.js")
            }, {
              name: "loginController.js",
              type: "copy",
              path: path.resolve(this.pathSkeleton, "app", "controller", "loginController.js")
            }, {
              name: "usersController.js",
              type: "copy",
              path: path.resolve(this.pathSkeleton, "app", "controller", "usersController.js")
            }]
          }]
        }, {
          name: "package.json",
          type: "file",
          skeleton: path.resolve(this.pathSkeleton, "package.json.skeleton"),
          params: this.cli.response
        }, {
          name: ".gitignore",
          type: "file",
          skeleton: path.resolve(this.pathSkeleton, "gitignore.skeleton"),
          params: this.cli.response
        }, {
          name: ".jshintrc",
          type: "file",
          skeleton: path.resolve(this.pathSkeleton, "jshintrc.skeleton"),
          params: this.cli.response
        }, {
          name: ".jshintignore",
          type: "file",
          skeleton: path.resolve(this.pathSkeleton, "jshintignore.skeleton"),
          params: this.cli.response
        }, {
          name: ".editorconfig",
          type: "file",
          skeleton: path.resolve(this.pathSkeleton, "editorconfig.skeleton"),
          params: this.cli.response
        }, {
          name: "web",
          type: "directory",
        }, {
          name: "tmp",
          type: "directory",
        }, {
          name: "config",
          type: "directory",
          childs: [{
            name: "certificates",
            type: "directory",
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
                params: this.cli.response
              }]
            }, {
              name: "ca_intermediate",
              type: "directory",
              childs: [{
                name: "openssl.cnf",
                type: "file",
                skeleton: path.resolve(this.pathSkeleton, "config", "openssl", "ca_intermediate", "openssl.cnf.skeleton"),
                params: this.cli.response
              }]
            }]
          }, {
            name: "config.js",
            type: "file",
            skeleton: path.resolve(this.pathSkeleton, "config", "config.js.skeleton"),
            params: this.cli.response
          }, {
            name: "pm2.config.js",
            type: "file",
            skeleton: path.resolve(this.pathSkeleton, "config", "pm2.config.js.skeleton"),
            params: this.cli.response
          }]
        }, {
          name: "bin",
          type: "directory",
          childs: [{
            name: "generateCertificates.sh",
            type: "file",
            chmod: 755,
            skeleton: path.resolve(this.pathSkeleton, "bin", "generateCertificates.sh.skeleton"),
            params: this.cli.response
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