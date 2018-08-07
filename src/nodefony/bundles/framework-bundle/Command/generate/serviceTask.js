class serviceTask extends nodefony.Task {

  constructor(name, command) {
    super(name, command);

  }

  showHelp() {
    this.setHelp("generate:service [-i]",
      "Generate Service"
    );
  }


}

module.exports = serviceTask;