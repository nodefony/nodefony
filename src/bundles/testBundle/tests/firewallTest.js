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


describe("BUNDLE TEST", function(){

  before(function(){
    global.firewall = kernel.get("security");
    global.options = {
      hostname: kernel.settings.system.domain,
      port: kernel.settings.system.httpPort,
      method: 'GET',
      urlws:'ws://'+kernel.settings.system.domain+':'+kernel.settings.system.httpPort
    };
  });

  describe('FIREWALL CONFIG', () =>{

    it("SETTINGS", (done)=>{
      assert.deepStrictEqual(global.firewall.name , "firewall");
      assert.deepStrictEqual( global.firewall.sessionStrategy , "migrate");
      assert(global.firewall.sessionService);
      assert(global.firewall.orm);
      assert(global.firewall.securedAreas);
      assert(global.firewall.reader);
      done();
    });

    it("test-sasl-area", (done)=>{
      assert(global.firewall.securedAreas["test-sasl-area"]);
      let sasl = global.firewall.securedAreas["test-sasl-area"];
      assert.deepStrictEqual( sasl.sessionContext, "default");
      assert.deepStrictEqual( sasl.redirect_Https, false);
      assert.deepStrictEqual( sasl.providerName, "nodefony");
      assert( sasl.provider) ;
      assert.deepStrictEqual( sasl.alwaysUseDefaultTarget, false);
      assert.deepStrictEqual( sasl.factoryName, "sasl");
      assert( sasl.factory) ;
      assert (sasl.crossDomain);
      assert.deepStrictEqual( sasl.formLogin, "/test/login");
      assert.deepStrictEqual( sasl.checkLogin, "/test/firewall/check");
      assert.deepStrictEqual( sasl.regPartten, '^/test/firewall/test');
      try {
        let res = sasl.pattern.test("/test/firewall/test/e");
        assert.ok(res);
      }catch(e){
        throw e;
      }
      done();
    });

    it("test-basic-area", (done)=>{
      assert(global.firewall.securedAreas["test-basic-area"]);
      //console.log(global.firewall.securedAreas["test-basic-area"] );
      done();
    });

    it("test-digest-area", (done)=>{
      assert(global.firewall.securedAreas["test-digest-area"]);
      done();
    });

    it("test-local-area", (done)=>{
      assert(global.firewall.securedAreas["test-local-area"]);
      done();
    });

  });
});
