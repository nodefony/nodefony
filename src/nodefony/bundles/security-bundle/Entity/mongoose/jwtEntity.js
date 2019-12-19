const Schema = require('mongoose').Schema;
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
    super(bundle, "jwt", "mongoose", "nodefony");
    this.once("onConnect", (name, db) => {
      this.model = this.registerModel(db);
      this.orm.setEntity(this);
    });
  }

  getSchema() {
    return {
      username: {
        type: String,
      },
      refreshToken: {
        type: String,
        unique: true,
        required: true
      },
      token: {
        type: String
      },
      active: {
        type: Boolean,
        default: true
      }
    };
  }

  registerModel(db) {

    let mySchema = new Schema(this.getSchema(), {
      timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
      }
    });

    mySchema.statics.getRefreshToken = function (token) {
      const request = {
        refreshToken: token
      };
      return this.findOne(request);
    };

    mySchema.statics.setRefreshToken = async function (username, token, refreshToken, active = true) {
      let session = null;
      try {
        session = await db.startSession.call(db);
        return this.create({
            username: username,
            refreshToken: refreshToken,
            token: token,
            active: active
          })
          .then((mytoken) => {
            session.commitTransaction();
            return mytoken;
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
    };

    mySchema.statics.updateRefreshToken = async function (username, token, refreshToken) {
      let session = null;
      try {
        session = await db.startSession.call(db);
        return this.update({
            username: username,
            refreshToken: refreshToken
          }, {
            token: token
          })
          .then((mytoken) => {
            session.commitTransaction();
            return mytoken;
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
    };

    mySchema.statics.deleteRefreshToken = async function (refreshToken) {
      let session = null;
      try {
        session = await db.startSession.call(db);
        let res = null;
          res = this.deleteMany({
            refreshToken: refreshToken
          });
          return res
            .then((mytoken) => {
              session.commitTransaction();
              if (mytoken.deletedCount){
                return true ;
              }
              return false;
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
    };

    mySchema.statics.truncate = async function (username) {
      let session = null;
      try {
        session = await db.startSession.call(db);
        let res = null;
        if (!username) {
          res = this.remove();
        } else {
          res = this.deleteMany({
            username: username
          });
        }
        return res
          .then((mytoken) => {
            session.commitTransaction();
            return mytoken.deletedCount;
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
    };
    return db.model(this.name, mySchema);
  }

  logger(pci /*, sequelize*/ ) {
    const msgid = "Entity " + this.name;
    return super.logger(pci, "DEBUG", msgid);
  }
};
