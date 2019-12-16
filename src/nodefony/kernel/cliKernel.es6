const simpleGit = require('simple-git');
const npm = require("npm");

const charsTable = {
  'top': '',
  'top-mid': '',
  'top-left': '',
  'top-right': '',
  'bottom': '',
  'bottom-mid': '',
  'bottom-left': '',
  'bottom-right': '',
  'left': '',
  'left-mid': '',
  'mid': '',
  'mid-mid': '',
  'right': '',
  'right-mid': '',
  'middle': ' '
};
const styleTable = {
  'padding-left': 0,
  'padding-right': 0
};
const optionsTaskTables = {
  colWidths: [8, 55, 120],
  chars: charsTable,
  style: styleTable
};
const optionsTitleTables = {
  colWidths: [100],
  chars: charsTable,
  style: styleTable
};

let createAssetDirectory = function (myPath, callback) {
  try {
    if (fs.existsSync(myPath)) {
      return callback(fs.statSync(myPath));
    }
    throw new Error(myPath + " don't exist");
  } catch (e) {

    this.logger("Create directory : " + myPath);
    fs.mkdir(myPath, (e) => {
      if (!e || (e && e.code === 'EEXIST')) {
        callback(fs.statSync(myPath));
      } else {
        this.logger(e, "ERROR");
      }
    });
  }
};

let parseAssetsBundles = function (table) {
  let bundles = this.kernel.getBundles();
  let result = null;
  let name = null;
  for (let bundle in bundles) {
    try {
      result = bundles[bundle].getPublicDirectory();
    } catch (e) {
      this.logger(e, "ERROR");
    }
    if (result && result.length()) {
      name = bundles[bundle].bundleName;
      try {
        let file = new nodefony.fileClass(bundles[bundle].publicPath);
        this.createSymlink(file.path, path.resolve(this.publicPath, name), (Srcpath, dstpath) => {
          let size = "not Defined";
          let sizeAssets = "not Defined";
          try {
            size = nodefony.niceBytes(this.getSizeDirectory(Srcpath, /^docs$|^tests|^node_modules|^assets$/));
            sizeAssets = nodefony.niceBytes(this.getSizeDirectory(path.resolve(Srcpath, "assets")));
          } catch (e) {
            //this.logger(e, "ERROR");
          }
          table.push([
              bundle,
              dstpath.replace(this.kernel.rootDir, "."),
              Srcpath.replace(this.kernel.rootDir, "."),
              size,
              sizeAssets
            ]);
        });
      } catch (e) {
        this.logger(e, "DEBUG");
      }
    }
  }
  try {
    this.logger("INSTALL LINK IN /web TOTAL SIZE : " + nodefony.niceBytes(this.getSizeDirectory(this.publicPath, /^docs$|^tests|^node_modules|^assets$/)), "DEBUG");
  } catch (e) {
    this.logger(e, "WARNING");
  }
};

const regHidden = /^\./;
const isHiddenFile = function (name) {
  return regHidden.test(name);
};
const defaultOptions = {
  type: "CONSOLE"
};
/*
 *
 *  CLI KERNEL
 *
 */
class cliKernel extends nodefony.cli {

  constructor(name, container, notificationsCenter, options) {
    super(name, container, notificationsCenter, nodefony.extend(defaultOptions, options));
    this.type = this.options.type;
    this.optionsTables = optionsTaskTables;
    this.optionsTitleTables = optionsTitleTables;
    this.yarnVersion = nodefony.checkYarnVersion();
    this.npmVersion = nodefony.checkNpmVersion();
    this.classCommand = {};
    this.commands = {
      nodefony: {}
    };
    this.args = [];
    this.command = "";
    this.task = "";
    this.action = "";
    this.publicPath = null;
    this.keepAlive = false;
    switch (nodefony.packageManager) {
    case 'yarn':
      this.packageManager = this.yarn;
      break;
    default:
      this.packageManager = this.npm;
    }
    this.parseNodefonyCommand();
  }

  setKernel(kernel) {
    this.kernel = kernel;
    if (this.kernel) {
      this.publicPath = this.kernel.publicPath;
      if (this.kernel.console) {
        try {
          this.loadNodefonyCommand();
        } catch (e) {
          throw e;
        }
      }
    }
  }

  setType(type) {
    switch (type) {
    case "console":
    case "CONSOLE":
      this.type = "CONSOLE";
      break;
    case "server":
    case "SERVER":
      this.type = "SERVER";
      break;
    default:
      throw new Error(`cliKernel Bad Type : ${type}`);
    }
  }

