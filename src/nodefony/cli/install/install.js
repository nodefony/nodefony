module.exports = class installProject extends nodefony.Builder {

  constructor(cli) {
    super(cli);
  }

  logger(pci, severity, msgid, msg) {
    if (!msgid) {
      msgid = "INSTALLER";
    }
    return super.logger(pci, severity, msgid, msg);
  }

  install(cwd = path.resolve(".")) {
    return new Promise((resolve, reject) => {
      return this.installFramework(cwd)
        .then(() => {
          return this.cli.packageManager.call(this.cli, ["install"], cwd, "dev")
            .then(() => {
              if (nodefony.isCore) {
                return this.npmLink(path.resolve("."), path.resolve("src", "nodefony"))
                  .catch((e) => {
                    return reject(e);
                  });
              } else {
                return cwd;
              }
            })
            .then(() => {
              this.cli.parseNodefonyCommand("install", [cwd]);
              return resolve(cwd);
            })
            .catch((e) => {
              return reject(e);
            });
        });
    });
  }

  build(cwd = path.resolve(".")) {
    return this.generateCertificates(cwd)
      .then(() => {
        return cwd;
      });
  }

  rebuild(cwd = path.resolve(".")) {
    let cmd = null;
    switch (nodefony.packageManager) {
    case 'yarn':
      cmd = ["install", "--force"];
      break;
    default:
      cmd = ["rebuild"];
    }
    return this.cli.packageManager.call(this.cli, cmd)
      .then(() => {
        return cwd;
      });
  }

  npmLink(cwd = path.resolve("."), argv = []) {
    return new Promise((resolve, reject) => {
      let tab = ["link"];
      if (argv) {
        tab = tab.concat(argv);
      }
      let cmd = null;
      try {
        this.logger("npm link " + argv);
        cmd = this.cli.spawn("npm", tab, {
          cwd: cwd,
          shell: true
        }, (code) => {
          if (code === 1) {
            return reject(new Error("nmp link error : " + code));
          }
          return resolve(cwd);
        });
      } catch (e) {
        this.logger(e, "ERROR");
        return reject(e);
      }
    });
  }

  generateCertificates(cwd = path.resolve(".")) {
    return new Promise((resolve, reject) => {
      try {
        let directory = path.resolve(cwd, "config", "certificates");
        this.cli.rm("-rf", directory);
        this.checkDirectoryExist(directory);
        this.logger(`Generate openssl certificates in : ${directory}`);
        let cmd = null;
        cmd = this.cli.spawn(path.resolve(cwd, "bin", "generateCertificates.sh"), [], {
          cwd: cwd,
          shell: true
        }, (code) => {
          if (code === 1) {
            return reject(new Error("generateCertificates error : " + code));
          }
          return resolve(code);
        });
      } catch (e) {
        return reject(e);
      }
    });
  }

  installFramework(cwd = path.resolve(".")) {
    return new Promise((resolve, reject) => {
      this.logger("Create Framework directories");
      try {
        let tmp = path.resolve(cwd, "tmp");
        this.checkDirectoryExist(tmp);
        let upload = path.resolve(cwd, "tmp", "upload");
        this.checkDirectoryExist(upload);
        let bin = path.resolve(cwd, "bin");
        this.checkDirectoryExist(bin);
        let databases = path.resolve(cwd, "app", "Resources", "databases");
        this.checkDirectoryExist(databases);
        let web = path.resolve(cwd, "web");
        this.checkDirectoryExist(web);
        let js = path.resolve(cwd, "web", "js");
        this.checkDirectoryExist(js);
        let css = path.resolve(cwd, "web", "css");
        this.checkDirectoryExist(css);
        let images = path.resolve(cwd, "web", "images");
        this.checkDirectoryExist(images);
        let fonts = path.resolve(cwd, "web", "fonts");
        this.checkDirectoryExist(fonts);
        let assets = path.resolve(cwd, "web", "assets");
        this.checkDirectoryExist(assets);
        js = path.resolve(cwd, "web", "assets", "js");
        this.checkDirectoryExist(js);
        css = path.resolve(cwd, "web", "assets", "css");
        this.checkDirectoryExist(css);
        images = path.resolve("web", "assets", "images");
        this.checkDirectoryExist(images);
        fonts = path.resolve(cwd, "web", "assets", "fonts");
        this.checkDirectoryExist(fonts);
        return resolve(true);
      } catch (e) {
        return reject(e);
      }
    });
  }

  checkDirectoryExist(directory) {
    if (!this.cli.exists(directory)) {
      try {
        this.cli.mkdir(directory);
        this.logger(`Create directory ${directory}`);
      } catch (e) {
        throw e;
      }
    }
  }

  removeDirectory(directory, recurse) {
    if (this.cli.exists(directory)) {
      try {
        if (recurse) {
          this.cli.rm("-rf", directory);
        } else {
          this.cli.rm("-f", directory);
        }
        this.logger(`Remove directory ${directory}`);
      } catch (e) {
        throw e;
      }
    }
  }

  clear(cwd = path.resolve(".")) {
    return new Promise((resolve, reject) => {
      try {
        let web = path.resolve(cwd, "web");
        this.removeDirectory(web, true);
        let modules = path.resolve(cwd, "node_modules");
        this.removeDirectory(modules, true);
        let tmp = path.resolve(cwd, "tmp");
        this.removeDirectory(tmp, true);
        let npmLock = path.resolve(cwd, "package-lock.json");
        this.removeDirectory(npmLock);
        let yarnLock = path.resolve(cwd, "yarn.lock");
        this.removeDirectory(yarnLock);
        return resolve(this.installFramework(cwd));
      } catch (e) {
        return reject(e);
      }
    });
  }
};