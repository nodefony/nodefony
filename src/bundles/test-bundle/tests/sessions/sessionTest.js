const http = require("http");
const https = require("https");
const WebSocketClient = require("websocket").client;
const request = require("request");
const assert = require("assert");

describe("BUNDLE TEST", () => {
  before(() => {
    global.options = {
      url: `http://${kernel.settings.system.domain}:${kernel.settings.system.httpPort}`,
      urlws: `ws://${kernel.settings.system.domain}:${kernel.settings.system.httpPort}`
    };

    const serviceSession = kernel.get("sessions");
    global.startSesion = serviceSession.settings.start;
  });

  describe("SESSION START HTTP", () => {
    it("SESSION-NO-SESSION", (done) => {
      if (global.startSesion === false) {
        const {url} = global.options;
        const options = nodefony.extend({}, global.options, {
          url: `${url}/test/unit/session/none`
        });
        request(options, (error, res, body) => {
          if (error) {
            throw error;
          }
          if (res.headers["set-cookie"]) {
            throw new Error("set-cookie exist !!!!");
          }
          done();
        });
      } else {
        done();
      }
    });

    it("SESSION-START", (done) => {
      const {url} = global.options;
      const options = nodefony.extend({}, global.options, {
        url: `${url}/test/unit/session/start`
      });
      request(options, (error, res, body) => {
        if (error) {
          throw error;
        }
        let id = null;
        if (res.headers["set-cookie"]) {
          try {
            id = res.headers["set-cookie"][0].split(";")[0].split("=")[1];
          } catch (e) {
            throw e;
          }
        }
        const ret = JSON.parse(body);
        assert.deepStrictEqual(ret.id, id);
        assert.deepStrictEqual(ret.name, "nodefony");
        assert.deepStrictEqual(ret.strategy, "migrate");
        assert.deepStrictEqual(ret.contextSession, "default");
        assert.deepStrictEqual(ret.status, "active");
        done();
      });
    });
    it("SESSION-INVALIDATE", (done) => {
      const {url} = global.options;
      const options = nodefony.extend({}, global.options, {
        url: `${url}/test/unit/session/invalidate`
      });
      request(options, (error, res, body) => {
        if (error) {
          throw error;
        }
        let id = null;
        if (res.headers["set-cookie"]) {
          try {
            id = res.headers["set-cookie"][0].split(";")[0].split("=")[1];
          } catch (e) {
            throw e;
          }
        }
        const ret = JSON.parse(body);
        assert.deepStrictEqual(ret.id, id);
        assert.notEqual(ret.oldId, id);
        assert.deepStrictEqual(ret.name, "nodefony");
        assert.deepStrictEqual(ret.strategy, "migrate");
        assert.deepStrictEqual(ret.contextSession, "default");
        assert.deepStrictEqual(ret.status, "active");
        done();
      });
    });
    it("SESSION-MIGRATE", (done) => {
      const {url} = global.options;
      const options = nodefony.extend({}, global.options, {
        url: `${url}/test/unit/session/migrate`
      });
      request(options, (error, res, body) => {
        if (error) {
          throw error;
        }
        let id = null;
        if (res.headers["set-cookie"]) {
          try {
            id = res.headers["set-cookie"][0].split(";")[0].split("=")[1];
          } catch (e) {
            throw e;
          }
        }
        const ret = JSON.parse(body);
        assert.deepStrictEqual(ret.id, id);
        assert.notEqual(ret.oldId, id);
        assert.deepStrictEqual(ret.name, "nodefony");
        assert.deepStrictEqual(ret.strategy, "migrate");
        assert.deepStrictEqual(ret.contextSession, "default");
        assert.deepStrictEqual(ret.status, "active");
        done();
      });
    });
  });

  describe("SESSION START WEBSOCKET", () => {
    it("WEBSOCKET", (done) => {
      const url = global.options.urlws;
      const options = nodefony.extend({}, global.options, {
        url: `${url}/test/unit/session/none`
      });
      const client = new WebSocketClient();
      client.connect(options.url, null, url, null, {});
      client.on("connect", (connection) => {
        connection.on("message", (message) => {
          const res = JSON.parse(message.utf8Data);
          assert.deepStrictEqual(res.id, null);
          connection.close();
        });
        connection.on("close", (reasonCode, description) => {
          done();
        });
      });
      client.on("connectFailed", () => {
        throw new Error("websoket client error");
      });
    });
    it("SESSION-START", (done) => {
      const url = global.options.urlws;
      const options = nodefony.extend({}, global.options, {
        url: `${url}/test/unit/session/start`
      });

      const client = new WebSocketClient();
      client.on("connect", (connection) => {
        // console.log(connection)
        // FIXME try to get cookies with websocket client ????

        connection.on("message", (message) => {
          const res = JSON.parse(message.utf8Data);
          if (res.foo) {
            return connection.close();
          }
          // assert.deepStrictEqual(res.id, id);
          assert.deepStrictEqual(res.name, "nodefony");
          assert.deepStrictEqual(res.strategy, "migrate");
          assert.deepStrictEqual(res.contextSession, "default");
          assert.deepStrictEqual(res.status, "active");
        });
        connection.on("close", (reasonCode, description) => {
          done();
        });

        setTimeout(() => {
          connection.sendUTF(JSON.stringify({
            foo: "bar"
          }));
        }, 500);
      });
      client.on("connectFailed", () => {
        throw new Error("websoket client error");
      });
      client.connect(options.url, null, url, null, {});
    });

    it("SESSION-INVALIDATE", (done) => {
      const url = global.options.urlws;
      const options = nodefony.extend({}, global.options, {
        url: `${url}/test/unit/session/invalidate`
      });
      const client = new WebSocketClient();
      client.on("connect", (connection) => {
        // console.log(connection)
        // FIXME try to get cookies with websocket client ????

        connection.on("message", (message) => {
          const res = JSON.parse(message.utf8Data);
          if (res.foo) {
            return connection.close();
          }
          // assert.deepStrictEqual(res.id, id);
          // assert.notEqual(res.oldId, id);
          assert.deepStrictEqual(res.name, "nodefony");
          assert.deepStrictEqual(res.strategy, "migrate");
          assert.deepStrictEqual(res.contextSession, "default");
          assert.deepStrictEqual(res.status, "active");
        });
        connection.on("close", (reasonCode, description) => {
          done();
        });

        setTimeout(() => {
          connection.sendUTF(JSON.stringify({
            foo: "bar"
          }));
        }, 500);
      });
      client.on("connectFailed", () => {
        throw new Error("websoket client error");
      });
      client.connect(options.url, null, url, null, {});
    });

    it("SESSION-MIGRATE", (done) => {
      const url = global.options.urlws;
      const options = nodefony.extend({}, global.options, {
        url: `${url}/test/unit/session/migrate`
      });
      const client = new WebSocketClient();
      client.on("connect", (connection) => {
        // console.log(connection)
        // FIXME try to get cookies with websocket client ????
        connection.on("message", (message) => {
          const res = JSON.parse(message.utf8Data);
          if (res.foo) {
            return connection.close();
          }
          // assert.deepStrictEqual(res.id, id);
          // assert.notEqual(res.oldId, id);
          assert.deepStrictEqual(res.name, "nodefony");
          assert.deepStrictEqual(res.strategy, "migrate");
          assert.deepStrictEqual(res.contextSession, "default");
          assert.deepStrictEqual(res.status, "active");
        });
        connection.on("close", (reasonCode, description) => {
          done();
        });

        setTimeout(() => {
          connection.sendUTF(JSON.stringify({
            foo: "bar"
          }));
        }, 500);
      });
      client.on("connectFailed", (error) => {
        throw new Error(error);
      });
      client.connect(options.url, null, url, null, {});
    });
  });
});
