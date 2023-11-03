/* eslint-disable max-lines-per-function */
const {Schema} = require("mongoose");

/*
 *
 *
 *    ENTITY JWT
 *
 *
 */
module.exports = class jwt extends nodefony.Entity {
  constructor (bundle) {
    super(bundle, "jwt", "mongoose", "nodefony");
  }

  getSchema () {
    return {
      username: {
        type: String
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

  registerModel (db) {
    const mySchema = new Schema(this.getSchema(), {
      timestamps: {
        createdAt: "createdAt",
        updatedAt: "updatedAt"
      }
    });

    mySchema.statics.getRefreshToken = function getRefreshToken (token) {
      const request = {
        refreshToken: token
      };
      return this.findOne(request);
    };

    mySchema.statics.setRefreshToken = async function setRefreshToken (username, token, refreshToken, active = true) {
      let session = null;
      try {
        session = await db.startSession();
        await session.startTransaction();
        return this.create({
          username,
          refreshToken,
          token,
          active
        })
          .then(async (mytoken) => {
            await session.commitTransaction();
            await session.endSession();
            return mytoken;
          })
          .catch(async (e) => {
            await session.abortTransaction();
            await session.endSession();
            throw e;
          });
      } catch (e) {
        if (session) {
          await session.abortTransaction();
          await session.endSession();
        }
        throw e;
      }
    };

    mySchema.statics.updateRefreshToken = async function updateRefreshToken (username, token, refreshToken) {
      let session = null;
      try {
        session = await db.startSession();
        await session.startTransaction();
        return this.update({
          username,
          refreshToken
        }, {
          token
        })
          .then(async (mytoken) => {
            await session.commitTransaction();
            await session.endSession();
            return mytoken;
          })
          .catch(async (e) => {
            await session.abortTransaction();
            await session.endSession();
            throw e;
          });
      } catch (e) {
        if (session) {
          await session.abortTransaction();
          await session.endSession();
        }
        throw e;
      }
    };

    mySchema.statics.deleteRefreshToken = async function deleteRefreshToken (refreshToken) {
      let session = null;
      try {
        session = await db.startSession();
        await session.startTransaction();
        let res = null;
        res = this.deleteMany({
          refreshToken
        });
        return res
          .then(async (mytoken) => {
            await session.commitTransaction();
            await session.endSession();
            if (mytoken.deletedCount) {
              return true;
            }
            return false;
          }).catch(async (e) => {
            await session.abortTransaction();
            await session.endSession();
            throw e;
          });
      } catch (e) {
        if (session) {
          await session.abortTransaction();
          await session.endSession();
        }
        throw e;
      }
    };

    mySchema.statics.truncate = async function truncate (username) {
      let session = null;
      try {
        session = await db.startSession();
        await session.startTransaction();
        let res = null;
        if (!username) {
          res = this.remove();
        } else {
          res = this.deleteMany({
            username
          });
        }
        return res
          .then(async (mytoken) => {
            await session.commitTransaction();
            await session.endSession();
            return mytoken.deletedCount;
          }).catch(async (e) => {
            await session.abortTransaction();
            await session.endSession();
            throw e;
          });
      } catch (e) {
        if (session) {
          await session.abortTransaction();
          await session.endSession();
        }
        throw e;
      }
    };
    return db.model(this.name, mySchema);
  }

  logger (pci /* , sequelize*/) {
    const msgid = `Entity ${this.name}`;
    return super.logger(pci, "DEBUG", msgid);
  }
};
