class entityTask extends nodefony.Task {
  constructor (name, command) {
    super(name, command);
    const nameOrm = this.kernel.getOrm();
    this.orm = this.get(nameOrm);
    this.ormList = [nameOrm];
  }

  showHelp () {
    this.setHelp(
      "generate:entity [-i] orm ",
      "Generate ORM Entity"
    );
  }

  interaction (/* args*/) {
    return this.cli.showAsciify(this.name)
      .then(() => {
        this.ormList.push(this.cli.getSeparator());
        this.ormList.push("Quit");
        return this.cli.prompt([{
          type: "list",
          name: "orm",
          message: "Choose an ORM to generate Entity : ",
          default: 0,
          pageSize: this.ormList.length,
          choices: this.ormList,
          filter: (val) => {
            if (val === "Quit") {
              return Promise.reject("Quit");
            }
            return val;
          }
        }]);
      });
  }

  generate (args, response) {
    let orm = null;
    if (response && response.orm) {
      orm = response.orm;
    } else if (orm.args.length) {
      orm = args[0];
    }
    let command = null;
    let task = null;
    switch (orm) {
    case "sequelize":
      command = this.cli.getCommand("sequelize", "sequelize");
      task = command.getTask("generate");
      return task.run(response);
    case "mongoose":
      command = this.cli.getCommand("generate", "mongoose");
      task = command.getTask("entity");
      return task.generate(response);
    default:
      throw new Error(`Bad orm  : ${orm} not found !`);
    }
  }
}

module.exports = entityTask;
