class Bootstrap extends nodefony.Builder {

  constructor(cli, cmd, args) {
    super(cli, cmd, args);
    this.log(`Build Bootstrap Project in : ${this.location}`);
    this.pathSkeleton = path.resolve(__dirname, "skeletons");
    this.force = true;
  }

  createBuilder() {
    try {
      return {
        name: "app",
        type: "directory",
        childs: [{
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
            name: "security.js",
            type: "copy",
            path: path.resolve(this.pathSkeleton, "app", "config", "security.js")
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
      };
    } catch (e) {
      throw e;
    }
  }
}

module.exports = Bootstrap;