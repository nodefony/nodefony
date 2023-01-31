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
// var https = require("https");
const WebSocketClient = require("websocket").client;
// var tunnel = require('tunnel');

const assert = require("assert");

const querystring = require("querystring");


describe("BUNDLE TEST", () => {
  before(() => {
    global.options = {
      hostname: kernel.settings.system.domain,
      port: kernel.settings.system.httpPort,
      method: "GET",
      urlws: `ws://${kernel.settings.system.domain}:${kernel.settings.system.httpPort}`
    };
  });

  describe("TWIG RENDER", () => {
    it("render-get", (done) => {
      global.options.path = "/test/unit/twig/render";
      const request = http.request(global.options, (res) => {
        assert.equal(res.statusCode, 408);
        done();
      });
      request.end();
    });

    it("render", (done) => {
      global.options.path = "/test/unit/twig/render";
      global.options.method = "POST";
      const data = {
        type: "render"
      };
      const post_data = querystring.stringify(data);
      global.options.headers = {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": Buffer.byteLength(post_data)
      };
      const request = http.request(global.options, (res) => {
        assert.equal(res.statusCode, 200);
        assert.equal(res.statusMessage, "OK");
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          const ret = JSON.parse(chunk);
          assert.deepStrictEqual(ret.response.data, data);
          done();
        });
      });
      request.write(post_data);
      request.end();
    });
    it("renderSync", (done) => {
      global.options.path = "/test/unit/twig/render";
      global.options.method = "POST";
      const data = {
        type: "renderSync"
      };
      const post_data = querystring.stringify(data);
      global.options.headers = {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": Buffer.byteLength(post_data)
      };
      const request = http.request(global.options, (res) => {
        assert.equal(res.statusCode, 200);
        assert.equal(res.statusMessage, "OK");
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          const ret = JSON.parse(chunk);
          assert.deepStrictEqual(ret.response.data, data);
          done();
        });
      });
      request.write(post_data);
      request.end();
    });
    it("renderAsync", (done) => {
      global.options.path = "/test/unit/twig/render";
      global.options.method = "POST";
      const data = {
        type: "renderAsync"
      };
      const post_data = querystring.stringify(data);
      global.options.headers = {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": Buffer.byteLength(post_data)
      };
      const request = http.request(global.options, (res) => {
        assert.equal(res.statusCode, 200);
        assert.equal(res.statusMessage, "OK");
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          const ret = JSON.parse(chunk);
          assert.deepStrictEqual(ret.response.data, data);
          done();
        });
      });
      request.write(post_data);
      request.end();
    });
    it("renderJson", (done) => {
      global.options.path = "/test/unit/twig/render";
      global.options.method = "POST";
      const data = {
        type: "renderJson"
      };
      const post_data = querystring.stringify(data);
      global.options.headers = {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": Buffer.byteLength(post_data)
      };
      const request = http.request(global.options, (res) => {
        assert.equal(res.statusCode, 200);
        assert.equal(res.statusMessage, "OK");
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          const ret = JSON.parse(chunk);
          assert.deepStrictEqual(ret.response.data, data);
          done();
        });
      });
      request.write(post_data);
      request.end();
    });
    it("renderJsonSync", (done) => {
      global.options.path = "/test/unit/twig/render";
      global.options.method = "POST";
      const data = {
        type: "renderJsonSync"
      };
      const post_data = querystring.stringify(data);
      global.options.headers = {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": Buffer.byteLength(post_data)
      };
      const request = http.request(global.options, (res) => {
        assert.equal(res.statusCode, 200);
        assert.equal(res.statusMessage, "OK");
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          const ret = JSON.parse(chunk);
          assert.deepStrictEqual(ret.response.data, data);
          done();
        });
      });
      request.write(post_data);
      request.end();
    });
    it("renderJsonAsync", (done) => {
      global.options.path = "/test/unit/twig/render";
      global.options.method = "POST";
      const data = {
        type: "renderJsonAsync"
      };
      const post_data = querystring.stringify(data);
      global.options.headers = {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": Buffer.byteLength(post_data)
      };
      const request = http.request(global.options, (res) => {
        assert.equal(res.statusCode, 200);
        assert.equal(res.statusMessage, "OK");
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          const ret = JSON.parse(chunk);
          assert.deepStrictEqual(ret.response.data, data);
          done();
        });
      });
      request.write(post_data);
      request.end();
    });
    it("renderJsonAsyncTimeOut", (done) => {
      global.options.path = "/test/unit/twig/render";
      global.options.method = "POST";
      const data = {
        type: "renderJsonAsyncTimeOut"
      };
      const post_data = querystring.stringify(data);
      global.options.headers = {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": Buffer.byteLength(post_data)
      };
      const request = http.request(global.options, (res) => {
        assert.equal(res.statusCode, 408);
        res.setEncoding("utf8");
        res.on("data", () => {
          done();
        });
      });
      request.write(post_data);
      request.end();
    });
    it("renderObject", (done) => {
      global.options.path = "/test/unit/twig/render";
      global.options.method = "POST";
      const data = {
        type: "renderOject"
      };
      const post_data = querystring.stringify(data);
      global.options.headers = {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": Buffer.byteLength(post_data)
      };
      const request = http.request(global.options, (res) => {
        assert.equal(res.statusCode, 200);
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          if (kernel.platform === "win32") {
            assert.deepStrictEqual(chunk, "\"<h1>NODEFONY REQUEST :renderOject </h1>\"\r\n");
          } else {
            assert.deepStrictEqual(chunk, "\"<h1>NODEFONY REQUEST :renderOject </h1>\"\n");
          }
          done();
        });
      });
      request.write(post_data);
      request.end();
    });
  });


  describe("TWIG EXTEND", () => {
    it("twig-extend-get", (done) => {
      global.options.path = "/test/unit/twig/extend";
      global.options.method = "GET";
      global.options.headers = {};
      const request = http.request(global.options, (res) => {
        assert.equal(res.statusCode, 500);
        done();
      });
      request.end();
    });

    const resultJson = function (type, message) {
      if (message) {
        return {
          response: {
            code: 200,
            reason: {
              type,
              message
            },
            data: {
              type
            }
          }
        };
      }
      return {
        response: {
          code: 200,
          reason: {
            type,
            message: {
              response: {
                code: 200,
                reason: {
                  type,
                  message: ""
                },
                data: {
                  type
                }
              }
            }
          },
          data: {
            type
          }
        }
      };
    };

    it("render", (done) => {
      global.options.path = "/test/unit/twig/extend";
      global.options.method = "POST";
      const data = {
        type: "render"
      };
      const post_data = querystring.stringify(data);
      global.options.headers = {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": Buffer.byteLength(post_data)
      };
      const request = http.request(global.options, (res) => {
        assert.equal(res.statusCode, 200);
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          const ret = JSON.parse(chunk);
          assert.deepStrictEqual(ret, resultJson("render"));
          done();
        });
      });
      request.write(post_data);
      request.end();
    });
    it("renderTorenderSync", (done) => {
      global.options.path = "/test/unit/twig/extend";
      global.options.method = "POST";
      const data = {
        type: "renderTorenderSync"
      };
      const post_data = querystring.stringify(data);
      global.options.headers = {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": Buffer.byteLength(post_data)
      };
      const request = http.request(global.options, (res) => {
        assert.equal(res.statusCode, 200);
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          const ret = JSON.parse(chunk);
          assert.deepStrictEqual(ret, resultJson("renderSync"));
          done();
        });
      });
      request.write(post_data);
      request.end();
    });

    it("renderSync", (done) => {
      global.options.path = "/test/unit/twig/extend";
      global.options.method = "POST";
      const data = {
        type: "renderSync"
      };
      const post_data = querystring.stringify(data);
      global.options.headers = {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": Buffer.byteLength(post_data)
      };
      const request = http.request(global.options, (res) => {
        assert.equal(res.statusCode, 200);
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          const ret = JSON.parse(chunk);
          assert.deepStrictEqual(ret, resultJson("renderSync"));
          done();
        });
      });
      request.write(post_data);
      request.end();
    });
    it("renderSyncTorender", (done) => {
      global.options.path = "/test/unit/twig/extend";
      global.options.method = "POST";
      const data = {
        type: "renderSyncTorender"
      };
      const post_data = querystring.stringify(data);
      global.options.headers = {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": Buffer.byteLength(post_data)
      };
      const request = http.request(global.options, (res) => {
        assert.equal(res.statusCode, 200);
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          const ret = JSON.parse(chunk);
          assert.deepStrictEqual(ret, resultJson("render"));
          done();
        });
      });
      request.write(post_data);
      request.end();
    });

    it("renderAsyncToSync", (done) => {
      global.options.path = "/test/unit/twig/extend";
      global.options.method = "POST";
      const data = {
        type: "renderAsyncToSync"
      };
      const post_data = querystring.stringify(data);
      global.options.headers = {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": Buffer.byteLength(post_data)
      };
      const request = http.request(global.options, (res) => {
        assert.equal(res.statusCode, 200);
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          const ret = JSON.parse(chunk);
          assert.deepStrictEqual(ret, resultJson("renderSync"));
          done();
        });
      });
      request.write(post_data);
      request.end();
    });

    it("renderAsyncToRender", (done) => {
      global.options.path = "/test/unit/twig/extend";
      global.options.method = "POST";
      const data = {
        type: "renderAsyncToRender"
      };
      const post_data = querystring.stringify(data);
      global.options.headers = {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": Buffer.byteLength(post_data)
      };
      const request = http.request(global.options, (res) => {
        assert.equal(res.statusCode, 200);
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          const ret = JSON.parse(chunk);
          assert.deepStrictEqual(ret, resultJson("render"));
          done();
        });
      });
      request.write(post_data);
      request.end();
    });

    //    it("renderSyncToAsync", function(done){
    //      global.options.path ='/test/unit/twig/extend';
    //      global.options.method ='POST';
    //      var data = {
    //        type:"renderSyncToAsync",
    //      };
    //      var post_data = querystring.stringify(data);
    //      global.options.headers = {
    //        'Content-Type': 'application/x-www-form-urlencoded',
    //        'Content-Length': Buffer.byteLength(post_data)
    //      };
    //      var request = http.request(global.options,function(res) {
    //        assert.equal(res.statusCode, 200);
    //        res.setEncoding('utf8');
    //        res.on('data',  (chunk) => {
    //          assert.throws( ()=>{ JSON.parse(chunk)} )
    //          done();
    //        });
    //      })
    //      request.write(post_data);
    //      request.end();
    //    });

    it("renderToOject", (done) => {
      global.options.path = "/test/unit/twig/extend";
      global.options.method = "POST";
      const data = {
        type: "renderToOject"
      };
      const post_data = querystring.stringify(data);
      global.options.headers = {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": Buffer.byteLength(post_data)
      };
      const request = http.request(global.options, (res) => {
        // assert.equal(res.statusCode, 200);
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          const ret = JSON.parse(chunk);
          // console.log(ret)
          assert.deepStrictEqual(ret, resultJson("renderOject", "<h1>NODEFONY REQUEST :renderOject </h1>"));
          done();
        });
      });
      request.write(post_data);
      request.end();
    });
  });

  describe("TWIG WEBSOCKET", () => {
    it("WEBSOCKET", (done) => {
      const url = global.options.urlws;
      const options = nodefony.extend({}, global.options, {
        url: `${url}/test/unit/twig/websocket`
      });
      const client = new WebSocketClient();
      client.connect(options.url, null, url, null, {});
      client.on("connect", function (connection) {
        assert(connection.connected);
        connection.on("message", (message) => {
          const res = JSON.parse(message.utf8Data);
          switch (res.type) {
          case "START":
            assert.deepStrictEqual(res.message, "CONNECTED");
            try {
              connection.sendUTF(JSON.stringify({
                type: "TWIG-RENDER"
              }));
            } catch (e) {
              this.logger(e, "ERROR");
            }
            break;
          case "TWIG-RENDER":
            connection.sendUTF(JSON.stringify({
              type: "STOP"
            }));
            break;
          case "STOP":
            assert.deepStrictEqual(res.response.reason.message.type, "RENDER");
            connection.close();
            break;
          }
        });
        connection.on("close", (reasonCode, description) => {
          assert.deepStrictEqual(reasonCode, 1000);
          assert.deepStrictEqual(description, "Normal connection closure");
          done();
        });
      });
      client.on("connectFailed", () => {
        throw new Error("websoket client error");
      });
    });
  });
});
