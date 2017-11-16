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


describe("BUNDLE TEST", function () {

    before(function () {
        global.options = {
            hostname: kernel.settings.system.domain,
            port: kernel.settings.system.httpPort,
            method: 'GET',
            urlws: 'ws://' + kernel.settings.system.domain + ':' + kernel.settings.system.httpPort
        };
    });

    describe(' WEBSOCKET', function () {
        it("404", function (done) {
            var url = global.options.urlws;
            var options = nodefony.extend({}, global.options, {
                url: url + "/test/unit/websockete"
            });
            var client = new WebSocketClient();

            client.connect(options.url, null);
            client.on('connect', function () {
                throw new Error("404 can't be connected");
            });
            client.on('connectFailed', function (error) {
                assert(error);
                done();
            });
        });

        it("404 connect", function (done) {
            var url = global.options.urlws;
            var options = nodefony.extend({}, global.options, {
                url: url + "/test/unit/websocket/404"
            });
            var client = new WebSocketClient();
            //let domain = "http://"+ kernel.settings.system.domain + ':' + kernel.settings.system.httpPort;
            client.connect(options.url, null);
            client.on('connect', function (connection) {
                assert(connection.connected);
                connection.on("message", (message) => {
                    let res = JSON.parse(message.utf8Data);
                    assert.deepStrictEqual(res.code, 404);
                });
                connection.on('close', (reasonCode, description) => {
                    assert.deepStrictEqual(reasonCode, 3404);
                    assert.deepStrictEqual(description, "Not Found");
                    done();
                });
            });
            client.on('connectFailed', function (error) {
                throw new Error(error);
            });
        });

        it("bad protocol", function (done) {
            var url = global.options.urlws;
            var options = nodefony.extend({}, global.options, {
                url: url + "/test/unit/websocket/protocol"
            });
            var client = new WebSocketClient();
            client.connect(options.url, 'telnete');
            client.on('connectFailed', function (error) {
                assert(error);
                done();
            });
        });
        it("protocol", function (done) {
            var url = global.options.urlws;
            var options = nodefony.extend({}, global.options, {
                url: url + "/test/unit/websocket/protocol/telnet"
            });
            var client = new WebSocketClient();
            client.connect(options.url, 'telnet');
            client.on('connect', function (connection) {
                assert(connection.connected);
                connection.on("message", (message) => {
                    let res = JSON.parse(message.utf8Data);
                    assert.deepStrictEqual(res.protocol, 'telnet');
                    assert.deepStrictEqual(res.origin.host, 'localhost:5151');
                    assert.deepStrictEqual(res.origin.hostname, 'localhost');
                    assert.deepStrictEqual(res.origin.port, '5151');
                    assert.deepStrictEqual(res.origin.protocol, 'ws:');
                    connection.close();
                });
                connection.on('close', (reasonCode, description) => {
                    assert.deepStrictEqual(reasonCode, 1000);
                    assert.deepStrictEqual(description, "Normal connection closure");
                    done();
                });
            });
            client.on('connectFailed', function (error) {
                throw new Error(error);
            });
        });
    });
});