  showBanner(data) {
    if (this.commander && this.commander.json) {
      return;
    }
    return super.showBanner(data);
  }

  async showAsciify(name = null) {
    if (this.commander && this.commander.json) {
      return Promise.resolve();
    }
    return await super.showAsciify(name);
  }

  clearNodefonyCommand() {
    this.pattern = null;
    this.command = null;
    this.task = null;
    this.action = null;
  }

  /**
   * PARSER
   * command:task:action
   */
  parseNodefonyCommand(cmd, args) {
    this.clearNodefonyCommand();
    if (cmd) {
      this.pattern = cmd.split(":");
      if (args) {
        this.args = args;
      }
    } else {
      if (this.commander.args && this.commander.args.length) {
        this.pattern = this.commander.args[0].split(":");
        if (this.commander.args[1]) {
          this.args = this.commander.args[1];
        }
      }
    }
    if (this.pattern) {
      if (!this.pattern.length) {
        return;
      }
      if (this.pattern[0]) {
        this.command = this.pattern[0];
      }
      if (this.pattern[1]) {
        this.task = this.pattern[1];
      }
      if (this.pattern[2]) {
        this.action = this.pattern[2];
      }
    }
  }

  loadNodefonyCommand() {
    if (!this.commands) {
      this.commands = {};
    }
    if (!this.commands.nodefony) {
      this.commands.nodefony = {};
    }
    for (let cmd in nodefony.commands) {
      try {
        let instance = new nodefony.commands[cmd](this, this.kernel);
        this.commands.nodefony[instance.name] = instance;
        if (this.commander.debug) {
          this.logger(`Register Command ${instance.name}`, "DEBUG", `Nodefony`);
        }
      } catch (e) {
        this.logger(e, "ERROR");
        continue;
      }
    }
  }

  loadCommand() {
    return new Promise((resolve, reject) => {
      let error = [];
      if (!this.commands) {
        this.commands = {};
      }
      for (let bundle in this.kernel.bundles) {
        if (!this.commands[bundle]) {
          this.commands[bundle] = {};
        }
        if (!this.classCommand[bundle]) {
          this.classCommand[bundle] = [];
        }
        try {
          this.kernel.bundles[bundle].registerCommand(this.classCommand[bundle]);
        } catch (e) {
          error.push(e);
          this.logger(e, "ERROR");
          continue;
        }
        for (let i = 0; i < this.classCommand[bundle].length; i++) {
          try {
            let instance = new this.classCommand[bundle][i](this, this.kernel.bundles[bundle]);
            this.commands[bundle][instance.name] = instance;
            if (this.commander.debug) {
              this.logger(`Register Command ${instance.name}`, "DEBUG", `Bundle ${bundle}`);
            }
          } catch (e) {
            this.logger(e, "ERROR");
            error.push(e);
            continue;
          }
        }
      }
      if (error.length) {
        return reject(error);
      }
      return resolve(this.commands);
    });
  }

  getCommand(command, bundle = null) {
    let commands = [];
    if (!command) {
      throw new Error("getCommand Bad command argument");
    }
    if (bundle) {
      if (!this.commands[bundle]) {
        throw new Error(`getCommand command : ${command}  Bundle : ${bundle} don't exist`);
      } else {
        if (this.commands[bundle][command]) {
          return this.commands[bundle][command];
        } else {
          throw new Error(`getCommand command : ${command}  don't exist in Bundle ${bundle}`);
        }
      }
    } else {
      for (let bundle in this.commands) {
        if (this.commands[bundle][command]) {
          commands.push(this.commands[bundle][command]);
        } else {
          continue;
        }
      }
    }
    return commands;
  }

  logCommand() {
    let txt = "";
    if (this.command) {
      if (this.task) {
        if (this.action) {
          if (this.args.length) {
            txt = `${this.command}:${this.task}:${this.action} ${this.args}`;
          } else {
            txt = `${this.command}:${this.task}:${this.action}`;
          }
        } else {
          if (this.args.length) {
            txt = `${this.command}:${this.task} ${this.args}`;
          } else {
            txt = `${this.command}:${this.task}`;
          }
        }
      } else {
        if (this.args.length) {
          txt = `${this.command}: ${this.args}`;
        } else {
          txt = `${this.command}`;
        }
      }
    } else {
      if (this.args.length) {
        txt = `${this.args}`;
      }
    }
    return txt;
    //this.logger(txt, "INFO", "COMMAND");
  }

