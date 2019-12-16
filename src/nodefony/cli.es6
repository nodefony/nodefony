const Table = require('cli-table');
const asciify = require('asciify');
//const inquirer = require('inquirer');
const commander = require('commander');
const spawn = require('child_process').spawn;
const spawnSync = require('child_process').spawnSync;
const moment = require("moment");
const semver = require('semver');

const red = clc.red.bold;
//const cyan   = clc.cyan.bold;
const blue = clc.blueBright.bold;
const green = clc.green;
//const yellow = clc.yellow.bold;
const magenta = clc.magenta.bold;
const reset = clc.reset; // '\x1b[0m';

let processName = null;
if (process.argv && process.argv[1]) {
  processName = path.basename(process.argv[1]);
} else {
  processName = process.title || "nodefony";
}

const defaultTableCli = {
  style: {
    head: ['cyan'],
    border: ['grey']
  }
};

const defaultOptions = {
  processName: processName,
  autostart: true,
  asciify: true,
  clear: true,
  color: blue,
  prompt: "default", // "default" || "rxjs"
  commander: true,
  signals: true,
  autoLogger: true,
  resize: false,
  version: null,
  warning: false,
  pid: false,
  promiseRejection: true
};

class CLI extends nodefony.Service {

  constructor(name, container, notificationsCenter, options) {
    switch (arguments.length) {
    case 0:
      options = nodefony.extend({}, defaultOptions);
      name = options.processName;
      super(options.processName, null, null, options);
      break;
    case 1:
      if (typeof name === "object" && name !== null) {
        options = nodefony.extend({}, defaultOptions, name);
        name = options.processName;
        super(options.processName, null, null, options);
      } else {
        options = nodefony.extend({}, defaultOptions);
        name = name || options.processName;
        super(name, null, null, options);
      }
      break;
    case 2:
      if (container instanceof nodefony.Container) {
        options = nodefony.extend({}, defaultOptions);
        name = name || options.processName;
        super(name, container, null, options);
      } else {
        if (typeof container === "object" && container !== null) {
          options = nodefony.extend({}, defaultOptions, container);
          name = name || options.processName;
          super(name, null, null, options);
        } else {
          options = nodefony.extend({}, defaultOptions);
          name = name || options.processName;
          super(name, container, null, options);
        }
      }
      break;
    default:
      options = nodefony.extend({}, defaultOptions, options);
      name = name || options.processName;
      super(name, container, notificationsCenter, options);
    }
    this.environment = process.env.NODE_ENV || "production";
    process.env.NODE_ENV = this.environment;
    this.unhandledRejections = new Map();

    this.setProcessTitle();
    this.pid = "";
    if (this.options.pid) {
      this.setPid();
    }
    this.wrapperLog = console.log;
    this.response = {};
    this.timers = {};
    if (this.options.autoLogger) {
      this.listenSyslog();
    }
    this.initUi();
    this.initCommander();

    if (this.options.warning) {
      process.on('warning', (warning) => {
        this.logger(warning, "WARNING");
        this.fire("onNodeWarning", warning, this);
      });
    } else {
      process.env.NODE_NO_WARNINGS = 1;
    }
    /**
     *  @signals
     */
    if (this.options.signals) {
      process.on('SIGINT', () => {
        this.blankLine();
        this.wrapperLog = console.log;
        this.logger("SIGINT", "CRITIC");
        //this.clear();
        this.fire("onSignal", "SIGINT", this);
        process.nextTick(() => {
          this.terminate();
        });
      });
      process.on('SIGTERM', () => {
        this.blankLine();
        this.wrapperLog = console.log;
        this.logger("SIGTERM", "CRITIC");
        this.fire("onSignal", "SIGTERM", this);
        process.nextTick(() => {
          this.terminate();
        });
      });
      process.on('SIGHUP', () => {
        this.blankLine();
        this.wrapperLog = console.log;
        this.logger("SIGHUP", "CRITIC");
        this.fire("onSignal", "SIGHUP", this);
        process.nextTick(() => {
          this.terminate();
        });
      });
      process.on('SIGQUIT', () => {
        this.blankLine();
        this.wrapperLog = console.log;
        this.logger("SIGQUIT", "CRITIC");
        //this.clear();
        this.fire("onSignal", "SIGQUIT", this);
        process.nextTick(() => {
          this.terminate();
        });
      });
      process.on('uncaughtException', (err) => {
        this.logger(err, "CRITIC", 'uncaughtException');
      });
    }
    /**
     *  @promiseRejection
     */
    if (this.options.promiseRejection) {
      this.listenRejection();
    }
    /**
     *    ASCIIFY
     */
    if (name && this.options.asciify) {
      this.showAsciify(name)
        .then(() => {
          if (this.options.autostart) {
            try {
              this.fire("onStart", this);
            } catch (e) {
              throw e;
            }
          }
        });
    } else {
      if (this.options.autostart) {
        try {
          this.fire("onStart", this);
        } catch (e) {
          this.logger(e, "ERROR");
        }
      }
    }
  }

