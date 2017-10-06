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

const http = require("http");
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

    describe('CORS SETTINGS ', function () {

        it("local-area-firewall", function (done) {
            global.options.path = '/test/unit/cors/http/test-local-area';
            var request = http.request(global.options, function (res) {
                assert.equal(res.statusCode, 200);
                res.setEncoding('utf8');
                res.on('data', (chunk) => {
                    let ret = JSON.parse(chunk);
                    assert.deepStrictEqual(ret, {
                        "Access-Control-Allow-Methods": "GET",
                        "Access-Control-Allow-Headers": "Authorization,X-CSRF-Token,X-Requested-With,Accept,Accept-Version,Content-Length,Content-MD5,Content-Type,Date",
                        "Access-Control-Expose-Headers": "WWW-Authenticate,X-Json",
                        "Access-Control-Allow-Credentials": true,
                        "Access-Control-Max-Age": 10
                    });
                    done();
                });
            });
            request.end();
        });
        it("sasl-area-firewall", function (done) {
            global.options.path = '/test/unit/cors/http/test-sasl-area';
            let request = http.request(global.options, function (res) {
                assert.equal(res.statusCode, 200);
                res.setEncoding('utf8');
                res.on('data', (chunk) => {
                    let ret = JSON.parse(chunk);
                    assert.deepStrictEqual(ret, {
                        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                        "Access-Control-Allow-Headers": "ETag, Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date",
                        "Access-Control-Allow-Credentials": true,
                        "Access-Control-Expose-Headers": "WWW-Authenticate ,X-Json",
                        "Access-Control-Max-Age": 10
                    });
                    done();
                });
            });
            request.end();
        });
    });

    describe('CORS CONTEXT HTTP', function () {

        it("CROSS DOMAIN mycrossdomain", function (done) {
            global.options.path = '/test/firewall/local/cors/http';
            let request = http.request(global.options, function (res) {
                assert.equal(res.statusCode, 200);
                res.setEncoding('utf8');
                assert.deepStrictEqual(res.headers["access-control-allow-methods"], "GET");
                assert.deepStrictEqual(res.headers["access-control-allow-headers"], "Authorization,X-CSRF-Token,X-Requested-With,Accept,Accept-Version,Content-Length,Content-MD5,Content-Type,Date");
                assert.deepStrictEqual(res.headers["access-control-expose-headers"], "WWW-Authenticate,X-Json");
                assert.deepStrictEqual(res.headers["access-control-allow-credentials"], "true");
                assert.deepStrictEqual(res.headers["access-control-max-age"], "10");
                assert.deepStrictEqual(res.headers["access-control-allow-origin"], "http://mycrossdomain.com:5151");
                res.on('data', (chunk) => {
                    let ret = JSON.parse(chunk);
                    assert.deepStrictEqual(ret.name, "test-login");
                    done();
                });
            });
            request.setHeader("origin", "http://mycrossdomain.com:5151");
            request.end();
        });

        it("CROSS DOMAIN myfalsecrossdomain", function (done) {
            global.options.path = '/test/firewall/local/cors/http';
            let request = http.request(global.options, function (res) {
                assert.equal(res.statusCode, 401);
                //console.log(res.headers);
                assert.deepStrictEqual(res.statusMessage, "CROSS DOMAIN Unauthorized REQUEST REFERER : http://myfalsecrossdomain.com:5151/");
                res.setEncoding('utf8');
                res.on('data', (chunk) => {
                    done();
                });
            });
            request.setHeader("origin", "http://myfalsecrossdomain.com:5151");
            request.end();
        });

    });

    describe('CORS CONTEXT WEBSOCKET', function () {

        it("CROSS DOMAIN mycrossdomain", function (done) {
            let url = global.options.urlws;
            let options = nodefony.extend({}, global.options, {
                url: url + "/test/firewall/local/cors/http"
            });
            let client = new WebSocketClient();
            client.connect(options.url, null, "https://localhost:5152", null, {});

            client.on('connect', function (connection) {
                assert(connection.connected);
                //done();

                connection.on('close', (reasonCode, description) => {
                    done();
                });
            });

        });


    });

    /*describe('CORS CONTEXT WEBSOCKET', function () {

        it("protocol", function (done) {
            var url = global.options.urlws;
            var options = nodefony.extend({}, global.options, {
                url: url + "/test/unit/websocket/cors"
            });
            let client = new WebSocketClient();
            client.connect(options.url, 'Sip', "https://localhost:5152", null, {});
            client.on('connect', function (connection) {
                assert(connection.connected);
                connection.on("message", (message) => {
                    let res = JSON.parse(message.utf8Data);
                    console.log(res);
                    assert.deepStrictEqual(res.protocol, 'sip');
                    assert.deepStrictEqual(res.origin.host, 'localhost:5152');
                    assert.deepStrictEqual(res.origin.hostname, 'localhost');
                    assert.deepStrictEqual(res.origin.port, '5152');
                    assert.deepStrictEqual(res.origin.protocol, 'https:');
                    connection.close();
                });
                connection.on('close', (reasonCode, description) => {
                    assert.deepStrictEqual(reasonCode, 1000);
                    assert.deepStrictEqual(description, "Normal connection closure");
                    done();
                });
            });
            client.on('connectFailed', (error) => {
                console.log(error)
                //throw new Error(error);
            });
        });

        it("protocol", function (done) {
            var url = global.options.urlws;
            var options = nodefony.extend({}, global.options, {
                url: url + "/test/unit/websocket/cors"
            });
            let client = new WebSocketClient();
            client.connect(options.url, 'Sip', "https://nodefony.com", null, {});
            client.on('connect', (connection) => {
                assert(connection.connected);
                connection.on("message", (message) => {
                    let res = JSON.parse(message.utf8Data);
                    console.log(res);
                    connection.close();
                    assert.deepStrictEqual(res.protocol, 'sip');
                    assert.deepStrictEqual(res.origin.host, 'nodefony.com');
                    assert.deepStrictEqual(res.origin.hostname, 'nodefony.com');
                    assert.deepStrictEqual(res.origin.port, 443);
                    assert.deepStrictEqual(res.origin.protocol, 'https:');
                    connection.close();
                });
                connection.on('close', (reasonCode, description) => {
                    assert.deepStrictEqual(reasonCode, 1000);
                    assert.deepStrictEqual(description, "Normal connection closure");
                    done();
                });
            });
            client.on('connectFailed', (error) => {
                throw new Error(error);
            });
        });
    });*/
});
