const redis = require('redis');

class redisConnection extends nodefony.Service {

  constructor(name, options = {}, service = null) {
    super(name, service.container, nodefony.notificationsCenter.create(), options);
    this.service = service;
    this.client = null;
  }

  logger(pci, severity, msgid, msg) {
    if (!msgid) {
      msgid = `\x1b[36mREDIS CONNECTION ${this.name} \x1b[0m`;
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
        this.client.on("unsubscribe", (channel, count) => {
          this.logger(`UNSUBSCRIBE  ${this.settings.host}:${this.settings.port} channel : ${channel} `, "INFO");
          this.fire("onUnsubscribe", channel, count, this);
        });
        this.client.on("psubscribe", (pattern, count) => {
          this.logger(`PSUBSCRIBE  ${this.settings.host}:${this.settings.port} pattern : ${pattern} `, "INFO");
          this.fire("onPsubscribe", pattern, count, this);
        });
        this.client.on("punsubscribe", (pattern, count) => {
          this.logger(`PUNSUBSCRIBE  ${this.settings.host}:${this.settings.port} pattern : ${pattern} `, "INFO");
          this.fire("onPunsubscribe", pattern, count, this);
        });
        this.client.on("message", (channel, message) => {
          this.logger(`MESSAGE  ${this.settings.host}:${this.settings.port} channel : ${channel} `, "DEBUG");
          this.logger(message, "DEBUG");
          this.fire("onMessage", channel, message, this);
        });
        this.client.on("message_buffer", (channel, message) => {
          this.logger(`MESSAGE BUFFER  ${this.settings.host}:${this.settings.port} channel : ${channel} `, "DEBUG");
          this.logger(message, "DEBUG");
          this.fire("onMessage_buffer", channel, message, this);
        });
        this.client.on("pmessage", (pattern, channel, message) => {
          this.logger(`PMESSAGE  ${this.settings.host}:${this.settings.port} pattern : ${pattern} channel : ${channel} `, "DEBUG");
          this.logger(message, "DEBUG");
          this.fire("onPmessage", pattern, channel, message, this);
        });
        this.client.on("pmessage_buffer", (pattern, channel, message) => {
          this.logger(`PMESSAGE BUFFER  ${this.settings.host}:${this.settings.port} pattern : ${pattern} channel : ${channel} `, "DEBUG");
          this.logger(message, "DEBUG");
          this.fire("onPmessage_buffer", pattern, channel, message, this);
        });
      } catch (e) {
        return reject(e);
      }
    });
  }

}

module.exports = class Redis extends nodefony.services.connections {

  constructor(container) {
    super("redis", container, redis, redisConnection);
    BlueBird.promisifyAll(this.engine);
    this.degug = false;
  }

  readConfig() {
    this.settings = this.bundle.settings.redis;
    this.settings.retry_strategy = this.retry_strategy;
    if (this.settings.debug) {
      this.degug = true;
      process.env.DEBUG_MODE = "redis";
    }
    this.globalOptions = this.settings.globalOptions;
    for (let connection in this.settings.connections) {
      let options = nodefony.extend({}, this.globalOptions, this.settings.connections[connection]);
      this.createConnection(connection, options)
        .then((client) => {
          this.displayTable(client, "INFO");
        }).catch((e) => {
          this.logger(e, "ERROR");
        });
    }
  }

  print(error, message) {
    if (error) {
      return this.logger(message, "ERROR");
    }
    return this.logger(message);
  }

  retry_strategy(options) {
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
        `${this.name.toUpperCase()} CONNECTIONS NAME`,
        "HOSTS",
        "CONNECTED"
      ]
    };
    try {
      let table = this.kernel.cli.displayTable(null, options);
      let data = [];
      data.push(client.name || "");
      data.push(client.client.address || "");
      data.push(client.client.connected || "");
      table.push(data);
      this.logger(` ${client.name} : \n${table.toString()}`, severity);
    } catch (e) {
      throw e;
    }
  }

};