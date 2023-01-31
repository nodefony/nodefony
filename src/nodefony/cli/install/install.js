module.exports = class installProject extends nodefony.Builder {
  constructor (cli) {
    super(cli);
  }

  log (pci, severity, msgid, msg) {
    if (!msgid) {
      msgid = "INSTALLER";
    }
    return super.log(pci, severity, msgid, msg);
  }

  async install (cwd = path.resolve("."), args, interactive) {
    return new Promise((resolve, reject) => this.installFramework(cwd)
      .then(() => this.cli.packageManager.call(this.cli, ["install"], cwd)
        .then(() => {
          if (false && nodefony.isCore && process.platform !== "win32") {
            return this.npmLink(path.resolve("."), path.resolve("src", "nodefony"))
              .catch((e) => reject(e));
          }
          return cwd;
        })
        .then(() => {
          this.cli.parseNodefonyCommand("install", [cwd, args, interactive]);
          return resolve(cwd);
        })
        .catch((e) => reject(e))));
  }

  async build (cwd = path.resolve("."), args, interactive) {
    await this.generateCertificates(cwd);
    return cwd;
  }

  rebuild (cwd = path.resolve("."), args, interactive) {
    let cmd = null;
    switch (nodefony.packageManager) {
    case "yarn":
      cmd = ["install", "--force"];
      break;
    default:
      cmd = ["install"];
    }
    try {
      this.cli.rm("-rf", path.resolve(cwd, "node_modules"));
      this.cli.rm("-rf", path.resolve(cwd, "yarn.lock"));
      this.cli.rm("-rf", path.resolve(cwd, "package-lock.json"));
      this.cli.rm("-rf", path.resolve(cwd, "ppnpm-lock.yaml"));
    } catch (e) {
      throw e;
    }
    return this.cli.packageManager.call(this.cli, cmd, cwd, "production")
      .then(() => cwd);
  }

  async npmLink (cwd = path.resolve("."), argv = []) {
    return new Promise((resolve, reject) => {
      let tab = ["link"];
      if (argv) {
        tab = tab.concat(argv);
      }
      let cmd = null;
      try {
        this.log(`npm link ${argv}`);
        cmd = this.cli.spawn("npm", tab, {
          cwd,
          shell: true,
          stdio: "inherit"
        }, (code) => {
          if (code === 1) {
            return reject(new Error(`nmp link error : ${code}`));
          }
          return resolve(cwd);
        });
      } catch (e) {
        this.log(e, "ERROR");
        return reject(e);
      }
    });
  }

  async generateCertificates (cwd = path.resolve(".")) {
    return new Promise((resolve, reject) => {
      try {
        const directory = path.resolve(cwd, "config", "certificates");
        this.log(`Clean certificates in : ${directory}`);
        this.cli.rm("-rf", directory);
        this.checkDirectoryExist(directory);
        this.log(`Generate openssl certificates in : ${directory}`);
        let cmd = null;
        cmd = this.cli.spawn("bash", [path.resolve(cwd, "bin", "generateCertificates.sh")], {
        // cmd = this.cli.spawn(path.resolve(cwd, "bin", "generateCertificates.sh"), [], {
          cwd,
          shell: true,
          stdio: "inherit"
        }, (code) => {
          if (code !== 0) {
            return reject(new Error(`generateCertificates error : ${code}`));
          }
          return resolve(cwd);
        });
      } catch (e) {
        return reject(e);
      }
    });
  }

  async installFramework (cwd = path.resolve(".")) {
    return new Promise((resolve, reject) => {
      this.log("Create Framework directories");
      try {
        const tmp = path.resolve(cwd, "tmp");
        this.checkDirectoryExist(tmp);
        const upload = path.resolve(cwd, "tmp", "upload");
        this.checkDirectoryExist(upload);
        const bin = path.resolve(cwd, "bin");
        this.checkDirectoryExist(bin);
        const databases = path.resolve(cwd, "app", "Resources", "databases");
        this.checkDirectoryExist(databases);
        const web = path.resolve(cwd, "web");
        this.checkDirectoryExist(web);
        let js = path.resolve(cwd, "web", "js");
        this.checkDirectoryExist(js);
        let css = path.resolve(cwd, "web", "css");
        this.checkDirectoryExist(css);
        let images = path.resolve(cwd, "web", "images");
        this.checkDirectoryExist(images);
        let fonts = path.resolve(cwd, "web", "fonts");
        this.checkDirectoryExist(fonts);
        const assets = path.resolve(cwd, "web", "assets");
        this.checkDirectoryExist(assets);
        js = path.resolve(cwd, "web", "assets", "js");
        this.checkDirectoryExist(js);
        css = path.resolve(cwd, "web", "assets", "css");
        this.checkDirectoryExist(css);
        images = path.resolve(cwd, "web", "assets", "images");
        this.checkDirectoryExist(images);
        fonts = path.resolve(cwd, "web", "assets", "fonts");
        this.checkDirectoryExist(fonts);
        return resolve(true);
      } catch (e) {
        return reject(e);
      }
    });
  }

  checkDirectoryExist (directory) {
    if (!this.cli.exists(directory)) {
      try {
        this.cli.mkdir(directory);
        this.log(`Create directory ${directory}`);
      } catch (e) {
        throw e;
      }
    }
  }

  removeDirectory (directory, recurse) {
    if (this.cli.exists(directory)) {
      try {
        if (recurse) {
          this.cli.rm("-rf", directory);
        } else {
          this.cli.rm("-f", directory);
        }
        this.log(`Remove directory ${directory}`);
      } catch (e) {
        throw e;
      }
    }
  }

  async clear (cwd = path.resolve(".")) {
    return new Promise((resolve, reject) => {
      try {
        const web = path.resolve(cwd, "web");
        this.removeDirectory(web, true);
        const modules = path.resolve(cwd, "node_modules");
        this.removeDirectory(modules, true);
        const tmp = path.resolve(cwd, "tmp");
        this.removeDirectory(tmp, true);
        const npmLock = path.resolve(cwd, "package-lock.json");
        this.removeDirectory(npmLock);
        const yarnLock = path.resolve(cwd, "yarn.lock");
        this.removeDirectory(yarnLock);
        const pnpmLock = path.resolve(cwd, "pnpm-lock.yaml");
        this.removeDirectory(pnpmLock);

        return resolve(this.installFramework(cwd));
      } catch (e) {
        return reject(e);
      }
    });
  }
};
