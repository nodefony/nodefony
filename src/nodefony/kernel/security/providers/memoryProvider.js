module.exports = nodefony.registerProvider("memoryProvider", () => {

  const memoryProvider = class memoryProvider extends nodefony.Provider {

    constructor(security, config) {
      super("memoryProvider", security);
      this.config = config;
      this.users = {};
      if (this.config.users) {
        for (let user in this.config.users) {
          this.setUser(this.config.users[user]);
        }
      }
    }

    loadUserByUsername(username) {
      return new Promise((resolve, reject) => {
        if (username in this.users) {
          return resolve(this.users[username]);
        } else {
          return reject(new Error(`Provider : ${this.name} loadUserByUsername user ${username} not Found `));
        }
      });
    }

    setUser(user) {
      if (user.username) {
        this.users[user.username] = new nodefony.User(
          user.username,
          user.password,
          user.roles,
          user.lang,
          user.provider,
          user.enabled,
          user.userNonExpired,
          user.credentialsNonExpired,
          user.accountNonLocked,
          user.name,
          user.surname,
          user.email,
          user.gender,
          user.url,
          user.image
        );
      } else {
        throw new Error("Bad user format memory");
      }

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