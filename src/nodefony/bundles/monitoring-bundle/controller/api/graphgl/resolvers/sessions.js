const {

  Op
} = nodefony.Sequelize;
module.exports = {
  Query: {
    //  provides all functions for each API endpoint
    // eslint-disable-next-line max-lines-per-function, complexity
    getSessions (obj, field, context, info) {
      const {
        username,
        query
      } = field;
      if (username) {
        // return this.getSessionsByUser(obj, field, context, info);
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
            // console.log(query);
            let index = query.startIndex || 1;
            index = parseInt(index, 10);
            let page = query.page || index;
            page = parseInt(page, 10) - 1;
            options.offset = page * query.itemsPerPage;
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
            if (query.search) {
              options.include[0].required = true;
              options.include[0].where = {
              // options.where = {
                username: {
                  [Op.startsWith]: query.search
                }
              };
            }
            if (username) {
              options.include[0].required = true;
              options.include[0].where = {
                username
              };
            }
            // console.log(options);
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
          const options = {};
          const filter = {};
          const projection = {};
          const populate = {
            path: "user"
          };
          const sort = [];
          if (query && query.type && query.type === "dataTable") {
            const page = query.page ? query.page - 1 : query.startIndex || 0;
            options.skip = query.itemsPerPage * page;
            options.limit = query.itemsPerPage;
            if (query.sortBy && query.sortBy.length) {
              // eslint-disable-next-line max-depth
              for (let i = 0; i < query.sortBy.length; i++) {
                const ele = [];
                ele.push(query.sortBy[i].key);
                ele.push(query.sortBy[i].order);
                sort.push(ele);
              }
            }
            if (query.search) {
              const regex = new RegExp(query.search, "iu");
              populate.match = {username: {$regex: regex}};
            }
          }
          // console.log(options, sort);
          if (sort.length) {
            return sessionEntity.find(filter, projection, options)
              .populate(populate)
              .sort(sort)
              .lean({versionKey: false})
              .then(async (result) => ({
                total: await sessionEntity.countDocuments(),
                sessions: result
              }))
              .catch((e) => {
                throw e;
              });
          }
          return sessionEntity.find(filter, projection, options)
            .populate(populate)
            .lean({versionKey: false})
            .then(async (result) => ({
              total: await sessionEntity.countDocuments(),
              sessions: result
            }))
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
