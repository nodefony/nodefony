class Provider extends nodefony.Service {

  constructor(name, manager) {
    super(name, manager.container);
    this.manager = manager;
    this.encoder = null;
  }

  logger(pci, severity, msgid, msg) {
    if (!msgid) {
      msgid = "PROVIDER " + this.name;
    }
    return super.logger(pci, severity, msgid, msg);
  }

  authenticate(token) {
    return new Promise((resolve, reject) => {
      if (token && this.supports(token)) {
        return this.loadUserByUsername(token.getUsername())
          .then(async (user) => {
            if (user) {
              this.logger(`TRY AUTHENTICATION  ${token.getUsername()}  PROVIDER ${this.name}`, "DEBUG");
              if (await this.isPasswordValid(token.getCredentials(), user.getPassword())) {
                token.setUser(user);
                token.setProvider(this);
                return resolve(token);
              }
              return reject(new nodefony.Error(`user ${token.getUsername()} Incorrect password`, 401));
            }
            return reject(new nodefony.Error(`user ${token.getUsername()} not found `));
          }).catch((error) => {
            return reject(error);
          });
      }
      return reject(new nodefony.Error("The token is not supported by this authentication provider " + this.name));
    });
  }

  async loadUserByUsername( /*username*/ ) {
    throw new nodefony.Error(`Provider : ${this.name} loadUserByUsername method  not defined`);
  }

  async isPasswordValid(raw, encoded) {
    return encoded === raw;
  }

  async refreshUser(user) {
    if (user instanceof nodefony.User) {
      return await this.loadUserByUsername(user.getUsername());
    }
    throw new nodefony.Error("refreshUser bad user type");
  }

  supports( /*token*/ ) {
    return true;
  }
}

nodefony.Provider = Provider;
module.exports = Provider;
