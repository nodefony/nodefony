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
const querystring = require("querystring");

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

  describe("REDIRECT ", () => {
    it("controller-redirect-302", (done) => {
      global.options.path = "/test/unit/redirect";
      const request = http.request(global.options, (res) => {
        assert.equal(res.statusCode, 302);
        assert.equal(res.statusMessage, "Found");
        assert.equal(res.headers.location, "/");
        done();
      });
      request.end();
    });

    it("controller-redirect-301", (done) => {
      global.options.path = "/test/unit/redirect/301?foo=bar";
      const request = http.request(global.options, (res) => {
        assert.equal(res.statusCode, 301);
        assert.equal(res.statusMessage, "Moved Permanently");
        assert.equal(res.headers.location, "/");
        done();
      });
      request.end();
    });

    it("controller-redirect-post-absolute", (done) => {
      global.options.path = "/test/unit/redirect";
      global.options.method = "POST";
      const post_data = querystring.stringify({
        url: "http://google.com",
        status: 301
      });
      global.options.headers = {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": Buffer.byteLength(post_data)
      };
      const request = http.request(global.options, (res) => {
        assert.equal(res.statusCode, 301);
        assert.equal(res.statusMessage, "Moved Permanently");
        assert.equal(res.headers.location, "http://google.com");
        done();
      });
      request.write(post_data);
      request.end();
    });

    it("controller-redirect-post-", (done) => {
      global.options.path = "/test/unit/redirect";
      global.options.method = "POST";
      const post_data = querystring.stringify({
        url: "bar/foo",
        status: 301
      });
      global.options.headers = {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": Buffer.byteLength(post_data)
      };
      const request = http.request(global.options, (res) => {
        assert.equal(res.statusCode, 301);
        assert.equal(res.statusMessage, "Moved Permanently");
        assert.equal(res.headers.location, "bar/foo");
        done();
      });
      request.write(post_data);
      request.end();
    });


    it("controller-redirect-post-301", (done) => {
      global.options.path = "/test/unit/redirect";
      global.options.method = "POST";
      const post_data = querystring.stringify({
        url: "/foo/bar",
        status: 301
      });
      global.options.headers = {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": Buffer.byteLength(post_data)
      };
      const request = http.request(global.options, (res) => {
        assert.equal(res.statusCode, 301);
        assert.equal(res.statusMessage, "Moved Permanently");
        assert.equal(res.headers.location, "/foo/bar");
        done();
      });
      request.write(post_data);
      request.end();
    });

    it("controller-redirect-post-302", (done) => {
      global.options.path = "/test/unit/redirect?bar=foo";
      global.options.method = "POST";
      const post_data = querystring.stringify({
        url: "/ping",
        status: 301
      });
      global.options.headers = {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": Buffer.byteLength(post_data)
      };
      const request = http.request(global.options, (res) => {
        assert.equal(res.statusCode, 301);
        assert.equal(res.statusMessage, "Moved Permanently");
        assert.equal(res.headers.location, "/ping?bar=foo");
        done();
      });
      request.write(post_data);
      request.end();
    });

    it("controller-redirect-route", (done) => {
      global.options.path = "/test/unit/redirect/route?url=home";
      global.options.method = "GET";
      delete global.options.headers;
      const request = http.request(global.options, (res) => {
        assert.equal(res.statusCode, 301);
        assert.equal(res.statusMessage, "Moved Permanently");
        assert.equal(res.headers.location, "/");
        done();
      });
      request.end();
    });
  });
});
