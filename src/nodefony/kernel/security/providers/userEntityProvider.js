module.exports = nodefony.register("userEntityProvider", () => {

  class userEntityProvider extends nodefony.Provider {

    constructor(name, manager, config) {
      super(name, manager);
      this.entityName = config.name || "user";
      this.userProperty = config.property ||  "username";
      this.orm = this.get(this.kernel.getOrm());
      this.orm.on("onOrmReady", () => {
        this.userEntity = this.orm.getEntity(this.entityName);
      });
    }

    getEntity(name) {
      if (name) {
        return this.orm.getEntity(name);
      }
      return this.orm.getEntity(this.entityName);
    }
  }
  return userEntityProvider;
});