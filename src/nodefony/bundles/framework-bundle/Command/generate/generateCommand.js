const bundlesTask = require(path.resolve(__dirname, "bundlesTask.js"));
const controllerTask = require(path.resolve(__dirname, "controllerTask.js"));
const serviceTask = require(path.resolve(__dirname, "serviceTask.js"));
const entityTask = require(path.resolve(__dirname, "entityTask.js"));
const nginxTask = require(path.resolve(__dirname, "nginxTask.js"));
const haproxyTask = require(path.resolve(__dirname, "haproxyTask.js"));
const letsencryptTask = require(path.resolve(__dirname, "letsencryptTask.js"));

class generateCommand extends nodefony.Command {

  constructor(cli, bundle) {
    super("generate", cli, bundle);
    this.setTask("bundle", bundlesTask);
    this.setTask("controller", controllerTask);
    this.setTask("service", serviceTask);
    this.setTask("entity", entityTask);
    this.setTask("nginx", nginxTask);
    this.setTask("haproxy", haproxyTask);
    this.setTask("letsencrypt", letsencryptTask);
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

}

module.exports = generateCommand;