module.exports = nodefony.registerProvider("memoryProvider", () => {

  const memoryProvider = class memoryProvider extends nodefony.Provider {

    constructor(security, config) {
      super("memoryProvider", security);
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

  return memoryProvider;
});