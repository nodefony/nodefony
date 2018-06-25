const bundlesTask = require(path.resolve(__dirname, "bundlesTask.js"));

class generateCommand extends nodefony.Command {

  constructor(cli, bundle) {
    super("generate", cli, bundle);
    this.setTask("bundle", bundlesTask);
  }

  bundle() {
    if (this.interactive) {
      return nodefony.builders.bundles.interaction(this.cli)
        .then((res) => {
          let task = this.getTask("bundle");
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
      let task = this.getTask("bundle");
      return task.nodefony.apply(task, arguments);
    }
  }

}

module.exports = generateCommand;