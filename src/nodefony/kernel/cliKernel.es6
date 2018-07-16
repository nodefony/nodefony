const simpleGit = require('simple-git');
const npm = require("npm");

module.exports = nodefony.register("cliKernel", function () {

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
    colWidths: [8, 45, 120],
    chars: charsTable,
    style: styleTable
  };
  const optionsTitleTables = {
    colWidths: [100],
    chars: charsTable,
    style: styleTable
  };

  let createAssetDirectory = function (myPath, callback) {
    this.logger("INSTALL ASSETS LINK IN WEB PUBLIC DIRECTORY  : " + myPath, "DEBUG");
    try {
      if (fs.existsSync(myPath)) {
        return callback(fs.statSync(myPath));
      }
      throw new Error(myPath + " don' exist");
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
    let srcpath = null;
    for (let bundle in bundles) {
      try {
        result = bundles[bundle].getPublicDirectory();
      } catch (e) {
        this.logger(e, "ERROR");
      }
      if (result.length()) {
        name = bundles[bundle].bundleName;
        srcpath = path.resolve(bundles[bundle].path, "Resources", "public");
        this.createSymlink(srcpath, path.resolve(this.publicPath, name), (Srcpath, dstpath) => {
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
      this.classCommand = {};
      this.commands = {
        nodefony: {}
      };
      this.args = [];
      this.command = "";
      this.task = "";
      this.action = "";
      this.publicPath = null;
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

    /*parseCommand(argv) {
      let res = super.parseCommand(argv);
      //this.parseNodefonyCommand();
      return res;
    }*/

    showBanner(data) {
      if (this.commander && this.commander.json) {
        return;
      }
      return super.showBanner(data);
    }

    /**
     * PARSER
     * command:task:action
     */
    parseNodefonyCommand(cmd, args) {
      this.pattern = null;
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
            continue;
          }
        }
      }
      /*this.commander.on('--help', (...args) => {
        console.log(args)
      });*/
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

    checkReturnPromise(value) {
      if (value && nodefony.isPromise(value)) {
        if (this.kernel) {
          this.kernel.promise = value;
        }
        return value;
      } else {
        return value;
      }
    }
    checkReturnValue(value) {
      if (value instanceof Error) {
        this.logger(value, "ERROR");
        process.nextTick(() => {
          return this.terminate(value.code || 1);
        });
      }
      process.nextTick(() => {
        //return this.terminate(0);
      });
    }

    matchCommand() {
      this.logger(`Parse command : ${this.command}:${this.task}:${this.action}`);
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
                        this.logger(`${this.command}:${this.task} ${this.args}`);
                        return myAction.apply(myCommand, this.args);
                      })
                      .catch((e) => {
                        return Promise.reject(e);
                      });
                  } catch (e) {
                    myCommand.logger(e, "ERROR");
                    return this.terminate(1);
                  }
                }
              }
              if (Object.keys(this.commands[bundle][this.command].tasks).length) {
                let myCommand = this.commands[bundle][this.command];
                if (this.task in myCommand.tasks) {
                  if (this.action) {
                    let myTask = myCommand.tasks[this.task];
                    if (myTask[this.action]) {
                      let myAction = myTask[this.action];
                      try {
                        return myTask.showBanner()
                          .then(() => {
                            this.logger(`${this.command}:${this.task}:${this.action} ${this.args}`);
                            return myAction.apply(myCommand.tasks[this.task], this.args);
                          })
                          .catch((e) => {
                            myTask.logger(e, "ERROR");
                            return this.terminate(1);
                          });
                      } catch (e) {
                        myTask.logger(e, "ERROR");
                        return this.terminate(1);
                      }
                    } else {
                      myTask.showHelp();
                      return this.terminate(0);
                    }
                  } else {
                    myCommand.showHelp();
                    return this.terminate(0);
                  }
                } else {
                  myCommand.showHelp();
                  return this.terminate(0);
                }
              } else {
                break;
              }
            } else {
              continue;
            }
          } else {
            continue;
          }
        }
        try {
          return require(path.resolve(this.command));
        } catch (e) {
          this.showHelp();
          throw new Error(`Command : ${this.command}:${this.task}:${this.action} Not Found`);
        }
      } else {
        this.showHelp();
      }
      return this.terminate(0);
    }

    setHelp(info, command, descrption, options) {
      this.displayTable([
        [info, this.clc.green(command), descrption]
      ], options ||  this.optionsTables);
    }

    setTitleHelp(title, options) {
      this.displayTable([
        [title, "", ""]
      ], options ||  this.optionsTitleTables);
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
      this.terminate(0);
    }

    logger(pci, severity, msgid, msg) {
      try {
        if (!msgid) {
          msgid = "SERVICE CLI KERNEL";
        }
        return super.logger(pci, severity, msgid, msg);
      } catch (e) {
        console.log(e, "\n", pci);
      }
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
        let myPath = dir + files[i];
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
        res = fs.symlink(srcpath, dstpath, (e) => {
          if (!e || (e && e.code === 'EEXIST')) {
            callback(srcpath, dstpath);
          } else {
            this.logger(e, "ERROR");
          }
        });
        callback(srcpath, dstpath);
      } catch (e) {
        this.logger("FILE :" + srcpath + " not exist: " + e, "ERROR");
      }
    }

    listPackage(myPath) {
      let tab = [];
      let mypromise = [];
      try {
        if (myPath) {
          mypromise.push(this.npmList(myPath, tab));
        }
      } catch (e) {
        throw e;
      }
      for (let bundle in this.kernel.bundles) {
        if ((!this.kernel.isCore) && this.kernel.isBundleCore(bundle)) {
          continue;
        }
        mypromise.push(this.npmList(this.kernel.bundles[bundle].path, tab));
      }
      return Promise.all(mypromise)
        .then((ele) => {
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
          //this.terminate(0);
        }).catch((error) => {
          this.logger(error, "ERROR");
          return error;
        });
    }

    npmList(myPath, ele = []) {
      return new Promise((resolve, reject) => {
        try {
          shell.cd(myPath);
        } catch (e) {
          reject(e);
        }
        let conf = null;
        let config = null;
        try {
          config = path.resolve(myPath, "package.json");
          conf = require(config);
        } catch (e) {
          this.logger("NPM NODEFONY PACKAGES package.json not find in : " + myPath, "INFO");
          shell.cd(this.kernel.rootDir);
          return resolve(ele);
        }
        this.logger("NPM NODEFONY PACKAGES :" + config, "INFO");
        npm.load(conf, (error, event) => {
          if (error) {
            shell.cd(this.kernel.rootDir);
            return reject(error);
          }
          event.config.localPrefix = myPath;
          event.config.globalPrefix = this.rootDir;
          event.localPrefix = myPath;
          event.globalPrefix = this.rootDir;
          npm.commands.ls([], true, (error, data) => {
            if (error) {
              shell.cd(this.kernel.rootDir);
              return reject(error);
            }
            try {
              for (var pack in data.dependencies) {
                if (data.dependencies[pack].name) {
                  let where = "";
                  if (data.dependencies[pack]._where) {
                    where = path.basename(data.dependencies[pack]._where) || "";
                  }
                  ele.push([
                    data.dependencies[pack].name,
                    data.dependencies[pack].version,
                    data.dependencies[pack].description ||  "",
                    where
                  ]);
                }
              }
            } catch (e) {
              shell.cd(this.kernel.rootDir);
              return reject(e);
            }
            shell.cd(this.kernel.rootDir);
            return resolve(ele);
          });
        });
      });
    }

    installPackage(bundle, env) {
      try {
        if (bundle instanceof nodefony.Bundle) {
          return this.npmInstall(bundle.path, null, env);
        }
        if (bundle instanceof nodefony.fileClass) {
          return this.npmInstall(bundle.dirName, null, env);
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

    outdatedPackage(bundle) {
      try {
        if (bundle instanceof nodefony.Bundle) {
          return this.npmOutdated(bundle.path, null);
          /*.catch(e => {
            console.log(e)
            return e;
          });*/
        }
        if (bundle instanceof nodefony.fileClass) {
          return this.npmOutdated(bundle.dirName, null);
          /*.catch(e => {
            console.log(e)
            return e;
          });*/
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

    /*readGeneratedConfig() {
      let exist = null;
      try {
        exist = fs.existsSync(this.generateConfigPath);
        if (exist) {
          try {
            let yml = yaml.load(fs.readFileSync(this.generateConfigPath, 'utf8'));
            this.checkBundlesExist(yml, "Generated Config", this.generateConfigPath, true);
            return yml;
          } catch (e) {
            throw e;
          }
        } else {
          return null;
        }
      } catch (e) {
        //console.trace(e);
        //this.logger(e, "ERROR");
        throw e;
      }
    }
    getConfigBunbles() {
      let config = [];
      this.checkBundlesExist(this.settings, "Kernel Config", this.configPath);
      try {
        for (let bundle in this.settings.system.bundles) {
          config.push(this.settings.system.bundles[bundle]);
        }
      } catch (e) {
        throw e;
      }
      return config;
    }

    checkBundlesExist(yml, nameConfig, pathConfig, remove) {
      let exist = null;
      if (yml && yml.system && yml.system.bundles) {
        for (let bundle in yml.system.bundles) {
          try {
            exist = nodefony.require(yml.system.bundles[bundle]);
          } catch (e) {
            //this.logger(e, "WARNING");
          }
          if (!exist) {
            try {
              exist = fs.existsSync(path.resolve(this.rootDir, yml.system.bundles[bundle]));
            } catch (e) {
              this.logger(e, "WARNING");
            }
          }
          if (!exist) {
            delete yml.system.bundles[bundle];
            if (remove) {
              try {
                fs.writeFileSync(pathConfig, yaml.safeDump(yml), {
                  encoding: 'utf8'
                });
                this.logger(nameConfig + " : " + bundle + " Bundle don't exist in file : " + pathConfig, "WARNING");
                this.logger("Update Config  : " + pathConfig);
              } catch (e) {
                this.logger(e, "ERROR");
              }
            } else {
              let error = new Error(nameConfig + " : " + bundle + " Bundle don't exist in file : " + pathConfig);
              this.logger(error, "ERROR");
              this.logger("Config file : " + pathConfig);
              this.logger(yml.system.bundles);
            }
            try {
              let link = path.resolve(this.publicPath, bundle);
              let stat = fs.lstatSync(link);
              if (stat) {
                exist = fs.existsSync(fs.readlinkSync(link));
                if (!exist) {
                  fs.unlinkSync(link);
                  this.logger("REMOVE LINK : " + link);
                }
              }
            } catch (e) {}
          }
        }
      }
    }*/

    listenRejection() {
      process.on('rejectionHandled', (promise) => {
        this.logger("PROMISE REJECTION EVENT ", "CRITIC");
        this.unhandledRejections.delete(promise);
      });
      process.on('unhandledRejection', (reason, promise) => {
        this.logger("WARNING  !!! PROMISE CHAIN BREAKING : " + reason, "WARNING");
        this.unhandledRejections.set(promise, reason);
        if (this.kernel.type === "SERVER") {
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
  return cliKernel;
});