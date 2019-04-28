const bundlesBuilder = nodefony.builders.bundle;
class bundlesTask extends nodefony.Task {

  constructor(name, command) {
    super(name, command);
    nodefony.extend(this.cli.response, {
      config: this.getParameters("bundles.app"),
      configKernel: this.getParameters("kernel")
    });
  }

  showHelp() {
    this.setHelp("generate:bundle name [path]",
      "Generate a nodefony Bundle  Example : nodefony generate:bundle name ./src/bundles"
    );
    this.setHelp("generate:bundle:vue name [path]",
      "Generate a Vue.js Bundle  Example : nodefony generate:bundle:vue name ./src/bundles"
    );
    this.setHelp("generate:bundle:react name [path]",
      "Generate a React Bundle Example : nodefony generate:bundle:react name ./src/bundles"
    );
  }


  generate() {
    return new bundlesBuilder(this.cli, this.cli.cmd, this.cli.args).run(this.cli.interactive);
  }

  /*interaction() {
    return this.cli.prompt([{
      type: 'list',
      name: 'front',
      default: 0,
      pageSize: 5,
      choices: ["Sandbox (without Front framwork)", "Vue.js", "React"],
      message: 'Choose Bundle Type (Mapping Front Framework in Bundle) :',
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
        default:
          front = value;
        }
        return front;
      }
      }]);
  }*/



  /*nodefony(name, Path = path.resolve("src", "bundles")) {
    let bundle = null;
    try {
      bundle = new nodefony.builders.bundles.nodefony(this.cli, "js");
      if (this.command.interactive) {
        return bundle.interaction()
          .then((res) => {
            try {
              let result = bundle.createBuilder(res.name, res.location);
              bundle.build(result, bundle.location);
              return bundle.install()
                .then(() => {
                  this.cli.terminate(0);
                }).catch((e) => {
                  this.logger(e, "ERROR");
                  this.cli.terminate(0);
                });
            } catch (e) {
              throw e;
            }
          }).catch((e) => {
            this.logger(e, "ERROR");
            throw e;
          });
      } else {
        let result = bundle.createBuilder(name, Path);
        bundle.build(result, bundle.location);
      }
    } catch (e) {
      throw e;
    }
    return bundle.install()
      .then(() => {
        this.cli.terminate(0);
      }).catch((e) => {
        this.logger(e, "ERROR");
        this.cli.terminate(0);
      });
  }

  angular(name, Path = path.resolve("src", "bundles")) {
    let bundle = null;
    try {
      bundle = new nodefony.builders.bundles.angular(this.cli, "js");
      if (this.command.interactive) {
        return bundle.interaction()
          .then((res) => {
            return bundle.generateProject(res.name, res.location)
              .then((builder) => {
                builder.build(builder.createBuilder(res.name, res.location), builder.location, true);
                return bundle.install()
                  .then(() => {
                    this.cli.terminate(0);
                  }).catch((e) => {
                    this.logger(e, "ERROR");
                    this.cli.terminate(0);
                  });
              });
          })
          .catch((e) => {
            this.logger(e, "ERROR");
            throw e;
          });
      } else {
        return bundle.generateProject(name, Path)
          .then((builder) => {
            builder.build(builder.createBuilder(name, Path), builder.location, true);
            return bundle.install()
              .then(() => {
                this.cli.terminate(0);
              }).catch((e) => {
                this.logger(e, "ERROR");
                this.cli.terminate(0);
              });
          });
      }
    } catch (e) {
      throw e;
    }
  }

  react(name, Path = path.resolve("src", "bundles")) {
    let bundle = null;
    try {
      bundle = new nodefony.builders.bundles.react(this.cli, "js");
      if (this.command.interactive) {
        return bundle.interaction()
          .then((res) => {
            return bundle.generateProject(res.name, res.location)
              .then((builder) => {
                builder.build(builder.createBuilder(res.name, res.location), builder.location, true);
                return bundle.install()
                  .then(() => {
                    this.cli.terminate(0);
                  }).catch((e) => {
                    this.logger(e, "ERROR");
                    this.cli.terminate(0);
                  });
              });
          })
          .catch((e) => {
            this.logger(e, "ERROR");
            throw e;
          });
      } else {
        return bundle.generateProject(name, Path)
          .then((builder) => {
            builder.build(builder.createBuilder(name, Path), builder.location, true);
            return bundle.install()
              .then(() => {
                this.cli.terminate(0);
              }).catch((e) => {
                this.logger(e, "ERROR");
                this.cli.terminate(0);
              });
          });
      }
    } catch (e) {
      throw e;
    }
  }*/
}

module.exports = bundlesTask;