  async start() {
    return new Promise((resolve, reject) => {
      try {
        if (this.options.autostart) {
          if (this.options.asciify) {
            this.once("onStart", () => {
              return resolve(this);
            });
          } else {
            this.fire("onStart", this);
            return resolve(this);
          }
        } else {
          if (this.options.asciify) {
            this.once("onAsciify", () => {
              this.fire("onStart", this);
              return resolve(this);
            });
          } else {
            this.fire("onStart", this);
            return resolve(this);
          }
        }
      } catch (e) {
        return reject(e);
      }
    });
  }

  idle() {
    return this.idle = setInterval(() => {}, 0);
  }

  logger(pci, severity, msgid, msg) {
    if (!msgid) {
      try {
        msgid = clc.magenta(`${this.name}`);
      } catch (e) {}
    }
    return super.logger(pci, severity, msgid, msg);
  }

  checkVersion(version = null) {
    if (!version) {
      version = this.version;
    }
    let res = semver.valid(version);
    if (res) {
      return res;
    }
    throw new Error("Not valid version : " + version + " check  http://semver.org ");
  }

  async showAsciify(name = null) {
    if (!name) {
      name = this.name;
    }
    return await this.asciify(`      ${name}`, {
        font: this.options.font || "standard"
      })
      .then((data) => {
        this.fire("onAsciify", data);
        if (this.options.clear) {
          this.clear();
        }
        let color = this.options.color || blue;
        console.log(color(data));
        return data;
      })
      .catch((err) => {
        this.logger(err, "ERROR");
        throw err;
      });
  }

  showBanner() {
    let version = this.commander ? this.commander.version() : (this.options.version || "1.0.0");
    let banner = null;
    if (this.options.version) {
      banner = `          Version : ${blue(version)}   Platform : ${green(process.platform)}   Process : ${green(process.title)}   Pid : ${process.pid}`;
      this.blankLine();
      console.log(banner);
    }
    return banner;
  }

  listenRejection() {
    process.on('rejectionHandled', (promise) => {
      this.logger("PROMISE REJECTION EVENT ", "CRITIC", 'rejectionHandled');
      this.unhandledRejections.delete(promise);
    });
    process.on('unhandledRejection', (reason, promise) => {
      this.logger("WARNING  !!! PROMISE CHAIN BREAKING : " + reason, "WARNING", 'unhandledRejection');
      console.trace(promise);
      this.unhandledRejections.set(promise, reason);
    });
  }

  setPid() {
    this.pid = process.pid;
  }

  setProcessTitle(name) {
    if (name) {
      process.title = name.replace(new RegExp("\\s", "gi"), "").toLowerCase();
    } else {
      process.title = this.name.replace(new RegExp("\\s", "gi"), "").toLowerCase();
    }
    return process.title;
  }

  logEnv() {
    return blue("      \x1b " + this.name) + " NODE_ENV : " + magenta(this.environment);
  }

  initCommander() {
    if (this.options.commander) {
      this.commander = commander;
      if (this.options.version) {
        this.setCommandVersion(this.options.version);
      }
      /*this.on("onStart", () => {
        //this.commander.parse(process.argv);
      });*/
    }
  }

  initUi() {
    this.clc = clc;
    this.inquirer = inquirer;
    if (this.options.prompt === "rxjs") {
      this.prompt = new Rx.Subject();
      let prompt = inquirer.createPromptModule();
      prompt(this.prompt);
    } else {
      this.prompt = inquirer.createPromptModule();
    }
    this.clui = require("clui");
    this.emoji = require("node-emoji");
    this.spinner = null;
    this.blankLine = function () {
      var myLine = new this.clui.Line().fill();
      return () => {
        myLine.output();
      };
    }.call(this);
    if (this.options.resize) {
      this.resize();
    }
  }

  getFonts() {
    asciify.getFonts((err, fonts) => {
      fonts.forEach(this.logger);
    });
  }

