/*
 *   MODEFONY FRAMEWORK UNIT TEST
 *
 *   MOCHA STYLE
 *
 *   In the global context you can find :
 *
 * nodefony : namespace to get library
 * kernel :   instance of kernel who launch the test
 *
 */

// var http = require("http");
// var https = require("https");
// var WebSocketClient = require('websocket').client;
// var tunnel = require('tunnel');

const assert = require("assert");


describe("NODEFONY BUNDLE HTTP", () => {
  describe("WEB", () => {
    it("HTTP-SERVICE", (doneHttp) => {
      const options = {
        url: `http://${kernel.settings.system.domain}:${kernel.settings.system.httpPort}`,
        headers: {
          "User-Agent": "nodefony"
        }
      };

      doneHttp();
    });

    it("HTTPS-SERVICE", (doneHttps) => {
      const service = kernel.get("httpsServer");
      const res = service.getCertificats();

      const options = {
        url: `https://${kernel.settings.system.domain}:${kernel.settings.system.httpsPort}`,
        agentOptions: {
          key: res.key,
          cert: res.cert,
          ca: res.ca
        }
      };

      doneHttps();
    });
  });
});
