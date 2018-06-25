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
    this.setHelp("generate:bundle:angular name [path]",
      "Generate a Angular Bundle  Example : nodefony generate:bundle:angular name ./src/bundles"
    );
    this.setHelp("generate:bundle:react name [path]",
      "Generate a React Bundle Example : nodefony generate:bundle:react name ./src/bundles"
    );
  }

  nodefony(name, Path) {
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

  angular(name, Path) {
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
        bundle.generateProject(name, Path)
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

  react(name, Path) {
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
        bundle.generateProject(name, Path)
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

}

module.exports = bundlesTask;