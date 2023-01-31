/*
 *   MODEFONY FRAMEWORK UNIT TEST
 *
 *   MOCHA STYLE
 *
 *   In the global context you can find :
 *
 *    nodefony : namespace to get library
 *    kernel :   instance of kernel who launch the test
 *
 */

const http = require("http");
const https = require("https");
const WebSocketClient = require("websocket").client;
// var tunnel = require('tunnel');

const assert = require("assert");


describe("BUNDLE TEST", () => {
  describe("CONFIGURATIONS ", () => {
    it("KERNEL", (done) => {
      // console.log( kernel.settings.system.version );
      done();
    });
  });

  describe("SERVER", () => {
    it("HTTP", (done) => {
      const options = {
        hostname: kernel.settings.system.domain,
        port: kernel.settings.system.httpPort,
        path: "/json",
        method: "GET"
      };

      const request = http.request(options, (res) => {
        assert.equal(res.statusCode, 200);
        assert.equal(res.headers.server, "nodefony");
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          const res = JSON.parse(chunk);
          assert.deepStrictEqual(res, {
            foo: "bar",
            bar: "foo"
          });
          done();
        });
      });
      request.end();
    });

    it("HTTPS", (done) => {
      const service = kernel.get("httpsServer");
      const res = service.getCertificats();

      const options = {
        hostname: kernel.settings.system.domain,
        port: kernel.settings.system.httpsPort,
        path: "/json",
        method: "GET",
        key: res.key,
        cert: res.cert,
        ca: res.ca
      };

      const request = https.request(options, (res) => {
        assert.equal(res.statusCode, 200);
        assert.equal(res.headers.server, "nodefony");
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          const res = JSON.parse(chunk);
          assert.deepStrictEqual(res, {
            foo: "bar",
            bar: "foo"
          });
          done();
        });
      });
      request.end();
    });

    it("WEBSOCKET", (done) => {
      const client = new WebSocketClient();
      let iter = 0;

      /* connect(url,requestedProtocols, [[[origin], headers] )*/
      const url = `ws://${kernel.settings.system.domain}:${kernel.settings.system.httpPort}/websoket`;
      // let domain = "http://" + kernel.settings.system.domain + ':' + kernel.settings.system.httpPort;
      client.connect(url, null, null, null, {});
      client.on("connect", (connection) => {
        // console.log( "websoket connection ok on : " + url)
        connection.on("message", (/* message*/) => {
          // console.log(message)
          iter++;
        });
        // connection.close();
        connection.on("close", (reasonCode, description) => {
          assert.equal(iter, 9);
          assert.equal(reasonCode, 1000);
          assert.equal(description, "NODEFONY CONTROLLER CLOSE SOCKET");
          done();
        });
      });
      client.on("connectFailed", () => {
        throw new Error("websoket client error");
      });
    });

    it("WEBSOCKET_SECURE", (done) => {
      const service = kernel.get("httpsServer");
      const res = service.getCertificats();

      const options = {
        key: res.key,
        cert: res.cert,
        ca: res.ca
      };
      let client = null;
      try {
        client = new WebSocketClient();
      } catch (e) {
        throw e;
      }

      let iter = 0;

      const url = `wss://${kernel.settings.system.domain}:${kernel.settings.system.httpsPort}/websoket`;
      // let domain = "https://" + kernel.settings.system.domain + ':' + kernel.settings.system.httpsPort;
      client.connect(url, null, null, null, options);
      client.on("connect", (connection) => {
        connection.on("message", (/* message*/) => {
          // console.log(message)
          iter++;
        });
        // connection.close();
        connection.on("close", (reasonCode, description) => {
          assert.equal(iter, 9);
          assert.equal(reasonCode, 1000);
          assert.equal(description, "NODEFONY CONTROLLER CLOSE SOCKET");
          done();
        });
      });
      client.on("connectFailed", () => {
        throw new Error("websoket client error");
      });
    });
  });
});
