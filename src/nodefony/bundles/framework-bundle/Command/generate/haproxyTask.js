class haproxyTask extends nodefony.Task {

  constructor(name, command) {
    super(name, command);

  }

  showHelp() {
    this.setHelp("generate:haproxy [-i]",
      "Generate Haproxy Minimal Configuration File as a reverse proxy in front of Nodefony"
    );
  }

  interaction( /*args*/ ) {
    return this.cli.showAsciify(this.name)
      .then(() => {

      });

  }

}

module.exports = haproxyTask;