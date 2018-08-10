const Sequelize = require('sequelize');

const error = function (err) {

  if (this.state !== "DISCONNECTED") {
    this.orm.kernel.fire('onError', err, this);
  }
  this.logger(err, "ERROR");
  this.logger(this.settings, "INFO", `CONFIGURATION Sequelize ${this.name}`);
  if (err.code) {
    switch (err.code) {
    case 'PROTOCOL_CONNECTION_LOST':
    case "ECONNREFUSED":
      this.state = "DISCONNECTED";
      return {
        status: 500,
        code: err.code,
        message: err.message
      };
    default:
      return err;
    }
  } else {
    return err;
  }
};

const Op = Sequelize.Op;
const operatorsAliases = {
  $eq: Op.eq,
  $ne: Op.ne,
  $gte: Op.gte,
  $gt: Op.gt,
  $lte: Op.lte,
  $lt: Op.lt,
  $not: Op.not,
  $in: Op.in,
  $notIn: Op.notIn,
  $is: Op.is,
  $like: Op.like,
  $notLike: Op.notLike,
  $iLike: Op.iLike,
  $notILike: Op.notILike,
  $regexp: Op.regexp,
  $notRegexp: Op.notRegexp,
  $iRegexp: Op.iRegexp,
  $notIRegexp: Op.notIRegexp,
  $between: Op.between,
  $notBetween: Op.notBetween,
  $overlap: Op.overlap,
  $contains: Op.contains,
  $contained: Op.contained,
  $adjacent: Op.adjacent,
  $strictLeft: Op.strictLeft,
  $strictRight: Op.strictRight,
  $noExtendRight: Op.noExtendRight,
  $noExtendLeft: Op.noExtendLeft,
  $and: Op.and,
  $or: Op.or,
  $any: Op.any,
  $all: Op.all,
  $values: Op.values,
  $col: Op.col
};

/*
 *
 * CLASS LIBRARY CONNECTION
 *
 */
const connectionDB = class connectionDB {

  constructor(name, type, options, orm) {
    this.state = "DISCONNECTED";
    this.name = name;
    this.type = type;
    this.db = null;
    this.orm = orm;
    this.intervalId = null;
    if (options.options) {
      options.options = nodefony.extend(true, {
        operatorsAliases: operatorsAliases
      }, options.options);
    }
    this.settings = options;
    this.connect(type, this.settings);
  }

  setConnection(db, config) {
    if (!db) {
      throw new Error("Cannot create class connection without db native");
    }
    this.db = db;
    this.orm.fire("onConnect", this.name, this.db);
    this.state = "CONNECTED";
    let severity = "INFO";
    if (this.orm.kernel.type === "CONSOLE") {
      severity = "DEBUG";
    }
    this.logger('Connection been established successfully Type : ' + this.type + " Database : " + config.dbname, severity);
  }

  getConnection() {
    return this.db;
  }

  connect(type, config) {
    if (this.orm.debug) {
      config.options.logging = (value) => {
        this.logger(value, "DEBUG");
      };
    } else {
      config.options.logging = false;
    }
    let conn = null;
    try {
      switch (type) {
      case "sqlite":
        config.options.storage = process.cwd() + config.dbname;
        break;
      }
      conn = new this.orm.engine(config.dbname, config.username, config.password, config.options);
      process.nextTick(() => {
        conn
          .authenticate()
          .then(() => {
            this.setConnection(conn, config);
          })
          .catch(err => {
            this.logger('Unable to connect to the database : ' + err, "ERROR");
            error.call(this, err);
            this.orm.fire('onErrorConnection', this.name, conn, this.orm);
          });
      });
    } catch (err) {
      error.call(this, err);
      this.orm.fire('onErrorConnection', this.name, conn, this.orm);
    }
    return conn;
  }

  logger(pci, severity, msgid, msg) {
    if (!msgid) {
      msgid = `CONNECTION Sequelize ${this.name}`;
    }
    return this.orm.logger(pci, severity, msgid, msg);
  }
};

/*
 *
 * CLASS SERVICE sequelize
 *
 */
module.exports = class sequelize extends nodefony.orm {

  constructor(container, kernel, autoLoader) {
    super("sequelize", container, kernel, autoLoader);
    this.engine = Sequelize;
    this.boot();
  }

  boot() {
    super.boot();
    this.kernel.listen(this, 'onBoot', ( /*kernel*/ ) => {
      this.settings = this.getParameters("bundles.sequelize");
      this.debug = this.settings.debug;
      if (this.settings.connectors && Object.keys(this.settings.connectors).length) {
        this.kernel.listen(this, "onReady", () => {
          this.displayTable();
        });
        for (let name in this.settings.connectors) {
          this.createConnection(name, this.settings.connectors[name]);
        }
      } else {
        process.nextTick(() => {
          this.logger('onOrmReady', "DEBUG", "EVENTS SEQUELIZE");
          this.fire('onOrmReady', this);
          this.ready = true;
        });
      }
    });
  }

  getConnectorSettings(tab) {
    for (let dbname in this.settings.connectors) {
      let conn = ["", "", ""];
      conn[0] = dbname;
      for (let data in this.settings.connectors[dbname]) {
        switch (data) {
        case "dbname":
          conn[1] = this.settings.connectors[dbname][data];
          break;
        case "driver":
          conn[2] = this.settings.connectors[dbname][data];
          break;
        }
      }
      tab.push(conn);
    }
    return tab;
  }

  displayTable(severity = "DEBUG") {
    let options = {
      head: [
        "NAME CONNECTOR",
        "NAME DATABASE",
        "DRIVER",
      ]
    };
    let table = this.kernel.cli.displayTable(null, options);
    this.getConnectorSettings(table);
    let res = table.toString();
    this.logger("ORM CONNECTORS LIST  : \n" + res, severity);
    return res;
  }

  createConnection(name, config) {
    try {
      return this.connections[name] = new connectionDB(name, config.driver, config, this);
    } catch (e) {
      throw e;
    }
  }
};