  listenSyslog(options) {
    let defaultOption = {
      severity: {
        operator: "<=",
        data: "7"
      }
    };
    return this.syslog.listenWithConditions(this, options || defaultOption,
      (pdu) => {
        return this.normalizeLog(pdu);
      });
  }

  async asciify(txt, options, callback) {
    return new Promise((resolve, reject) => {
      asciify(txt, nodefony.extend({
        font: 'standard'
      }, options), (error, data) => {
        if (callback && typeof callback === "function") {
          return callback(error, data);
        }
        if (error) {
          return reject(error);
        }
        return resolve(data);
      });
    });
  }

  parseCommand(argv) {
    this.parse = this.commander.parse(argv || process.argv);
    if (this.commander.debug) {
      this.debug = this.commander.debug;
    } else {
      this.debug = false;
    }
    if (this.commander.interactive) {
      this.interactive = this.commander.interactive;
    } else {
      this.interactive = false;
    }
    return this.parse;
  }

  setOption(option, description, callback) {
    return this.commander.option(option, description, callback);
  }
  setCommandVersion(version) {
    if (typeof this.commander.version === "function") {
      return this.commander.version(version);
    }
  }
  setCommand(command, description, options) {
    return this.commander.command(command, description, options);
  }
  showHelp(quit, callback) {
    if (quit) {
      return this.commander.help(callback);
    }
    return this.commander.outputHelp(callback);
  }

  createProgress(size) {
    return new this.clui.Progress(size);
  }

  createSparkline(values, suffix) {
    if (values) {
      try {
        return this.clui.Sparkline(values, suffix || "");
      } catch (e) {
        this.logger(e, "ERROR");
        throw e;
      }
    }
  }

  getSeparator(sep) {
    if (sep) {
      return new inquirer.Separator(sep);
    }
    return new inquirer.Separator("--------");
  }

  getSpinner(message, design) {
    return new this.clui.Spinner(message, design || null);
  }

  startSpinner(message, design) {
    try {
      this.spinner = this.getSpinner(message, design);
      this.wrapperLog = this.spinner.message;
      this.spinner.start();
      return this.spinner;
    } catch (e) {
      this.logger(e, "ERROR");
      throw e;
    }
  }
  stopSpinner( /*message, options*/ ) {
    if (this.spinner) {
      this.spinner.stop();
      this.wrapperLog = console.log;
      this.spinner = null;
      delete this.spinner;
      return true;
    }
    this.logger(new Error("Spinner is not started "), "ERROR");
    return false;
  }

  normalizeLog(pdu) {
    //console.log(pdu)
    let date = new Date(pdu.timeStamp);
    if (pdu.payload === "" || pdu.payload === undefined) {
      console.error(date.toDateString() + " " + date.toLocaleTimeString() + " " + nodefony.Service.logSeverity(pdu.severityName) + " " + green(pdu.msgid) + " " + " : " + "logger message empty !!!!");
      console.trace(pdu);
      return;
    }
    let message = pdu.payload;
    switch (typeof message) {
    case "object":
      switch (true) {
      case (message instanceof nodefony.Error):
        break;
      case (message instanceof Error):
        message = new nodefony.Error(message);
        break;
      default:
        message = util.inspect(message);
      }
      break;
    default:
    }
    if (!this.wrapperLog) {
      this.wrapperLog = console.log;
    }
    return this.wrapperLog(`${this.pid} ${date.toDateString()} ${date.toLocaleTimeString()} ${nodefony.Service.logSeverity(pdu.severityName)} ${green(pdu.msgid)} : ${message}`);
  }

  displayTable(datas, options, syslog) {
    let table = null;
    try {
      table = new Table(options || defaultTableCli);
      if (datas) {
        for (var i = 0; i < datas.length; i++) {
          table.push(datas[i]);
        }
        if (syslog) {
          if (syslog.logger) {
            syslog.logger(table.toString());
          } else {
            if (syslog.log) {
              syslog.log(table.toString());
            } else {
              this.log(`\n${table.toString()}`);
            }

          }
        } else {
          console.log(table.toString());
        }
      }
    } catch (e) {
      throw e;
    }
    return table;
  }

  static niceBytes(x) {
    let units = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
      n = parseInt(x, 10) || 0,
      l = 0;
    while (n >= 1024) {
      n = n / 1024;
      l++;
    }
    return (n.toFixed(n >= 10 || l < 1 ? 0 : 1) + ' ' + units[l]);
  }

