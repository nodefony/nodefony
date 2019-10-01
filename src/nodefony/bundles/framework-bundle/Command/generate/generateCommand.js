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
    //this.setTask("entity", entityTask);
    this.setTask("nginx", nginxTask);
    this.setTask("haproxy", haproxyTask);
    this.setTask("letsencrypt", letsencryptTask);
  }

  bundle() {
    let task = this.getTask("bundle");
    return task.run(arguments);
  }

  controller(){
    let task = this.getTask("controller");
    return task.run(arguments);
  }

}

module.exports = generateCommand;
