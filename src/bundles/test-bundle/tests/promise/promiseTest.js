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

  describe("CONTROLLER PROMISE", () => {
    it("promise-natif", (done) => {
      global.options.path = "/test/unit/promise/promise1";
      const data = {status: 200,
        data: {foo: "bar"}};
      const request = http.request(global.options, (res) => {
        assert.equal(res.statusCode, 200);
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          const res = JSON.parse(chunk);
          assert.deepStrictEqual(res, data);
          done();
        });
      });
      request.end();
    });
    it("promise-natif-forward", (done) => {
      global.options.path = "/test/unit/promise";
      const data = {status: 200,
        data: {foo: "bar"}};
      const request = http.request(global.options, (res) => {
        assert.equal(res.statusCode, 200);
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          const res = JSON.parse(chunk);
          assert.deepStrictEqual(res, data);
          done();
        });
      });
      request.end();
    });
    it("promise-natif-2", (done) => {
      global.options.path = "/test/unit/promise/promise2";
      const data = {status: 200,
        data: {foo: "bar"}};
      const request = http.request(global.options, (res) => {
        assert.equal(res.statusCode, 200);
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          const res = JSON.parse(chunk);
          assert.deepStrictEqual(res, data);
          done();
        });
      });
      request.end();
    });
    it("promise-natif-all", (done) => {
      global.options.path = "/test/unit/promise/promise3";
      const data = [{"status": 200,
        "time": "200"}, {"status": 200,
        "time": "500"}];
      const request = http.request(global.options, (res) => {
        assert.equal(res.statusCode, 200);
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          const res = JSON.parse(chunk);
          assert.deepStrictEqual(res, data);
          done();
        });
      });
      request.end();
    });
    it("promise-natif-4", (done) => {
      global.options.path = "/test/unit/promise/promise4";
      const data = [{"status": 200,
        "time": "200"}, {"status": 200,
        "time": "500"}];
      const request = http.request(global.options, (res) => {
        assert.equal(res.statusCode, 200);
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          const res = JSON.parse(chunk);
          assert.deepStrictEqual(res, data);
          done();
        });
      });
      request.end();
    });
    it("promise-natif-5", (done) => {
      global.options.path = "/test/unit/promise/promise5";
      const data = {"status": 500,
        "promise": "1"};
      const request = http.request(global.options, (res) => {
        assert.equal(res.statusCode, 500);
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          const res = JSON.parse(chunk);
          assert.deepStrictEqual(res, data);
          done();
        });
      });
      request.end();
    });
    it("promise-natif-6", (done) => {
      global.options.path = "/test/unit/promise/promise6";
      const data = {"status": 404,
        "promise": "2"};
      const request = http.request(global.options, (res) => {
        assert.equal(res.statusCode, 404);
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          const res = JSON.parse(chunk);
          assert.deepStrictEqual(res, data);
          done();
        });
      });
      request.end();
    });
    it("promise-natif-7", (done) => {
      global.options.path = "/test/unit/promise/promise7";
      const data = {"status": 500,
        "data": {foo: "bar"}};
      const request = http.request(global.options, (res) => {
        assert.equal(res.statusCode, 500);
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          const res = JSON.parse(chunk);
          assert.deepStrictEqual(res, data);
          done();
        });
      });
      request.end();
    });
    it("promise-natif-8", (done) => {
      global.options.path = "/test/unit/promise/promise8";
      const data = {"status": 500,
        "data": {foo: "bar"}};
      const request = http.request(global.options, (res) => {
        assert.equal(res.statusCode, 500);
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          const res = JSON.parse(chunk);
          assert.deepStrictEqual(res, data);
          done();
        });
      });
      request.end();
    });
    it("promise-natif-88", (done) => {
      global.options.path = "/test/unit/promise/promise88";
      const data = {"status": 500,
        "data": "notDefinded is not defined"};
      const request = http.request(global.options, (res) => {
        assert.equal(res.statusCode, 500);
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          const res = JSON.parse(chunk);
          assert.deepStrictEqual(res, data);
          done();
        });
      });
      request.end();
    });
    it("promise-bluebird-9", (done) => {
      global.options.path = "/test/unit/promise/promise9";
      const request = http.request(global.options, (res) => {
        assert.equal(res.statusCode, 200);
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          const res = JSON.parse(chunk);
          assert.deepStrictEqual(res.data.username, "admin");
          done();
        });
      });
      request.end();
    });
    it("promise-bluebird-10", (done) => {
      global.options.path = "/test/unit/promise/promise10";
      const request = http.request(global.options, (res) => {
        // console.log(res)
        res.setEncoding("utf8");
        // var id = res.headers["set-cookie"][0].split(";")[0].split("=")[1] ;
        // console.log(id)
        res.on("data", (chunk) => {
          JSON.parse(chunk);
          assert.equal(res.statusCode, 200);
          // assert.deepStrictEqual(res, null);
          done();
        });
      });
      request.end();
    });
    it("promise-bluebird-11", (done) => {
      global.options.path = "/test/unit/promise/promise11";
      const request = http.request(global.options, (res) => {
        assert.equal(res.statusCode, 200);
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          const res = JSON.parse(chunk);
          assert.deepStrictEqual(res.data.username, "admin");
          done();
        });
      });
      request.end();
    });
    it("promise-bluebird-12", (done) => {
      global.options.path = "/test/unit/promise/promise12";
      const request = http.request(global.options, (res) => {
        assert.equal(res.statusCode, 500);
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          const res = JSON.parse(chunk);
          assert.deepStrictEqual(res.data.username, "admin");
          done();
        });
      });
      request.end();
    });
    it("promise-bluebird-13", (done) => {
      global.options.path = "/test/unit/promise/promise13";
      const data = {"status": 500,
        "data": "notDefinded is not defined"};
      const request = http.request(global.options, (res) => {
        assert.equal(res.statusCode, 500);
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          const res = JSON.parse(chunk);
          assert.deepStrictEqual(res, data);
          done();
        });
      });
      request.end();
    });
  });
});
