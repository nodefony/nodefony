module.exports = {
  Query: {
    //  provides all functions for each API endpoint
    getSessions (obj, field, context, info) {
      const {
        username,
        query
      } = field;
      if (username) {
        return this.getSessionsByUser(obj, field, context, info);
      }
      const sessionServices = context.get("sessions");
      const storage = sessionServices.settings.handler;
      switch (storage) {
      case "orm":
        const orm = context.getORM();
        const ormName = context.kernel.getOrm();
        const sessionEntity = orm.getEntity("session");
        const userEntity = orm.getEntity("user");
        switch (ormName) {
        case "sequelize":
          const options = {
            include: [{
              model: userEntity,
              required: false
            }]
          };
          if (query && query.type && query.type === "dataTable") {
            options.offset = parseInt(query.startIndex, 10);
            options.limit = parseInt(query.itemsPerPage, 10);
            if (query.sortBy && query.sortBy.length) {
              options.order = [];
              for (let i = 0; i < query.sortBy.length; i++) {
                const {key} = query.sortBy[i];
                const {order} = query.sortBy[i];
                const tab = [];
                if (key === "user") {
                  tab.push("username");
                } else {
                  tab.push(key);
                }
                tab.push(order);
                options.order.push(tab);
              }
            }
            return sessionEntity.findAndCountAll(options)
              .then((results) => {
                try {
                  return {
                    total: results.count,
                    sessions: results.rows
                  };
                } catch (e) {
                  throw new nodefony.Error(error);
                }
              })
              .catch((error) => {
                context.log(error, "ERROR");
                throw new nodefony.Error(error);
              });
          }
          return sessionEntity.findAndCountAll(options)
            .then((results) => ({
              total: results.count,
              sessions: results.rows
            }))
            .catch((error) => {
              if (error) {
                context.log(error, "ERROR");
                throw new nodefony.Error(error);
              }
            });

          break;
        case "mongoose":

          /* let sessions = {
            rows: null,
            count: 0
          };*/
          const sort = {};
          if (field.query && field.query.order.length) {
            for (let i = 0; i < field.query.order.length; i++) {
              const {name} = field.query.columns[parseInt(field.query.order[i].column, 10)];
              const {dir} = field.query.order[i];
              sort[name] = dir === "desc" ? -1 : 1;
            }
          } else {
            sort.createdAt = -1;
          }
          return sessionEntity.find({}, {})
            .populate("username")
            // .sort(sort)
            // .skip(parseInt(field.query.start, 10))
            // .limit(parseInt(field.query.length, 10))
            .then(async (result) =>
              // sessions.rows = result;
              // sessions.count = await sessionEntity.count();
              result // JSON.stringify(sessions);
            )
            .then((result) => result)
            .catch((e) => {
              throw e;
            });
        }
        break;
      case "files":
        throw new nodefony.Error("session.storage.file not implemented");
      case "memcached":
        throw new nodefony.Error("session.storage.memcached not implemented");
      }
    },

    getSessionsByUser (obj, field, context, info) {
      const sessionServices = context.get("sessions");
      const storage = sessionServices.settings.handler;
      const {
        username
      } = field;
      switch (storage) {
      case "orm":
        const orm = context.getORM();
        const ormName = context.kernel.getOrm();
        const sessionEntity = orm.getEntity("session");
        const userEntity = orm.getEntity("user");
        switch (ormName) {
        case "sequelize":
          return sessionEntity.findAndCountAll({
            where: {
              username
            },
            include: [{
              model: userEntity,
              required: false
            }]
          })
            .then((results) => results.rows)
            .catch((error) => {
              if (error) {
                context.log(error, "ERROR");
                throw new nodefony.Error(error);
              }
            });
          break;
        case "mongoose":
          return sessionEntity.find({}, {})
            .populate({
              path: "username",
              match: {
                username
              }
            })
            // .sort(sort)
            // .skip(parseInt(field.query.start, 10))
            // .limit(parseInt(field.query.length, 10))
            .then(async (result) =>
              // console.log("passs", result)
              result.filter((session) => {
                if (session.username) {
                  if (session.username.username === username) {
                    return session;
                  }
                }
              }))
            .catch((e) => {
              throw e;
            });
          break;
        default:
          throw new nodefony.Error(` ORM ${ormName} not implemented`);
        }
        break;
      case "files":
        throw new nodefony.Error("session.storage.file not implemented");
      case "memcached":
        throw new nodefony.Error("session.storage.memcached not implemented");
      default:
        throw new nodefony.Error(`session.handler ${storage} not implemented`);
      }
    }
  }
};
