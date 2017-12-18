module.exports = nodefony.register("Entity", function () {

  class Entity extends nodefony.Service {
    constructor(name, orm, connection) {
      super(name, orm.container);
      this.orm = orm;
      this.connection = connection;
    }
  }

  return Entity;
});