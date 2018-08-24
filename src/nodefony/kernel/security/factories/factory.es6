module.exports = nodefony.register('Factory', () => {

  class Factory extends nodefony.Service {

    constructor(name, security, settings = {}) {
      super(name, security.container, security.notificationsCenter);
      this.settings = settings ||  {};
      this.security = security;
      this.providerName = this.settings.provider;
      this.provider = null;
      this.kernel.once("onPostReady", () => {
        if (!this.providerName) {
          if (this.providerName !== false) {
            this.providerName = this.security.providerName;
          } else {
            this.provider = this.providerName;
          }
        }
        if (this.providerName !== this.security.providerName) {
          if (this.providerName) {
            this.provider = this.security.getProvider(this.providerName);
          }
        } else {
          this.provider = this.security.provider;
        }
      });
    }

    logger(pci, severity, msgid, msg) {
      if (!msgid) {
        msgid = `\x1b[36mFACTORY ${this.name}\x1b[0m`;
      }
      return super.logger(pci, severity, msgid, msg);
    }

    handle(context) {
      return this.authenticate(context)
        .then(token => {
          return token;
        })
        .catch(error => {
          throw error;
        });
    }

    authenticate(context) {
      return new Promise((resolve, reject) => {
        this.logger("FACTORY AUTHENTICATION " + this.name, "DEBUG");
        let token = null;
        try {
          token = this.createToken(context, this.providerName);
          if (!this.supportsToken(token)) {
            return reject(new Error("Factory " + this.name + " Token Unauthorized !! "));
          }
          return this.authenticateToken(token)
            .then((token) => {
              token.setAuthenticated(true);
              token.setFactory(this.name);
              return resolve(token);
            }).catch((e) => {
              return reject(e);
            });
        } catch (e) {
          return reject(e);
        }
      });
    }

    createToken(context = null /*, providerName = null*/ ) {
      if (context.metaSecurity) {
        if (context.metaSecurity.token && context.metaSecurity.token.user) {
          let token = new nodefony.security.tokens.userPassword(context.metaSecurity.token.user);
          token.unserialize(context.metaSecurity.token);
          return token;
        }
      } else {
        return new nodefony.security.tokens.userPassword();
      }
    }

    supportsToken( /*token*/ ) {
      return true;
    }

    authenticateToken(token, provider) {
      if (provider) {
        return provider.authenticate(token);
      } else {
        if ( !this.provider) {
          return new Promise((resolve) => {
            return resolve(token);
          });
        }
        return this.provider.authenticate(token);
      }
    }
  }
  return Factory;
});