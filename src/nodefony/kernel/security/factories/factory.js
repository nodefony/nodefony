module.exports = nodefony.register('Factory', () => {

  const Factory = class Factory extends nodefony.Service {

    constructor(name, security, settings = {}) {
      super(name, security.container, security.notificationsCenter);
      this.settings = settings ||  {};
      this.security = security;
      this.provider = this.settings.provider ||  this.security.provider;
    }

    getKey() {
      return this.name;
    }

    getPosition() {
      return "http";
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
        this.logger("TRY AUTHENTICATION " + this.name, "DEBUG");
        if (!this.token) {
          let token = null;
          try {
            token = this.createToken(context, this.security.provider);
            if (!this.supportsToken(token)) {
              return reject(new Error("Factory " + this.name + " Token Unauthorized !! "));
            }
            return this.authenticateToken(token, this.security.provider).then((token) => {
              context.factory = this.name;
              return resolve(token);
            }).catch((e) => {
              return reject(e);
            });
          } catch (e) {
            return reject(e);
          }
        } else {
          try {
            if (!this.supportsToken(this.token)) {
              return reject(new Error("Factory " + this.name + " Token Unauthorized !! "));
            }
            return this.authenticateToken(this.token, this.security.provider).then((token) => {
              context.factory = this.name;
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

    createToken( /* context, provider*/ ) {}

    supportsToken( /*token*/ ) {
      return true;
    }

    authenticateToken(token, provider) {
      if (provider) {
        return provider.authenticate(token).then((token) => {
          return provider.loadUserByUsername(token.getUsername()).then((user) => {
            if (user) {
              token.setUser(user);
              //token.setAuthenticated(true);
              //this.logger(`AUTHENTICATION  ${token.getUsername()}  SUCCESSFULLY  PROVIDER ${provider.name}`, "INFO");
              return token;
            }
            throw Error(`user ${token.getUsername()} not found `);
          }).catch((error) => {
            throw error;
          });
        }).catch((error) => {
          throw error;
        });
      } else {
        return new Promise((resolve, reject) => {
          return reject(new Error(`authenticateToken Provider ${provider}`));
        });
      }
    }
  };
  return Factory;
});