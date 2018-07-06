nodefony.Builder = class Builder {

  constructor(cli, cmd, args) {
    this.cli = cli;
    this.twig = twig;
    this.cmd = cmd || this.cli.cmd;
    this.args = args || this.cli.args;
    this.location = path.resolve(".");
    this.twigOptions = {
      views: process.cwd(),
      'twig options': {
        async: false,
        cache: false
      }
    };
  }

  run(interactive) {
    if (interactive) {
      this.interactive = interactive;
      return this.interaction()
        .then((response) => {
          return this.generate(response);
        });
    } else {
      return this.generate();
    }
  }

  interaction() {
    return new Promise((resolve, reject) => {
      return reject(new Error("Builder has not interactive mode"));
    });
  }

  removeInteractivePath(file) {
    return this.cli.prompt([{
      type: 'confirm',
      name: 'remove',
      message: `Do You Want Remove : ${file}?`,
      default: false
    }]).then((response) => {
      if (response.remove) {
        if (!this.cli.exists(file)) {
          throw `${file} not exist`;
        }
        try {
          this.cli.rm("-rf", file);
          return response;
        } catch (e) {
          throw e;
        }
      } else {
        return response;
      }
    });
  }

  generate() {
    return new Promise((resolve, reject) => {
      try {
        if (this.createBuilder) {
          this.build(this.createBuilder(), this.location);
          return resolve(this.cli.response);
        }
        return reject(new Error(`Builder has not createBuilder Nothing to do !!`));
      } catch (e) {
        return reject(e);
      }
    });
  }

  logger(pci, severity, msgid, msg) {
    try {
      if (!msgid) {
        msgid = "GENERATER";
      }
      return this.cli.logger(pci, severity, msgid, msg);
    } catch (e) {
      console.log(pci);
    }
  }

  buildSkeleton(skeleton, parse, obj = {}, callback = null) {
    let skelete = null;
    try {
      if (skeleton instanceof nodefony.fileClass) {
        skelete = skeleton;
      } else {
        skelete = new nodefony.fileClass(skeleton);
      }
      if (skelete.type === "File") {
        if (parse !== false) {
          obj.settings = this.twigOptions;
          this.twig.renderFile(skelete.path, obj, callback);
        } else {
          callback(null, fs.readFileSync(skelete.path, {
            encoding: 'utf8'
          }));
        }
      } else {
        throw new Error(" skeleton must be file !!! : " + skelete.path);
      }
    } catch (e) {
      this.logger(e, "ERROR");
    }
    return skelete;
  }

  build(obj, parent, force) {
    if (!(parent instanceof nodefony.fileClass)) {
      parent = new nodefony.fileClass(parent);
    }
    let child = null;
    switch (nodefony.typeOf(obj)) {
    case "array":
      try {
        for (let i = 0; i < obj.length; i++) {
          this.build(obj[i], parent, force);
        }
      } catch (e) {
        this.logger(e, "ERROR");
        throw e;
      }
      break;
    case "object":
      for (let ele in obj) {
        let value = obj[ele];
        switch (ele) {
        case "name":
          var name = value;
          break;
        case "type":
          switch (value) {
          case "directory":
            try {
              let directory = path.resolve(parent.path, name);
              child = this.cli.createDirectory(directory, 0o755, (ele) => {
                if (force) {
                  this.logger("Force Create Directory :" + ele.name);
                } else {
                  this.logger("Create Directory :" + ele.name);
                }
                if (obj.chmod) {
                  this.cli.chmod(obj.chmod, directory);
                }
              }, force);
            } catch (e) {
              this.logger(e, "ERROR");
              throw e;
            }
            break;
          case "file":
            try {
              let file = path.resolve(parent.path, name);
              this.createFile(file, obj.skeleton, obj.parse, obj.params, (ele) => {
                this.logger("Create File      :" + ele.name);
              });
              if (obj.chmod) {
                this.cli.chmod(obj.chmod, file);
              }
            } catch (e) {
              this.logger(e, "ERROR");
              throw e;
            }
            break;
          case "symlink":
            try {
              if (force) {
                this.cli.ln('-sf', path.resolve(parent.path, obj.params.source), path.resolve(parent.path, obj.params.dest));
              } else {
                this.cli.ln('-s', path.resolve(parent.path, obj.params.source), path.resolve(parent.path, obj.params.dest));
              }
              this.logger("Create symbolic link :" + obj.name);
            } catch (e) {
              this.logger(e, "ERROR");
              throw e;
            }
            break;
          case "copy":
            try {
              let file = path.resolve(parent.path, name);
              if (obj.params && obj.params.recurse) {
                this.cli.cp("-R", obj.path, file);
              } else {
                this.cli.cp("-f", obj.path, file);
              }
              this.logger("Copy             :" + obj.name);
              if (obj.chmod) {
                this.cli.chmod(obj.chmod, file);
              }
            } catch (e) {
              this.logger(e, "ERROR");
              throw e;
            }
            break;
          }
          break;
        case "childs":
          try {
            this.build(value, child, force);
          } catch (e) {
            this.logger(e, "ERROR");
            throw e;
          }
          break;
        }
      }
      break;
    default:
      this.logger("generate build error arguments : ", "ERROR");
    }
    return child;
  }

  createFile(myPath, skeleton, parse, params = {}, callback = null) {
    if (skeleton) {
      this.buildSkeleton(skeleton, parse, params, (error, result) => {
        if (error) {
          this.logger(error, "ERROR");
        } else {
          try {
            fs.writeFileSync(myPath, result, {
              mode: params.mode || "644"
            });
            callback(new nodefony.fileClass(myPath));
          } catch (e) {
            throw e;
          }
        }
      });
    } else {
      let data = " ";
      try {
        fs.writeFileSync(myPath, data, {
          mode: params.mode || "644"
        });
        callback(new nodefony.fileClass(myPath));
      } catch (e) {
        throw e;
      }
    }
  }
};
nodefony.builders.bundles = require(path.resolve(__dirname, "cli", "builder", "bundle", "bundle.js"));
nodefony.builders.Project = require(path.resolve(__dirname, "cli", "builder", "project", "project.js"));

module.exports = nodefony.Builder;