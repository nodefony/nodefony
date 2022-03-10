const cron = require('node-cron');
const defaultOptions = {
  scheduled: true,
  recoverMissedExecutions: false,
  timezone: "Europe/Paris"
};

class Cron extends nodefony.Service {

  constructor(container) {
    if (container) {
      super("CRON", container);
    } else {
      super("CRON");
      this.initSyslog();
    }
    this.cron = cron;
    this.cronTab = {};
  }

  getTasks() {
    return this.cron.getTasks()
  }

  getTask(name) {
    if (!name) {
      throw new Error(`Task : ${name} not exist in cron tab`);
    }
    if (name in this.cronTab) {
      return this.cronTab[name];
    }
    throw new Error(`Task name  : ${name} not exist in cron tab`);
  }

  /**
   *    # ┌────────────── second (optional)
   *    # │ ┌──────────── minute
   *    # │ │ ┌────────── hour
   *    # │ │ │ ┌──────── day of month
   *    # │ │ │ │ ┌────── month
   *    # │ │ │ │ │ ┌──── day of week
   *    # │ │ │ │ │ │
   *    # │ │ │ │ │ │
   *    # * * * * * *
   *
   **/
  createTask(name, param, options = defaultOptions, callback = null) {
    if (arguments.length !== 4) {
      throw new Error("Cron createTask bad parameters ");
    }
    if (!name) {
      throw new Error("Cron createTask bad parameters name ");
    }
    if (!this.validate(param)) {
      throw new Error(`Invalid Cron Expression : ${param}`);
    }
    if (name in this.cronTab) {
      throw new Error(`Task name  : ${name} already exist in cron tab`);
    }
    try {
      options.name = name ;
      this.cronTab[name] = this.cron.schedule(param, callback, options);
      return this.cronTab[name];
    } catch (e) {
      throw e;
    }
  }

  startTask(name) {
    if (!name) {
      throw new Error("Cron startTask bad parameters name ");
    }
    if (name in this.cronTab) {
      try {
        const res = this.cronTab[name].start();
        this.log(`Start Task : ${name} ! `,"INFO", "CRONTAB");
        return res ;
      } catch (e) {
        throw e;
      }
    }
    throw new Error(`Cron startTask name: ${name} not found in cron tab !`);
  }

  stopTask(name) {
    if (!name) {
      throw new Error("Cron stopTask bad parameters name ");
    }
    if (name in this.cronTab) {
      try {
        return this.cronTab[name].stop();
      } catch (e) {
        throw e;
      }
    }
    throw new Error(`Cron stopTask name: ${name} not found in cron tab !`);
  }

  deleteTask(name) {
    if (!name) {
      throw new Error("Cron deleteTask bad parameters name ");
    }
    if (name in this.cronTab) {
      try {
        return this.cronTab[name].destroy();
      } catch (e) {
        throw e;
      }
    }
    throw new Error(`Cron deleteTask name: ${name} not found in cron tab !`);
  }

  validate(param) {
    try {
      return this.cron.validate(param);
    } catch (e) {
      this.log(e, "ERROR");
      throw new Error(`Invalid Cron Expression : ${param}`);
    }
  }

}

nodefony.services.cron = Cron ;
module.exports = Cron;
