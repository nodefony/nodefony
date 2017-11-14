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

//const http = require("http");
//const https = require("https");
//const WebSocketClient = require('websocket').client;
//const querystring = require('querystring');
const assert = require('assert');


describe("BUNDLE TEST", function () {

  before(function () {
    global.options = {
      hostname: kernel.settings.system.domain,
      port: kernel.settings.system.httpPort,
      //headers: {'Accept': 'application/json'},
      method: 'GET'
    };
  });

  describe('SERVICE INSTANCE', function () {

    it("INSTANCE myservice", function (done) {
      let myservice = kernel.get("myservice");
      assert(myservice);
      assert.deepStrictEqual(myservice.name, "myservice");
      assert(myservice.router);
      assert.deepStrictEqual(myservice.router.name, "router");
      assert(myservice.httpKernel);
      assert.deepStrictEqual(myservice.httpKernel.name, "HTTP KERNEL");
      assert(myservice.domain);
      assert.deepStrictEqual(myservice.domain, kernel.domain);
      done();
    });

    it("INSTANCE myservice call method boot", function (done) {
      let myservice = kernel.get("myservice");
      assert(myservice.ele);
      assert.deepStrictEqual(myservice.ele, "myargs");
      assert(myservice.https);
      assert.deepStrictEqual(myservice.https.name, "SERVER HTTPS");
      assert(myservice.calldomain);
      assert.deepStrictEqual(myservice.calldomain, kernel.domain);
      done();
    });

    it("INSTANCE myservice call method boot2", function (done) {
      let myservice = kernel.get("myservice");
      assert(myservice.ele2);
      assert.deepStrictEqual(myservice.ele2, [1, 2, 3, 4]);
      assert.deepStrictEqual(myservice.ele3, null);
      assert(myservice.http);
      assert.deepStrictEqual(myservice.http.name, "SERVER HTTP");
      done();
    });

  });
});
