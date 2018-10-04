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
//var https = require("https");
const WebSocketClient = require('websocket').client;
const assert = require('assert');
//var querystring = require("querystring");

describe("BUNDLE TEST", function() {

  before(function() {

    global.options = {
      hostname: kernel.settings.system.domain,
      port: kernel.settings.system.httpPort,
      method: 'GET',
      urlws: 'ws://' + kernel.settings.system.domain + ':' + kernel.settings.system.httpPort
    };
  });

  describe('CORS SETTINGS ', function() {

    it("local-area-firewall", function(done) {
      global.options.path = '/test/unit/cors/http/test-local-area';
      var request = http.request(global.options, function(res) {
        assert.equal(res.statusCode, 200);
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          let ret = JSON.parse(chunk);
          assert.deepStrictEqual(ret, {
            "Access-Control-Allow-Methods": "GET",
            "Access-Control-Allow-Headers": "Authorization,X-CSRF-Token,X-Requested-With,Accept,Accept-Version,Content-Length,Content-MD5,Content-Type,Date",
            "Access-Control-Expose-Headers": "WWW-Authenticate,X-Json",
            "Access-Control-Allow-Credentials": true,
            "Access-Control-Max-Age": 10
          });
          done();
        });
      });
      request.end();
    });

  });

  describe('CORS CONTEXT HTTP', function() {

    it("CROSS DOMAIN mycrossdomain", function(done) {
      global.options.path = '/test/firewall/local/cors/http/test-local-area';
      let request = http.request(global.options, function(res) {
        assert.equal(res.statusCode, 302);
        res.setEncoding('utf8');
        assert.deepStrictEqual(res.headers["access-control-allow-methods"], "GET");
        assert.deepStrictEqual(res.headers["access-control-allow-headers"], "Authorization,X-CSRF-Token,X-Requested-With,Accept,Accept-Version,Content-Length,Content-MD5,Content-Type,Date");
        assert.deepStrictEqual(res.headers["access-control-expose-headers"], "WWW-Authenticate,X-Json");
        assert.deepStrictEqual(res.headers["access-control-allow-credentials"], "true");
        assert.deepStrictEqual(res.headers["access-control-max-age"], "10");
        assert.deepStrictEqual(res.headers["access-control-allow-origin"], "http://mycrossdomain.com:5151");
        assert.deepStrictEqual(res.headers.location, "/login/test-local-area");
        done();
        /*res.on('data', (chunk) => {
          let ret = JSON.parse(chunk);
          assert.deepStrictEqual(ret.name, "test-login");
          done();
        });*/
      });
      request.setHeader("origin", "http://mycrossdomain.com:5151");
      request.end();
    });

    it("CROSS DOMAIN myfalsecrossdomain", function(done) {
      global.options.path = '/test/firewall/local/cors/http/test-local-area';
      let request = http.request(global.options, function(res) {
        assert.equal(res.statusCode, 401);
        assert.deepStrictEqual(res.statusMessage, "CROSS DOMAIN Unauthorized REQUEST REFERER : http://myfalsecrossdomain.com:5151/");
        res.setEncoding('utf8');
        res.on('data', () => {
          done();
        });
      });
      request.setHeader("origin", "http://myfalsecrossdomain.com:5151");
      request.end();
    });
  });

  describe('CORS CONTEXT WEBSOCKET', function() {

    it("CROSS DOMAIN mycrossdomain", function(done) {
      let url = global.options.urlws;
      let options = nodefony.extend({}, global.options, {
        url: url + "/test/firewall/local/cors/http/test-local-area"
      });
      let client = new WebSocketClient();
      client.connect(options.url, null, "ws://mycrossdomain.com:5151", null, {});
      client.on('connect', function(connection) {
        assert(connection.connected);
        connection.on('close', (reasonCode, description) => {
          assert.deepStrictEqual(reasonCode, 3401);
          assert.deepStrictEqual(description, "Unauthorized");
          done();
        });
      });
    });

    it("CROSS DOMAIN myfalsecrossdomain", function(done) {
      let url = global.options.urlws;
      let options = nodefony.extend({}, global.options, {
        url: url + "/test/firewall/local/cors/http/test-local-area"
      });
      let client = new WebSocketClient();
      client.connect(options.url, null, "http://myfalsecrossdomain.com:5151", null, {});
      client.on('connect', function(connection) {
        assert(connection.connected);
        connection.on('close', (reasonCode, description) => {
          assert.deepStrictEqual(reasonCode, 3401);
          assert.deepStrictEqual(description, "CROSS DOMAIN Unauthorized REQUEST REFERER : http://myfalsecrossdomain.com:5151/");
          done();
        });
      });
    });
  });

  describe('CORS SESSION HTTP', function() {
    it("CROSS DOMAIN SESSION START", (done) => {
      global.options.path = '/test/firewall/cors/session/start';
      let request = http.request(global.options, function(res) {
        assert.equal(res.statusCode, 200);
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          let ret = JSON.parse(chunk);
          assert(ret.id);
          assert.ok(ret.cross, "cross domain error");
          global.session = ret.id;
          done();
        });
      });
      request.setHeader("origin", "http://mycrossdomain.com:5151");
      request.end();
    });
    it("CROSS DOMAIN SESSION HTTP", (done) => {
      global.options.path = '/test/firewall/cors/session/http';
      let request = http.request(global.options, function(res) {
        assert.equal(res.statusCode, 200);
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          let ret = JSON.parse(chunk);
          assert.ok(ret.cross, "cross domain error");
          assert.deepStrictEqual(ret.id, global.session);
          done();
        });
      });
      request.setHeader("origin", "http://mycrossdomain.com:5151");
      request.setHeader("Cookie", "nodefony=" + global.session);
      request.end();
    });
  });

  describe('CORS SESSION WEBSOCKET', function() {
    it("CROSS DOMAIN SESSION WEBSOCKET", (done) => {
      let url = global.options.urlws;
      let options = nodefony.extend({}, global.options, {
        url: url + "/test/firewall/cors/session/start"
      });
      let client = new WebSocketClient();
      client.connect(options.url, null, "http://mycrossdomain.com:5151", null, {});
      client.on('connect', function(connection) {
        assert(connection.connected);
        connection.on("message", (message) => {
          let res = JSON.parse(message.utf8Data);
          assert(res.id);
          assert.ok(res.cross, "cross domain error");
          done();
        });
      });
    });
  });

});