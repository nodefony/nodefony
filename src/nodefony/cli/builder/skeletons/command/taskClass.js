class {{commandName}}Task extends nodefony.Task {

  constructor(name, command) {
    super(name, command);
  }

  showHelp() {
    this.setHelp("{{commandName}}:task:action myarg1 myarg2",
      "nodefony {{commandName}}:task:action myarg1 myarg2"
    );
  }

  action(arg1, arg2){
    this.logger(arg1);
    this.logger(arg2);
  }

}

module.exports = {{commandName}}Task;
