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

  vue(){
    this.cli.response.front = "vue";
    return this.generate();
  }

  react(){
    this.cli.response.front = "react";
    return this.generate();
  }

  generate() {
    return new bundlesBuilder(this.cli, this.cli.cmd, this.cli.args)
    .run(this.cli.interactive)
    .then((obj)=>{
      return obj.builder.install()
      .then(() => {
        this.cli.terminate(0);
      }).catch((e) => {
        this.logger(e, "ERROR");
        this.cli.terminate(0);
      });
    });
  }

}

module.exports = bundlesTask;
