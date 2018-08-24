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

const http = require("http");
//const https = require("https");
//const WebSocketClient = require('websocket').client;
//const querystring = require('querystring');
const assert = require('assert');


describe("BUNDLE TEST", function () {

  before(function () {
    global.options = {
      hostname: kernel.settings.system.domain,
      port: kernel.settings.system.httpPort,
      headers: {
        'Accept': 'application/json'
      },
      method: 'GET'
    };
  });

  describe('REST API ERROR FRAMEWORK', function () {

    it("request-404-get", function (done) {
      global.options.path = '/test/unit/rest/404?foo=bar&bar=foo';
      let request = http.request(global.options, function (res) {
        assert.equal(res.statusCode, 404);
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          let res = JSON.parse(chunk);
          assert.deepStrictEqual(res.server, "nodefony");
          assert.deepStrictEqual(res.message, "Not Found");
          assert.ok(res.pdu);
          done();
        });
      });
      request.end();
    });

    it("request-401-get", function (done) {
      global.options.path = '/test/unit/rest/401?foo=bar&bar=foo';
      let request = http.request(global.options, function (res) {
        assert.equal(res.statusCode, 401);
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          let res = JSON.parse(chunk);
          assert.deepStrictEqual(res.server, "nodefony");
          assert.deepStrictEqual(res.message, "Unauthorized");
          assert.ok(res.pdu);
          assert.deepStrictEqual(res.pdu.payload.bundle, "test");
          assert.deepStrictEqual(res.pdu.payload.controller, "rest");
          assert.deepStrictEqual(res.pdu.payload.action, "401");
          done();
        });
      });
      request.end();
    });

    it("request-403-get", function (done) {
      global.options.path = '/test/unit/rest/403?foo=bar&bar=foo';
      let request = http.request(global.options, function (res) {
        assert.equal(res.statusCode, 403);
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          let res = JSON.parse(chunk);
          assert.deepStrictEqual(res.server, "nodefony");
          assert.ok(res.pdu);
          assert.deepStrictEqual(res.pdu.payload.bundle, "test");
          assert.deepStrictEqual(res.pdu.payload.controller, "rest");
          assert.deepStrictEqual(res.message, "Forbidden");
          assert.ok(res.pdu);
          done();
        });
      });
      request.end();
    });

  });
});