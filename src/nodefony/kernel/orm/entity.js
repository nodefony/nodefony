module.exports = nodefony.register("Entity", function () {

  class Entity extends nodefony.Service {
    constructor(bundle, name, orm, connection) {
      super(name, bundle.container);
      this.bundle = bundle;
      this.name = name;
      this.orm = orm;
      this.connection = connection;
      this.model = null;
      this.orm = this.get(orm);
      if (!this.orm) {
        throw new Error(this.name + " entity can't be registered  ORM not found : " + orm);
      }
      this.orm.on('onReadyConnection', (connectionName, db /*, ormService*/ ) => {
        if (connectionName === this.connection) {
          this.fire("onConnect", connectionName, db);
        }
      });
    }
  }

  return Entity;
});