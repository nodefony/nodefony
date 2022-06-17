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

  getConnector(field, context) {
    const {name} = field
    const Orm = context.kernel.getORM()
    let connectors = Orm.getConnectorsList()
    if( name in connectors){
      let connector = connectors[name]
      connector.entities = JSON.parse(this.getEntitiesByConnector(field, context))
      return JSON.stringify(connector);
    }
    return JSON.stringify({})
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

  getEntitiesByBundle(field, context){
    const {name} = field
    const Orm = context.kernel.getORM()
    return JSON.stringify(Orm.getEntitiesList(name));
  },

  getEntitiesByConnector(field, context){
    const {name} = field
    const Orm = context.kernel.getORM()
    let res = []
    const list = Orm.getEntitiesList()
    for(let conn in list){
      if( list[conn].connectorName && list[conn].connectorName === name){
        res.push(list[conn])
      }
    }
    return JSON.stringify(res);
  }



}
