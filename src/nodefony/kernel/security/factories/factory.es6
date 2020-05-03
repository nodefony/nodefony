class Factory extends nodefony.Service {

  constructor(name, security, settings = {}) {
    super(name, security.container, security.notificationsCenter);
    this.settings = settings || {};
    this.security = security;
    this.providerName = this.settings.provider  || this.security.providerName;
    this.provider = null;
    this.kernel.once("onReady", () => {
      //console.log("onReady factory", this.name, this.providerName)
      if (!this.providerName) {
        if (this.providerName !== false) {
          this.providerName = this.security.providerName;
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

  logout(context) {
    if ( context.session){
      return context.session.invalidate()
        .then(() => {
          return context ;
        }).catch(e => {
          throw e ;
        });
    }
    return new Promise((resolve) => {
      return resolve(context);
    });
  }

  authenticate(context) {
    return new Promise((resolve, reject) => {
      this.log("FACTORY AUTHENTICATION " + this.name, "DEBUG");
      let token = null;
      try {
        token = this.createToken(context, this.provider);
        if (!this.supportsToken(token)) {
          return reject(new nodefony.Error("Factory " + this.name + " Token Unauthorized !! "));
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

  createToken(context = null, provider = null) {
    let token = null;
    if (context.metaSecurity) {
      if (context.metaSecurity.token && context.metaSecurity.token.user) {
        token = new nodefony.security.tokens.userPassword(context.metaSecurity.token.user);
        token.unserialize(context.metaSecurity.token);
      }
    } else {
      token = new nodefony.security.tokens.userPassword();
    }
    token.setProvider(provider || this.provider);
    return token;
  }

  supportsToken( /*token*/ ) {
    return true;
  }

  authenticateToken(token, provider) {
    if (provider) {
      return provider.authenticate(token);
    } else {
      if (!this.provider) {
        return new Promise((resolve) => {
          return resolve(token);
        });
      }
      return this.provider.authenticate(token);
    }
  }
}

nodefony.Factory = Factory;
module.exports = Factory;
