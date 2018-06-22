const simpleGit = require('simple-git');
const npm = require("npm");

module.exports = nodefony.register("cliKernel", function () {

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
  /*
   *
   *  CLI KERNEL
   *
   */
  class cliKernel extends nodefony.cli {

    constructor(name, container, notificationsCenter, options) {
      super(name, container, notificationsCenter, options);
      this.publicPath = this.kernel.publicPath; //path.resolve("web"); //this.kernel.rootDir + "/web/";
      this.commands = {};
      this.classCommand = {};
      this.parse = this.commander.args || []; //super.parseCommand();
      this.args =   [];
      this.command = null;
      this.task = null;
      this.action = null;
      this.parseCommand();
    }

    /*loadCommand() {
      switch (this.commander.args[0]) {
      case "npm:install":
        return true;
      case "npm:list":
        this.on("onBoot", () => {
          this.listPackage(this.kernel.rootDir);
        });
        return true;
      }
      this.stop = false;
      for (let bundle in this.kernel.bundles) {
        this.kernel.bundles[bundle].registerCommand(this.commands);
      }
      this.bundles = {};
      for (let bundle in this.commands) {
        if (!this.bundles[bundle]) {
          var name = this.clc.cyan(bundle) + " \n";
          this.bundles[bundle] = {
            name: name,
            task: []
          };
        }
        let commands = this.commands[bundle];
        for (var cmd in commands) {
          let command = commands[cmd].prototype.commands;
          for (var task in command) {
            this.bundles[bundle].task.push(command[task]);
          }
        }
      }
      this.commander.on('--help', () => {
        console.log(this.showHelp.call(this, this.bundles, ""));
        this.terminate();
      });
      return this.stop;
    }*/

    /**
     * PARSER
     * command:task:action
     */
    parseCommand() {
      if (this.parse.length) {
        this.pattern = this.parse[0].split(":");
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
        this.args = this.parse[1];
      }
    }

    loadCommand() {
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
          } catch (e) {
            this.logger(e, "ERROR");
            continue;
          }
        }
      }
      /*this.commander.on('--help', () => {
        this.terminate();
      });*/
    }

    matchCommand() {
      if (this.parse.length) {
        for (let bundle in this.commands) {
          if (Object.keys(this.commands[bundle]).length) {
            if (this.command in this.commands[bundle]) {
              let myCommand = this.commands[bundle][this.command];
              if (!this.action) {
                if (myCommand[this.task]) {
                  let myAction = myCommand[this.task];
                  try {
                    myCommand.showBanner();
                    this.logger(`${this.command}:${this.task}`);
                    return myAction.apply(myCommand, this.args);
                  } catch (e) {
                    return myCommand.logger(e, "ERROR");
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
                        myTask.showBanner();
                        this.logger(`${this.command}:${this.task}:${this.action}`);
                        return myAction.apply(myCommand.tasks[this.task], this.args);
                      } catch (e) {
                        return myTask.logger(e, "ERROR");
                      }
                    } else {
                      return myTask.showHelp();
                    }
                  } else {
                    return myCommand.showHelp();
                  }
                } else {
                  return myCommand.showHelp();
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
          this.logger(e, "ERROR");
        }
      } else {
        this.showHelp();
      }
      return;
    }

    showHelp() {
      //super.showHelp();
      this.blankLine();
      console.log(`${this.clc.cyan("nodefony")} Commands : Usage   nodefony [options] <cmd> [args ...]

\t${this.clc.green("dev")}                 Run Nodefony Development Server
\t${this.clc.green("prod")}                Run Nodefony Preprod Server
\t${this.clc.green("pm2")}                 Run Nodefony Production Server ( PM2 mode )
\t${this.clc.green("npm:install")}         Install all NPM framework packages
\t${this.clc.green("npm:list")}            List all NPM installed packages

${this.clc.cyan("Bundles")} Commands : Usage   nodefony [options] <command:task:action> [args ...]
`);
      for (let bundle in this.commands) {
        if (Object.keys(this.commands[bundle]).length) {
          console.log(`  ${this.clc.cyan(bundle)}`);
        } else {
          continue;
        }
        for (let command in this.commands[bundle]) {
          this.commands[bundle][command].showHelp();
        }
      }
    }


    /*matchCommand() {
      this.cliParse = this.commander.args;
      let ret = null;
      let err = null;
      if (this.cliParse.length) {
        var ele = this.cliParse[0].split(":");
        if (ele.length) {
          let cmd = ele[0];
          for (let bundle in this.commands) {
            if (cmd in this.commands[bundle]) {
              let worker = this.commands[bundle][cmd];
              if (worker) {
                try {
                  ret = new worker(this.container, this.cliParse, {
                    processName: cmd,
                    asciify: true,
                    clear: true,
                    signals: false,
                    autoLogger: false,
                    promiseRejection: false
                  });
                } catch (e) {
                  throw e;
                }
              } else {
                this.showHelp();
                throw new Error("Worker : ") + cmd + " not exist";
              }
              return ret;
            }
          }
          try {
            return require(path.resolve(this.cliParse[0]));
          } catch (e) {
            this.logger(e, "ERROR");
          }
          err = new Error("COMMAND : " + this.cliParse[0] + " not exist");
        } else {
          err = new Error("BAD FORMAT ARGV : " + this.cliParse[0]);
        }
      }
      this.showHelp();
      if (err) {
        this.logger(err, "ERROR");
      }
      return;
    }*/

    /*showHelp() {
      return super.showHelp();
    }*/
    /*showHelp(obj, str) {
      this.blankLine();
      str += "\n  Bundles Commands : " + "\n\n";
      str += this.clc.cyan("nodefony") + " \n";
      str += this.clc.green("\tdev") + "                  Run Nodefony Development Server  \n";
      str += this.clc.green("\tprod") + "                  Run Nodefony Preprod Server \n";
      str += this.clc.green("\tpm2") + "                  Run Nodefony Production Server ( PM2 mode ) \n";
      str += this.clc.green("\tnpm:install") + "               Install all NPM framework packages\n";
      str += this.clc.green("\tnpm:list") + "               List all NPM installed packages \n";
      for (var ele in obj) {
        if (obj[ele].name) {
          str += obj[ele].name;
        }
        for (var cmd in obj[ele].task) {
          str += this.clc.green("\t" + obj[ele].task[cmd][0]);
          let length = obj[ele].task[cmd][0].length;
          let size = 65 - length;
          for (let i = 0; i < size; i++) {
            str += " ";
          }
          str += obj[ele].task[cmd][1] + "\n";
        }
      }
      return str;
    }*/

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
      let mypromise = null;
      try {
        mypromise = this.npmList(myPath, tab);
      } catch (e) {
        throw e;
      }
      for (let bundle in this.kernel.bundles) {
        //if (this.kernel.isBundleCore(bundle) ) {
        //  continue;
        //}
        mypromise.then(this.npmList(this.kernel.bundles[bundle].path, tab));
      }
      return mypromise.then((ele) => {
        let headers = [
          "NAME",
          "VERSION",
          "DESCRIPTION",
          "BUNDLES"
        ];
        this.displayTable(ele, {
          head: headers,
          colWidths: [30, 10, 100, 20]
        });
        this.terminate(0);
      }).catch((error) => {
        this.logger(error, "ERROR");
        this.terminate(1);
      });
    }

    npmList(myPath, ele) {
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
                  ele.push([
                    data.dependencies[pack].name,
                    data.dependencies[pack].version,
                    data.dependencies[pack].description ||  "",
                    path.basename(data.dependencies[pack]._where) || ""
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

    installPackage(name, file, env) {
      try {
        if (file instanceof nodefony.fileClass) {
          file = new nodefony.fileClass(file.dirName + "/package.json");
        } else {
          file = new nodefony.fileClass(path.dirname(file) + "/package.json");
        }
        return this.npmInstall(file.dirName, null, env);
      } catch (e) {
        if (e.code !== "ENOENT") {
          this.logger("Install Package BUNDLE : " + name + ":", "ERROR");
          this.logger(e, "ERROR");
          throw e;
        }
        throw e;
      }
    }

    // installPackage(name, file, env) {
    //   if (env === "development" || env === "production") {
    //     process.env.NODE_ENV = env;
    //   } else {
    //     process.env.NODE_ENV = "development";
    //   }
    //   try {
    //     let conf = new nodefony.fileClass(file.dirName + "/package.json");
    //     let config = require(conf.path);
    //     shell.cd(file.dirName);
    //     npm.load(config, (error, event) => {
    //       if (error) {
    //         this.logger(error, "ERROR");
    //         this.terminate(1);
    //       }
    //       event.config.localPrefix = file.dirName;
    //       event.config.globalPrefix = this.kernel.rootDir;
    //       event.localPrefix = file.dirName;
    //       event.globalPrefix = this.kernel.rootDir;
    //       //npm.config.set('localPrefix', file.dirName);
    //       //npm.config.set('globalPrefix', this.rootDir);
    //       let tab = [];
    //       this.logger("NPM :" + npm.version + " Installing Dependencies for bundle : " + file.shortName);
    //       for (let dep in config.dependencies) {
    //         let mypackage = dep + "@" + config.dependencies[dep];
    //         this.logger("\t Dependency : " + mypackage);
    //         try {
    //           require.resolve(dep);
    //         } catch (e) {
    //           this.logger("\t Dependency : " + mypackage);
    //           tab.push(mypackage);
    //         }
    //       }
    //       if (process.env.NODE_ENV === "development") {
    //         for (let dep in config.devDependencies) {
    //           let mypackage = dep + "@" + config.devDependencies[dep];
    //           this.logger("\t Dependency dev : " + mypackage);
    //           try {
    //             require.resolve(dep);
    //           } catch (e) {
    //             tab.push(mypackage);
    //           }
    //         }
    //       }
    //       if (tab.length) {
    //         event.commands.install(tab, (err /*, data*/ ) => {
    //           if (err) {
    //             this.logger("NPM :" + npm.version + " Installing Dependencies for bundle : " + file.shortName, "ERROR");
    //             this.logger(err, "ERROR");
    //           }
    //         });
    //       }
    //     });
    //   } catch (e) {
    //     if (e.code !== "ENOENT") {
    //       this.logger("Install Package BUNDLE : " + name + ":" + e, "ERROR");
    //       shell.cd(this.kernel.rootDir);
    //       throw e;
    //     }
    //   }
    //   shell.cd(this.kernel.rootDir);
    // }

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
      return nodefony.cli.quit(code);
    }
  }
  return cliKernel;
});