  matchCommand() {
    if (this.command) {
      for (let bundle in this.commands) {
        if (Object.keys(this.commands[bundle]).length) {
          if (this.command in this.commands[bundle]) {
            let myCommand = this.commands[bundle][this.command];
            if (!this.action) {
              if (myCommand[this.task]) {
                let myAction = myCommand[this.task];
                try {
                  return myCommand.showBanner()
                    .then(() => {
                      this.logger(this.logCommand(), "INFO", "COMMAND");
                      return myAction.apply(myCommand, this.args);
                    })
                    .catch((e) => {
                      return Promise.reject(e);
                    });
                } catch (e) {
                  //myCommand.logger(e, "ERROR");
                  return Promise.reject(e);
                }
              }
            }
            if (Object.keys(this.commands[bundle][this.command].tasks).length) {
              let myCommand = this.commands[bundle][this.command];
              if (this.task in myCommand.tasks) {
                let myTask = myCommand.tasks[this.task];
                if (this.action) {
                  if (myTask[this.action]) {
                    let myAction = myTask[this.action];
                    try {
                      return myTask.showBanner()
                        .then(() => {
                          this.logger(this.logCommand(), "INFO", "COMMAND");
                          return myAction.apply(myCommand.tasks[this.task], this.args);
                        })
                        .catch((e) => {
                          //myTask.logger(e, "ERROR");
                          return Promise.reject(e);
                        });
                    } catch (e) {
                      //myTask.logger(e, "ERROR");
                      return Promise.reject(e);
                    }
                  } else {
                    myTask.showHelp();
                    let error = new Error(this.logCommand() + " Action Not Found");
                    this.logger(error, "ERROR", "COMMAND");
                    return Promise.reject(error);
                  }
                } else {
                  // hook run
                  return myTask.showBanner()
                    .then(() => {
                      this.logger(this.logCommand(), "INFO", "COMMAND");
                      return myTask.run.call(myCommand.tasks[this.task], this.args);
                    })
                    .catch((e) => {
                      //myTask.logger(e, "ERROR");
                      myTask.showHelp();
                      return Promise.reject(e);
                    });
                }
              } else {
                myCommand.showHelp();
                let error = new Error(this.logCommand() + " Task Not Found");
                this.logger(error, "ERROR", "COMMAND");
                return Promise.reject(error);
              }
            } else {
              continue;
            }
          } else {
            continue;
          }
        } else {
          continue;
        }
      }
      try {
        let res = require(path.resolve(this.command));
        if (typeof res === "function" && res.name === "appKernel") {
          this.keepAlive = true;
          this.parseNodefonyCommand();
          return nodefony.start("prod", this.args, this);
        }
        return res;
      } catch (e) {
        this.showHelp();
        if (this.command !== "help") {
          throw new Error(`Command : ${this.command}:${this.task}:${this.action} Not Found`);
        }
      }
    } else {
      this.showHelp();
    }
    return this.terminate(0);
  }

  setHelp(info, command, descrption, options) {
    this.displayTable([
        [info, this.clc.green(command), descrption]
      ], options || this.optionsTables);
  }

  setTitleHelp(title, options) {
    this.displayTable([
        [title, "", ""]
      ], options || this.optionsTitleTables);
  }

  showHelp() {
    super.showHelp();
    this.blankLine();
    if (nodefony.isTrunk) {
      nodefony.showHelp(this);
    }
    if (this.commands) {
      for (let cmd in this.commands.nodefony) {
        this.commands.nodefony[cmd].showHelp();
      }
    }
    if (nodefony.isTrunk) {
      this.setTitleHelp(`${this.clc.cyan("Bundles")}`);
    }
    for (let bundle in this.commands) {
      if (bundle === "nodefony") {
        continue;
      }
      if (Object.keys(this.commands[bundle]).length) {
        this.setTitleHelp(`  ${this.clc.cyan(bundle)}`);
      } else {
        continue;
      }
      for (let command in this.commands[bundle]) {
        this.commands[bundle][command].showHelp();
      }
    }
    //this.terminate(0);
  }

  getSimpleGit(gitPath) {
    if (gitPath) {
      return simpleGit(gitPath);
    }
    return simpleGit;
  }

  setGitPath(gitPath) {
    this.git = this.getSimpleGit(gitPath);
    return this.git;
  }

