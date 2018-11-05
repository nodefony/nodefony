/*
 *   MODEFONY FRAMEWORK UNIT TEST
 *
 *   MOCHA STYLE
 *
 *   In the global context you can find :
 *
 *	nodefony : namespace to get library
 *	kernel :   instance of kernel who launch the test
 *
 */

var http = require("http");
var https = require("https");
var WebSocketClient = require('websocket').client;
//var tunnel = require('tunnel');

var querystring = require('querystring');
const assert = require('assert');



describe("BUNDLE TEST", function () {

  before(function () {
    global.options = {
      hostname: kernel.settings.system.domain,
      port: kernel.settings.system.httpPort,
      //path: '/myroute/',
      method: 'GET'
    };
  });

  describe('ROUTING DEFAULT_VALUE', function () {

    it("myroute/", function (done) {
      global.options.path = '/myroute/';
      var request = http.request(global.options, function (res) {
        assert.equal(res.statusCode, 200);
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          var res = JSON.parse(chunk);
          assert.deepStrictEqual(res, {
            page: "51",
            element: "defaultValue"
          });
          done();
        });
      });
      request.end();
    });
    it("myroute", function (done) {
      global.options.path = '/myroute';
      var request = http.request(global.options, function (res) {
        assert.equal(res.statusCode, 200);
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          var res = JSON.parse(chunk);
          assert.deepStrictEqual(res, {
            page: "51",
            element: "defaultValue"
          });
          done();
        });
      });
      request.end();
    });

    it("myroute/51", function (done) {
      global.options.path = '/myroute/51';
      var request = http.request(global.options, function (res) {
        assert.equal(res.statusCode, 200);
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          var res = JSON.parse(chunk);
          assert.deepStrictEqual(res, {
            page: "51",
            element: "myRouteDefaultValue"
          });
          done();
        });
      });
      request.end();
    });

    it("myroute/51/", function (done) {
      global.options.path = '/myroute/51/';
      var request = http.request(global.options, function (res) {
        assert.equal(res.statusCode, 200);
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          var res = JSON.parse(chunk);
          assert.deepStrictEqual(res, {
            page: "51",
            element: "myRouteDefaultValue"
          });
          done();
        });
      });
      request.end();
    });

    it("myroute/51/foo", function (done) {
      global.options.path = '/myroute/51/foo';
      var request = http.request(global.options, function (res) {
        assert.equal(res.statusCode, 200);
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          var res = JSON.parse(chunk);
          assert.deepStrictEqual(res, {
            page: "51",
            element: "foo"
          });
          done();
        });
      });
      request.end();
    });
    it("myroute/51/foo/", function (done) {
      global.options.path = '/myroute/51/foo/';
      var request = http.request(global.options, function (res) {
        assert.equal(res.statusCode, 200);
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          var res = JSON.parse(chunk);
          assert.deepStrictEqual(res, {
            page: "51",
            element: "foo"
          });
          done();
        });
      });
      request.end();
    });
  });

  describe('ROUTING REQUIEREMENTS REGEXP', function () {
    it("<requirement key='page'>^\d\d$</requirement>", function (done) {
      global.options.path = '/myroute/515/foo/';
      var request = http.request(global.options, function (res) {
        assert.equal(res.statusCode, 500);
        res.setEncoding('utf8');
        res.on('data', () => {});
        done();
      });
      request.end();
    });
  });

  describe('ROUTING pattern:  /wildcard/*', function () {
    it(" URL =>/wildcard/route1", function (done) {
      global.options.path = '/wildcard/route1';
      var request = http.request(global.options, function (res) {
        assert.equal(res.statusCode, 200);
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          var ret = JSON.parse(chunk);
          assert.equal(ret.path, "/wildcard/route1");
          done();
        });
      });
      request.end();
    });
    it("URL => /wildcard/route1/route2", function (done) {
      global.options.path = '/wildcard/route1/route2';
      var request = http.request(global.options, function (res) {
        assert.equal(res.statusCode, 200);
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          var ret = JSON.parse(chunk);
          assert.equal(ret.path, "/wildcard/route1/route2");
          done();
        });
      });
      request.end();
    });
  });

  describe('ROUTING pattern:  /wildcard1*', function () {
    it(" URL =>/wildcard1", function (done) {
      global.options.path = '/wildcard1';
      var request = http.request(global.options, function (res) {
        assert.equal(res.statusCode, 200);
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          var ret = JSON.parse(chunk);
          assert.equal(ret.path, "/wildcard1");
          assert.equal(ret.ele, "");
          done();
        });
      });
      request.end();
    });
    it(" URL =>/wildcard1/route1", function (done) {
      global.options.path = '/wildcard1/route1';
      var request = http.request(global.options, function (res) {
        assert.equal(res.statusCode, 200);
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          var ret = JSON.parse(chunk);
          assert.equal(ret.path, "/wildcard1/route1");
          assert.equal(ret.ele, "/route1");
          done();
        });
      });
      request.end();
    });
    it("URL => /wildcard1/route1/route2", function (done) {
      global.options.path = '/wildcard1/route1/route2';
      var request = http.request(global.options, function (res) {
        assert.equal(res.statusCode, 200);
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          var ret = JSON.parse(chunk);
          assert.equal(ret.path, "/wildcard1/route1/route2");
          assert.equal(ret.ele, "/route1/route2");
          done();
        });
      });
      request.end();
    });
  });




  describe('ROUTING pattern:  /wildcard2/{*}', function () {
    it(" URL =>/wildcard2/route1", function (done) {
      global.options.path = '/wildcard2/route1';
      var request = http.request(global.options, function (res) {
        assert.equal(res.statusCode, 200);
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          var ret = JSON.parse(chunk);
          assert.equal(ret.path, "/wildcard2/route1");
          assert.equal(ret.ele, "route1");
          done();
        });
      });
      request.end();
    });
    it("URL => /wildcard2/route1/error", function (done) {
      global.options.path = '/wildcard2/route1/error';
      var request = http.request(global.options, function (res) {
        assert.equal(res.statusCode, 404);
        res.setEncoding('utf8');
        done();
      });
      request.end();
    });
  });

  describe('ROUTING wildcard type {*}', function () {
    it(" URL =>/wildcard3/{*}/route2", function (done) {
      global.options.path = '/wildcard3/myroute/route2';
      var request = http.request(global.options, function (res) {
        assert.equal(res.statusCode, 200);
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          var ret = JSON.parse(chunk);
          assert.equal(ret.path, "/wildcard3/myroute/route2");
          assert.equal(ret.ele, "myroute");
          done();
        });
      });
      request.end();
    });
    it("PATTERN => /wildcard4/{*}/route2/{*}/test}", function (done) {
      global.options.path = '/wildcard4/myRoute/route2/myRoute1/test';
      var request = http.request(global.options, function (res) {
        assert.equal(res.statusCode, 200);
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          var ret = JSON.parse(chunk);
          assert.equal(ret.path, "/wildcard4/myRoute/route2/myRoute1/test");
          assert.equal(ret.ele, "myRoute");
          assert.equal(ret.ele2, "myRoute1");
          done();
        });
      });
      request.end();
    });
  });

  describe('ROUTING requirement method', function () {
    it("PATTERN => GET /requirement/method", function (done) {
      global.options.path = '/requirement/method';
      var request = http.request(global.options, function (res) {
        assert.equal(res.statusCode, 200);
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          var ret = JSON.parse(chunk);
          assert.equal(ret.method, "GET");
          done();
        });
      });
      request.end();
    });

    it("PATTERN => POST /requirement/method", function (done) {
      global.options.path = '/requirement/method';
      global.options.method = 'POST';
      var data = {
        foo: "bar",
        bar: "foo"
      };
      var post_data = querystring.stringify(data);
      global.options.headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(post_data)
      };
      var request = http.request(global.options, function (res) {
        assert.equal(res.statusCode, 200);
        assert.equal(res.statusMessage, "OK");
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          var res = JSON.parse(chunk);
          assert.deepStrictEqual(res.method, "POST");
          assert.deepStrictEqual(res.query, data);
          assert.deepStrictEqual(res.queryPost, data);
          assert.deepStrictEqual(res.queryGet, {});
          assert.deepStrictEqual(res.resolver.type, "method");
          done();
        });
      });
      request.write(post_data);
      request.end();
    });
  });

});