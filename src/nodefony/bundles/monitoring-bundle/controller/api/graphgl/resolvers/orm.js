module.exports = {
  Query: {
    //  provides all functions for each API endpoint
    getOrm(obj, field, context, info) {
      const orm = context.kernel.getOrm()
      const Orm = context.kernel.getORM()
      return JSON.stringify({
        name: orm,
        debug: Orm.debug,
        version:Orm.engine.version
      });
    },

    getConnectors(obj, field, context, info) {
      const Orm = context.kernel.getORM()
      return JSON.stringify(Orm.getConnectorsList());
    },

    getConnector(obj, field, context, info) {
      const {
        name
      } = field
      const Orm = context.kernel.getORM()
      let connectors = Orm.getConnectorsList()
      if (name in connectors) {
        let connector = connectors[name]
        connector.entities = JSON.parse(this.getEntitiesByConnector(obj, field, context, info))
        return JSON.stringify(connector);
      }
      return JSON.stringify({})
    },

    getEntities(obj, field, context, info) {
      const Orm = context.kernel.getORM()
      return JSON.stringify(Orm.getEntitiesList());
    },

    getEntity(obj, field, context, info) {
      const {
        name
      } = field
      const Orm = context.kernel.getORM()
      return JSON.stringify(Orm.getEntitiesList(null, name));
    },

    getEntitiesByBundle(obj, field, context, info) {
      const {
        name
      } = field
      const Orm = context.kernel.getORM()
      return JSON.stringify(Orm.getEntitiesList(name));
    },

    getEntitiesByConnector(obj, field, context, info) {
      const {
        name
      } = field
      const Orm = context.kernel.getORM()
      let res = []
      const list = Orm.getEntitiesList()
      for (let conn in list) {
        if (list[conn].connectorName && list[conn].connectorName === name) {
          res.push(list[conn])
        }
      }
      return JSON.stringify(res);
    }

  }

}
