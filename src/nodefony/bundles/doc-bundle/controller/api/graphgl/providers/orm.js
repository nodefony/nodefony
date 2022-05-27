module.exports = {
  //  provides all functions for each API endpoint
  getOrm(field, context) {
    const orm = context.kernel.getOrm()
    const Orm = context.kernel.getORM()
    return JSON.stringify({
      name: orm,
      debug: Orm.debug,
    });
  },

  getConnectors(field, context) {
    const Orm = context.kernel.getORM()
    return JSON.stringify(Orm.getConnectorsList());
  },

  getEntities(field, context) {
    const Orm = context.kernel.getORM()
    return JSON.stringify(Orm.getEntitiesList());
  },

  getEntity(field, context) {
    const {name} = field
    const Orm = context.kernel.getORM()
    return JSON.stringify(Orm.getEntitiesList(null, name));
  },

  getEntitiesByBundle(ield, context){
    const {name} = field
    const Orm = context.kernel.getORM()
    return JSON.stringify(Orm.getEntitiesList(name));
  }



}