  static niceUptime(date, suffix) {
    return moment(date).fromNow(suffix || false);
  }

  static niceDate(date, format) {
    return moment(date).format(format);
  }

  getEmoji(name) {
    if (name) {
      return this.emoji.get(name);
    }
    return this.emoji.random().emoji;
  }

  clear() {
    this.clui.Clear();
  }

  reset() {
    process.stdout.write(reset);
  }

  resize() {
    process.stdout.on('resize', () => {
      this.columns = process.stdout.columns;
      this.rows = process.stdout.rows;
      this.fire("onResize", this.columns, this.rows, this);
    });
  }

  rm() {
    try {
      return shell.rm.apply(shell, arguments);
    } catch (e) {
      throw e;
    }
  }
  cp() {
    try {
      return shell.cp.apply(shell, arguments);
    } catch (e) {
      throw e;
    }
  }
  cd() {
    try {
      return shell.cd.apply(shell, arguments);
    } catch (e) {
      throw e;
    }
  }
  ln() {
    try {
      return shell.ln.apply(shell, arguments);
    } catch (e) {
      throw e;
    }
  }
  mkdir() {
    try {
      return shell.mkdir.apply(shell, arguments);
    } catch (e) {
      throw e;
    }
  }

  chmod() {
    try {
      return shell.chmod.apply(shell, arguments);
    } catch (e) {
      throw e;
    }
  }
  ls() {
    try {
      return shell.ls.apply(shell, arguments);
    } catch (e) {
      throw e;
    }
  }

  createDirectory(myPath, mode, callback, force) {
    let file = null;
    if (!callback) {
      return new Promise((resolve, reject) => {
          try {
            fs.mkdirSync(myPath, mode);
            file = new nodefony.fileClass(myPath);
            return resolve(file);
          } catch (e) {
            switch (e.code) {
            case "EEXIST":
              if (force) {
                file = new nodefony.fileClass(myPath);
                return resolve(file);
              }
              break;
            }
            return reject(e);
          }
        })
        .catch(e => {
          throw e;
        });
    }
    try {
      fs.mkdirSync(myPath, mode);
      file = new nodefony.fileClass(myPath);
      callback(file);
      return file;
    } catch (e) {
      switch (e.code) {
      case "EEXIST":
        if (force) {
          file = new nodefony.fileClass(myPath);
          callback(file);
          return file;
        }
        break;
      }
      throw e;
    }
  }

  existsSync(myPath) {
    if (!myPath) {
      throw new Error("existsSync no path found");
    }
    return fs.existsSync(myPath);
  }

  exists(myPath, mode, callback) {
    if (!myPath) {
      throw new Error("exists no path found");
    }
    if (!mode) {
      mode = fs.constants.R_OK | fs.constants.W_OK;
    }
    if (callback) {
      return fs.access(myPath, mode, callback);
    }
    return fs.existsSync(myPath);
  }

  terminate(code, quiet) {
    if (quiet) {
      return code;
    }
    if (code === 0) {
      process.exitCode = code;
    }
    process.exit(code);
  }

  static quit(code) {
    if (code === 0) {
      process.exitCode = code;
    }
    process.exit(code);
  }

  startTimer(name) {
    if (name in this.timers) {
      throw new Error("Timer : " + name + " already exist !! stopTimer to clear");
    }
    try {
      this.logger("BEGIN TIMER : " + name, "INFO");
      this.timers[name] = name;
      return console.time(name);
    } catch (e) {
      if (name in this.timers) {
        delete this.timers[name];
      }
      throw e;
    }
  }

  stopTimer(name) {
    if (!name) {
      for (let timer in this.timers) {
        this.stopTimer(this.timers[timer]);
      }
    }
    try {
      if (name in this.timers) {
        this.logger("END TIMER : " + name, "INFO");
        delete this.timers[name];
        return console.timeEnd(name);
      }
      throw new Error("Timer : " + name + " not exist !! startTimer before");
    } catch (e) {
      if (name in this.timers) {
        delete this.timers[name];
      }
      throw e;
    }
  }

