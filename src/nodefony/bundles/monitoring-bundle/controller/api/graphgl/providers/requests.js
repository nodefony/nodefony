module.exports = {
  //  provides all functions for each API endpoint
  getRequests(field, context) {
    const orm = context.getORM();
    let ormName = context.kernel.getOrm();
    const requestsEntity = orm.getEntity("requests");
    const userEntity = orm.getEntity("user");
    const {
      query
    } = field
    switch (ormName) {
    case "sequelize":
      let options = {
        attributes: ["id", "remoteAddress", "userAgent", "url", "route", "method", "state", "protocol", "scheme"],
        include: [{
          model: userEntity
        }],
      }
      if (query) {
        if (query.start) {
          options.offset = parseInt(query.start, 10)
        }
        if (query.length) {
          options.limit = parseInt(query.length, 10)
        }
        if (query.order.length) {
          options.order = [];
          for (let i = 0; i < query.order.length; i++) {
            let tab = [];
            tab.push(query.columns[parseInt(query.order[i].column, 10)].name);
            tab.push(query.order[i].dir);
            options.order.push(tab);
          }
        }
      }
      return requestsEntity.findAndCountAll(options)
        .then((results) => {
          return JSON.stringify(results);
        })
        .catch((error) => {
          context.log(error, "ERROR");
          throw new nodefony.Error(error)
        });
    case 'mongoose':
      break
    }
  },

  getRequestsById(field, context) {
    const {
      id
    } = field
    const orm = context.getORM();
    let ormName = context.kernel.getOrm();
    const requestsEntity = orm.getEntity("requests");
    const userEntity = orm.getEntity("user");
    switch (ormName) {
    case "sequelize":
      return requestsEntity.findOne({
          where: {
            id: id,
          },
          include: [{
            model: userEntity,
            required: false
          }]
        })
        .then((results) => {
          return JSON.stringify(results);
        })
        .catch((error) => {
          context.log(error, "ERROR");
          throw new nodefony.Error(error)
        });
    default:
      return JSON.stringify([]);
    }
  }
}
