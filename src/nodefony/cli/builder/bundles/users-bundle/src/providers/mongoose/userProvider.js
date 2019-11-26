module.exports = nodefony.registerProvider("userProvider", () => {

  const Provider = class userProvider extends nodefony.userEntityProvider {

    constructor(name, manager, entityName) {
      super(name, manager, entityName);
    }

    loadUserByUsername(username) {
      if (!this.userEntity) {
        this.userEntity = this.getEntity();
      }
      return this.userEntity.findOne({
        username: username
      }).then((user) => {
        //throw user;
        if (user) {
          return this.refreshUser(user);
        }
        throw new nodefony.Error("User : " + username + " not Found", 404);
      }).catch(function (error) {
        throw error;
      });
    }

    refreshUser(user) {
      let serialize = user.populate();
      return new nodefony.User(
        serialize.username,
        serialize.password,
        serialize.roles,
        serialize.lang,
        serialize.enabled,
        serialize.userNonExpired,
        serialize.credentialsNonExpired,
        serialize.accountNonLocked,
        serialize.name,
        serialize.surname,
        serialize.email,
        serialize.gender,
        serialize.url,
        serialize.image
      );
    }

  };
  return Provider;
});
