class User {
  constructor(controller){
    this.controller = controller;
    this.entity = this.controller.getEntity("user");
    this.ormName = this.controller.getOrm().name;
    this.query = this.controller.query;
  }

  find() {
    switch (this.ormName) {
      case "mongoose":
        return this.entity.find();
      case "sequelize":
        return this.entity.findAll();
    }
  }

  findOne(username) {
    switch (this.ormName) {
      case "mongoose":
        return this.entity.findOne({
          username: username
        });
      case "sequelize":
        return this.entity.findOne({
          where: {
            username: username
          }
        });
    }
  }

  async update(user, value) {
    switch (this.ormName) {
      case "mongoose":
      let session = null;
      try {
        session = await this.controller.startTransaction("user");
        return user.updateOne(value)
        .then((user) => {
          session.commitTransaction();
          return user;
        }).catch(e => {
          session.abortTransaction();
          throw e;
        });
      }catch(e){
        if (session) {
          session.abortTransaction();
        }
        throw e;
      }
      break;
      case "sequelize":
        let transaction = null;
        try {
          transaction = await this.controller.startTransaction("user");
          return user.update(value, {
              transaction: transaction
            })
            .then((user) => {
              transaction.commit();
              return user;
            }).catch(e => {
              transaction.rollback();
              throw e;
            });
        } catch (e) {
          if (transaction) {
            transaction.rollback();
          }
          throw e;
        }
    }
  }

  async create() {
    switch (this.ormName) {
      case "sequelize":
        let transaction = null;
        try {
          transaction = await this.controller.startTransaction("user");
          return this.entity.create({
              username: this.query.username || null,
              email: this.query.email,
              password: this.query.passwd,
              name: this.query.name,
              surname: this.query.surname,
              gender: this.query.gender,
              roles: this.query.roles
            }, {
              transaction: transaction
            })
            .then((user) => {
              transaction.commit();
              return user;
            }).catch(e => {
              transaction.rollback();
              throw e;
            });
        } catch (e) {
          if (transaction) {
            transaction.rollback();
          }
          throw e;
        }
        break;
      case "mongoose":
        let session = null;
        try {
          session = await this.controller.startTransaction("user");
          return this.entity.create({
              username: this.query.username || null,
              email: this.query.email,
              password: this.query.passwd,
              name: this.query.name,
              surname: this.query.surname,
              gender: this.query.gender,
              roles: this.query.roles
            })
            .then((user) => {
              session.commitTransaction();
              return user;
            }).catch(e => {
              session.abortTransaction();
              throw e;
            });
        } catch (e) {
          if (session) {
            session.abortTransaction();
          }
          throw e;
        }
    }
  }

  async delete(user) {
    switch (this.ormName) {
      case "mongoose":
      let session = null;
      try {
        session = await this.controller.startTransaction("user");
        return user.remove({
          force: true
        })
        .then((user) => {
          session.commitTransaction();
          return user;
        }).catch(e => {
          session.abortTransaction();
          throw e;
        });
      }catch (e) {
        if (session) {
          session.abortTransaction();
        }
        throw e;
      }
      break;
      case "sequelize":
        let transaction = null;
        try {
          transaction = await this.controller.startTransaction("user");
          return user.destroy({
              transaction: transaction
            })
            .then((user) => {
              transaction.commit();
              return user;
            }).catch(e => {
              transaction.rollback();
              throw e;
            });
        } catch (e) {
          if (transaction) {
            transaction.rollback();
          }
          throw e;
        }
    }
  }
}

module.exports = User ;
