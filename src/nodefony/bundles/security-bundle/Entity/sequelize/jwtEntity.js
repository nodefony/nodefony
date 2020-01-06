const Sequelize = require("sequelize");
const Model = Sequelize.Model;
/*
 *
 *
 *    ENTITY JWT
 *
 *
 */
module.exports = class jwt extends nodefony.Entity {

  constructor(bundle) {
    /*
     *   @param bundle instance
     *   @param Entity name
     *   @param orm name
     *   @param connection name
     */
    super(bundle, "jwt", "sequelize", "nodefony");

  }

  getSchema() {
    return {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      username: {
        type: Sequelize.STRING(256)
      },
      refreshToken: {
        type: Sequelize.TEXT('medium'),
        //primaryKey: true,
        //unique: true,
        allowNull: false
      },
      token: {
        type: Sequelize.TEXT('medium'),
      },
      active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      }
    };
  }

  registerModel(db) {
    class MyModel extends Model {
      static getRefreshToken(token) {
        const request = {
          where: {
            refreshToken: token
          }
        };
        return this.findOne(request);
      }

      static async setRefreshToken(username, token, refreshToken, active = true) {
        const transaction = await db.transaction.call(db);
        return this.create({
            username: username,
            refreshToken: refreshToken,
            token: token,
            active: active
          }, {
            transaction: transaction
          })
          .then((mytoken) => {
            transaction.commit();
            return mytoken;
          }).catch(e => {
            transaction.rollback();
            throw e;
          });
      }

      static async updateRefreshToken(username, token, refreshToken) {
        let transaction = null;
        try {
          transaction = await db.transaction.call(db);
          return this.update({
              token: token
            }, {
              where: {
                username: username,
                refreshToken: refreshToken
              }
            }, {
              transaction: transaction
            })
            .then((mytoken) => {
              transaction.commit();
              return mytoken;
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

      static async deleteRefreshToken(refreshToken) {
        let transaction = null;
        let opt = {
          where: {}
        };
        opt.where.refreshToken = refreshToken;
        try {
          transaction = await db.transaction.call(db);
          return this.destroy(opt, {
              transaction: transaction
            })
            .then((mytoken) => {
              transaction.commit();
              if (mytoken) {
                return true;
              }
              return false;
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

      static async truncate(username) {
        let transaction = null;
        let opt = {
          where: {}
        };
        if (username) {
          opt.where.username = username;
        } else {
          opt.truncate = true;
        }
        try {
          transaction = await db.transaction.call(db);
          return this.destroy(opt, {
              transaction: transaction
            })
            .then((mytoken) => {
              transaction.commit();
              return mytoken;
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

    MyModel.init(this.getSchema(), {
      sequelize: db,
      modelName: this.name
    });
    return MyModel;
  }

  logger(pci /*, sequelize*/ ) {
    const msgid = "Entity " + this.name;
    return super.logger(pci, "DEBUG", msgid);
  }
};