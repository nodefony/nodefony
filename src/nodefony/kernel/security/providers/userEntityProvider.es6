class userEntityProvider extends nodefony.Provider {
  constructor (name, manager, config) {
    super(name, manager);
    this.entityName = config.name || "user";
    this.userProperty = config.property || "username";
    this.orm = this.get(this.kernel.getOrm());
    this.orm.on("onOrmReady", () => {
      this.userEntity = this.orm.getEntity(this.entityName);
      this.entity = this.orm.entities[this.entityName];
      if (this.entity) {
        this.encoder = this.entity.getEncoder();
      }
    });
  }

  getEntity (name) {
    if (name) {
      return this.orm.getEntity(name);
    }
    return this.orm.getEntity(this.entityName);
  }

  async encodePassword (raw, salt) {
    try {
      const ret = this.entity.hasEncoder();
      if (ret) {
        return await this.encoder.encodePassword(raw, salt);
      }
      throw new Error(`encodePassword : Entity ${this.entity.name} encoder not defined`);
    } catch (e) {
      throw e;
    }
  }

  async isPasswordValid (raw, encoded) {
    try {
      const ret = this.entity.hasEncoder();
      if (ret) {
        this.log("Check Password Valid ", "DEBUG", `ENCODER ${this.encoder.name}`);
        return await this.encoder.isPasswordValid(raw, encoded);
      }
      return await super.isPasswordValid(raw, encoded);
    } catch (e) {
      throw e;
    }
  }
}

nodefony.userEntityProvider = userEntityProvider;
module.exports = userEntityProvider;
