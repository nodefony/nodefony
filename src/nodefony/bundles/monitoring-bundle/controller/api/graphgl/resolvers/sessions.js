module.exports = {
  Query: {
    //  provides all functions for each API endpoint
    getSessions(obj, field, context, info) {
      const {
        username
      } = field
      if (username) {
        return this.getSessionsByUser(obj, field, context, info)
      }
      let sessionServices = context.get("sessions");
      let storage = sessionServices.settings.handler;
      switch (storage) {
      case "orm":
        const orm = context.getORM();
        const ormName = context.kernel.getOrm();
        const sessionEntity = orm.getEntity("session");
        const userEntity = orm.getEntity("user");
        switch (ormName) {
        case "sequelize":
          let options = {
            include: [{
              model: userEntity,
              required: false
        }]
          }
          if (field.query && field.query.type && field.query.type === "dataTable") {
            options.offset = parseInt(field.query.start, 10);
            options.limit = parseInt(field.query.length, 10);
            if (field.query.order.length) {
              options.order = [];
              for (let i = 0; i < field.query.order.length; i++) {
                let tab = [];
                tab.push(field.query.columns[parseInt(field.query.order[i].column, 10)].name);
                tab.push(field.query.order[i].dir);
                options.order.push(tab);
              }
            }
            return sessionEntity.findAndCountAll(options)
              .then((results) => {
                try {
                  return results.rows;
                } catch (e) {
                  throw new nodefony.Error(error)
                }
              })
              .catch((error) => {
                context.log(error, "ERROR");
                throw new nodefony.Error(error)
              });
          } else {
            return sessionEntity.findAndCountAll(options)
              .then((results) => {
                return results.rows;
              })
              .catch((error) => {
                if (error) {
                  context.log(error, "ERROR");
                  throw new nodefony.Error(error)
                }
              });
          }
          break;
        case "mongoose":
          /*let sessions = {
            rows: null,
            count: 0
          };*/
          let sort = {};
          if (field.query && field.query.order.length) {
            for (let i = 0; i < field.query.order.length; i++) {
              let name = field.query.columns[parseInt(field.query.order[i].column, 10)].name;
              let dir = field.query.order[i].dir;
              sort[name] = dir === "desc" ? -1 : 1;
            }
          } else {
            sort.createdAt = -1;
          }
          return sessionEntity.find({}, {})
            .populate('username')
            //.sort(sort)
            //.skip(parseInt(field.query.start, 10))
            //.limit(parseInt(field.query.length, 10))
            .then(async (result) => {
              //sessions.rows = result;
              //sessions.count = await sessionEntity.count();
              return result //JSON.stringify(sessions);
            }).then((result) => {
              return result
            })
            .catch(e => {
              throw e;
            });
        }
        break;
      case "files":
        throw new nodefony.Error("session.storage.file not implemented")
      case "memcached":
        throw new nodefony.Error("session.storage.memcached not implemented")
      }
    },

    getSessionsByUser(obj, field, context, info) {
      let sessionServices = context.get("sessions");
      let storage = sessionServices.settings.handler;
      const {
        username
      } = field
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
                username: username
              },
              include: [{
                model: userEntity,
                required: false
            }]
            })
            .then((results) => {
              return results.rows
            })
            .catch((error) => {
              if (error) {
                context.log(error, "ERROR");
                throw new nodefony.Error(error)
              }
            });
          break;
        case "mongoose":
          return sessionEntity.find({}, {})
            .populate({
              path: 'username',
              match: {
                username: username
              },
            })
            //.sort(sort)
            //.skip(parseInt(field.query.start, 10))
            //.limit(parseInt(field.query.length, 10))
            .then(async (result) => {
              //console.log("passs", result)
              return result.filter((session) => {
                if (session.username) {
                  if (session.username.username === username) {
                    return session
                  }
                }
              })
            })
            .catch(e => {
              throw e;
            });
          break;
        default:
          throw new nodefony.Error(` ORM ${ormName} not implemented`)
        }
        break;
      case "files":
        throw new nodefony.Error("session.storage.file not implemented")
      case "memcached":
        throw new nodefony.Error("session.storage.memcached not implemented")
      default:
        throw new nodefony.Error(`session.handler ${storage} not implemented`)

      }
    }
  }
}
