class Api extends nodefony.Service {

  constructor(config, context = null) {
    const container = context ? context.container : kernel.container;
    super(config.name, container, false);
    this.name = null;
    this.version = null;
    this.description = null;
    this.context = null;
    this.parseArgs(config, context);
    this.debug = kernel.debug;
    if (this.context) {
      this.bundle = this.context.get("bundle");
      this.debug = this.kernel.debug;
      this.context.setContextJson();
    }
  }

  parseArgs(config, context) {
    this.name = config.name;
    this.version = config.version;
    this.description = config.description;
    this.context = context;
    this.basePath = config.basePath;
    //throw new Error(`Constructor Api bad arguments  : ${arguments}`);
  }

  /**
   *  @method logger
   */
  logger(pci, severity, msgid, msg) {
    if (!msgid) {
      msgid = clc.magenta(`API ${this.name} `);
    }
    return super.logger(pci, severity, msgid, msg);
  }

  renderError(error, code, message = "", severity = "ERROR", messageID = null) {
    return this.render(error, code, message, severity, messageID);
  }

  getNodefonyInfo(service) {
    let obj = {
      debug: this.debug
    };
    switch (true) {
    case service instanceof nodefony.Service:
      obj.service = {
        name: service.name
      };
      if (service.entity && service.entity.name) {
        obj.service.entity = service.entity.name;
      }
      break;
    default:
    }
    if (this.context) {
      obj.environment = this.kernel.environment;
      obj.local = this.context.translation.defaultLocale.substr(0, 2);
    }
    return obj;
  }

}

nodefony.Api = Api;
module.exports = Api;