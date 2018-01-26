module.exports = nodefony.registerProvider("nodefony", () => {

  const Provider = class Provider extends nodefony.security.providers.entityUserProvider {

    constructor(security, entityName) {
      super('nodefony', security, entityName);
    }

    loadUserByUsername(username) {
      if (!this.userEntity) {
        this.userEntity = this.getEntity();
      }
      return this.userEntity.findOne({
        where: {
          username: username
        }
      }).then(function (user) {
        if (user) {
          return user;
        }
        let error = new Error("User : " + username + " not Found");
        error.code = 404;
        throw error;
      }).catch(function (error) {
        if (error) {
          return error;
        }
      });
    }
  };

  return Provider;
});