class entityTask extends nodefony.Task {

  constructor(name, command) {
    super(name, command);

  }

  showHelp() {
    this.setHelp("generate:entity [-i]",
      "Generate Entity"
    );
  }

}

module.exports = entityTask;