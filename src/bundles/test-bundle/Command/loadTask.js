const WebSocketClient = require("websocket").client;
const assert = require("assert");

const request = function (url, options) {
  return new Promise((resolve, reject) => {
    const client = new WebSocketClient();
    this.result.requests += 1;
    client.connect(url, null, null, null, options);
    client.on("connect", (connection) => {
      this.result.connect += 1;
      setTimeout(() => {
        connection.close(1000);
      }, 1000);

      connection.on("message", (message) => {
        this.log(message, "INFO");
        assert(message);
      });
      connection.on("close", (reasonCode, description) => {
        this.log(description, "INFO", `CLOSE WEBSOKET : ${reasonCode}`);
        if (!this.result[reasonCode]) {
          this.result[reasonCode] = 0;
        }
        this.result[reasonCode] += 1;

        return resolve(reasonCode);
      });
      connection.on("error", (error) => {
        this.result.errors += 1;
        this.log(error, "ERROR");
      });
    });
    client.on("connectFailed", (error) => {
      this.log(error, "ERROR");
      return reject(error);
    });
  });
};

const requestConcurence = function (url, options, concurence) {
  return new Promise((resolve, reject) => {
    let i = 0;
    let j = 0;
    for (;;) {
      request.call(this, url, options)
        .then(() => {
          console.log("then : ", j, concurence);
          if (j === concurence - 1) {
            return resolve(concurence);
          }
          j++;
        })
        .catch((error) => {
          this.log(error, "ERROR");
          console.log("then : ", j, concurence);
          j++;
        });
      if (i === concurence - 1) {
        break;
      }
      i++;
    }
  });
};

class loadTask extends nodefony.Task {
  constructor (name, command) {
    super(name, command);
    this.bundle = command.bundle;
    this.config = {
      hostname: this.kernel.settings.system.domain,
      port: this.kernel.settings.system.httpPort,
      method: "GET",
      urlws: `wss://${this.kernel.settings.system.domain}:${this.kernel.settings.system.httpsPort}`
    };
    this.cert = this.get("httpsServer").getCertificats();
    this.result = {
      requests: 0,
      connect: 0,
      errors: 0
    };
  }

  showHelp () {
    this.setHelp(
      "test:load:websoket [nb]",
      "Websocket load test  nodefony test:load:websoket 100"
    );
    super.showHelp();
  }

  websoket (number, concurence) {
    return new Promise(async (resolve, reject) => {
      const url = `${this.config.urlws}/websoket`;
      const options = nodefony.extend({}, this.config, {
        key: this.cert.key,
        cert: this.cert.cert,
        ca: this.cert.ca
      });
      const nb = parseInt(number, 10) || 100;
      const conc = parseInt(concurence, 10) || 10;
      let i = 0;
      this.log({
        requests: nb,
        concurence: conc
      }, "INFO");
      try {
        for (;;) {
          try {
            const res = await requestConcurence.call(this, url, options, conc);
            this.log({
              res,
              i,
              nb
            });
            if (i >= nb - res) {
              console.log(this.result);
              return resolve(i);
            }
            i += res;
          } catch (e) {
            this.log(error, "ERROR");
            break;
          }
        }
      } catch (e) {
        this.log(error, "ERROR");
      }
    });
  }
}

module.exports = loadTask;
