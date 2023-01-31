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

const http = require("http");
const https = require("https");
const WebSocketClient = require("websocket").client;
// var tunnel = require('tunnel');

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

  describe("ROUTING DEFAULT_VALUE", () => {
    it("myroute/", (done) => {
      global.options.path = "/myroute/";
      const request = http.request(global.options, (res) => {
        assert.equal(res.statusCode, 200);
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          const res = JSON.parse(chunk);
          assert.deepStrictEqual(res, {
            page: "51",
            element: "defaultValue"
          });
          done();
        });
      });
      request.end();
    });
    it("myroute", (done) => {
      global.options.path = "/myroute";
      const request = http.request(global.options, (res) => {
        assert.equal(res.statusCode, 200);
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          const res = JSON.parse(chunk);
          assert.deepStrictEqual(res, {
            page: "51",
            element: "defaultValue"
          });
          done();
        });
      });
      request.end();
    });

    it("myroute/51", (done) => {
      global.options.path = "/myroute/51";
      const request = http.request(global.options, (res) => {
        assert.equal(res.statusCode, 200);
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          const res = JSON.parse(chunk);
          assert.deepStrictEqual(res, {
            page: "51",
            element: "myRouteDefaultValue"
          });
          done();
        });
      });
      request.end();
    });

    it("myroute/51/", (done) => {
      global.options.path = "/myroute/51/";
      const request = http.request(global.options, (res) => {
        assert.equal(res.statusCode, 200);
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          const res = JSON.parse(chunk);
          assert.deepStrictEqual(res, {
            page: "51",
            element: "myRouteDefaultValue"
          });
          done();
        });
      });
      request.end();
    });

    it("myroute/51/foo", (done) => {
      global.options.path = "/myroute/51/foo";
      const request = http.request(global.options, (res) => {
        assert.equal(res.statusCode, 200);
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          const res = JSON.parse(chunk);
          assert.deepStrictEqual(res, {
            page: "51",
            element: "foo"
          });
          done();
        });
      });
      request.end();
    });
    it("myroute/51/foo/", (done) => {
      global.options.path = "/myroute/51/foo/";
      const request = http.request(global.options, (res) => {
        assert.equal(res.statusCode, 200);
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          const res = JSON.parse(chunk);
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

  describe("ROUTING REQUIEREMENTS REGEXP", () => {
    it("<requirement key='page'>^\d\d$</requirement>", (done) => {
      global.options.path = "/myroute/515/foo/";
      const request = http.request(global.options, (res) => {
        assert.equal(res.statusCode, 500);
        res.setEncoding("utf8");
        res.on("data", () => {});
        done();
      });
      request.end();
    });
  });

  describe("ROUTING pattern:  /wildcard/*", () => {
    it(" URL =>/wildcard/route1", (done) => {
      global.options.path = "/wildcard/route1";
      const request = http.request(global.options, (res) => {
        assert.equal(res.statusCode, 200);
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          const ret = JSON.parse(chunk);
          assert.equal(ret.path, "/wildcard/route1");
          done();
        });
      });
      request.end();
    });
    it("URL => /wildcard/route1/route2", (done) => {
      global.options.path = "/wildcard/route1/route2";
      const request = http.request(global.options, (res) => {
        assert.equal(res.statusCode, 200);
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          const ret = JSON.parse(chunk);
          assert.equal(ret.path, "/wildcard/route1/route2");
          done();
        });
      });
      request.end();
    });
  });

  describe("ROUTING pattern:  /wildcard1*", () => {
    it(" URL =>/wildcard1", (done) => {
      global.options.path = "/wildcard1";
      const request = http.request(global.options, (res) => {
        assert.equal(res.statusCode, 200);
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          const ret = JSON.parse(chunk);
          assert.equal(ret.path, "/wildcard1");
          assert.equal(ret.ele, "");
          done();
        });
      });
      request.end();
    });
    it(" URL =>/wildcard1/route1", (done) => {
      global.options.path = "/wildcard1/route1";
      const request = http.request(global.options, (res) => {
        assert.equal(res.statusCode, 200);
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          const ret = JSON.parse(chunk);
          assert.equal(ret.path, "/wildcard1/route1");
          assert.equal(ret.ele, "/route1");
          done();
        });
      });
      request.end();
    });
    it("URL => /wildcard1/route1/route2", (done) => {
      global.options.path = "/wildcard1/route1/route2";
      const request = http.request(global.options, (res) => {
        assert.equal(res.statusCode, 200);
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          const ret = JSON.parse(chunk);
          assert.equal(ret.path, "/wildcard1/route1/route2");
          assert.equal(ret.ele, "/route1/route2");
          done();
        });
      });
      request.end();
    });
  });


  describe("ROUTING pattern:  /wildcard2/{*}", () => {
    it(" URL =>/wildcard2/route1", (done) => {
      global.options.path = "/wildcard2/route1";
      const request = http.request(global.options, (res) => {
        assert.equal(res.statusCode, 200);
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          const ret = JSON.parse(chunk);
          assert.equal(ret.path, "/wildcard2/route1");
          assert.equal(ret.ele, "route1");
          done();
        });
      });
      request.end();
    });
    it("URL => /wildcard2/route1/error", (done) => {
      global.options.path = "/wildcard2/route1/error";
      const request = http.request(global.options, (res) => {
        assert.equal(res.statusCode, 404);
        res.setEncoding("utf8");
        done();
      });
      request.end();
    });
  });

  describe("ROUTING wildcard type {*}", () => {
    it(" URL =>/wildcard3/{*}/route2", (done) => {
      global.options.path = "/wildcard3/myroute/route2";
      const request = http.request(global.options, (res) => {
        assert.equal(res.statusCode, 200);
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          const ret = JSON.parse(chunk);
          assert.equal(ret.path, "/wildcard3/myroute/route2");
          assert.equal(ret.ele, "myroute");
          done();
        });
      });
      request.end();
    });
    it("PATTERN => /wildcard4/{*}/route2/{*}/test}", (done) => {
      global.options.path = "/wildcard4/myRoute/route2/myRoute1/test";
      const request = http.request(global.options, (res) => {
        assert.equal(res.statusCode, 200);
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          const ret = JSON.parse(chunk);
          assert.equal(ret.path, "/wildcard4/myRoute/route2/myRoute1/test");
          assert.equal(ret.ele, "myRoute");
          assert.equal(ret.ele2, "myRoute1");
          done();
        });
      });
      request.end();
    });
  });

  describe("ROUTING requirement method", () => {
    it("PATTERN => GET /requirement/method", (done) => {
      global.options.path = "/requirement/method";
      const request = http.request(global.options, (res) => {
        assert.equal(res.statusCode, 200);
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          const ret = JSON.parse(chunk);
          assert.equal(ret.method, "GET");
          done();
        });
      });
      request.end();
    });

    it("PATTERN => POST /requirement/method", (done) => {
      global.options.path = "/requirement/method";
      global.options.method = "POST";
      const data = {
        foo: "bar",
        bar: "foo"
      };
      const post_data = querystring.stringify(data);
      global.options.headers = {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": Buffer.byteLength(post_data)
      };
      const request = http.request(global.options, (res) => {
        assert.equal(res.statusCode, 200);
        assert.equal(res.statusMessage, "OK");
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          const res = JSON.parse(chunk);
          assert.deepStrictEqual(res.method, "POST");
          assert.deepStrictEqual(res.query, data);
          assert.deepStrictEqual(res.queryPost, data);
          assert.deepStrictEqual(res.queryGet, {});
          assert.deepStrictEqual(res.resolver, null);
          done();
        });
      });
      request.write(post_data);
      request.end();
    });
    it("PATTERN => PUT /requirement/method", (done) => {
      global.options.path = "/requirement/method";
      global.options.method = "PUT";
      const data = {
        foo: "bar",
        bar: "foo"
      };
      const post_data = querystring.stringify(data);
      global.options.headers = {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": Buffer.byteLength(post_data)
      };
      const request = http.request(global.options, (res) => {
        assert.equal(res.statusCode, 405);
        assert.equal(res.statusMessage, "Method PUT Unauthorized");
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          // console.log(chunk)
          const res = JSON.parse(chunk);
          // assert.deepStrictEqual(res.method, "PUT");
          assert.deepStrictEqual(res.message, "Method PUT Unauthorized");
          assert.deepStrictEqual(res.code, 405);
          // assert.deepStrictEqual(res.query, data);
          // assert.deepStrictEqual(res.queryPost, data);
          // assert.deepStrictEqual(res.queryGet, {});
          // assert.deepStrictEqual(res.resolver, null);
          done();
        });
      });
      request.write(post_data);
      request.end();
    });
  });
});
