const WebSocketClient = require('websocket').client;
const assert = require('assert');

const request = function (url, options) {
  return new Promise((resolve, reject) => {
    const client = new WebSocketClient();
    client.connect(url, null, null, null, options);
    client.on('connect', (connection) => {
      this.result.connect += 1;
      setTimeout(() => {
        connection.close(1000);
      }, 5000);

      connection.on("message", (message) => {
        this.logger(message, "INFO");
        assert(message);
      });
      connection.on('close', (reasonCode, description) => {
        this.logger(description, "INFO", `CLOSE WEBSOKET : ${reasonCode}`);
        if (reasonCode === 1000) {
          this.result["1OOO"] += 1;
        }
        if (this.result[reasonCode]) {
          this.result[reasonCode] += 1;
        } else {
          this.result[reasonCode] = 1;
        }
        return resolve(reasonCode);
      });
      connection.on('error', (error) => {
        this.logger(error, "ERROR");
      });

    });
    client.on('connectFailed', (error) => {
      this.logger(error, "ERROR");
      return reject(error);
    });
  });
};

const requestConcurence = function (url, options, concurence) {
  return new Promise((resolve, reject) => {
    let i = 0;
    for (;;) {
      request.call(this, url, options)
        .catch((error) => {
          this.logger(error, "ERROR");
        });
      if (i === (concurence - 1)) {
        resolve(concurence);
        break;
      }
      i++;
    }
  });
};

class loadTask extends nodefony.Task {

  constructor(name, command) {
    super(name, command);
    this.cli.idle();
    this.bundle = command.bundle;
    this.config = {
      hostname: this.kernel.settings.system.domain,
      port: this.kernel.settings.system.httpPort,
      method: 'GET',
      urlws: 'wss://' + this.kernel.settings.system.domain + ':' + this.kernel.settings.system.httpsPort
    };
    this.cert = this.get("httpsServer").getCertificats();
    this.result = {
      connect: 0,
      error: 0
    };
  }

  showHelp() {
    this.setHelp("test:load:websoket [nb]",
      "Websocket load test  nodefony test:load:websoket 100"
    );
    super.showHelp();
  }

  websoket(number, concurence) {
    return new Promise(async (resolve, reject) => {
      let url = `${this.config.urlws}/websoket`;
      let options = nodefony.extend({}, this.config, {
        key: this.cert.key,
        cert: this.cert.cert,
        ca: this.cert.ca
      });
      let nb = number || 100;
      let conc = concurence || 10;
      let i = 0;
      //console.log(nb, conc);
      return resolve(await requestConcurence.call(this, url, options, 5));
      try {
        for (;;) {
          try {
            let res = await requestConcurence.call(this, url, options, conc);
            this.logger({
              res: res,
              i: i,
              nb: nb
            });

            if (i === nb) {
              console.log(i, res, nb);
              console.log(this.result);
              resolve(i);
              break;
            }
            i += res;
          } catch (e) {
            this.logger(error, "ERROR");
            break;
          }
        }


      } catch (e) {
        this.logger(error, "ERROR");
      }

    });

  }

}

module.exports = loadTask;