//const loadTask = require(path.resolve(__dirname, "loadTask.js"));
class cronCommand extends nodefony.Command {
  constructor(cli, bundle) {
    super("cron", cli, bundle);
    this.cronService = this.get("cron")
  }

  showHelp() {
    this.setHelp("cron:test",
      "cron tab test"
    );
    super.showHelp();
  }

  test() {
    let {
      resolve,
      promise
    } = this.cli.idle()

    const task = this.cronService.createTask("mytask", "*/10 * * * * *", {
      scheduled: true,
    }, () => {
      return "executed"
    })

    task.on("task-done", (ret)=>{
      console.log("done",ret)
    })

    setTimeout(() => {
      task.stop();
      return resolve()
    }, 35000)
    return promise
  }

}
module.exports = cronCommand;
