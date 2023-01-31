module.exports = {
  Query: {
    //  provides all functions for each API endpoint
    getRequests (obj, field, context, info) {
      const orm = context.getORM();
      const ormName = context.kernel.getOrm();
      const requestsEntity = orm.getEntity("requests");
      const userEntity = orm.getEntity("user");
      const {
        query
      } = field;
      switch (ormName) {
      case "sequelize":
        const options = {
          attributes: ["id", "createdAt", "updatedAt", "remoteAddress", "userAgent", "url", "route", "method", "state", "protocol", "time", "scheme"],
          include: [{
            model: userEntity
          }]
        };
        if (query) {
          if (query.start) {
            options.offset = parseInt(query.start, 10);
          }
          if (query.length) {
            options.limit = parseInt(query.length, 10);
          }
          if (query.order.length) {
            options.order = [];
            for (let i = 0; i < query.order.length; i++) {
              const tab = [];
              tab.push(query.columns[parseInt(query.order[i].column, 10)].name);
              tab.push(query.order[i].dir);
              options.order.push(tab);
            }
          }
        }
        return requestsEntity.findAndCountAll(options)
          .then((results) => JSON.stringify(results))
          .catch((error) => {
            context.log(error, "ERROR");
            throw new nodefony.Error(error);
          });
      case "mongoose":
        return requestsEntity.find({})
          .populate("username")
          .then((results) =>
            // console.log(results)
            JSON.stringify({
              count: Object.keys(results).length,
              rows: results
            }));
        break;
      }
    },

    getRequestsById (obj, field, context, info) {
      const {
        id
      } = field;
      const orm = context.getORM();
      const ormName = context.kernel.getOrm();
      const requestsEntity = orm.getEntity("requests");
      const userEntity = orm.getEntity("user");
      switch (ormName) {
      case "sequelize":
        return requestsEntity.findOne({
          where: {
            id
          },
          include: [{
            model: userEntity,
            required: false
          }]
        })
          .then((results) => JSON.stringify(results))
          .catch((error) => {
            context.log(error, "ERROR");
            throw new nodefony.Error(error);
          });
      default:
        return JSON.stringify([]);
      }
    }
  }
};
