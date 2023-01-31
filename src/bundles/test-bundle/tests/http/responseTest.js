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
// var https = require("https");
// var WebSocketClient = require('websocket').client;
// var tunnel = require('tunnel');

const assert = require("assert");


describe("BUNDLE TEST", () => {
  before(() => {
    global.options = {
      hostname: kernel.settings.system.domain,
      port: kernel.settings.system.httpPort,
      // path: '/myroute/',
      method: "GET"
    };
  });

  describe("RESPONSE ", () => {
    it("status200", (done) => {
      global.options.path = "/test/unit/response/status/200";
      const request = http.request(global.options, (res) => {
        assert.equal(res.statusCode, 200);
        assert.equal(res.statusMessage, "OK");
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          const res = JSON.parse(chunk);
          assert.deepStrictEqual(res.code, 200);
          assert.deepStrictEqual(res.message, "OK");
          done();
        });
      });
      request.end();
    });

    it("status500", (done) => {
      global.options.path = "/test/unit/response/status/500";
      const request = http.request(global.options, (res) => {
        assert.equal(res.statusCode, 500);
        assert.equal(res.statusMessage, "Internal Server Error");
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          const res = JSON.parse(chunk);
          assert.deepStrictEqual(res.code, 500);
          assert.deepStrictEqual(res.message, "Internal Server Error");
          done();
        });
      });
      request.end();
    });

    it("status404", (done) => {
      global.options.path = "/test/unit/response/status/404";
      const request = http.request(global.options, (res) => {
        assert.equal(res.statusCode, 404);
        assert.equal(res.statusMessage, "Not Found");
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          const res = JSON.parse(chunk);
          assert.deepStrictEqual(res.code, 404);
          assert.deepStrictEqual(res.message, "Not Found");
          done();
        });
      });
      request.end();
    });

    it("messageFoo", (done) => {
      global.options.path = "/test/unit/response/status/200/foo";
      const request = http.request(global.options, (res) => {
        assert.equal(res.statusCode, 200);
        assert.equal(res.statusMessage, "foo");
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          const res = JSON.parse(chunk);
          assert.deepStrictEqual(res.code, 200);
          assert.deepStrictEqual(res.message, "foo");
          done();
        });
      });
      request.end();
    });

    it("messageNotFound", (done) => {
      global.options.path = "/test/unit/response/status/401/userNotFound";
      const request = http.request(global.options, (res) => {
        assert.equal(res.statusCode, 401);
        assert.equal(res.statusMessage, "userNotFound");
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          const res = JSON.parse(chunk);
          assert.deepStrictEqual(res.code, 401);
          assert.deepStrictEqual(res.message, "userNotFound");
          done();
        });
      });
      request.end();
    });
    it("messageNull", (done) => {
      global.options.path = "/test/unit/response/status/404/null";
      const request = http.request(global.options, (res) => {
        assert.equal(res.statusCode, 404);
        assert.equal(res.statusMessage, "Not Found");
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          const res = JSON.parse(chunk);
          // console.log(res)
          assert.deepStrictEqual(res.code, 404);
          assert.deepStrictEqual(res.message, "Not Found");
          assert.deepStrictEqual(res.generateUrl, "/test/unit/response/status/404/bar");
          done();
        });
      });
      request.end();
    });
    it("message408", (done) => {
      global.options.path = "/test/unit/response/status/408?foo=bar";
      const request = http.request(global.options, (res) => {
        assert.equal(res.statusCode, 408);
        assert.equal(res.statusMessage, "Request Timeout");
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          const res = JSON.parse(chunk);
          // console.log(res)
          assert.deepStrictEqual(res.code, 408);
          assert.deepStrictEqual(res.message, "Request Timeout");
          assert.deepStrictEqual(res.generateUrl, "/test/unit/response/status/408");
          done();
        });
      });
      request.end();
    });

    it("queryString-simple", (done) => {
      global.options.path = "/test/unit/response/query?foo=bar";
      const request = http.request(global.options, (res) => {
        assert.equal(res.statusCode, 200);
        assert.equal(res.statusMessage, "OK");
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          const res = JSON.parse(chunk);
          assert.deepStrictEqual(res.query, {foo: "bar"});
          assert.deepStrictEqual(res.generateUrl, "/test/unit/response/query/foo/bar?foo=bar");
          done();
        });
      });
      request.end();
    });

    it("queryString-multiple", (done) => {
      global.options.path = "/test/unit/response/query?foo=bar&bar=foo";
      const request = http.request(global.options, (res) => {
        assert.equal(res.statusCode, 200);
        assert.equal(res.statusMessage, "OK");
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          const res = JSON.parse(chunk);
          assert.deepStrictEqual(res.query, {foo: "bar",
            bar: "foo"});
          assert.deepStrictEqual(res.generateUrl, "/test/unit/response/query/foo/bar?foo=bar&bar=foo");
          done();
        });
      });
      request.end();
    });

    it("queryString-withVariable", (done) => {
      global.options.path = "/test/unit/response/query/myvar1/myvar2?foo=bar&bar=foo&ele=null";
      const request = http.request(global.options, (res) => {
        assert.equal(res.statusCode, 200);
        assert.equal(res.statusMessage, "OK");
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          const res = JSON.parse(chunk);
          assert.deepStrictEqual(res.query, {foo: "bar",
            bar: "foo",
            ele: "null"});
          assert.deepStrictEqual(res.generateUrl, "/test/unit/response/query/myvar1/myvar2?foo=bar&bar=foo&ele=null");
          done();
        });
      });
      request.end();
    });
  });
});
