module.exports = nodefony.register("userEntityProvider", () => {

  class userEntityProvider extends nodefony.Provider {

    constructor(name, manager, config) {
      super(name, manager);
      this.entityName = config.name || "user";
      this.userProperty = config.property ||  "username";
      this.orm = this.get(this.kernel.getOrm());
      this.orm.on("onOrmReady", () => {
        this.userEntity = this.orm.getEntity(this.entityName);
        this.entity = this.orm.entities[this.entityName];
        this.encoder = this.entity.getEncoder();
      });
    }

    getEntity(name) {
      if (name) {
        return this.orm.getEntity(name);
      }
      return this.orm.getEntity(this.entityName);
    }

    encodePassword(raw, salt) {
      try {
        let ret = this.entity.hasEncoder();
        if (ret) {
          return this.encoder.encodePassword(raw, salt);
        }
        throw new Error(`encodePassword : Entity ${this.entity.name} encoder not defined`);
      } catch (e) {
        throw e;
      }
    }

    isPasswordValid(raw, encoded) {
      try {
        let ret = this.entity.hasEncoder();
        if (ret) {
          this.logger(`Check Password Valid `, "DEBUG", `ENCODER ${this.encoder.name}`);
          return this.encoder.isPasswordValid(raw, encoded);
        }
        return super.isPasswordValid(raw, encoded);
      } catch (e) {
        throw e;
      }
    }
  }
  return userEntityProvider;
});