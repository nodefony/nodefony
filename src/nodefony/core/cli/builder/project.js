module.exports = class generateProject extends nodefony.Builder {

  constructor(cli) {
    super(cli);
    nodefony.extend(this.cli.response, {
      name: "myproject",
      description: "description project",
      path: path.resolve("."),
      authorFullName: "admin",
      authorMail: "admin@nodefony.com",
      domain: "localhost",
      portHttp: "5151",
      portHttps: "5152",
      bundle: false,
      version: nodefony.version,
      year: new Date().getFullYear(),
      orm: "sequelize",
      npm: 'npm'
    });

    this.pathSkeleton = path.resolve(__dirname, "..", "skeletons", "project");
  }

  interaction() {
    return this.cli.inquirer.prompt([{
        type: 'input',
        name: 'name',
        default: this.cli.response.name,
        message: 'Enter Nodefony Project Name',
        validate: (value) => {
          if (value) {
            this.name = value;
            return true;
          }
          return 'Please enter a valid project name';
        }
      }, {
        type: 'input',
        name: 'description',
        message: 'Enter short description',
        default: this.cli.response.description,
        filter: (value) => {
          if (value === "description project") {
            return `Project ${this.name}`;
          }
          return value;
        }
      }, {
        type: 'input',
        name: 'path',
        default: this.cli.response.path,
        message: 'Project Path',
        validate: (value) => {
          if (value) {
            this.location = value;
            return true;
          }
          return 'Please enter a valid project Path';
        }
      }, {
        type: 'input',
        name: 'authorFullName',
        default: this.cli.response.authorFullName,
        message: 'Please Enter Author Full Name',
      }, {
        type: 'input',
        name: 'authorMail',
        default: this.cli.response.authorMail,
        message: 'Please Enter Email Author ',
      }, {
        type: 'input',
        name: 'domain',
        default: this.cli.response.domain,
        message: 'Enter Server Domain :',
      }, {
        type: 'input',
        name: 'portHttp',
        default: this.cli.response.portHttp,
        message: 'Enter server Domain http Port  :',
      }, {
        type: 'input',
        name: 'portHttps',
        default: this.cli.response.portHttps,
        message: 'Enter Server Secure Domain https Port  :',
      }, {
        type: 'confirm',
        name: 'bundle',
        message: 'Do You Want Generate Bundle?',
        default: this.cli.response.bundle
      }])
      .then((response) => {
        nodefony.extend(this.cli.response, response);
        this.path = path.resolve(this.location, response.name);
        if (this.cli.exists(this.path)) {
          this.logger(`${this.path} Already exist`, "WARNING");
          return this.removePath(this.path).then((response) => {
            nodefony.extend(this.cli.response, response);
            if (response.remove) {
              return this.createBuilder(this.cli.response.name, this.location);
            }
            let error = new Error(`${this.path} Already exist`);
            error.code = 0;
            throw error;
          }).catch((e) => {
            throw e;
          });
        }
        return this.createBuilder(this.cli.response.name, this.location);
      });
  }

  createBuilder(name, location) {
    return this.build({
      name: name,
      type: "directory",
      childs: [{
        name: "app",
        type: "directory",
        childs: [{
          name: "appKernel.js",
          type: "file",
          skeleton: path.resolve(this.pathSkeleton, "app", "appKernel.js.skeleton"),
          params: this.cli.response
        }, {
          name: "package.json",
          type: "file",
          skeleton: path.resolve(this.pathSkeleton, "app", "package.json.skeleton"),
          params: this.cli.response
        }, {
          name: "Resources",
          type: "directory",
        }, {
          name: "config",
          type: "directory",
          childs: [{
            name: "config.yml",
            type: "file",
            skeleton: path.resolve(this.pathSkeleton, "app", "config.yml.skeleton"),
            params: this.cli.response
          }, {
            name: "routing.js",
            type: "file",
            skeleton: path.resolve(this.pathSkeleton, "app", "routing.js.skeleton"),
            params: this.cli.response
          }, {
            name: "security.yml",
            type: "file",
            skeleton: path.resolve(this.pathSkeleton, "app", "security.yml.skeleton"),
            params: this.cli.response
          }]
        }, {
          name: "controller",
          type: "directory",
          childs: [{
            name: "appController.js",
            type: "file",
            skeleton: path.resolve(this.pathSkeleton, "controller", "appController.js.skeleton"),
            params: this.cli.response
          }]
        }]
      }, {
        name: "package.json",
        type: "file",
        skeleton: path.resolve(this.pathSkeleton, "package.json.skeleton"),
        params: this.cli.response
      }, {
        name: ".gitignore",
        type: "file",
        skeleton: path.resolve(this.pathSkeleton, "gitignore.skeleton"),
        params: this.cli.response
      }, {
        name: ".jshintrc",
        type: "file",
        skeleton: path.resolve(this.pathSkeleton, "jshintrc.skeleton"),
        params: this.cli.response
      }, {
        name: ".jshintignore",
        type: "file",
        skeleton: path.resolve(this.pathSkeleton, "jshintignore.skeleton"),
        params: this.cli.response
      }, {
        name: ".editorconfig",
        type: "file",
        skeleton: path.resolve(this.pathSkeleton, "editorconfig.skeleton"),
        params: this.cli.response
      }, {
        name: "web",
        type: "directory",
      }, {
        name: "tmp",
        type: "directory",
      }, {
        name: "config",
        type: "directory",
        childs: [{
          name: "certificates",
          type: "directory",
        }, {
          name: "openssl",
          type: "directory",
        }, {
          name: "config.yml",
          type: "file",
          skeleton: path.resolve(this.pathSkeleton, "config", "config.yml.skeleton"),
          params: this.cli.response
        }]
      }, {
        name: "bin",
        type: "directory",
      }, {
        name: "src",
        type: "directory",
        childs: [{
          name: "bundles",
          type: "directory",
        }]
      }]
    }, location);
  }


  removePath(file) {
    return this.cli.inquirer.prompt([{
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

};