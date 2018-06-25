module.exports = nodefony.register.call(nodefony.commands, "nodefony", function () {

  class nodefonyCommand extends nodefony.Command {

    constructor(cli, kernel) {
      super("nodefony", cli, kernel);
      this.setTask("npm", require(path.resolve(__dirname, "tasks", "npmTask.es6")));
    }

  }

  return nodefonyCommand;
});