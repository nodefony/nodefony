const builderInstall = require(path.resolve(__dirname, "install", "install.js"));

module.exports = class cliStart extends nodefony.cliKernel {

  constructor() {
    super("nodefony", null, null, {
      asciify: false,
      autostart: false,
      signals: true,
      clean: true,
      promiseRejection: true,
      version: nodefony.version,
    });
    this.choices = [];
    this.cmd = null;
    this.args = null;
    this.started = false;
    this.commander.usage(`<command:task:action> [args...]`);
    this.commander.arguments(`<cmd> [args...]`)
      .action((cmd, args /*, commander*/ ) => {
        this.cmd = cmd.toLowerCase();
        this.args = args;
        this.parseNodefonyCommand();
        this.start(this.cmd, this.args, cmd);
      });
    this.commander.on('--help', () => {
      if (!nodefony.isTrunk) {
        this.setTitleHelp(this.clc.cyan("nodefony"));
        this.setHelp("", "create:project [-i] name [path]", "Generate Nodefony Project");
      }
    });
    this.setOption('-d, --debug ', 'Nodefony debug');
    this.setOption('-h, --help ', 'Nodefony help');
    this.setOption('-v, --version ', 'Nodefony version');
    this.setOption('-i, --interactive ', 'Nodefony cli Interactive Mode');
    this.setOption('-j, --json', 'Nodefony json response');
    this.parseCommand(process.argv);
    if (!this.cmd && !process.argv.slice(2).length) {
      this.showMenu();
    } else {
      if (!this.started) {
        this.start(this.cmd, this.args);
      }
    }
  }

  showBanner(data) {
    super.showBanner(data);
    if (nodefony.projectName !== "nodefony") {
      this.logger(`WELCOME ${nodefony.projectName.toUpperCase()} ${nodefony.projectVersion}`);
    } else {
      this.logger(`WELCOME NODEFONY CLI ${nodefony.version}`);
    }
  }

  setCommand(cmd, args = []) {
    while (process.argv.length > 2) {
      process.argv.pop();
    }
    process.argv.push(cmd);
    return this.parseCommand(process.argv.concat(args));
  }

  start(command, args, rawCommand) {
    //console.log(this.command)
    this.started = true;
    switch (command) {
    case "create:project":
    case "create":
      try {
        return this.createProject(command, args, this.commander.interactive);
      } catch (e) {
        throw e;
      }
      break;
    case "build":
      try {
        return this.buildProject();
      } catch (e) {
        throw e;
      }
      break;
    case "install":
      if (nodefony.isTrunk) {
        return this.installProject();
      }
      this.showHelp();
      this.logger("No nodefony trunk detected !", "WARNING");
      break;
    case "app":
      try {
        return process.stdout.write(nodefony.projectName);
      } catch (e) {
        return process.stdout.write("nodefony");
      }
      break;
    case "version":
      try {
        return process.stdout.write(nodefony.version);
      } catch (e) {
        throw e;
      }
      break;
    case "help":
      if (!nodefony.isTrunk) {
        return this.showHelp();
      } else {
        this.setCommand("", ["-h"]);
      }
      break;
    default:
      if (nodefony.isTrunk) {
        return nodefony.start(command, args, this);
      } else {
        try {
          if (rawCommand) {
            return nodefony.require(path.resolve(rawCommand));
          }
        } catch (e) {
          this.logger(e, "ERROR");
        }
        this.showHelp();
      }
    }
  }

  showMenu() {
    this.generateString = `Generate`;
    this.startString = "Start Server";
    this.runString = "Run";
    if (nodefony.isTrunk) {
      if (nodefony.builded) {
        this.choices.push(`${this.startString} Development`);
        this.choices.push(`${this.startString} Pre-Production`);
        this.choices.push(`${this.startString} Production`);
        this.choices.push(`Install`);
        this.choices.push(`Build`);
        this.choices.push(`${this.generateString} Bundle`);
        this.choices.push(`${this.generateString} Controller`);
        this.choices.push(`Webpack Dump`);
        this.choices.push(`${this.generateString} Certificates`);
        this.choices.push(`${this.runString} Test`);
        this.choices.push(`Outdated`);
        this.choices.push(`Reset`);
      } else {
        this.choices.push(`Build`);
        this.choices.push(`Install`);
        this.choices.push(`${this.generateString} Bundle`);
        this.choices.push(`${this.generateString} Certificates`);
        this.choices.push(`Reset`);
      }
    } else {
      this.choices.push(`Create Nodefony Project`);
    }
    this.choices.push("Help");
    this.choices.push("Quit");
    return this.showAsciify("NODEFONY")
      .then((data) => {
        this.showBanner(data);
        return this.interaction(this.choices).then(() => {
          switch (this.response.command) {
          case "project":
            return this.createProject(null, null, true);
          case "build":
            return this.buildProject();
          case "install":
            if (nodefony.isTrunk) {
              return this.installProject();
            }
            this.showHelp();
            this.logger("No nodefony trunk detected !", "WARNING");
            break;
          case "exit":
            this.logger("QUIT");
            return this.terminate(0);
          case "clear":
            return this.cleanProject();
          case "certificates":
            return this.generateCertificates();
          case "webpack":
            this.setCommand("webpack:dump");
            break;
          case "bundle":
            this.setCommand("generate:bundle", ["-i"]);
            break;
          case "controller":
            break;
          case "development":
            this.setCommand("development");
            break;
          case "production":
            this.setCommand("production");
            break;
          case "pre-production":
            this.setCommand("preprod");
            break;
          case "test":
            this.setCommand("unitest:launch:all");
            break;
          case "outdated":
            this.setCommand("nodefony:outdated");
            break;
          default:
            this.setCommand("", "-h");
          }
        });
      })
      .catch((e) => {
        this.logger(e, "ERROR");
        throw e;
      });
  }

  interaction(choices) {
    return this.prompt([{
        type: 'list',
        name: 'command',
        message: ' Nodefony CLI : ',
        default: 0, //(choices.length - 1),
        pageSize: choices.length,
        choices: choices,
        filter: (val) => {
          //this.logger(val, "INFO");
          switch (val) {
          case "Quit":
            return "exit";
          case "Help":
            return "help";
          case `${this.startString} Development`:
            return "development";
          case `${this.startString} Production`:
            return "production";
          case `${this.startString} Pre-Production`:
            return "pre-production";
          case `Create Nodefony Project`:
            return "project";
          case `${this.generateString} Certificates`:
            return "certificates";
          case `${this.generateString} Bundle`:
            return "bundle";
          case `${this.generateString} Controller`:
            return "controller";
          case `${this.runString} Test`:
            return "test";
          case `Install Framework`:
          case `Install`:
            return "install";
          case `Build`:
            return "build";
          case `Reset`:
            return "clear";
          case `Webpack Dump`:
            return "webpack";
          case `Outdated`:
            return "outdated";
          default:
            this.logger(`command not found : ${val}`, "INFO");
            this.terminate(1);
          }
        }
      }])
      .then((response) => {
        return nodefony.extend(this.response, response);
      });
  }

  createProject(command, args, interactive = false) {
    try {
      if (command === "create:project") {
        if (!args[0]) {
          let error = new Error("Project name empty Unauthorised Please enter a valid project name ");
          this.logger(error, "ERROR");
          this.terminate(1);
        }
      }
      let project = new nodefony.builders.Project(this, command, args);
      return project.run(interactive)
        .then((res) => {
          this.logger(`Create Project ${res.name} complete`, "INFO");
          if (res.bundle) {
            this.response.project = true;
            this.response.config = {
              App: {
                projectName: res.name,
                authorName: res.authorFullName,
                authorMail: res.authorMail,
                local: res.locale,
                projectYear: res.year
              }
            };
            this.response.configKernel = {
              system: {
                domain: res.domain
              }
            };
            return nodefony.builders.bundles.interaction(this)
              .then((res) => {
                let bundle = new nodefony.builders.bundles[res.type](this, "js");
                bundle.interaction()
                  .then((res) => {
                    try {
                      let result = bundle.createBuilder(res.name, res.location);
                      bundle.build(result, bundle.location);
                      let cwd = path.resolve(project.location, project.name);
                      this.cd(cwd);
                      return this.buildProject(cwd);
                    } catch (e) {
                      throw e;
                    }
                  }).catch((e) => {
                    this.logger(e, "ERROR");
                    throw e;
                  });
              }).catch((e) => {
                this.logger(e, "ERROR");
                throw e;
              });
          }

          let cwd = path.resolve(project.location, project.name);
          this.cd(cwd);
          return this.buildProject(cwd);
        }).catch((e) => {
          if (e.code || e.code === 0) {
            this.logger(e, "INFO");
            this.terminate(e.code);
          }
          this.logger(e, "ERROR");
          this.terminate(e.code || 1);
        });
    } catch (e) {
      throw e;
    }
  }

  installProject(cwd = path.resolve(".")) {
    try {
      let installer = new builderInstall(this);
      return installer.install(cwd)
        .then((ret) => {
          this.logger("Install Complete");
          return ret;
        }).catch((e) => {
          this.logger(e, "ERROR");
          throw e;
        });
    } catch (e) {
      this.logger(e, "ERROR");
      throw e;
    }
  }

  buildProject(cwd = path.resolve(".")) {
    try {
      let installer = new builderInstall(this);
      return installer.build(cwd)
        .then((ret) => {
          this.logger("Build Complete");
          return ret;
        }).catch((e) => {
          this.logger(e, "ERROR");
          throw e;
        });
    } catch (e) {
      this.logger(e, "ERROR");
      throw e;
    }
  }

  cleanProject(cwd = path.resolve(".")) {
    try {
      let installer = new builderInstall(this);
      return installer.clear(cwd).then(() => {
        this.logger("Clean Project Complete");
        this.terminate(0);
      }).catch((e) => {
        this.logger(e, "ERROR");
        throw e;
      });
    } catch (e) {
      this.logger(e, "ERROR");
      throw e;
    }
  }

  generateCertificates(cwd = path.resolve(".")) {
    try {
      let installer = new builderInstall(this);
      return installer.generateCertificates(cwd)
        .then(() => {
          this.logger("Generate Certificates Complete");
          return cwd;
        }).catch((e) => {
          this.logger(e, "ERROR");
          throw e;
        });
    } catch (e) {
      this.logger(e, "ERROR");
      throw e;
    }
  }

};