module.exports = nodefony.registerProvider('userProvider', () => {

  const userProvider = class userProvider extends nodefony.Provider {

    constructor(name, security) {
      super(name, security);
    }


    loadUserByUsername() {

    }

    refreshUser(user) {
      return user;
    }

  };

  return userProvider;
});