module.exports = nodefony.registerProvider("chainProvider", () => {

  const chainProvider = class chainProvider extends nodefony.Provider {

    constructor(security, config) {
      super("chainProvider", security);
      this.config = config;
    }

    loadUserByUsername( /*username*/ ) {
      throw new Error(`Provider : ${this.name} loadUserByUsername method  not defined`);
    }

    refreshUser(user) {
      if (user instanceof nodefony.User) {
        return this.loadUserByUsername(user.getUsername());
      }
      throw new Error("refreshUser bad user type");
    }

  };

  return chainProvider;
});