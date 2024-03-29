class letsencryptTask extends nodefony.Task {
  constructor (name, command) {
    super(name, command);
    this.builder = new nodefony.Builder(this.cli);
    this.skeleton = path.resolve(__dirname, "skeletons", "letsencrypt", "webroot.ini.skeleton");
    this.skeletonScript = path.resolve(__dirname, "skeletons", "letsencrypt", "renew-letsencrypt.sh.skeleton");
    this.location = path.resolve("config", "letsencrypt");
    this.locationScript = path.resolve("bin");
    this.locationCertificates = path.resolve("config", "certificates", "letsencrypt");
    this.confName = "webroot.ini";
    this.scriptName = "renew-letsencrypt.sh";
    this.defaultResponse = {
      webservice: "nginx",
      bin_letsencrypt: "/usr/bin/letsencrypt",
      rootdir: this.kernel.rootDir,
      publicPath: this.kernel.publicPath,
      domain: `${this.kernel.projectName}.com`,
      email: this.kernel.bundles.app.settings.App.authorMail,
      config_file_name: this.confName,
      config_file_path: this.location,
      locationCertificates: this.locationCertificates,
      certificateName: "fullchain.pem"
    };
  }

  showHelp () {
    this.setHelp(
      "generate:letsencrypt [-i]",
      "Generate Let's Encrypt Webroot Configuration "
    );
  }

  createConfigFile (response) {
    try {
      this.cli.mkdir("-p", response.config_file_path);
      this.cli.mkdir("-p", path.resolve(response.locationCertificates, response.domain));
      const Path = path.resolve(response.config_file_path, response.config_file_name);
      // this.pathConfig = Path ;
      response.pathConfig = Path;
      return this.builder.createFile(Path, this.skeleton, true, response);
    } catch (e) {
      throw e;
    }
  }

  createScriptRenew (response) {
    try {
      this.cli.mkdir("-p", response.config_file_path);
      const Path = path.resolve(this.locationScript, this.scriptName);
      return this.builder.createFile(Path, this.skeletonScript, true, response);
    } catch (e) {
      throw e;
    }
  }

  interaction (/* args*/) {
    return this.cli.showAsciify(this.name)
      .then(() => this.cli.prompt([{
        type: "input",
        name: "domain",
        default: this.defaultResponse.domain,
        message: "Enter Server Domain Name Certificates : ",
        validate: (/* value, response*/) => true
      }]));
  }

  generate (args, response) {
    const res = nodefony.extend({}, this.defaultResponse, response);
    return this.createConfigFile(res)
      .then((file) => {
        this.log(`Success Creation letsEncrypt Configuration File :  ${file.path} `);
        return this.createScriptRenew(res)
          .then((script) => {
            this.log(`Success Creation Script Renew Certificates :  ${script.path} `);
            this.cli.chmod("+x", script.path);
            return file;
          });
      });
  }
}

module.exports = letsencryptTask;
