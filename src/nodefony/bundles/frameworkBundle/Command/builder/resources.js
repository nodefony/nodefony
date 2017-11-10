const Config = class Config {
  constructor(cli, builder) {
    this.cli = cli;
    this.name = "config";
    this.type = builder.type;
    this.params = builder.params;
    this.bundleType = builder.bundleType;
    this.skeletonPath = builder.skeletonPath;
    this.routing = builder.routing; //new routing(this.cli, builder);
    this.configSkeleton = path.resolve(this.skeletonPath, this.bundleType, "config.yml.skeleton");
    this.webpackSkeleton = path.resolve(this.skeletonPath, "webpack", "webpack.common.skeleton");
  }

  createBuilder() {
    let obj = {
      name: this.name,
      type: "directory",
      childs: [{
          name: "config.yml",
          type: "file",
          skeleton: this.configSkeleton,
          params: this.params
        },
        this.routing.createBuilder(),
        this.createSecurityConfig("yml")
      ]
    };
    if (this.bundleType === "") {
      obj.childs.push({
        name: "webpack.config.js",
        type: "file",
        skeleton: this.webpackSkeleton,
        params: this.params
      });
      obj.childs.push(this.createWebpackConfig());
    }
    return obj;
  }

  createSecurityConfig(type) {
    let name = "security." + type;
    this.skeletonSecurity = path.resolve(this.skeletonPath, this.bundleType, "security." + type + ".skeleton");
    return {
      name: name,
      type: "file",
      skeleton: this.skeletonSecurity,
      params: this.params
    };
  }

  createWebpackConfig() {
    this.prodSkeleton = path.resolve(this.skeletonPath, "webpack", "webpack.prod.skeleton");
    this.devSkeleton = path.resolve(this.skeletonPath, "webpack", "webpack.dev.skeleton");
    return {
      name: "webpack",
      type: "directory",
      childs: [{
        name: "webpack.dev.config.js",
        type: "file",
        skeleton: this.devSkeleton,
        params: this.params
      }, {
        name: "webpack.prod.config.js",
        type: "file",
        skeleton: this.prodSkeleton,
        params: this.params
      }]
    };
  }
};

const Resources = class Resources {
  constructor(cli, builder) {
    this.cli = cli;
    this.type = builder.type;
    this.params = builder.params;
    this.bundleType = builder.bundleType;
    this.skeletonPath = builder.skeletonPath;
    this.routing = builder.routing;
    this.config = new Config(this.cli, this);
    this.view = builder.view;
    this.translation = builder.translation;
  }
  createBuilder() {
    return {
      name: "Resources",
      type: "directory",
      childs: [
        this.config.createBuilder(),
        this.createPublicResources(),
        this.translation.createBuilder(),
        this.view.createBuilder("views", "index.html.twig")
      ]
    };
  }
  createPublicResources() {
    this.jsFileSkeleton = path.resolve(this.skeletonPath, "webpackEntryPoint.skeleton");
    this.cssFileSkeleton = path.resolve(this.skeletonPath, "webpackCss.skeleton");
    return {
      name: "public",
      type: "directory",
      childs: [{
        name: "js",
        type: "directory",
        childs: [{
          name: this.params.name + ".js",
          type: "file",
          skeleton: this.jsFileSkeleton,
          params: this.params
        }]
      }, {
        name: "css",
        type: "directory",
        childs: [{
          name: this.params.name + ".css",
          type: "file",
          skeleton: this.cssFileSkeleton,
          params: this.params
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
  }
};

module.exports = Resources;
