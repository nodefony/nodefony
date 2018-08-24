const Memcached = require('memcached');

nodefony.register.call(nodefony.session.storage, "memcached", function () {

  const checkClient = function (contextSession) {
    let client = null;
    if (contextSession) {
      if (this.clients[contextSession]) {
        client = this.clients[contextSession];
      } else {
        throw ("client Memcached not found error context : " + contextSession);
      }
    } else {
      if (this.clients["default"]) {
        client = this.clients["default"];
      } else {
        throw ("client Memcached not found error context ", null);
      }
    }
    return client;
  };

  const memcacheGC = function ( /*client, msMaxlifetime*/ ) {};

  const memcachedSessionStorage = class memcachedSessionStorage {
    constructor(manager) {
      this.manager = manager;
      this.gc_maxlifetime = manager.settings.gc_maxlifetime;
      this.contextSessions = [];
      this.settings = manager.settings.memcached;
      this.options = this.settings.options;
      this.servers = {};
      this.clients = {};

      for (let server in this.settings.servers) {
        let port = this.settings.servers[server].port ? this.settings.servers[server].port : 11211;
        let host = this.settings.servers[server].location;
        let weight = this.settings.servers[server].weight ? this.settings.servers[server].weight : 1;
        this.servers[host + ":" + port] = weight;
      }
    }

    logger(pci, severity, msgid, msg) {
      let syslog = this.manager;
      if (!msgid) {
        msgid = "MEMCACHED SESSION STORAGE";
      }
      return syslog.logger(pci, severity || "DEBUG", msgid, msg);
    }

    start(id, contextSession) {
      try {
        return this.read(id, contextSession);
      } catch (e) {
        throw e;
      }
    }

    open(contextSession) {
      this.clients[contextSession] = new Memcached(this.servers, nodefony.extend({}, this.options, {
        namespace: contextSession
      }));

      /*this.clients[contextSession].stats(function(error, stats){
      this.stats = stats ;
    }.bind(this));*/

      this.clients[contextSession].on('issue', (details) => {
        if (details.failures) {
          this.logger(details.message, "ERROR");
        } else {
          this.logger(details.message, "INFO");
        }
      });

      this.clients[contextSession].on('failure', (details) => {
        this.logger("Server " + details.server + "went down due to: " + details.messages.join(''), "ERROR");
      });

      this.clients[contextSession].on('reconnecting', (details) => {
        this.logger("Total downtime caused by server " + details.server + " :" + details.totalDownTime + "ms", "INFO");
      });

      this.gc(this.gc_maxlifetime, contextSession);

      return true;
    }

    close() {
      this.gc(this.gc_maxlifetime);
      return true;
    }

    destroy(id, contextSession) {
      return new Promise((resolve, reject) => {
        let client = null;
        try {
          client = checkClient.call(this, contextSession);
        } catch (e) {
          this.logger(e, "ERROR");
          return reject(e);
        }

        client.get(id, (err /*, data*/ ) => {
          if (err) {
            this.logger(" context : " + contextSession + " ID : " + id + " DESTROY ERROR", "ERROR");
            return reject(err);
          }

          client.del(id, (err) => {
            if (err) {
              this.logger(" context : " + contextSession + " ID : " + id + " DESTROY ERROR", "ERROR");
              return reject(err);
            }
            this.logger(" DESTROY SESSION context : " + contextSession + " ID : " + id + " DELETED");
            return resolve(id);
          });
        });
      });
    }

    gc(maxlifetime, contextSession) {
      let msMaxlifetime = ((maxlifetime || this.gc_maxlifetime) * 1000);
      if (contextSession) {
        if (this.clients[contextSession]) {
          memcacheGC.call(this, this.clients[contextSession], msMaxlifetime);
        }
      } else {
        for (var client in this.clients) {
          memcacheGC.call(this, this.clients[client], msMaxlifetime);
        }
      }
    }

    read(id, contextSession /*, callback*/ ) {
      return new Promise((resolve, reject) => {
        let client = null;
        try {
          client = checkClient.call(this, contextSession);
        } catch (e) {
          this.logger(e, "ERROR");
          return reject(e);
        }
        try {
          client.get(id, function (err, data) {
            if (err) {
              return reject(err);
            }
            if (data) {
              return resolve(JSON.parse(data));
            } else {
              return resolve({});
            }
          });
        } catch (e) {
          this.logger(e, "ERROR");
          return reject(e);
        }
      });
    }

    write(id, serialize, contextSession /*, callback*/ ) {
      return new Promise((resolve, reject) => {
        let client = null;
        try {
          client = checkClient.call(this, contextSession);
        } catch (e) {
          this.logger(e, "ERROR");
          return reject(e);
        }
        try {
          client.get(id, (err, data) => {
            if (err) {
              return reject(err);
            }
            if (data) {
              try {
                client.replace(id, JSON.stringify(serialize), this.gc_maxlifetime, (err /*, result*/ ) => {
                  if (err) {
                    return reject(err);
                  }
                  return resolve(serialize);
                });
              } catch (e) {
                return reject(e);
              }
            } else {
              try {
                client.set(id, JSON.stringify(serialize), this.gc_maxlifetime, (err /*, result*/ ) => {
                  if (err) {
                    return reject(err);
                  }
                  return resolve(serialize);
                });
              } catch (e) {
                return reject(e);
              }
            }
          });
        } catch (e) {
          this.logger(e, "ERROR");
          return reject(e);
        }
      });
    }
  };
  return memcachedSessionStorage;
});
