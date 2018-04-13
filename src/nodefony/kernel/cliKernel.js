const spawn = require('child_process').spawn;
const spawnSync = require('child_process').spawnSync;
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

  let parseAssetsBundles = function (table, Name) {
    let bundles = this.kernel.getBundles();
    let result = null;
    let name = null;
    let srcpath = null;
    for (let bundle in bundles) {
      if (Name && Name !== bundle) {
        continue;
      }
      try {
        result = bundles[bundle].getPublicDirectory();
      } catch (e) {
        continue;
      }
      if (result.length()) {
        name = bundles[bundle].bundleName;
        srcpath = path.resolve(bundles[bundle].path, "Resources", "public");
        this.createSymlink(srcpath, this.publicDirectory + name, (Srcpath, dstpath) => {
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
      this.logger("INSTALL LINK IN /web TOTAL SIZE : " + nodefony.niceBytes(this.getSizeDirectory(this.publicDirectory, /^docs$|^tests|^node_modules|^assets$/)), "DEBUG");
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
      this.publicDirectory = this.kernel.rootDir + "/web/";
      this.commands = {};
    }

    loadCommand() {
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
        console.log(this.generateHelp.call(this, this.bundles, ""));
        this.terminate();
      });
      return this.stop;
    }

    matchCommand() {
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
          err = "COMMAND : " + this.cliParse[0] + " not exist";
        } else {
          err = "BAD FORMAT ARGV : " + this.cliParse[0];
        }
      }
      this.showHelp();
      if (err) {
        this.logger(err, "ERROR");
      }
      return;
    }

    showHelp() {
      return super.showHelp();
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
    assetInstall(name) {
      let table = this.displayTable(null, {
        head: [
          "BUNDLES",
          "DESTINATION PATH",
          "SOURCE PATH",
          "SIZE",
          "ASSETS COMPILE"
        ]
      });
      createAssetDirectory.call(this, this.publicDirectory, () => {
        parseAssetsBundles.call(this, table, name);
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
        let myPath = dir + "/" + files[i];
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
          dirSize = this.getSizeDirectory(fs.realpathSync(myPath), exclude);
          totalSizeBytes += dirSize;
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

    createDirectory(myPath, mode, callback, force) {
      let file = null;
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

    existsSync(myPath, mode) {
      if (!myPath) {
        throw new Error("existsSync no path found");
      }
      if (!mode) {
        mode = fs.constants.R_OK | fs.constants.W_OK;
      }
      return fs.accessSync(myPath, mode);
    }

    exists(myPath, mode, callback) {
      if (!myPath) {
        throw new Error("exists no path found");
      }
      if (!mode) {
        mode = fs.constants.R_OK | fs.constants.W_OK;
      }
      return fs.access(myPath, mode, callback);
    }

    spawn(command, args, options, close) {
      let cmd = null;
      try {
        this.logger("Run Spawn : " + command + " " + args.join(" "));
        cmd = spawn(command, args, options || {});

        cmd.stdout.on('data', (data) => {
          let str = data.toString();
          if (str) {
            this.logger(`${command} stdout :  ${str}`);
          }
        });
        cmd.stderr.on('data', (data) => {
          let str = data.toString();
          if (str) {
            this.logger(`${command} stderr :  ${str}`, "INFO");
          }
        });
        cmd.on('close', (code) => {
          this.logger(`child process exited with code ${code}`);
          if (close) {
            close(code);
          }
        });
        cmd.on('error', (err) => {
          this.logger(err, "ERROR");
          this.terminate(1);
        });
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
        if (cmd.output[2].toString()) {
          this.logger(cmd.output[2].toString(), "ERROR");
        } else {
          if (cmd.output[1].toString()) {
            this.logger(cmd.output[1].toString());
          }
        }
      } catch (e) {
        this.logger(e, "ERROR");
        throw e;
      }
      return cmd;
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
        if (bundle + "Bundle" in this.kernel.bundlesCore) {
          continue;
        }
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

    npmInstall(cwd, argv, env) {
      if (env === "development" || env === "production") {
        process.env.NODE_ENV = env;
      } else {
        process.env.NODE_ENV = "development";
      }
      return new Promise((resolve, reject) => {
        let tab = ["install"];
        if (argv) {
          tab = tab.concat(argv);
        }
        let cmd = null;
        try {
          this.logger("npm install in " + cwd);
          cmd = this.spawn("npm", tab, {
            cwd: cwd
          }, (code) => {
            if (code === 1) {
              return reject(new Error("nmp install error : " + code));
            }
            return resolve(cwd);
          });
        } catch (e) {
          this.logger(e, "ERROR");
          return reject(e);
        }
      });
    }

    /*installPackage(name, file, env) {
      try {
        new nodefony.fileClass(file.dirName + "/package.json");
        return this.npmInstall(file.dirName, null, env);
      } catch (e) {
        if (e.code !== "ENOENT") {
          this.logger("Install Package BUNDLE : " + name + ":", "ERROR");
          this.logger(e, "ERROR");
          throw e;
        }
      }
    }*/

    installPackage(name, file, env) {
      if (env === "development" || env === "production") {
        process.env.NODE_ENV = env;
      } else {
        process.env.NODE_ENV = "development";
      }
      try {
        let conf = new nodefony.fileClass(file.dirName + "/package.json");
        let config = require(conf.path);
        shell.cd(file.dirName);
        npm.load(config, (error, event) => {
          if (error) {
            this.logger(error, "ERROR");
            this.terminate(1);
          }
          event.config.localPrefix = file.dirName;
          event.config.globalPrefix = this.kernel.rootDir;
          event.localPrefix = file.dirName;
          event.globalPrefix = this.kernel.rootDir;
          //npm.config.set('localPrefix', file.dirName);
          //npm.config.set('globalPrefix', this.rootDir);
          let tab = [];
          this.logger("NPM :" + npm.version + " Installing Dependencies for bundle : " + file.shortName);
          for (let dep in config.dependencies) {
            let mypackage = dep + "@" + config.dependencies[dep];
            this.logger("\t Dependency : " + mypackage);
            try {
              require.resolve(dep);
            } catch (e) {
              this.logger("\t Dependency : " + mypackage);
              tab.push(mypackage);
            }
          }
          if (process.env.NODE_ENV === "development") {
            for (let dep in config.devDependencies) {
              let mypackage = dep + "@" + config.devDependencies[dep];
              this.logger("\t Dependency dev : " + mypackage);
              try {
                require.resolve(dep);
              } catch (e) {
                tab.push(mypackage);
              }
            }
          }
          if (tab.length) {
            event.commands.install(tab, (err /*, data*/ ) => {
              if (err) {
                this.logger("NPM :" + npm.version + " Installing Dependencies for bundle : " + file.shortName, "ERROR");
                this.logger(err, "ERROR");
              }
            });
          }
        });
      } catch (e) {
        if (e.code !== "ENOENT") {
          this.logger("Install Package BUNDLE : " + name + ":" + e, "ERROR");
          shell.cd(this.kernel.rootDir);
          throw e;
        }
      }
      shell.cd(this.kernel.rootDir);
    }

    generateHelp(obj, str) {
      this.blankLine();
      str += "\n  Command : " + "\n\n";
      str += this.clc.cyan("nodefony") + " \n";
      str += this.clc.green("\tdev") + "                  Run Nodefony Development Server  \n";
      str += this.clc.green("\tprod") + "                  Run Nodefony Preprod Server \n";
      str += this.clc.green("\tpm2") + "                  Run Nodefony Production Server ( PM2 mode ) \n";
      str += this.clc.green("\tapp") + "                  Get Nodefony App name  \n";
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
    }

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
      process.exit(code);
    }
  }
  return cliKernel;
});