/*
 *   MODEFONY FRAMEWORK UNIT TEST
 *
 *   MOCHA STYLE
 *
 *   In the global context you can find :
 *
 *  nodefony : namespace to get library
 *  kernel :   instance of kernel who launch the test
 *
 */

// const http = require("http");
// var https = require("https");
const WebSocketClient = require("websocket").client;
const assert = require("assert");
// var querystring = require("querystring");


describe("BUNDLE TEST", () => {
  before(() => {
    global.options = {
      hostname: kernel.settings.system.domain,
      port: kernel.settings.system.httpPort,
      method: "GET",
      urlws: `ws://${kernel.settings.system.domain}:${kernel.settings.system.httpPort}`
    };
  });

  describe(" WEBSOCKET", () => {
    it("404", (done) => {
      const url = global.options.urlws;
      const options = nodefony.extend({}, global.options, {
        url: `${url}/test/unit/websockete`
      });
      const client = new WebSocketClient();

      client.connect(options.url, null);
      client.on("connect", () => {
        throw new Error("404 can't be connected");
      });
      client.on("connectFailed", (error) => {
        assert(error);
        done();
      });
    });

    it("404 connect", (done) => {
      const url = global.options.urlws;
      const options = nodefony.extend({}, global.options, {
        url: `${url}/test/unit/websocket/404`
      });
      const client = new WebSocketClient();
      // let domain = "http://"+ kernel.settings.system.domain + ':' + kernel.settings.system.httpPort;
      client.connect(options.url, null);
      client.on("connect", (connection) => {
        assert(connection.connected);
        connection.on("message", (message) => {
          const res = JSON.parse(message.utf8Data);
          assert.deepStrictEqual(res.code, 404);
        });
        connection.on("close", (reasonCode, description) => {
          assert.deepStrictEqual(reasonCode, 3404);
          assert.deepStrictEqual(description, "Not Found");
          done();
        });
      });
      client.on("connectFailed", (error) => {
        throw new Error(error);
      });
    });

    it("bad protocol", (done) => {
      const url = global.options.urlws;
      const options = nodefony.extend({}, global.options, {
        url: `${url}/test/unit/websocket/protocol`
      });
      const client = new WebSocketClient();
      client.connect(options.url, "telnete");
      client.on("connectFailed", (error) => {
        assert(error);
        done();
      });
    });
    it("protocol", (done) => {
      const url = global.options.urlws;
      const options = nodefony.extend({}, global.options, {
        url: `${url}/test/unit/websocket/protocol/telnet`
      });
      const client = new WebSocketClient();
      client.connect(options.url, "telnet");
      client.on("connect", (connection) => {
        assert(connection.connected);
        connection.on("message", (message) => {
          const res = JSON.parse(message.utf8Data);
          assert.deepStrictEqual(res.protocol, "telnet");
          assert.deepStrictEqual(res.origin.host, `${global.options.hostname}:${global.options.port}`);
          assert.deepStrictEqual(res.origin.hostname, global.options.hostname);
          assert.deepStrictEqual(res.origin.port, "5151");
          assert.deepStrictEqual(res.origin.protocol, "ws:");
          connection.close();
        });
        connection.on("close", (reasonCode, description) => {
          assert.deepStrictEqual(reasonCode, 1000);
          assert.deepStrictEqual(description, "Normal connection closure");
          done();
        });
      });
      client.on("connectFailed", (error) => {
        throw new Error(error);
      });
    });
  });
});
