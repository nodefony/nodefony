module.exports = class generateBuilder extends nodefony.Builder {
  constructor (cli) {
    super(cli);
    this.choices = [];
    if (nodefony.isTrunk) {
      this.choices.push("Generate New Bundle");
      this.choices.push("Generate New Controller");
      this.choices.push("Generate New Service");
      this.choices.push("Generate New Entity");
      this.choices.push("Generate New Nodefony Project");
      this.choices.push("Generate Openssl Certificates");
      this.choices.push("Generate Haproxy Configuration");
      this.choices.push("Generate Nginx Configuration");
      this.choices.push("Generate letsEncrypt Webroot Configuration");
    } else {
      this.choices.push("Generate New Nodefony Project");
    }
    this.choices.push(this.cli.getSeparator());
    this.choices.push("Quit");
  }

  log (pci, severity, msgid, msg) {
    try {
      if (!msgid) {
        msgid = "GENERATER";
      }
      return this.cli.log(pci, severity, msgid, msg);
    } catch (e) {
      console.log(pci);
    }
  }

  interaction () {
    return this.cli.prompt([{
      type: "list",
      name: "command",
      message: " Nodefony CLI : ",
      default: 0,
      pageSize: this.choices.length,
      choices: this.choices,
      filter: (val) => {
        switch (val) {
        case "Generate New Nodefony Project":
          return "project";
        case "Generate Openssl Certificates":
          return "certificates";
        case "Generate New Bundle":
          return "bundle";
        case "Generate New Controller":
          return "controller";
        case "Generate New Service":
          return "service";
        case "Generate New Entity":
          return "entity";
        case "Generate Haproxy Configuration":
          return "haproxy";
        case "Generate Nginx Configuration":
          return "nginx";
        case "Generate letsEncrypt Webroot Configuration":
          return "letsencrypt";
        case "Quit":
          return "quit";
        default:
          console.log("\n");
          this.log(`command not found : ${val}`, "INFO");
          this.cli.terminate(1);
        }
      }
    }])
      .then((response) => {
        this.start(response);
        return response;
      });
  }

  start (response) {
    switch (response.command) {
    case "project":
      return this.cli.createProject(response.command, this.cli.args, true);
    case "certificates":
      return this.cli.generateCertificates();
    case "bundle":
      return this.cli.setCommand("generate:bundles", ["-i"]);
    case "controller":
      return this.cli.setCommand("generate:controller", ["-i"]);
    case "service":
      return this.cli.setCommand("generate:service", ["-i"]);
    case "entity":
      return this.cli.setCommand("sequelize:generate:entity", ["-i"]);
    case "haproxy":
      return this.cli.setCommand("generate:haproxy", ["-i"]);
    case "nginx":
      return this.cli.setCommand("generate:nginx", ["-i"]);
    case "letsencrypt":
      return this.cli.setCommand("generate:letsencrypt", ["-i"]);
    case "quit":
      return this.cli.setCommand("showmenu");
    default:
      this.log(`Command : ${response.command} Not Found`, "ERROR");
      return this.cli.setCommand("", "-h");
    }
  }
};
