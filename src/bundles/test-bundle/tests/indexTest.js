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

var http = require("http");
var https = require("https");
var WebSocketClient = require('websocket').client;
//var tunnel = require('tunnel');

const assert = require('assert');


describe("BUNDLE TEST", function () {

  describe('CONFIGURATIONS ', function () {

    it("KERNEL", function (done) {
      //console.log( kernel.settings.system.version );
      done();
    });

  });

  describe('SERVER', function () {

    it("HTTP", function (done) {

      var options = {
        hostname: kernel.settings.system.domain,
        port: kernel.settings.system.httpPort,
        path: '/json',
        method: 'GET'
      };

      var request = http.request(options, function (res) {
        assert.equal(res.statusCode, 200);
        assert.equal(res.headers.server, "nodefony");
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          var res = JSON.parse(chunk);
          assert.deepStrictEqual(res, {
            foo: "bar",
            bar: "foo"
          });
          done();
        });

      });
      request.end();
    });

    it("HTTPS", function (done) {
      var service = kernel.get("httpsServer");
      var res = service.getCertificats();

      var options = {
        hostname: kernel.settings.system.domain,
        port: kernel.settings.system.httpsPort,
        path: '/json',
        method: 'GET',
        key: res.key,
        cert: res.cert,
        ca: res.ca
      };

      var request = https.request(options, (res) => {
        assert.equal(res.statusCode, 200);
        assert.equal(res.headers.server, "nodefony");
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
          var res = JSON.parse(chunk);
          assert.deepStrictEqual(res, {
            foo: "bar",
            bar: "foo"
          });
          done();
        });
      });
      request.end();

    });

    it("WEBSOCKET", function (done) {

      let client = new WebSocketClient();
      let iter = 0;
      /* connect(url,requestedProtocols, [[[origin], headers] )*/
      let url = 'ws://' + kernel.settings.system.domain + ':' + kernel.settings.system.httpPort + '/websoket';
      //let domain = "http://" + kernel.settings.system.domain + ':' + kernel.settings.system.httpPort;
      client.connect(url, null, null, null, {});
      client.on('connect', function (connection) {
        //console.log( "websoket connection ok on : " + url)
        connection.on("message", ( /*message*/ ) => {
          //console.log(message)
          iter++;
        });
        //connection.close();
        connection.on('close', (reasonCode, description) => {
          assert.equal(iter, 9);
          assert.equal(reasonCode, 1000);
          assert.equal(description, "NODEFONY CONTROLLER CLOSE SOCKET");
          done();
        });

      });
      client.on('connectFailed', function () {
        throw new Error("websoket client error");
      });
    });

    it("WEBSOCKET_SECURE", function (done) {
      let service = kernel.get("httpsServer");
      let res = service.getCertificats();

      let options = {
        key: res.key,
        cert: res.cert,
        ca: res.ca
      };
      let client = null;
      try {
        client = new WebSocketClient();
      } catch (e) {
        throw e;
      }

      let iter = 0;

      let url = 'wss://' + kernel.settings.system.domain + ':' + kernel.settings.system.httpsPort + '/websoket';
      //let domain = "https://" + kernel.settings.system.domain + ':' + kernel.settings.system.httpsPort;
      client.connect(url, null, null, null, options);
      client.on('connect', function (connection) {
        connection.on("message", ( /*message*/ ) => {
          //console.log(message)
          iter++;
        });
        //connection.close();
        connection.on('close', (reasonCode, description) => {
          assert.equal(iter, 9);
          assert.equal(reasonCode, 1000);
          assert.equal(description, "NODEFONY CONTROLLER CLOSE SOCKET");
          done();
        });
      });
      client.on('connectFailed', function () {
        throw new Error("websoket client error");
      });
    });
  });

});