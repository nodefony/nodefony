const routing = require("./routing.js");

const Public = class Public {
  constructor(cli, builder) {
    this.cli = cli;
    this.type = builder.type;
    this.bundleType = builder.bundleType;
    this.skeletonPath = builder.skeletonPath;
    this.params = builder.params;
    this.name = "public";
    this.jsFileSkeleton = path.resolve(this.skeletonPath, "webpackEntryPoint.skeleton");
    this.cssFileSkeleton = path.resolve(this.skeletonPath, "webpackCss.skeleton");
  }
  createBuilder() {
    return {
      name: this.name,
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

const Webpack = class Webpack {
  constructor(cli, builder, type) {
    this.cli = cli;
    this.type = type || "js";
    this.name = "webpack";
    this.bundleType = builder.bundleType;
    this.skeletonPath = builder.skeletonPath;
    this.params = builder.params;
    this.prodSkeleton = path.resolve(this.skeletonPath, "webpack", "webpack.prod.skeleton");
    this.devSkeleton = path.resolve(this.skeletonPath, "webpack", "webpack.dev.skeleton");
  }
  createBuilder() {
    return {
      name: this.name,
      type: "directory",
      childs: [{
        name: "webpack.dev.config." + this.type,
        type: "file",
        skeleton: this.devSkeleton,
        params: this.params
      }, {
        name: "webpack.prod.config." + this.type,
        type: "file",
        skeleton: this.prodSkeleton,
        params: this.params
      }]
    };
  }
};

const Security = class Security {
  constructor(cli, builder) {
    this.cli = cli;
    this.type = "yml";
    this.bundleType = builder.bundleType;
    this.params = builder.params;
    this.skeletonPath = builder.skeletonPath;
    this.name = "security." + this.type;
    this.skeletonSecurity = path.resolve(this.skeletonPath, this.bundleType, "security." + this.type + ".skeleton");
  }
  createBuilder() {
    return {
      name: this.name,
      type: "file",
      skeleton: this.skeletonSecurity,
      params: this.params
    };
  }
};

const Config = class Config {
  constructor(cli, builder) {
    this.cli = cli;
    this.name = "config";
    this.type = "yml";
    this.params = builder.params;
    this.bundleType = builder.bundleType;
    this.skeletonPath = builder.skeletonPath;
    this.routing = new routing(this.cli, builder);
    this.webpack = new Webpack(this.cli, this);
    this.security = new Security(this.cli, this);
    this.configSkeleton = path.resolve(this.skeletonPath, this.bundleType, "config." + this.type + ".skeleton");
    this.webpackSkeleton = path.resolve(this.skeletonPath, "webpack", "webpack.common.skeleton");
  }

  createBuilder() {
    return {
      name: this.name,
      type: "directory",
      childs: [{
          name: "config." + this.type,
          type: "file",
          skeleton: this.configSkeleton,
          params: this.params
        }, {
          name: "webpack.js",
          type: "file",
          skeleton: this.webpackSkeleton,
          params: this.params
        },
        this.routing.createBuilder(),
        this.webpack.createBuilder(),
        this.security.createBuilder()
      ]
    };
  }

};

const Transalation = class Translation {
  constructor(cli, builder) {
    this.cli = cli;
    this.type = builder.type;
    this.params = builder.params;
    this.bundleType = builder.bundleType;
    this.skeletonPath = builder.skeletonPath;
    this.name = "translations";
  }
  createBuilder() {
    return {
      name: this.name,
      type: "directory",
      childs: [{
        name: ".gitignore",
        type: "file"
      }]
    };
  }
};


const View = class View {
  constructor(cli, builder) {
    this.cli = cli;
    this.type = builder.type;
    this.params = builder.params;
    this.bundleType = builder.bundleType;
    this.skeletonPath = builder.skeletonPath;
    this.name = "views";
  }
  createBuilder() {
    return {};
  }
};


const Resources = class Resources {
  constructor(cli, builder) {
    this.cli = cli;
    this.type = builder.type;
    this.params = builder.params;
    this.bundleType = builder.bundleType;
    this.skeletonPath = builder.skeletonPath;
    this.public = new Public(this.cli, this);
    this.config = new Config(this.cli, this);
    this.view = new View(this.cli, this);
    this.translation = new Transalation(this.cli, this);
  }
  createBuilder() {
    return {
      name: "Resources",
      type: "directory",
      childs: [
        this.config.createBuilder(),
        this.public.createBuilder(),
        this.translation.createBuilder(),
        this.view.createBuilder()
      ]
    };
  }
};

module.exports = Resources;
