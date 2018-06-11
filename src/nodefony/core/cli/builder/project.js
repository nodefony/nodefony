module.exports = class generateProject extends nodefony.Builder {

  constructor(cli) {
    super(cli);
  }

  interaction() {
    return this.cli.inquirer.prompt([{
        type: 'input',
        name: 'name',
        message: 'Enter Nodefony Project Name',
        validate: (value) => {
          if (value) {
            return true;
          }
          return 'Please enter a valid project name';
        }
      }, {
        type: 'confirm',
        name: 'bundle',
        message: 'Do You Want Generate Bundle?',
        default: false
      }])
      .then((response) => {
        nodefony.extend(this.cli.response, response);
        this.parent = path.resolve("project");
        this.path = path.resolve("project", response.name);
        if (this.cli.exists(this.path)) {
          this.logger(`${this.path} Already exist`, "WARNING");
          return this.removePath(this.path).then((response) => {
            nodefony.extend(this.cli.response, response);
            if (response.remove) {
              return this.createBuilder(this.cli.response.name, this.parent);
            }
            let error = new Error(`${this.path} Already exist`);
            error.code = 0;
            throw error;
          }).catch((e) => {
            throw e;
          });
        }
        return this.createBuilder(this.cli.response.name, this.parent);
      });
  }

  createBuilder(name, location) {
    return this.build({
      name: name,
      type: "directory",
      childs: []
    }, new nodefony.fileClass(location));
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