  async npm(argv = [], cwd = path.resolve("."), env = "dev") {
    switch (env) {
    case "dev":
    case "development":
      process.env.NODE_ENV = "development";
      break;
    case "prod":
    case "production":
      process.env.NODE_ENV = "production";
      break;
    default:
      process.env.NODE_ENV = this.environment;
    }
    return new Promise((resolve, reject) => {
      let cmd = null;
      try {
        this.debug = this.commander.debug || false;
        this.logger(`Command : npm ${argv.join(' ')} in cwd : ${cwd}`);
        //const exe = path.resolve(nodefony.path, "node_modules", ".bin", "npm");
        let exe = null;
        if (process.platform === "win32") {
          exe = 'npm.cmd';
        } else {
          exe = 'npm';
        }
        cmd = this.spawn(exe, argv, {
          cwd: cwd,
          env: process.env,
          stdio: "inherit",
          NODE_ENV: process.env.NODE_ENV
        }, (code) => {
          if (code === 0) {
            return resolve(code);
          }
          return resolve(new Error(`Command : npm ${argv.join(' ')}  cwd : ${cwd} Error Code : ${code}`));
        });
      } catch (e) {
        this.logger(e, "ERROR");
        return reject(e);
      }
    });
  }

  async yarn(argv = [], cwd = path.resolve("."), env = "dev") {
    switch (env) {
    case "dev":
    case "development":
      process.env.NODE_ENV = "development";
      break;
    case "prod":
    case "production":
      process.env.NODE_ENV = "production";
      break;
    default:
      process.env.NODE_ENV = this.environment;
    }
    return new Promise((resolve, reject) => {
      let cmd = null;
      try {
        this.logger(`Command : yarn ${argv.join(' ')} in cwd : ${cwd}`);
        this.debug = this.commander.debug || false;
        //const exe = path.resolve(nodefony.path, "node_modules", ".bin", "npm");
        let exe = null;
        if (process.platform === "win32") {
          exe = 'yarn.cmd';
        } else {
          exe = 'yarn';
        }
        cmd = this.spawn(exe, argv, {
          cwd: cwd,
          env: process.env,
          stdio: "inherit",
          NODE_ENV: process.env.NODE_ENV
        }, (code) => {
          if (code === 0) {
            return resolve(code);
          }
          return resolve(new Error(`Command : yarn ${argv.join(' ')}  cwd : ${cwd} Error Code : ${code}`));
        });
      } catch (e) {
        this.logger(e, "ERROR");
        return reject(e);
      }
    });
  }

  spawn(command, args, options, close) {
    let cmd = null;
    try {
      if (options.NODE_ENV) {
        options.env.NODE_ENV = options.NODE_ENV;
        delete options.NODE_ENV;
      }
      this.logger(`Spawn : ${command} ${args.join(" ")}`, "INFO");
      cmd = spawn(command, args, options || {});
      //if (this.debug) {
      if (cmd.stdout) {
        cmd.stdout.on('data', (data) => {
          let str = data.toString();
          if (str) {
            if (this.debug) {
              this.logger(`${command} :\n`, "INFO", blue("STDOUT"));
            }
            process.stdout.write(str);
          }
        });
      }
      if (cmd.stderr) {
        cmd.stderr.on('data', (data) => {
          let str = data.toString();
          if (str) {
            if (this.debug) {
              this.logger(`${command} :\n`, "INFO", red("STDERR"));
            }
            process.stdout.write(str);
          }
        });
      }
      cmd.on('close', (code) => {
        if (this.debug) {
          this.logger(`Child Process exited with code ${code}`, "DEBUG");
        }
        if (close) {
          close(code);
        }
        if (code !== 0) {
          this.logger(`Spawn : ${command} ${args.join(" ")} Error Code : ${code}`, "ERROR");
        }
      });
      cmd.on('error', (err) => {
        this.logger(err, "ERROR");
        throw new Error(`Child Process exited with error :  ${err}`);
        //this.terminate(1);
      });
      if (cmd.stdin) {
        process.stdin.pipe(cmd.stdin);
      }
    } catch (e) {
      this.logger(e, "ERROR");
      throw e;
    }
    return cmd;
  }

  spawnSync(command, args, options) {
    let cmd = null;
    try {
      cmd = spawnSync(command, args, options);
      if (cmd.error) {
        throw cmd.error;
      }
      if (cmd.stderr) {
        this.logger(cmd.stderr.toString(), "ERROR");
      }
      if (cmd.stdout) {
        this.logger(cmd.stdout.toString(), "INFO");
      }
    } catch (e) {
      this.logger(e, "ERROR");
      throw e;
    }
    return cmd;
  }
}

nodefony.niceBytes = CLI.niceBytes;
nodefony.cli = CLI;
module.exports = CLI;