/*
 *   MODEFONY FRAMEWORK UNIT TEST
 *
 *   MOCHA STYLE
 *
 *   In the global context you can find :
 *
 *	nodefony : namespace to get library
 *	kernel :   instance of kernel who launch the test
 *
 */

var http = require("http");
//var https = require("https");
//var WebSocketClient = require('websocket').client;
var querystring = require('querystring');
const assert = require('assert');
var request = require('request');

describe("BUNDLE TEST", function () {

    before(function () {
        global.options = {
            hostname: kernel.settings.system.domain,
            port: kernel.settings.system.httpPort,
            method: 'GET'
        };
    });

    /*describe('REQUEST ', function () {

        it("request-get-query", function (done) {
            global.options.path = '/test/unit/request?foo=bar&bar=foo';
            var request = http.request(global.options, function (res) {
                assert.equal(res.statusCode, 200);
                res.setEncoding('utf8');
                res.on('data', (chunk) => {
                    var res = JSON.parse(chunk);
                    assert.deepStrictEqual(res.method, "GET");
                    assert.deepStrictEqual(res.query, {
                        foo: "bar",
                        bar: "foo"
                    });
                    done();
                });
            });
            request.end();
        });

        it("request-post-x-www-form-urlencoded", function (done) {
            global.options.path = '/test/unit/request';
            global.options.method = 'POST';
            var data = {
                foo: "bar",
                bar: "foo"
            };
            var post_data = querystring.stringify(data);
            global.options.headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(post_data)
            };
            var request = http.request(global.options, function (res) {
                assert.equal(res.statusCode, 200);
                assert.equal(res.statusMessage, "OK");
                res.setEncoding('utf8');
                res.on('data', (chunk) => {
                    var res = JSON.parse(chunk);
                    assert.deepStrictEqual(res.method, "POST");
                    assert.deepStrictEqual(res.query, data);
                    assert.deepStrictEqual(res.queryPost, data);
                    assert.deepStrictEqual(res.queryGet, {});
                    done();
                });
            });
            request.write(post_data);
            request.end();
        });

        it("request-post-x-www-form-urlencoded-post", function (done) {
            global.options.path = '/test/unit/request?nodefony=2.0';
            global.options.method = 'POST';
            var data = {
                foo: "bar",
                bar: "foo"
            };
            var post_data = querystring.stringify(data);
            global.options.headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(post_data)
            };
            var request = http.request(global.options, function (res) {
                assert.equal(res.statusCode, 200);
                assert.equal(res.statusMessage, "OK");
                res.setEncoding('utf8');
                res.on('data', (chunk) => {
                    var res = JSON.parse(chunk);
                    assert.deepStrictEqual(res.method, "POST");
                    assert.deepStrictEqual(res.query, nodefony.extend({}, data, {
                        nodefony: "2.0"
                    }));
                    assert.deepStrictEqual(res.queryPost, data);
                    assert.deepStrictEqual(res.queryGet, {
                        nodefony: "2.0"
                    });
                    done();
                });
            });
            request.write(post_data);
            request.end();
        });

        it("request-exception-500", function (done) {
            global.options.path = '/test/unit/exception';
            global.options.method = 'GET';
            global.options.headers = {};
            var request = http.request(global.options, function (res) {
                assert.equal(res.statusCode, 500);
                assert.deepStrictEqual(res.statusMessage, "My create Exception");
                done();
            });
            request.end();
        });

        it("request-exception-notDefined", function (done) {
            global.options.path = '/test/unit/exception/notDefined';
            global.options.method = 'GET';
            global.options.headers = {};
            var request = http.request(global.options, function (res) {
                assert.equal(res.statusCode, 500);
                assert.deepStrictEqual(res.statusMessage, "Internal Server Error");
                done();
            });
            request.end();
        });

        it("request-exception-401", function (done) {
            global.options.path = '/test/unit/exception/401';
            global.options.method = 'GET';
            global.options.headers = {};
            var request = http.request(global.options, function (res) {
                assert.equal(res.statusCode, 401);
                assert.deepStrictEqual(res.statusMessage, "My Unauthorized Exception");
                done();
            });
            request.end();
        });

        it("request-exception-404", function (done) {
            global.options.path = '/test/unit/exception/404';
            global.options.method = 'GET';
            global.options.headers = {};
            var request = http.request(global.options, function (res) {
                assert.equal(res.statusCode, 404);
                assert.deepStrictEqual(res.statusMessage, "My not found Exception");
                done();
            });
            request.end();
        });

        it("request-exception-fire", function (done) {
            global.options.path = '/test/unit/exception/fire';
            global.options.method = 'GET';
            global.options.headers = {};
            var request = http.request(global.options, function (res) {
                assert.equal(res.statusCode, 500);
                assert.deepStrictEqual(res.statusMessage, "My Fire Exception");
                done();
            });
            request.end();
        });

        it("request-exception-error", function (done) {
            global.options.path = '/test/unit/exception/error';
            global.options.method = 'GET';
            global.options.headers = {};
            var request = http.request(global.options, function (res) {
                assert.equal(res.statusCode, 500);
                assert.deepStrictEqual(res.statusMessage, "varNotExit is not defined");
                done();
            });
            request.end();
        });

        it("request-exception-timeout", function (done) {
            global.options.path = '/test/unit/exception/408';
            global.options.method = 'GET';
            global.options.headers = {};
            var request = http.request(global.options, function (res) {
                assert.equal(res.statusCode, 408);
                assert.deepStrictEqual(res.statusMessage, "My Timeout Exception");
                done();
            });
            request.end();
        });
        it("request-exception-timeout2", function (done) {
            global.options.path = '/test/unit/exception/timeout';
            global.options.method = 'GET';
            global.options.headers = {};
            var request = http.request(global.options, function (res) {
                assert.equal(res.statusCode, 408);
                assert.deepStrictEqual(res.statusMessage, "Request Timeout");
                done();
            });
            request.end();
        });
        it("request-exception-action", function (done) {
            global.options.path = '/test/unit/exception/1001';
            global.options.method = 'GET';
            global.options.headers = {};
            var request = http.request(global.options, function (res) {
                assert.equal(res.statusCode, 500);
                assert.deepStrictEqual(res.statusMessage, "Action not found");
                done();
            });
            request.end();
        });
    });

    describe('REQUEST FORM DATA', () => {
        it("request-post-formData", function (done) {
            global.options.path = '/test/unit/request/multipart';
            request.post("http://" + global.options.hostname + ":" + global.options.port + global.options.path, {
                    form: {
                        key: 'value',
                        myval: "ézézézézézézézézézézézézé@@@@ê",
                        "myval-special": "ézézézézézézézézézézézézé@@@@ê",
                        "myval-spécial": "ézézézézézézé<<<<<>>>>>zézézézézézé@@@@ê",
                        "ézézézézézézézézézézézézé@@@@ê": "ézézézézézézé<<<<<>>>>>zézézézézézé@@@@ê"
                    }
                },
                (err, httpResponse, body) => {
                    if (err) {
                        throw err;
                    }
                    let json = JSON.parse(body);
                    assert.deepStrictEqual(json.query.key, "value");
                    assert.deepStrictEqual(json.query.myval, "ézézézézézézézézézézézézé@@@@ê");
                    assert.deepStrictEqual(json.query["myval-special"], "ézézézézézézézézézézézézé@@@@ê");
                    assert.deepStrictEqual(json.query["myval-spécial"], "ézézézézézézé<<<<<>>>>>zézézézézézé@@@@ê");
                    assert.deepStrictEqual(json.query["ézézézézézézézézézézézézé@@@@ê"], "ézézézézézézé<<<<<>>>>>zézézézézézé@@@@ê");
                    done();
                }
            );
        });
    });*/

    describe('REQUEST MULTIPART FORM DATA', function () {
        it("request-post-multiparts", function (done) {
            let formData = {
                // Pass a simple key-value pair
                my_field: 'ézézézézézézé<<<<<>>>>>zézézézézézé@@@@ê',
                "myval-spécial": 'ézézézézézézézézézézézézé@@@@ê',
                // Pass data via Buffers
                my_buffer: new Buffer([1, 2, 3]),
                // Pass data via Streams
                my_file: fs.createReadStream(path.resolve("..", __dirname, "images", "pdf.png")),
                custom_filé: {
                    value: "ézézézézézézézézézézézézé@@@@ê",
                    options: {
                        filename: 'topsecrêt.txt',
                        contentType: 'plain/text'
                    }
                }
            };
            global.options.path = '/test/unit/request/multipart';
            request.post({
                url: "http://" + global.options.hostname + ":" + global.options.port + global.options.path,
                formData: formData
            }, function optionalCallback(err, httpResponse, body) {
                if (err) {
                    throw err;
                }
                let json = JSON.parse(body);
                console.log(json)
                assert.deepStrictEqual(json.query.my_field, "ézézézézézézé<<<<<>>>>>zézézézézézé@@@@ê");
                assert.deepStrictEqual(json.query.my_buffer, new Buffer([1, 2, 3]).toString());
                assert.deepStrictEqual(json.query["myval-spécial"], "ézézézézézézézézézézézézé@@@@ê");
                console.log(body);
                done();
            });
        });


        /*it("request-post-multiparts", function (done) {
            global.options.path = '/test/unit/request/multipart';
            var options = {
                method: 'POST',
                url: "http://" + global.options.hostname + ":" + global.options.port + global.options.path,
                headers: {
                    'Accept': 'application/json'
                },
                multipart: {
                    chunked: false,
                    //preambleCRLF: true,
                    //postambleCRLF: true,
                    data: [{
                            'content-type': 'application/json',
                            body: JSON.stringify({
                                foo: 'bar',
                                _attachments: {
                                    'message.txt': {
                                        follows: true,
                                        length: 18,
                                        'content_type': 'text/plain'
                                    }
                                }
                            })
                        },
                        {
                            body: 'I am an attachment'
                        }, {
                            body: new Buffer([1, 2, 3]),
                        }
                    ]
                }
            };
            request(options, (error, response, body) => {
                if (error) {
                    throw error;
                }
                console.log('Upload successful!  Server responded with:', body);
                done();
            });
        });*/
    });
});
