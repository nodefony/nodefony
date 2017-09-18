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
const WebSocketClient = require('websocket').client;
const assert = require('assert');
//var querystring = require("querystring");


describe("BUNDLE TEST", function(){

  before(function(){
    global.options = {
      hostname: kernel.settings.system.domain,
      port: kernel.settings.system.httpPort,
      method: 'GET',
      urlws:'ws://'+kernel.settings.system.domain+':'+kernel.settings.system.httpPort
    };
  });

  describe(' WEBSOCKET', function(){
    it("WEBSOCKET", function(done){
      var url =  global.options.urlws ;
      var options = nodefony.extend({}, global.options, {
        url:url+"/test/unit/websocket"
      });
      var client = new WebSocketClient();
      client.connect(options.url, null, "nodefony", null, {});
      client.on('connect', function(connection) {
        assert(connection.connected);
        connection.on("message", (message) => {
          let res = JSON.parse(message.utf8Data) ;
          assert.deepStrictEqual(res.server , "nodefony");
          assert.deepStrictEqual(res.code , 404);
          assert.deepStrictEqual(res.url , options.url);
          assert.deepStrictEqual(res.message , "Not Found");
        });
        connection.on('close', (reasonCode, description) => {
          assert.deepStrictEqual(reasonCode , 3404);
          assert.deepStrictEqual(description , "Not Found");
          done();
        });
      });
      client.on('connectFailed', function() {
        throw new Error( "websoket client error");
      });
    });
  });
});
