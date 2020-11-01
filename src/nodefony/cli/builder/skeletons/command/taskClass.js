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
    this.log(arg1);
    this.log(arg2);
  }

}

module.exports = {{commandName}}Task;
