const bundlesTask = require(path.resolve(__dirname, "bundlesTask.js"));
const controllerTask = require(path.resolve(__dirname, "controllerTask.js"));
const serviceTask = require(path.resolve(__dirname, "serviceTask.js"));
const entityTask = require(path.resolve(__dirname, "entityTask.js"));

class generateCommand extends nodefony.Command {

  constructor(cli, bundle) {
    super("generate", cli, bundle);
    this.setTask("bundle", bundlesTask);
    this.setTask("controller", controllerTask);
    this.setTask("service", serviceTask);
    this.setTask("entity", entityTask);
  }

  bundle() {
    let task = this.getTask("bundle");
    if (this.interactive) {
      return nodefony.builders.bundles.interaction(this.cli)
        .then((res) => {
          switch (res.type) {
          case "nodefony":
            return task.nodefony.apply(task, arguments);
          case "react":
            return task.react.apply(task, arguments);
          case "angular":
            return task.angular.apply(task, arguments);
          }
        });
    } else {
      return task.nodefony.apply(task, arguments);
    }
  }

  controller() {
    let task = this.getTask("bundle");
    console.log(task);
  }

  service() {
    let task = this.getTask("service");
    console.log(task);

  }

  entity() {
    let task = this.getTask("entity");
    console.log(task);
  }

}

module.exports = generateCommand;