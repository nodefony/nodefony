module.exports = nodefony.registerProvider("userProvider", () => {

  const Provider = class userProvider extends nodefony.security.providers.userEntityProvider {

    constructor(security, entityName) {
      super(security, entityName);
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
          let serialize = user.populate();
          return new nodefony.User(
            serialize.username,
            serialize.password,
            serialize.roles,
            serialize.lang,
            serialize.provider,
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
        let error = new Error("User : " + username + " not Found");
        error.code = 401;
        throw error;
      }).catch(function (error) {
        return error;
      });
    }



  };
  return Provider;
});