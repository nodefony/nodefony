module.exports = nodefony.registerProvider("entityUserProvider", () => {

  const entityUserProvider = class entityUserProvider extends nodefony.security.providers.userProvider {

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