class nginxTask extends nodefony.Task {

  constructor(name, command) {
    super(name, command);
    this.builder = new nodefony.Builder(this.cli);
    this.skeleton = path.resolve(__dirname, "skeletons", "nginx", "nginx.skeleton");
    this.location = path.resolve("config", "nginx");
    this.confName = `${this.kernel.projectName}.conf`;
    this.defaultResponse = {
      rootdir: this.kernel.rootDir,
      publicPath: this.kernel.publicPath,
      domain: `${this.kernel.projectName}.com`,
      http_port: 80,
      https_port: 443,
      proxy_domain: this.kernel.domain,
      proxy_http_port: this.kernel.httpPort,
      proxy_https_port: this.kernel.httpsPort,
      config_file_name: this.confName,
      config_file_path: this.location
    };
  }

  showHelp() {
    this.setHelp("generate:nginx [-i]",
      "Generate Nginx Minimal Configuration File as a reverse proxy in front of Nodefony"
    );
  }

  createConfigFile(response) {
    try {
      if (response.config_file_path === this.location) {
        this.cli.mkdir(response.config_file_path);
      }
      let Path = path.resolve(response.config_file_path, response.config_file_name);
      return this.builder.createFile(Path, this.skeleton, true, response);
    } catch (e) {
      throw e;
    }
  }

  interaction( /*args*/ ) {
    return this.cli.showAsciify(this.name)
      .then(() => {
        return this.cli.prompt([{
          type: 'input',
          name: 'domain',
          default: this.defaultResponse.domain,
          message: `Enter Server Domain Name : `,
          validate: ( /*value, response*/ ) => {
            return true;
          }
        }, {
          type: 'input',
          name: 'http_port',
          default: this.defaultResponse.http_port,
          message: `Enter Server HTTP Port : `,
          validate: ( /*value, response*/ ) => {
            return true;
          }
        }, {
          type: 'input',
          name: 'https_port',
          default: this.defaultResponse.https_port,
          message: `Enter Server HTTPS Port : `,
          validate: ( /*value, response*/ ) => {
            return true;
          }
        }, {
          type: 'input',
          name: 'proxy_domain',
          default: this.defaultResponse.proxy_domain,
          message: `Enter Domain Remote Proxy Nodefony : `,
          validate: ( /*value, response*/ ) => {
            return true;
          }
        }, {
          type: 'input',
          name: 'proxy_http_port',
          default: this.defaultResponse.proxy_http_port,
          message: `Enter Proxy Remote Nodefony HTTP Port : `,
          validate: ( /*value, response*/ ) => {
            return true;
          }
        }, {
          type: 'input',
          name: 'proxy_https_port',
          default: this.defaultResponse.proxy_https_port,
          message: `Enter Proxy Remote Nodefony HTTPS Port : `,
          validate: ( /*value, response*/ ) => {
            return true;
          }
        }]);
      });
  }

  generate(args, response) {
    let res = nodefony.extend({}, this.defaultResponse, response);
    return this.createConfigFile(res);
  }

}

module.exports = nginxTask;