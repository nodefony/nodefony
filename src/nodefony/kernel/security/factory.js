module.exports = nodefony.register('Factory', () => {

  const Factory = class Factory extends nodefony.Service {

    constructor(name, security, settings) {
      super(name, security.container, security.notificationsCenter);
      this.settings = settings;
      this.security = security;
    }

    getKey() {
      return this.name;
    }

    logger(pci, severity, msgid, msg) {
      if (!msgid) {
        msgid = `\x1b[36mFACTORY ${this.name}\x1b[0m`;
      }
      return super.logger(pci, severity, msgid, msg);
    }

    handle(context, callback) {
      return new Promise((resolve, reject) => {
        let error = new Error(`Factory ${this.name} no handle defined `);
        this.logger(error, "ERROR");
        return reject(error);
      });
    }

  };

  return Factory;
});