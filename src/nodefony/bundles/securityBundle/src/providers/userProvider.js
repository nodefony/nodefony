module.exports = nodefony.registerProvider("userProvider", () => {

  const entityUserProvider = class userProvider extends nodefony.Provider {

    constructor(name, security, entityName) {
      super(name, security);
      this.entityName = entityName;
      this.orm = this.get(this.kernel.getOrm());
      this.orm.on("onOrmReady", () => {
        this.userEntity = this.orm.getEntity(entityName);
      });
    }

    getEntity() {
      return this.orm.getEntity(this.entityName);
    }

  };

  return entityUserProvider;
});