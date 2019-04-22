class SandBox extends nodefony.Builder {
  constructor(cli, cmd, args) {
    super(cli, cmd, args);
    this.log("Build Sandbox Project");
    this.pathSkeleton = path.resolve(__dirname, "skeletons");
    this.force = true;
  }

  async interaction() {
    this.cli.reset();
    await this.cli.showAsciify("SandBox");
    return this.cli.prompt([{
      type: 'checkbox',
      message: 'Select toppings',
      name: 'toppings',
      pageSize: 10,
      choices: [{
        name: 'Bootstrap'
        }, {
        name: 'PWA'
        }]
      }]);
  }

  createBuilder() {
    try {
      return {
        name: "app",
        type: "directory",
        childs: [{
          name: "package.json",
          type: "copy",
          path: path.resolve(this.pathSkeleton, "app", "package.json")
        }, {
          name: "appKernel.js",
          type: "file",
          skeleton: path.resolve(this.pathSkeleton, "app", "appKernel.js.skeleton"),
          params: this.cli.response
          }, {
          name: "Resources",
          type: "directory",
          childs: [{
            name: "databases",
            type: "copy",
            path: path.resolve(this.pathSkeleton, "app", "Resources", "databases"),
            params: {
              recurse: true
            }
          }]
        }, {
          name: "controller",
          type: "copy",
          path: path.resolve(this.pathSkeleton, "app", "controller"),
          params: {
            recurse: true
          }
        }, {
          name: "config",
          type: "directory",
          childs: [{
            name: "config.js",
            type: "file",
            skeleton: path.resolve(this.pathSkeleton, "app", "config", "config.js"),
            params: this.cli.response
          }, {
            name: "routing.js",
            type: "copy",
            path: path.resolve(this.pathSkeleton, "app", "config", "routing.js")
          }, {
            name: "security.js",
            type: "copy",
            path: path.resolve(this.pathSkeleton, "app", "config", "security.js")
          }, {
            name: "services.js",
            type: "copy",
            path: path.resolve(this.pathSkeleton, "app", "config", "services.js")
          }, {
            name: "webpack.config.js",
            type: "copy",
            path: path.resolve(this.pathSkeleton, "app", "config", "webpack.config.js")
          }, {
            name: "webpack",
            type: "copy",
            path: path.resolve(this.pathSkeleton, "app", "config", "webpack"),
            params: {
              recurse: true
            }
          }]
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
            name: "public",
            type: "copy",
            path: path.resolve(this.pathSkeleton, "app", "Resources", "public"),
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
            name: "css",
            type: "copy",
            path: path.resolve(this.pathSkeleton, "app", "Resources", "css"),
            params: {
              recurse: true
            }
          }]
        }]
      };
    } catch (e) {
      throw e;
    }
  }
}

module.exports = SandBox;