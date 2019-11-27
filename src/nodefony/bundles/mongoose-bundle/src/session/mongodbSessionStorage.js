nodefony.register.call(nodefony.session.storage, "mongoose", function () {

  const finderGC = function (msMaxlifetime, contextSession) {
    let where = {
      context: contextSession,
      updatedAt: {
        $lt: new Date(new Date() - msMaxlifetime)
      }
    };
    return this.entity.deleteMany(where).then((results) => {
      let severity = "DEBUG";
      if (!results) {
        throw new Error("session.storage finderGC no result ");
      }
      if (results && results.n) {
        severity = "INFO";
        this.manager.logger("Context : " + (contextSession || "default") + " GARBADGE COLLECTOR ==> " + results.n + "  DELETED", severity);
      }
      return results;
    }).catch((error) => {
      this.manager.logger(error, "ERROR");
      throw error;
    });
  };


  const dbSessionStorage = class dbSessionStorage {

    constructor(manager) {
      this.manager = manager;
      this.orm = this.manager.get("mongoose");
      this.manager.kernel.on( "onReady", () => {
        this.entity = this.orm.getEntity("session");
      });
      this.gc_maxlifetime = this.manager.settings.gc_maxlifetime;
      this.contextSessions = [];
    }

    start(id, contextSession) {
      try {
        return this.read(id, contextSession);
      } catch (e) {
        throw e;
      }
    }

    open(contextSession) {
      if (this.orm.kernel.type !== "CONSOLE") {
        this.gc(this.gc_maxlifetime, contextSession);
        return this.entity.countDocuments({
          context: contextSession
        }).then((sessionCount) => {
          this.manager.logger("CONTEXT " + (contextSession ? contextSession : "default") + " MONGODB SESSIONS STORAGE  ==>  " + this.manager.settings.handler.toUpperCase() + " COUNT SESSIONS : " + sessionCount, "INFO");
        });
      }
    }

    close() {
      this.gc(this.gc_maxlifetime);
      return true;
    }

    destroy(id, contextSession) {
      return this.entity.findOne({
          session_id: id,
          context: contextSession
        })
        .then((result) => {
          if (result) {
            return result.remove({
              force: true
            }).then((session) => {
              this.manager.logger("DB DESTROY SESSION context : " + session.context + " ID : " + session.session_id + " DELETED");
              return session;
            }).catch((error) => {
              this.manager.logger("DB DESTROY SESSION context : " + contextSession + " ID : " + id, "ERROR");
              throw error;
            });
          }
        }).catch((error) => {
          this.manager.logger("DB DESTROY SESSION context : " + contextSession + " ID : " + id, "ERROR");
          throw error;
        });
    }

    gc(maxlifetime, contextSession) {
      let msMaxlifetime = ((maxlifetime || this.gc_maxlifetime) * 1000);
      if (contextSession) {
        finderGC.call(this, msMaxlifetime, contextSession);
      } else {
        if (this.contextSessions.length) {
          for (let i = 0; i < this.contextSessions.length; i++) {
            finderGC.call(this, msMaxlifetime, this.contextSessions[i]);
          }
        }
      }
    }

    read(id, contextSession) {
      let where = null;
      if (contextSession) {
        where = {
          session_id: id,
          context: (contextSession)
        };
      } else {
        where = {
          session_id: id
        };
      }
      return this.entity.findOne(where)
        .then((result) => {
          if (result) {
            return {
              id: result.session_id,
              flashBag: result.flashBag,
              metaBag: result.metaBag,
              Attributes: result.Attributes
            };
          } else {
            return {};
          }
        }).catch((error) => {
          this.manager.logger(error, "ERROR");
          throw error;
        });
    }

    write(id, serialize, contextSession) {
      let data = nodefony.extend({}, serialize, {
        session_id: id,
        context: contextSession || "default"
      });
      return this.entity.updateOne({
          session_id: id,
          context: (contextSession || "default")
        }, data, {
          upsert: true
        }).then((result) => {
          if (result.nModified) {
            this.manager.logger("UPDATE SESSION : " + data.session_id, "DEBUG");
          }
          if (result.upserted) {
            this.manager.logger("ADD SESSION : " + data.session_id, "DEBUG");
          }
          return data;
        })
        .catch((error) => {
          if (error) {
            this.manager.logger(error, "ERROR");
            return error;
          }
        });
    }

  };
  return dbSessionStorage;
});