  listenSyslog(syslog, debug) {
    if (!this.kernel) {
      return super.listenSyslog(syslog, debug);
    }
    if (this.commander.json) {
      return;
    }
    if (!syslog) {
      syslog = this.syslog;
    }
    // CRITIC ERROR
    syslog.listenWithConditions(this, {
      severity: {
        data: "CRITIC,ERROR"
      }
    }, (pdu) => {
      return this.normalizeLog(pdu);
    });
    // INFO DEBUG
    let data = null;
    if (debug) {
      data = "INFO,DEBUG,WARNING";
    } else {
      if (this.kernel.type === "SERVER" && this.kernel.environment === "dev") {
        data = "INFO,WARNING";
      } else {
        data = "INFO";
      }
    }
    syslog.listenWithConditions(this, {
      severity: {
        data: data
      }
    }, (pdu) => {
      return this.normalizeLog(pdu, this.cluster);
    });
  }

  // ASSETS LINK
  assetInstall() {
    let table = this.displayTable(null, {
      head: [
          "BUNDLES",
          "DESTINATION PATH",
          "SOURCE PATH",
          "SIZE",
          "ASSETS COMPILE"
        ]
    });
    this.logger("INSTALL ASSETS LINK IN WEB PUBLIC DIRECTORY  : " + this.publicPath, "DEBUG");
    createAssetDirectory.call(this, this.publicPath, () => {
      parseAssetsBundles.call(this, table);
      this.logger("\n" + table.toString(), "DEBUG");
    });
  }

  getSizeDirectory(dir, exclude) {
    let stat = null;
    try {
      if (exclude) {
        let basename = path.basename(dir);
        if (basename.match(exclude)) {
          return 0;
        }
      }
      stat = fs.lstatSync(dir);
    } catch (e) {
      //this.logger(e, "WARNING");
      return 0;
    }

    let files = null;
    switch (true) {
    case stat.isFile():
      throw new Error(dir + " is not a directory");
    case stat.isDirectory():
      files = fs.readdirSync(dir);
      break;
    case stat.isSymbolicLink():
      files = fs.realpathSync(dir);
      break;
    default:
      throw new Error(dir + " is not a directory");
    }
    let totalSizeBytes = 0;
    let dirSize = null;
    for (let i = 0; i < files.length; i++) {
      let myPath = `${dir}/${files[i]}`;
      try {
        stat = fs.lstatSync(myPath);
      } catch (e) {
        return totalSizeBytes;
      }
      switch (true) {
      case stat.isFile():
        if (!isHiddenFile(files[i])) {
          totalSizeBytes += stat.size;
        }
        break;
      case stat.isDirectory():
        dirSize = this.getSizeDirectory(myPath, exclude);
        totalSizeBytes += dirSize;
        break;
      case stat.isSymbolicLink():
        //console.log("isSymbolicLink")
        try {
          dirSize = this.getSizeDirectory(fs.realpathSync(myPath), exclude);
          totalSizeBytes += dirSize;
        } catch (e) {}
        break;
      }
    }
    return totalSizeBytes;
  }

  createSymlink(srcpath, dstpath, callback) {
    let res = null;
    try {
      res = fs.statSync(srcpath);
      try {
        // LINK
        res = fs.lstatSync(dstpath);
        if (res) {
          fs.unlinkSync(dstpath);
        }
      } catch (e) {
        //console.log("PASS CATCH")
        //console.log(e ,"ERROR")
      }
      //console.log(srcpath+" : "+ dstpath);
      res = shell.ln("-sf", srcpath, dstpath);
      return callback(srcpath, dstpath);
      /*res = fs.symlink(srcpath, dstpath, (e) => {
        if (!e || (e && e.code === 'EEXIST')) {
          callback(srcpath, dstpath);
        } else {
          this.logger(e, "ERROR");
        }
      });
      callback(srcpath, dstpath);*/
    } catch (e) {
      this.logger("FILE :" + srcpath + " not exist: " + e, "ERROR");
    }
  }

  async listPackage(myPath) {
    let tab = [];
    let ele = [];
    try {
      if (myPath) {
        ele.push(await this.npmList(myPath, tab));
      }
    } catch (e) {
      throw e;
    }
    for (let bundle in this.kernel.bundles) {
      if ((!this.kernel.isCore) && this.kernel.isBundleCore(bundle)) {
        continue;
      }
      ele.push(await this.npmList(this.kernel.bundles[bundle].path, tab));
    }
    let headers = [
        "NAME",
        "VERSION",
        "DESCRIPTION",
        "BUNDLES"
      ];
    this.displayTable(ele[0], {
      head: headers,
      colWidths: [30, 10, 100, 20]
    });
    return ele;
  }

