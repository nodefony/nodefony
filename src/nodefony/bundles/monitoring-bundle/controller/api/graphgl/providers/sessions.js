module.exports = {
  //  provides all functions for each API endpoint
  getSessions(field, context) {
    let sessionServices = context.get("sessions");
    let storage = sessionServices.settings.handler;
    switch (storage) {
    case "orm":
      let orm = context.getORM();
      let ormName = context.kernel.getOrm();
      let sessionEntity = orm.getEntity("session");
      switch (ormName) {
      case "sequelize":
        if (field.query && field.query.type && field.query.type === "dataTable") {
          let options = {
            offset: parseInt(field.query.start, 10),
            limit: parseInt(field.query.length, 10)
          };
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
                return JSON.stringify(results);
              } catch (e) {
                throw new nodefony.Error(error)
              }
            })
            .catch((error) => {
              context.log(error, "ERROR");
              throw new nodefony.Error(error)
            });
        } else {
          return sessionEntity.findAndCountAll()
            .then((results) => {
              return JSON.stringify(results);
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
        let sessions = {
          rows: null,
          count: 0
        };
        let sort = {};
        if (field.query.order.length) {
          for (let i = 0; i < field.query.order.length; i++) {
            let name = field.query.columns[parseInt(field.query.order[i].column, 10)].name;
            let dir = field.query.order[i].dir;
            sort[name] = dir === "desc" ? -1 : 1;
          }
        } else {
          sort.createdAt = -1;
        }
        return sessionEntity.find({}, {})
          //.populate('username')
          .sort(sort)
          .skip(parseInt(field.query.start, 10))
          .limit(parseInt(field.query.length, 10))
          .then((result) => {
            //console.log(result)
            sessions.rows = result;
            return sessionEntity.count();
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

  getSessionsByUser(field, context) {
    let sessionServices = context.get("sessions");
    let storage = sessionServices.settings.handler;
    const {username} = field
    switch (storage) {
    case "orm":
      let orm = context.getORM();
      let ormName = context.kernel.getOrm();
      let sessionEntity = orm.getEntity("session");
      switch (ormName) {
      case "sequelize":
      return sessionEntity.findAndCountAll({
        where:{
          username:username
        }
      })
        .then((results) => {
          return JSON.stringify(results);
        })
        .catch((error) => {
          if (error) {
            context.log(error, "ERROR");
            throw new nodefony.Error(error)
          }
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
