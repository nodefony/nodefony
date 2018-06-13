nodefony.Builder = class Builder {

  constructor(cli) {
    this.cli = cli;
    this.twig = twig;
    this.twigOptions = {
      views: process.cwd(),
      'twig options': {
        async: false,
        cache: false
      }
    };
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
              child = this.cli.createDirectory(path.resolve(parent.path, name), 0o755, (ele) => {
                if (force) {
                  this.logger("Force Create Directory :" + ele.name);
                } else {
                  this.logger("Create Directory :" + ele.name);
                }
              }, force);
            } catch (e) {
              this.logger(e, "ERROR");
              throw e;
            }
            break;
          case "file":
            try {
              this.createFile(path.resolve(parent.path, name), obj.skeleton, obj.parse, obj.params, (ele) => {
                this.logger("Create File      :" + ele.name);
              });
            } catch (e) {
              this.logger(e, "ERROR");
              throw e;
            }
            break;
          case "symlink":
            try {
              if (force) {
                shell.ln('-sf', path.resolve(parent.path, obj.params.source), path.resolve(parent.path, obj.params.dest));
              } else {
                shell.ln('-s', path.resolve(parent.path, obj.params.source), path.resolve(parent.path, obj.params.dest));
              }
              this.logger("Create symbolic link :" + obj.name);
            } catch (e) {
              this.logger(e, "ERROR");
              throw e;
            }
            break;
          case "copy":
            try {
              if (obj.params && obj.params.recurse) {
                this.cli.cp("-R", obj.path, path.resolve(parent.path, name));
              } else {
                this.cli.cp("-f", obj.path, path.resolve(parent.path, name));
              }
              this.logger("Copy             :" + obj.name);
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

  createFile(myPath, skeleton, parse, params, callback) {
    if (skeleton) {
      this.buildSkeleton(skeleton, parse, params, (error, result) => {
        if (error) {
          this.logger(error, "ERROR");
        } else {
          try {
            fs.writeFileSync(myPath, result, {
              mode: "644"
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
          mode: "644"
        });
        callback(new nodefony.fileClass(myPath));
      } catch (e) {
        throw e;
      }
    }
  }
};
module.exports = nodefony.Builder;