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

    handle(context, token) {
      return this.authenticate(context, token);
    }

    authenticate(context, token) {
      return new Promise((resolve, reject) => {
        this.logger("TRY AUTHENTICATION " + this.name, "DEBUG");
        if (!token) {
          try {
            token = this.createToken(context, this.security.provider);
            if (!this.supportsToken(token)) {
              return reject(new Error("Factory " + this.name + " Token Unauthorized !! "));
            }
            return this.authenticateToken(token, this.security.provider).then((token) => {
              return resolve(token);
            }).catch((e) => {
              return reject(e);
            });
          } catch (e) {
            return reject(e);
          }
        } else {
          try {
            if (!this.supportsToken(token)) {
              return reject(new Error("Factory " + this.name + " Token Unauthorized !! "));
            }
            return this.authenticateToken(token, this.security.provider).then((token) => {
              return resolve(token);
            }).catch((e) => {
              return reject(e);
            });
          } catch (e) {
            return reject(e);
          }
        }
      });
    }

    createToken( /*context, provider*/ ) {}

    supportsToken( /*token*/ ) {}

    authenticateToken( /*token*/ ) {}

  };

  return Factory;
});