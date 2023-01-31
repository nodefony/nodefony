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
// const https = require("https");
// const WebSocketClient = require('websocket').client;
// const querystring = require('querystring');
const assert = require("assert");


describe("BUNDLE TEST", () => {
  before(() => {
    global.options = {
      hostname: kernel.settings.system.domain,
      port: kernel.settings.system.httpPort,
      // headers: {'Accept': 'application/json'},
      method: "GET"
    };
  });

  describe("SERVICE INSTANCE", () => {
    it("INSTANCE myservice", (done) => {
      const myservice = kernel.get("myservice");
      assert(myservice);
      assert.deepStrictEqual(myservice.name, "myservice");
      assert(myservice.router);
      assert.deepStrictEqual(myservice.router.name, "ROUTER");
      assert(myservice.httpKernel);
      assert.deepStrictEqual(myservice.httpKernel.name, "HTTP KERNEL");
      assert(myservice.domain);
      assert.deepStrictEqual(myservice.domain, kernel.domain);
      done();
    });

    it("INSTANCE myservice call method boot", (done) => {
      const myservice = kernel.get("myservice");
      assert(myservice.ele);
      assert.deepStrictEqual(myservice.ele, "myargs");
      assert(myservice.https);
      assert.deepStrictEqual(myservice.https.name, "HTTPS");
      assert(myservice.calldomain);
      assert.deepStrictEqual(myservice.calldomain, kernel.domain);
      done();
    });

    it("INSTANCE myservice call method boot2", (done) => {
      const myservice = kernel.get("myservice");
      assert(myservice.ele2);
      assert.deepStrictEqual(myservice.ele2, [1, 2, 3, 4]);
      assert.deepStrictEqual(myservice.ele3, null);
      assert(myservice.http);
      assert.deepStrictEqual(myservice.http.name, "HTTP");
      done();
    });
  });
});
