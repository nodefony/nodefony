module.exports = nodefony.register("orm", function () {

  const connectionMonitor = function (name, db, orm) {
    this.connectionNotification++;
    if (Object.keys(orm.settings.connectors).length === this.connectionNotification) {
      process.nextTick(() => {
        orm.logger('onOrmReady', "DEBUG", "EVENTS ORM");
        orm.fire('onOrmReady', orm);
      });
    }
  };

  const Orm = class Orm extends nodefony.Service {

    constructor(name, container, kernel, autoLoader) {

      super(name, container);

      if ((this.kernel.debug === false && this.debug === true) || this.debug === undefined) {
        this.debug = this.kernel.debug;
      }
      this.entities = {};
      this.definitions = {};
      this.autoLoader = autoLoader;
      this.connections = {};
      this.connectionNotification = 0;
    }

    boot() {
      this.listen(this, "onReadyConnection", connectionMonitor);
      this.listen(this, "onErrorConnection", connectionMonitor);

      this.kernel.listen(this, 'onBoot', (kernel) => {
        let callback = null;
        for (let bundle in kernel.bundles) {
          if (Object.keys(kernel.bundles[bundle].entities).length) {
            for (let entity in kernel.bundles[bundle].entities) {
              let ele = kernel.bundles[bundle].entities[entity];
              if (ele.type !== this.name) {
                continue;
              }
              if (!(ele.connection in this.definitions)) {
                this.definitions[ele.connection] = [];
              }
              callback = (enti, bundle, name) => {
                let Enti = enti;
                let Name = name;
                let Bundle = bundle;
                return (db) => {
                  try {
                    this.entities[Name] = Enti.entity.call(this, db, this);
                    this.logger(this.name + " REGISTER ENTITY : " + Name + " PROVIDE BUNDLE : " + Bundle, "DEBUG");
                    return Enti;
                  } catch (e) {
                    this.logger(e);
                  }
                };
              };
              callback = callback(ele, bundle, entity);
              this.definitions[ele.connection].push(callback);
            }
          }
        }
      });

      this.listen(this, "onConnect", (name, db) => {
        if (name in this.definitions) {
          for (let i = 0; i < this.definitions[name].length; i++) {
            this.definitions[name][i](db);
          }
        }
        try {
          this.fire("onReadyConnection", name, db, this);
        } catch (e) {
          this.logger(e, "ERROR", this.name + " ENTITY");
        }
      });
    }

    logger(pci, severity, msgid, msg) {
      if (!msgid) {
        msgid = this.kernel.cli.clc.magenta(this.name + " ");
      }
      return super.logger(pci, severity, msgid, msg);
    }

    getConnection(name) {
      if (this.connections[name]) {
        return this.connections[name].db;
      }
      return null;
    }

    getEntity(name) {
      if (name) {
        return this.entities[name];
      } else {
        return this.entities;
      }
    }
  };

  return Orm;
});
