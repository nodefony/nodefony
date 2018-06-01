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
//var https = require("https");
//const WebSocketClient = require('websocket').client;
const assert = require('assert');
//var querystring = require("querystring");


describe("BUNDLE TEST", function () {

  before(function () {
    global.firewall = kernel.get("security");
    global.options = {
      hostname: kernel.settings.system.domain,
      port: kernel.settings.system.httpPort,
      method: 'GET',
      urlws: 'ws://' + kernel.settings.system.domain + ':' + kernel.settings.system.httpPort
    };
  });

  describe('FIREWALL CONFIG', () => {
    it("SETTINGS", (done) => {
      assert.deepStrictEqual(global.firewall.name, "firewall");
      assert.deepStrictEqual(global.firewall.sessionStrategy, "migrate");
      assert(global.firewall.sessionService);
      assert(global.firewall.orm);
      assert(global.firewall.securedAreas);
      assert(global.firewall.reader);
      done();
    });

    it("test-basic-area", (done) => {
      assert(global.firewall.securedAreas["test-basic-area"]);
      let basic = global.firewall.securedAreas["test-basic-area"];
      assert.deepStrictEqual(basic.sessionContext, "default");
      assert.deepStrictEqual(basic.redirect_Https, false);
      assert.deepStrictEqual(basic.providerName, "nodefony");
      assert(basic.provider);
      assert.deepStrictEqual(basic.alwaysUseDefaultTarget, false);
      assert.deepStrictEqual(basic.name, "test-basic-area");
      assert(basic.factories.length);
      assert.deepStrictEqual(basic.factories.length, 1);
      assert.deepStrictEqual(basic.factories[0].name, "basic");
      assert.deepStrictEqual(basic.cors, null);
      assert.deepStrictEqual(basic.formLogin, null);
      assert.deepStrictEqual(basic.checkLogin, "/test/firewall/basic");
      assert.deepStrictEqual(basic.stringPattern, '^/test/firewall/basic');
      try {
        let res = basic.pattern.test("/test/firewall/basic/myroute");
        assert.ok(res);
      } catch (e) {
        throw e;
      }
      done();
    });
    it("test-digest-area", (done) => {
      assert(global.firewall.securedAreas["test-digest-area"]);
      let digest = global.firewall.securedAreas["test-digest-area"];
      assert.deepStrictEqual(digest.sessionContext, "default");
      assert.deepStrictEqual(digest.redirect_Https, false);
      assert.deepStrictEqual(digest.providerName, "nodefony");
      assert(digest.provider);
      assert.deepStrictEqual(digest.alwaysUseDefaultTarget, false);
      assert.deepStrictEqual(digest.name, "test-digest-area");
      assert(digest.factories.length);
      assert.deepStrictEqual(digest.factories.length, 1);
      assert.deepStrictEqual(digest.factories[0].name, "digest");
      assert.deepStrictEqual(digest.cors, null);
      assert.deepStrictEqual(digest.formLogin, null);
      assert.deepStrictEqual(digest.checkLogin, "/test/firewall/digest");
      assert.deepStrictEqual(digest.stringPattern, '^/test/firewall/digest');
      try {
        let res = digest.pattern.test("/test/firewall/digest/myroute");
        assert.ok(res);
      } catch (e) {
        throw e;
      }
      done();
    });

  });
});