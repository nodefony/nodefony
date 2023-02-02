const redis = require("redis");

class redisConnection extends nodefony.Service {
  constructor (name, options = {}, service = null) {
    super(name, service.container, nodefony.notificationsCenter.create(), options);
    this.service = service;
    this.client = null;
  }

  log (pci, severity, msgid, msg) {
    if (!msgid) {
      // eslint-disable-next-line no-param-reassign
      msgid = `\x1b[36mREDIS CONNECTION ${this.name} \x1b[0m`;
    }
    return super.log(pci, severity, msgid, msg);
  }

  create (options = {}) {
    return new Promise(async (resolve, reject) => {
      try {
        this.settings = nodefony.extend({}, options);
        this.client = this.service.engine.createClient(this.settings);
        await this.client.connect();
        if (options.password) {
          if (options.username) {
            await this.client.auth({
              username: options.username,
              password: options.password
            });
          } else {
            await this.client.auth({
              password: options.password
            });
          }
          this.log(`AUTHENTICATED READY ${this.settings.socket.host} : ${this.settings.socket.port} `, "INFO");
        } else {
          this.log(`READY ${this.settings.socket.host} : ${this.settings.socket.port} `, "INFO");
        }

        this.client.on("error", (error) => {
          this.log(error, "ERROR");
          this.fire("onError", error, this);
        });
        this.client.on("warning", (warning) => {
          this.log(warning, "WARNING");
          this.fire("onWarning", warning, this);
        });
        this.client.on("end", () => {
          this.log(`END CONNECT   ${this.settings.socket.host} : ${this.settings.socket.port} `, "INFO");
          this.fire("onEnd", this);
        });
        this.client.on("connect", () => {
          this.log(`CONNECT  ${this.settings.socket.host} : ${this.settings.socket.port} `, "INFO");
          this.fire("onConnect", this);
        });
        this.client.on("reconnecting", () => {
          this.log(`RECONNECTING  ${this.settings.socket.host} : ${this.settings.socket.port} `, "INFO");
          this.fire("onReconnecting", this);
        });
        this.client.on("subscribe", (channel, count) => {
          this.log(`SUBSCRIBE  ${this.settings.socket.host}:${this.settings.socket.port} channel : ${channel} `, "INFO");
          this.fire("onSubscribe", channel, count, this);
        });
        this.client.on("unsubscribe", (channel, count) => {
          this.log(`UNSUBSCRIBE  ${this.settings.socket.host}:${this.settings.socket.port} channel : ${channel} `, "INFO");
          this.fire("onUnsubscribe", channel, count, this);
        });
        this.client.on("psubscribe", (pattern, count) => {
          this.log(`PSUBSCRIBE  ${this.settings.socket.host}:${this.settings.socket.port} pattern : ${pattern} `, "INFO");
          this.fire("onPsubscribe", pattern, count, this);
        });
        this.client.on("punsubscribe", (pattern, count) => {
          this.log(`PUNSUBSCRIBE  ${this.settings.socket.host}:${this.settings.socket.port} pattern : ${pattern} `, "INFO");
          this.fire("onPunsubscribe", pattern, count, this);
        });
        this.client.on("message", (channel, message) => {
          this.log(`MESSAGE  ${this.settings.socket.host}:${this.settings.socket.port} channel : ${channel} `, "DEBUG");
          this.log(message, "DEBUG");
          this.fire("onMessage", channel, message, this);
        });
        this.client.on("message_buffer", (channel, message) => {
          this.log(`MESSAGE BUFFER  ${this.settings.socket.host}:${this.settings.socket.port} channel : ${channel} `, "DEBUG");
          this.log(message, "DEBUG");
          this.fire("onMessage_buffer", channel, message, this);
        });
        this.client.on("pmessage", (pattern, channel, message) => {
          this.log(`PMESSAGE  ${this.settings.socket.host}:${this.settings.socket.port} pattern : ${pattern} channel : ${channel} `, "DEBUG");
          this.log(message, "DEBUG");
          this.fire("onPmessage", pattern, channel, message, this);
        });
        this.client.on("pmessage_buffer", (pattern, channel, message) => {
          this.log(`PMESSAGE BUFFER  ${this.settings.socket.host}:${this.settings.socket.port} pattern : ${pattern} channel : ${channel} `, "DEBUG");
          this.log(message, "DEBUG");
          this.fire("onPmessage_buffer", pattern, channel, message, this);
        });
        this.fire("onReady", this);
        return resolve(this.client);
      } catch (e) {
        console.trace(e);
        return reject(e);
      }
    });
  }
}

class Redis extends nodefony.services.Connections {
  constructor (container) {
    super("redis", container, redis, redisConnection);
    this.debug = false;
  }

  readConfig () {
    this.settings = this.bundle.settings.redis;
    if (this.settings.debug) {
      this.debug = true;
      process.env.DEBUG_MODE = "redis";
    }
    this.globalOptions = this.settings.globalOptions;
    this.globalOptions.socket.reconnectStrategy = this.retry_strategy;
    for (const connection in this.settings.connections) {
      const options = nodefony.extend({}, this.globalOptions, this.settings.connections[connection]);
      this.createConnection(connection, options)
        .then((client) => {
          this.displayTable(client, "INFO");
        })
        .catch((e) => {
          this.log(e, "ERROR");
        });
    }
  }

  print (error, message) {
    if (error) {
      return this.log(message, "ERROR");
    }
    return this.log(message);
  }

  retry_strategy (retries) {
    return Math.min(retries * 100, 10000);
  }

  displayTable (client, severity = "DEBUG") {
    const options = {
      head: [
        `${this.name.toUpperCase()} CONNECTIONS NAME`,
        "HOSTS",
        "CONNECTED"
      ]
    };
    try {
      const table = this.kernel.cli.displayTable(null, options);
      const data = [];
      data.push(client.name || "");
      data.push(client.client.address || "");
      data.push(client.client.connected || "");
      table.push(data);
      this.log(` ${client.name} : \n${table.toString()}`, severity);
    } catch (e) {
      throw e;
    }
  }
}

nodefony.services.Redis = Redis;
module.exports = Redis;
