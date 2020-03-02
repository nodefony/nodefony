
class microService extends nodefony.Builder {

  constructor(cli, cmd, args) {
    super(cli, cmd, args);
    this.name = null;
    this.pathSkeleton = path.resolve(__dirname, "..","skeletons", "microservice");


    if (this.cmd === "create:microService" || this.cmd === "microService") {
      if (args && args[0]) {
        this.name = args[0];
        if (args[1]) {
          this.location = path.resolve(args[1]);
        }
      }
    }
    nodefony.extend(this.response, {
      name: this.name || "nodefony-service",
      description: "Service Description",
      path: this.location,
      authorFullName: "admin",
      authorName: "admin",
      authorMail: "admin@nodefony.com",
      year: new Date().getFullYear(),
      npm: 'npm',
      addons: {
      }
    });
    if (!this.name) {
      this.name = this.cli.response.name;
    }
    this.path = path.resolve(this.location, this.response.name);
    this.setEnv();
  }

  /*generate(response) {

  }*/


  async interaction() {
    let promtOptions = [{
        type: 'input',
        name: 'name',
        default: this.response.name,
        message: 'Enter Service Name',
        validate: (value) => {
          if (value) {
            this.name = value;
            nodefony.projectName = value;
            return true;
          }
          return `${value} Unauthorised Please enter a valid project name`;
        }
      }, {
        type: 'input',
        name: 'description',
        message: 'Enter short description',
        default: "Service Description",
        validate: (value) => {
          if (!value) {
            this.cli.response.description = `${this.response.description} ${this.name}`;
          }
          return true;
        },
        filter: (value) => {
          if (!value) {
            return this.response.description;
          }
          if (value === "Service Description") {
            return this.response.description;
          }
          return value;
        }
      },{
        type: 'input',
        name: 'path',
        default: this.location,
        message: 'Project Path',
        validate: (value) => {
          let myPath = null;
          try {
            myPath = new nodefony.fileClass(path.resolve(value));
          } catch (e) {
            return e.message;
          }

          if (value) {
            this.location = value;
            return true;
          }
          return 'Please enter a valid Service Path';
        }
      }, {
        type: 'input',
        name: 'authorFullName',
        default: this.response.authorFullName,
        message: 'Please Enter Author Full Name',
        filter: (value) => {
          if (!value) {
            this.response.authorName = this.response.authorFullName;
            return this.response.authorFullName;
          }
          return value;
        }
      }, {
        type: 'input',
        name: 'authorMail',
        default: this.response.authorMail,
        message: 'Please Enter Email Author ',
        filter: (value) => {
          if (!value) {
            return this.response.authorMail;
          }
          return value;
        }
      }];

      return this.cli.prompt(promtOptions)
        .then((response) => {
          console.log(response)
          return response ;
        });
  }

  createBuilder(response) {
    try {
      return {
        name: this.response.name,
        type: "directory",
        childs: [{
            name: "tmp",
            type: "directory"
          },{
            name: "dist",
            type: "directory"
          },{
            name: "package.json",
            type: "file",
            skeleton: path.resolve(this.pathSkeleton, "package.json"),
            params: this.response
          },{
            name: "README.md",
            type: "copy",
            path: path.resolve(this.pathSkeleton, "README.md")
          },{
            name: ".editorconfig",
            type: "copy",
            path: path.resolve(this.pathSkeleton, ".editorconfig")
          },{
            name: ".gitignore",
            type: "copy",
            path: path.resolve(this.pathSkeleton, ".gitignore")
          },{
            name: ".jshintrc",
            type: "copy",
            path: path.resolve(this.pathSkeleton, ".jshintrc")
          },{
            name: "bin",
            type: "directory",
            childs: [{
              name: "cli",
              type: "file",
              chmod: 755,
              skeleton: path.resolve(this.pathSkeleton, "bin", "cli"),
              params: this.response
            }]
          },{
            name: "src",
            type: "copy",
            path: path.resolve(this.pathSkeleton, "src"),
            params:{recurse:true}
          },{
            name: "tests",
            type: "copy",
            path: path.resolve(this.pathSkeleton, "tests"),
            params:{recurse:true}
          },{
            name: "config",
            type: "copy",
            path: path.resolve(this.pathSkeleton, "config"),
            params:{recurse:true}
          }
        ]
      };
    }catch(e){

    }
  }

}



nodefony.builders.microService = microService;
module.exports = microService;
