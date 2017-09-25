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

  describe('CORS WEBSOCKET', function(){


    it("protocol", function(done){
      var url =  global.options.urlws ;
      var options = nodefony.extend({}, global.options, {
        url:url+"/test/unit/websocket/cors"
      });
      var client = new WebSocketClient();
      client.connect(options.url, 'Sip',"https://localhost:5152" ,null,{});
      client.on('connect', function(connection) {
        assert(connection.connected);
        connection.on("message", (message) => {
          let res = JSON.parse(message.utf8Data) ;
          console.log(res);
          assert.deepStrictEqual(res.protocol , 'sip');
          assert.deepStrictEqual(res.origin.host , 'localhost:5152');
          assert.deepStrictEqual(res.origin.hostname , 'localhost');
          assert.deepStrictEqual(res.origin.port , '5152');
          assert.deepStrictEqual(res.origin.protocol , 'https:');
          connection.close();
        });
        connection.on('close', (reasonCode, description) => {
          assert.deepStrictEqual(reasonCode , 1000);
          assert.deepStrictEqual(description , "Normal connection closure");
          done();
        });
      });
      client.on('connectFailed', function(error) {
        throw new Error( error);
      });
    });

    it("protocol", function(done){
      var url =  global.options.urlws ;
      var options = nodefony.extend({}, global.options, {
        url:url+"/test/unit/websocket/cors"
      });
      var client = new WebSocketClient();
      client.connect(options.url, 'Sip',"https://nodefony.com" ,null,{});
      client.on('connect', function(connection) {
        assert(connection.connected);
        connection.on("message", (message) => {
          let res = JSON.parse(message.utf8Data) ;
          console.log(res);
          assert.deepStrictEqual(res.protocol , 'sip');
          assert.deepStrictEqual(res.origin.host , 'nodefony.com');
          assert.deepStrictEqual(res.origin.hostname , 'nodefony.com');
          assert.deepStrictEqual(res.origin.port , 443);
          assert.deepStrictEqual(res.origin.protocol , 'https:');
          connection.close();
        });
        connection.on('close', (reasonCode, description) => {
          assert.deepStrictEqual(reasonCode , 1000);
          assert.deepStrictEqual(description , "Normal connection closure");
          done();
        });
      });
      client.on('connectFailed', function(error) {
        throw new Error( error);
      });
    });


  });
});
