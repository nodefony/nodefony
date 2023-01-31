const {
  Sequelize,
  DataTypes,
  Model,
  Transaction,
  Op
} = require("sequelize");
// const Op = Sequelize.Op;

nodefony.register.call(nodefony.session.storage, "sequelize", () => {
  const dbSessionStorage = class dbSessionStorage {
    constructor (manager) {
      this.manager = manager;
      this.orm = this.manager.get("sequelize");
      this.orm.once("onOrmReady", () => {
        this.entity = this.orm.getEntity("session");
        if (!this.entity) {
          throw new Error("Entity session not ready");
        }
        this.dialect = this.entity.sequelize.options.dialect;
        this.applyTransaction = this.manager.settings.applyTransaction;
        if (this.applyTransaction === true) {
          this.applyTransaction = this.dialect !== "sqlite";
        }
        this.userEntity = this.orm.getEntity("user");
      });
      this.gc_maxlifetime = this.manager.settings.gc_maxlifetime;
      this.contextSessions = [];
    }

    async finderGC (msMaxlifetime, contextSession) {
      if (!this.entity) {
        return Promise.resolve(true);
      }
      let transaction = null;
      if (this.applyTransaction) {
        transaction = await this.entity.sequelize.transaction();
      }
      const mydate = new Date(new Date() - msMaxlifetime);
      const query = {
        transaction
      };
      query.attributes = ["context", "updatedAt", "session_id"];
      query.force = true;
      query.where = {
        updatedAt: {
          // $lt: mydate
          [Op.lt]: mydate
        }
      };
      if (contextSession) {
        query.where.context = contextSession;
      }
      return this.entity.destroy(query)
        .then(async (results) => {
          if (transaction) {
            await transaction.commit();
          }
          let severity = "DEBUG";
          if (results) {
            severity = "INFO";
          }
          this.manager.log(`Context : ${contextSession || "default"} GARBAGE COLLECTOR ==> ${results}  DELETED`, severity);
          return results;
        })
        .catch(async (error) => {
          if (transaction && !transaction.finished) {
            await transaction.rollback();
          }
          throw error;
        });
    }

    start (id, contextSession) {
      try {
        return this.read(id, contextSession);
      } catch (e) {
        throw e;
      }
    }

    async open (contextSession) {
      if (this.orm.kernel.type !== "CONSOLE") {
        await this.gc(this.gc_maxlifetime, contextSession);
        if (!this.entity) {
          return Promise.resolve(0);
        }
        let transaction = null;
        if (this.applyTransaction) {
          transaction = await this.entity.sequelize.transaction();
        }
        return this.entity.count({
          where: {
            "context": contextSession
          },
          transaction
        })
          .then(async (sessionCount) => {
            if (transaction) {
              await transaction.commit();
            }
            const log = `CONTEXT ${contextSession ? contextSession : "default"} SEQUELIZE SESSIONS STORAGE ==> ${this.manager.settings.handler.toUpperCase()} COUNT SESSIONS : ${sessionCount}`;
            this.manager.log(log, "INFO");
          })
          .catch(async (e) => {
            if (transaction && !transaction.finished) {
              await transaction.rollback();
            }
            this.manager.log(e, "ERROR", "SESSION Storage");
          });
      }
    }

    close () {
      this.gc(this.gc_maxlifetime);
      return true;
    }

    async destroy (id, contextSession) {
      if (!this.entity) {
        throw new Error("Entity Session not ready");
      }
      let transaction = null;
      if (this.applyTransaction) {
        transaction = await this.entity.sequelize.transaction();
      }
      const where = {
        session_id: id
      };
      if (contextSession) {
        where.context = contextSession;
      }
      return this.entity.findOne({
        where,
        transaction
      })
        .then((result) => {
          if (result) {
            return result.destroy({
              force: true,
              transaction
            }).then(async (session) => {
              if (transaction) {
                await transaction.commit();
              }
              this.manager.log(`DB DESTROY SESSION context : ${session.context} ID : ${session.session_id} DELETED`);
            })
              .catch(async (error) => {
                if (transaction && !transaction.finished) {
                  await transaction.rollback();
                }
                this.manager.log(`DB DESTROY SESSION context : ${contextSession} ID : ${id}`, "ERROR");
                throw error;
              });
          }
        })
        .catch(async (error) => {
          if (transaction && !transaction.finished) {
            await transaction.rollback();
          }
          throw error;
        });
    }

    async gc (maxlifetime, contextSession) {
      const msMaxlifetime = (maxlifetime || this.gc_maxlifetime) * 1000;
      if (contextSession) {
        await this.finderGC(msMaxlifetime, contextSession);
      } else if (this.contextSessions.length) {
        for (let i = 0; i < this.contextSessions.length; i++) {
          await this.finderGC(msMaxlifetime, this.contextSessions[i]);
        }
      }
    }

    async read (id, contextSession) {
      if (!this.entity) {
        throw new Error("Entity Session not ready");
      }
      let myWhere = null;
      let transaction = null;
      if (this.applyTransaction) {
        transaction = await this.entity.sequelize.transaction();
      }
      if (contextSession) {
        myWhere = {
          where: {
            session_id: id,
            context: contextSession
          },
          include: [{
            model: this.userEntity,
            required: false
          }],
          transaction
        };
      } else {
        myWhere = {
          where: {
            session_id: id
          },
          include: [{
            model: this.userEntity,
            required: false
          }],
          transaction
        };
      }
      return this.entity.findOne(myWhere)
        .then(async (result) => {
          if (result) {
            if (transaction) {
              await transaction.commit();
            }
            return {
              id: result.session_id,
              flashBag: result.flashBag,
              metaBag: result.metaBag,
              Attributes: result.Attributes,
              created: result.createdAt,
              updated: result.updatedAt,
              username: result.username
            };
          }
          return {};
        })
        .catch(async (error) => {
          if (transaction && !transaction.finished) {
            await transaction.rollback();
          }
          this.manager.log(error, "ERROR");
          throw error;
        });
    }

    async write (id, serialize, contextSession) {
      if (!this.entity) {
        throw new Error("Entity Session not ready");
      }
      let transaction = null;
      if (this.applyTransaction) {
        transaction = await this.entity.sequelize.transaction();
      }
      const data = nodefony.extend({}, serialize, {
        session_id: id,
        context: contextSession || "default"
      });
      if (data.username) {
        data.username = data.username.username;
      }
      return this.entity.findOne({
        where: {
          session_id: id,
          context: contextSession || "default"
        },
        transaction
      }).then((result) => {
        if (result) {
          return result.update(data, {
            where: {
              session_id: id,
              context: contextSession || "default"
            },
            transaction
          })
            .then(async (session) => {
              if (transaction) {
                await transaction.commit();
              }
              return session;
            })
            .catch(async (error) => {
              if (transaction && !transaction.finished) {
                await transaction.rollback();
              }
              throw error;
            });
        }
        return this.entity.create(data, {
          isNewRecord: true,
          transaction
        })
          .then(async (session) => {
            if (transaction) {
              await transaction.commit();
            }
            this.manager.log(`ADD SESSION : ${session.session_id}${session.username ? ` username :${session.username}` : ""}`, "DEBUG");
            return session;
          })
          .catch(async (error) => {
            if (transaction && !transaction.finished) {
              await transaction.rollback();
            }
            throw error;
          });
      })
        .catch(async (error) => {
          if (transaction && !transaction.finished) {
            await transaction.rollback();
          }
          if (error) {
            throw error;
          }
        });
    }
  };
  return dbSessionStorage;
});