  async npmList(cwd = path.resolve("."), ele = []) {
    return new Promise((resolve, reject) => {
      try {
        this.cd(cwd);
      } catch (e) {
        return reject(e);
      }
      let conf = null;
      let config = null;
      try {
        config = path.resolve(cwd, "package.json");
        conf = require(config);
      } catch (e) {
        this.logger("NODEFONY PACKAGES package.json not find in : " + cwd, "INFO");
        this.cd(this.kernel.rootDir);
        return resolve(ele);
      }
      this.logger("NODEFONY PACKAGES :" + config, "INFO");
      npm.load(conf, (error, event) => {
        if (error) {
          this.cd(this.kernel.rootDir);
          return reject(error);
        }
        event.config.localPrefix = cwd;
        event.config.globalPrefix = this.rootDir;
        event.localPrefix = cwd;
        event.globalPrefix = this.rootDir;
        npm.commands.ls([], true, (error, data) => {
          if (error) {
            this.cd(this.kernel.rootDir);
            return reject(error);
          }
          try {
            for (let pack in data.dependencies) {
              if (data.dependencies[pack].name) {
                let where = "";
                if (data.dependencies[pack]._where) {
                  where = path.basename(data.dependencies[pack]._where) || "";
                }
                ele.push([
                    data.dependencies[pack].name,
                    data.dependencies[pack].version,
                    data.dependencies[pack].description || "",
                    where || path.basename(cwd)
                  ]);
              }
            }
          } catch (e) {
            this.cd(this.kernel.rootDir);
            return reject(e);
          }
          this.cd(this.kernel.rootDir);
          return resolve(ele);
        });
      });
    });
  }

  async installPackage(bundle, env) {
    try {
      if (bundle instanceof nodefony.Bundle) {
        return await this.packageManager(["install"], bundle.path, env);
      }
      if (bundle instanceof nodefony.fileClass) {
        return await this.packageManager(["install"], bundle.dirName, env);
      }
      throw new Error("installPackage bundle must be an instance of nodefony.Bundle");
    } catch (e) {
      if (e.code !== "ENOENT") {
        this.logger("Install Package BUNDLE : " + bundle.name + ":", "ERROR");
        this.logger(e, "ERROR");
        throw e;
      }
      throw e;
    }
  }

  async rebuildPackage(bundle, env = "development") {
    let cmd = null;
    switch (nodefony.packageManager) {
    case 'yarn':
      cmd = ["install", "--force"];
      break;
    default:
      cmd = ["install"];
    }
    try {
      if (bundle instanceof nodefony.Bundle) {
        this.rm("-rf", path.resolve(bundle.path, "node_modules"));
        return this.packageManager(cmd, bundle.path, env);
      }
      if (bundle instanceof nodefony.fileClass) {
        this.rm("-rf", path.resolve(bundle.dirName, "node_modules"));
        return this.packageManager(cmd, bundle.dirName, env);
      }
      throw new Error("rebuildPackage bundle must be an instance of nodefony.Bundle");
    } catch (e) {
      if (e.code !== "ENOENT") {
        this.logger("rebuild Package BUNDLE : " + bundle.name + ":", "ERROR");
        this.logger(e, "ERROR");
        throw e;
      }
      throw e;
    }
  }

  async outdatedPackage(bundle) {
    try {
      if (bundle instanceof nodefony.Bundle) {
        return await this.packageManager(["outdated"], bundle.path);
      }
      if (bundle instanceof nodefony.fileClass) {
        return await this.packageManager(["outdated"], bundle.dirName);
      }
      throw new Error("Method outdatedPackage bundle must be an instance of nodefony.Bundle");
    } catch (e) {
      if (e.code !== "ENOENT") {
        this.logger("Outdated  Package BUNDLE : " + bundle.name + ":", "ERROR");
        this.logger(e, "ERROR");
        throw e;
      }
      throw e;
    }
  }

  listenRejection() {
    process.on('rejectionHandled', (promise) => {
      this.logger("PROMISE REJECTION EVENT ", "CRITIC");
      this.unhandledRejections.delete(promise);
    });
    process.on('unhandledRejection', (reason, promise) => {
      this.logger("WARNING  !!! PROMISE CHAIN BREAKING : " + reason, "WARNING");
      this.unhandledRejections.set(promise, reason);
      if (this.kernel && this.kernel.type === "SERVER") {
        console.trace(promise);
      }
    });
  }

  terminate(code) {
    if (this.kernel) {
      return this.kernel.terminate(code);
    }
    this.fire("onTerminate", this);
    return nodefony.cli.quit(code);
  }
}

nodefony.cliKernel = cliKernel;
module.exports = cliKernel;