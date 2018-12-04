const redis = require('redis');
const shortId = require('shortid');

class redisClient extends nodefony.Service {

  constructor(name, options = {}, service = null) {
    super(name, service.container, nodefony.notificationsCenter.create(), options);
    this.service = service;
    this.client = null;
  }

  logger(pci, severity, msgid, msg) {
    if (!msgid) {
      msgid = `\x1b[36mREDIS CLIENT ${this.name} \x1b[0m`;
    }
    return super.logger(pci, severity, msgid, msg);
  }

  create(options = {}) {
    return new Promise((resolve, reject) => {
      try {
        this.settings = nodefony.extend({}, this.settings, options);
        this.client = this.service.engine.createClient(options);
        this.client.on('ready', () => {
          this.fire("onReady", this);
          if (options.password) {
            this.client.auth(options.password, () => {
              this.logger(`AUTHENTICATED READY ${this.settings.host} : ${this.settings.port} `, "INFO");
              return resolve(this.client);
            });
          } else {
            this.logger(`READY ${this.settings.host} : ${this.settings.port} `, "INFO");
            return resolve(this.client);
          }
        });
        this.client.on('error', (error) => {
          this.logger(error, "ERROR");
          this.fire("onError", error, this);
        });
        this.client.on('warning', (warning) => {
          this.logger(warning, "WARNING");
          this.fire("onWarning", warning, this);
        });
        this.client.on('end', () => {
          this.logger(`END CONNECT   ${this.settings.host} : ${this.settings.port} `, "INFO");
          this.fire("onEnd", this);
        });
        this.client.on('connect', () => {
          this.logger(`CONNECT  ${this.settings.host} : ${this.settings.port} `, "INFO");
          this.fire("onConnect", this);
        });
        this.client.on('reconnecting', () => {
          this.logger(`RECONNECTING  ${this.settings.host} : ${this.settings.port} `, "INFO");
          this.fire("onReconnecting", this);
        });
        this.client.on("subscribe", (channel, count) => {
          this.logger(`SUBSCRIBE  ${this.settings.host}:${this.settings.port} channel : ${channel} `, "INFO");
          this.fire("onSubscribe", channel, count, this);
        });
        this.client.on("message", (channel, message) => {
          this.logger(`MESSAGE  ${this.settings.host}:${this.settings.port} channel : ${channel} `, "DEBUG");
          this.logger(message, "DEBUG");
          this.fire("onMessage", channel, message, this);
        });
      } catch (e) {
        return reject(e);
      }
    });
  }

  subscribe(room) {
    try {
      return this.client.subscribe(room);
    } catch (e) {
      throw e;
    }
  }

  publish(channel, message) {
    try {
      return this.client.publish(channel, message);
    } catch (e) {
      throw e;
    }
  }
}

module.exports = class Redis extends nodefony.Service {

  constructor(container) {
    super("redis", container);
    this.engine = redis;
    BlueBird.promisifyAll(redis);
    this.subscribers = {};
    this.publishers = {};
    this.settings = this.bundle.settings.redis;
    this.settings.retry_strategy = this.retry_strategy;
    this.clients = {};
    this.degug = false;
    this.globalOptions = this.settings.globalOptions;
    if (this.settings.debug) {
      this.degug = true;
      process.env.DEBUG_MODE = "redis";
    }
  }

  boot() {
    if (this.kernel.ready) {
      for (let connection in this.settings.connections) {
        let options = nodefony.extend({}, this.globalOptions, this.settings.connections[connection]);
        this.createConnection(connection, options)
          .then((client) => {
            this.displayTable(client, "INFO");
          }).catch((e) => {
            this.logger(e, "ERROR");
          });
      }
    } else {
      this.kernel.on("onReady", () => {
        for (let connection in this.settings.connections) {
          let options = nodefony.extend({}, this.globalOptions, this.settings.connections[connection]);
          this.createConnection(connection, options)
            .then((client) => {
              this.displayTable(client, "INFO");
            }).catch((e) => {
              this.logger(e, "ERROR");
            });
        }
      });
    }
  }

  generateId() {
    return shortId.generate();
  }

  createConnection(name, options = {}) {
    return new Promise((resolve, reject) => {
      try {
        if (!name) {
          name = this.generateId();
        }
        if (name in this.clients) {
          throw new Error(`Redis client ${name} already exit `);
        }
        let conn = new redisClient(name, options, this);
        this.clients[conn.name] = conn;
        return conn.create(options)
          .then(() => {
            return resolve(conn);
          }).catch((e) => {
            return reject(e);
          });
      } catch (e) {
        return reject(e);
      }
    });
  }

  getClient(name) {
    if (name in this.clients) {
      return this.clients[name];
    }
    return null;
  }

  removeClient(name) {
    if (name in this.clients) {
      delete this.clients[name];
      return true;
    }
    throw new Error(`redis removeClient ${name} not found`);
  }

  retry_strategy(options) {
    console.log(options)
    if (options.error && options.error.code === 'ECONNREFUSED') {
      // End reconnecting on a specific error and flush all commands with
      // a individual error
      return new Error('The server refused the connection');
    }
    if (options.total_retry_time > 1000 * 60 * 60) {
      // End reconnecting after a specific timeout and flush all commands
      // with a individual error
      return new Error('Retry time exhausted');
    }
    if (options.attempt > 10) {
      // End reconnecting with built in error
      return undefined;
    }
    // reconnect after
    return Math.min(options.attempt * 100, 3000);
  }

  displayTable(client, severity = "DEBUG") {
    let options = {
      head: [
        "NAME CONNECTOR",
        "Address",
        "connected"
      ]
    };
    try {
      let table = this.kernel.cli.displayTable(null, options);
      let data = [];
      data.push(client.name || "");
      data.push(client.client.address || "");
      data.push(client.client.connected || "");
      table.push(data);
      this.logger(`REDIS CLIENT ${client.name} : \n${table.toString()}`, severity);
    } catch (e) {
      throw e;
    }
  }

};