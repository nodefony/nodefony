// const Sequelize = require("sequelize");
// const Model = Sequelize.Model;
const {
  Sequelize,
  DataTypes,
  Model
} = nodefony.Sequelize;

/*
 *
 *
 *    ENTITY JWT
 *
 *
 */
module.exports = class jwt extends nodefony.Entity {
  constructor (bundle) {
    /*
     *   @param bundle instance
     *   @param Entity name
     *   @param orm name
     *   @param connection name
     */
    super(bundle, "jwt", "sequelize", "nodefony");
  }

  getSchema () {
    return {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      refreshToken: {
        type: DataTypes.TEXT,
        // primaryKey: true,
        // unique: true,
        allowNull: false
      },
      token: {
        type: DataTypes.TEXT
      },
      active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      }
    };
  }

  registerModel (db) {
    class MyModel extends Model {
      static associate (models) {
        if (models.user) {
          models.user.hasMany(models.jwt, {
            foreignKey: {
              allowNull: true,
              name: "username"
            },
            onDelete: "CASCADE",
            onUpdate: "CASCADE"
          });
          models.jwt.belongsTo(models.user, {
            foreignKey: {
              allowNull: true,
              name: "username"
            },
            onDelete: "CASCADE",
            onUpdate: "CASCADE"
          });
        } else {
          this.log("ENTITY ASSOCIATION user NOT AVAILABLE", "WARNING");
          // throw new Error("ENTITY ASSOCIATION user NOT AVAILABLE");
        }
      }

      static getRefreshToken (token) {
        const request = {
          where: {
            refreshToken: token
          }
        };
        return this.findOne(request);
      }

      static async setRefreshToken (username, token, refreshToken, active = true) {
        const transaction = await db.transaction.call(db);
        return this.create({
          username,
          refreshToken,
          token,
          active
        }, {
          transaction
        })
          .then((mytoken) => {
            transaction.commit();
            return mytoken;
          })
          .catch((e) => {
            transaction.rollback();
            throw e;
          });
      }

      static async updateRefreshToken (username, token, refreshToken) {
        let transaction = null;
        try {
          transaction = await db.transaction.call(db);
          return this.update({
            token
          }, {
            where: {
              username,
              refreshToken
            },
            transaction
          })
            .then((mytoken) => {
              transaction.commit();
              return mytoken;
            })
            .catch((e) => {
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

      static async deleteRefreshToken (refreshToken) {
        let transaction = null;
        const opt = {
          where: {}
        };
        opt.where.refreshToken = refreshToken;
        try {
          transaction = await db.transaction.call(db);
          return this.destroy(opt, {
            transaction
          })
            .then((mytoken) => {
              transaction.commit();
              if (mytoken) {
                return true;
              }
              return false;
            })
            .catch((e) => {
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

      static async truncate (username) {
        let transaction = null;
        const opt = {
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
            transaction
          })
            .then((mytoken) => {
              transaction.commit();
              return mytoken;
            })
            .catch((e) => {
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

  logger (pci /* , sequelize*/) {
    const msgid = `Entity ${this.name}`;
    return super.logger(pci, "DEBUG", msgid);
  }
};
