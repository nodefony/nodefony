class bundlesTask extends nodefony.Task {
  constructor (name, command) {
    super(name, command);
    nodefony.extend(this.cli.response, {
      config: this.getParameters("bundles.app"),
      configKernel: this.getParameters("kernel")
    });
  }

  showHelp () {
    this.setHelp(
      "generate:bundles:nodefony name [path]",
      "Generate a nodefony Bundle  Example : nodefony generate:bundles:nodefony name ./src/bundles"
    );
    this.setHelp(
      "generate:bundles:vue name [path]",
      "Generate a Vue.js Bundle  Example : nodefony generate:bundles:vue name ./src/bundles"
    );
    this.setHelp(
      "generate:bundles:react name [path]",
      "Generate a React Bundle Example : nodefony generate:bundles:react name ./src/bundles"
    );
  }

  nodefony () {
    return this.generate();
  }

  vue () {
    this.cli.response.front = "vue";
    return this.generate();
  }

  react () {
    this.cli.response.front = "react";
    return this.generate();
  }

  generate () {
    return new nodefony.builders.bundle(this.cli, this.cli.cmd, this.cli.args)
      .run(this.cli.interactive)
      .then((obj) => obj.builder.install()
        .then(() => {
          this.cli.terminate(0);
        })
        .catch((e) => {
          this.log(e, "ERROR");
          this.cli.terminate(0);
        }));
  }
}

module.exports = bundlesTask;
