const Routing = class Routing {
  constructor(cli, builder) {
    this.cli = cli;
    this.builder = builder;
    this.type = builder.type;
    this.bundleType = builder.bundleType;
    this.params = builder.params;
    this.name = "routing." + this.type;
    this.skeletonPath = builder.skeletonPath;
    this.skeleton = path.resolve(this.skeletonPath, this.bundleType, "routing." + this.type + ".skeleton");
    this.skeletonRoute = path.resolve(this.skeletonPath, "route." + this.type + ".skeleton");
  }
  createBuilder() {
    return {
      name: this.name,
      type: "file",
      skeleton: this.skeleton,
      params: this.params
    };
  }
  addConfigRoute(realName, type) {
    if (type && type !== this.type) {
      this.skeleton = path.resolve(this.skeletonPath, this.bundleType, "routing." + type + ".skeleton");
      this.skeletonRoute = path.resolve(this.skeletonPath, "route." + type + ".skeleton");
      this.name = "routing." + type;
    }
    try {
      let route = new nodefony.Route(realName);
      route.addDefault("controller", this.builder.name + ":" + realName + ":index");
      let file = null;
      switch (type || this.type) {
      case "js":
        file = path.resolve(this.builder.bundlePath, "Resources", "config", this.name);
        let json = require(file);
        json[route.name] = {
          pattern: "/" + this.builder.shortName + "/" + route.name,
          defaults: {
            controller: this.builder.name + ":" + realName + ":index"
          }
        };
        this.builder.buildSkeleton(this.skeletonRoute, true, {
          routes: JSON.stringify(json, null, 2)
        }, (error, data) => {
          if (error) {
            throw error;
          }
          try {
            fs.writeFileSync(file, data, {
              mode: "777"
            });
          } catch (e) {
            throw e;
          }
        });
        break;
      case "yml":
        let create = false;
        try {
          file = new nodefony.fileClass(path.resolve(this.builder.bundlePath, "Resources", "config", this.name));
        } catch (e) {
          let parent = new nodefony.fileClass(path.resolve(this.builder.bundlePath, "Resources", "config"));
          let result = this.createBuilder();
          this.builder.build(result, parent);
          file = new nodefony.fileClass(path.resolve(this.builder.bundlePath, "Resources", "config", this.name));
          create = true;
        }
        this.builder.buildSkeleton(this.skeletonRoute, true, {
          controller: realName,
          prefix: this.builder.shortName,
          bundleName: this.builder.name
        }, function (error, data) {
          if (error) {
            throw error;
          }
          try {
            let content = "";
            if (!create) {
              content = file.content();
            }
            fs.writeFileSync(file.path, content + data, {
              mode: "777"
            });
          } catch (e) {
            throw e;
          }
        });
        break;
      default:
        throw new Error("Bad type generator routing");
      }
    } catch (e) {
      throw e;
    }
  }
};

module.exports = Routing;
