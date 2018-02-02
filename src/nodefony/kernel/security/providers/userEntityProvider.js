module.exports = nodefony.register("userEntityProvider", () => {

  const userEntityProvider = class userEntityProvider extends nodefony.Provider {

    constructor(security, config) {
      super("userEntityProvider", security);

      this.entityName = config.name || "user";
      this.userProperty = config.property ||  "username";
      this.orm = this.get(this.kernel.getOrm());
      this.orm.on("onOrmReady", () => {
        this.userEntity = this.orm.getEntity(this.entityName);
        //console.log(this.userEntity)
      });
    }

    getEntity(name) {
      if (name) {
        return this.orm.getEntity(name);
      }
      return this.orm.getEntity(this.entityName);
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

  return userEntityProvider;
});