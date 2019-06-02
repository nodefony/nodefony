
nodefony.Builder = class Builder extends nodefony.Service {

  constructor(cli, cmd, args) {
    super("BUILDER", cli.container, cli.notificationsCenter);
    this.cli = cli;
    this.twig = twig;
    this.cmd = cmd || this.cli.cmd;
    this.args = args || this.cli.args;
    this.location = new nodefony.fileClass(path.resolve("."));
    this.globalSkeleton = path.resolve(__dirname, "cli", "builder", "skeletons");
    this.force = false;
    this.twigOptions = {
      views: process.cwd(),
      'twig options': {
        async: false,
        cache: false
      }
    };
  }

  setLocation(location) {
    return this.location = location;
  }

  run(interactive) {
    if (interactive) {
      this.interactive = interactive;
      return this.interaction()
        .then((response) => {
          return this.generate(response, this.force)
            .then((response) => {
              return {
                response: response,
                builder: this
              };
            });
        })
        .catch(e => {
          throw e;
        });
    } else {
      return this.generate(null, this.force)
        .then((response) => {
          return {
            response: response,
            builder: this
          };
        });
    }
  }

  async interaction() {
    return new Promise(resolve => {
      return resolve(this.cli.response);
    });
  }

  generate(response, force = false) {
    return new Promise((resolve, reject) => {
      try {
        if (this.createBuilder) {
          this.build(this.createBuilder(response), this.location, force);
          return resolve(this.cli.response);
        }
        return resolve(this.cli.response);
      } catch (e) {
        return reject(e);
      }
    });
  }

  buildFront(response, location) {
    this.Front = null;
    switch (response.front) {
    case "vue":
      this.Front = new Vue(this.cli, this.cmd, this.args);
      break;
    case "react":
      this.Front = new React(this.cli, this.cmd, this.args);
      break;
    case 'demo':
      this.Front = new Demo(this.cli, this.cmd, this.args);
      break;
    case 'electron':
      this.Front = null;
      break;
    case 'api':
      this.Front = null;
      break;
    case 'sandbox':
    default:
      this.Front = new SandBox(this.cli, this.cmd, this.args);
      break;
    }
    this.Front.setLocation(location);
    return this.Front;
  }

  async removeInteractivePath(file) {
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

  buildSkeleton(skeleton, parse = true, obj = {}, callback = null) {
    let skelete = null;
    if (!callback) {
      return new Promise((resolve, reject) => {
        try {
          if (skeleton instanceof nodefony.fileClass) {
            skelete = skeleton;
          } else {
            skelete = new nodefony.fileClass(skeleton);
          }
          if (skelete.type === "File") {
            if (parse === true) {
              obj.settings = this.twigOptions;
              this.twig.renderFile(skelete.path, obj, (error, result) => {
                if (error) {
                  return reject(error);
                }
                return resolve(result);
              });
            } else {
              fs.readFile(skelete.path, {
                encoding: 'utf8'
              }, (error, result) => {
                if (error) {
                  return reject(error);
                }
                return resolve(result);
              });
            }
          } else {
            let error = new Error(" skeleton must be file !!! : " + skelete.path);
            return reject(error);
          }
        } catch (e) {
          return reject(e);
        }
      });
    }
    try {
      if (skeleton instanceof nodefony.fileClass) {
        skelete = skeleton;
      } else {
        skelete = new nodefony.fileClass(skeleton);
      }
      if (skelete.type === "File") {
        if (parse === true) {
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
    let child = null;
    try {
      if (!(parent instanceof nodefony.fileClass)) {
        parent = new nodefony.fileClass(parent);
      }

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
    } catch (e) {
      this.logger(obj, "ERROR");
      throw e;
    }
    return child;
  }

  createFile(myPath, skeleton, parse = true, params = {}, callback = null) {
    if (!callback) {
      return new Promise((resolve, reject) => {
        if (skeleton) {
          return this.buildSkeleton(skeleton, parse, params)
            .then((file) => {
              fs.writeFile(myPath, file, {
                mode: params.mode || "644"
              }, (err) => {
                if (err) {
                  return reject(err);
                }
                return resolve(new nodefony.fileClass(myPath));
              });
            })
            .catch((e) => {
              return reject(e);
            });
        } else {
          let data = " ";
          fs.writeFile(myPath, data, {
            mode: params.mode || "644"
          }, (err) => {
            if (err) {
              return reject(err);
            }
            return resolve(new nodefony.fileClass(myPath));
          });
        }
      });
    }
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

  generateConfig(webpack = false) {
    let config = {
      name: "config",
      type: "directory",
      childs: [{
        name: "config.js",
        type: "file",
        skeleton: path.resolve(this.globalSkeleton, "config", "config.js"),
        params: this.cli.response
      }, {
        name: "routing.js",
        type: "file",
        skeleton: path.resolve(this.globalSkeleton, "config", "routing.js"),
        params: this.cli.response
      }, {
        name: "security.js",
        type: "file",
        skeleton: path.resolve(this.globalSkeleton, "config", "security.js"),
        params: this.cli.response
      }, {
        name: "services.js",
        type: "copy",
        path: path.resolve(this.globalSkeleton, "config", "services.js")
      }]
    };
    if (webpack) {
      config.childs.push({
        name: "webpack.config.js",
        type: "file",
        skeleton: path.resolve(this.globalSkeleton, "config", "webpack.config.js"),
        params: this.cli.response
      });
      config.childs.push({
        name: "webpack",
        type: "copy",
        path: path.resolve(this.globalSkeleton, "config", "webpack"),
        params: {
          recurse: true
        }
      });
    }
    return config;
  }
};

const SandBox = require(path.resolve(__dirname, "cli", "builder", "sandbox", "sandBoxBuilder.js"));
const Vue = require(path.resolve(__dirname, "cli", "builder", "vue", "vueBuilder.js"));
const React = require(path.resolve(__dirname, "cli", "builder", "react", "reactBuilder.js"));
const Demo = require(path.resolve(__dirname, "cli", "builder", "demo", "demoBuilder.js"));
//nodefony.builders.bundles = require(path.resolve(__dirname, "cli", "builder", "bundle", "bundle.js"));
nodefony.builders.bundle = require(path.resolve(__dirname, "cli", "builder", "bundles", "bundle.js"));

module.exports = nodefony.Builder;
