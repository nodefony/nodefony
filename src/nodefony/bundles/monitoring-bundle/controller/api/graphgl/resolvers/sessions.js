module.exports = {
  Query: {
    //  provides all functions for each API endpoint
    // eslint-disable-next-line max-lines-per-function
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
      case "orm": {
        const orm = context.getORM();
        const ormName = context.kernel.getOrm();
        const sessionEntity = orm.getEntity("session");
        const userEntity = orm.getEntity("user");
        switch (ormName) {
        case "sequelize": {
          const options = {
            include: [{
              model: userEntity,
              required: false
            }]
          };
          if (query && query.type && query.type === "dataTable") {
            options.offset = parseInt(query.startIndex || 0, 10);
            options.limit = parseInt(query.itemsPerPage, 10);
            if (query.sortBy && query.sortBy.length) {
              options.order = [];
              // eslint-disable-next-line max-depth
              for (let i = 0; i < query.sortBy.length; i++) {
                const {key} = query.sortBy[i];
                const {order} = query.sortBy[i];
                const tab = [];
                // eslint-disable-next-line max-depth
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
                  throw new nodefony.Error(e);
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
        }
        case "mongoose": {
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
            .then((result) => result)
            .catch((e) => {
              throw e;
            });
        }
        default:
        }
        break;
      }
      case "files":
        throw new nodefony.Error("session.storage.file not implemented");
      case "memcached":
        throw new nodefony.Error("session.storage.memcached not implemented");
      default:
        throw new nodefony.Error(`${storage} not implemented`);
      }
      return null;
    },

    getSessionsByUser (obj, field, context/* , info*/) {
      const sessionServices = context.get("sessions");
      const storage = sessionServices.settings.handler;
      const {
        username
      } = field;
      switch (storage) {
      case "orm": {
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
            .then((result) => result.filter((session) => {
              if (session.username) {
                if (session.username.username === username) {
                  return session;
                }
              }
              return null;
            }))
            .catch((e) => {
              throw e;
            });
        default:
          throw new nodefony.Error(` ORM ${ormName} not implemented`);
        }
      }
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
