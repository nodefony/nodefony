/* eslint-disable max-lines-per-function */
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
const https = require("https");
const util = require("util");
const Url = require("url");
const {
  syncBuiltinESMExports
} = require("module");
syncBuiltinESMExports();
let fetch = null;
let FormData = null;
let Blob = null;
let fileFromPath = null;
const querystring = require("querystring");
const assert = require("assert");
const request = require("request");
// const WebSocketClient = require('websocket').client;


const serviceHttps = kernel.get("httpsServer");
const httpAgent = new http.Agent({
  keepAlive: true
});
const httpsAgent = new https.Agent({
  keepAlive: true,
  key: serviceHttps.key,
  cert: serviceHttps.crt,
  rejectUnauthorized: false
});

const options = {
  agent (_parsedURL) {
    if (_parsedURL.protocol == "http:") {
      return httpAgent;
    }
    return httpsAgent;
  }
};

describe("BUNDLE TEST", () => {
  before(async () => {
    fetch = await import("node-fetch")
      .then((esmFS) => esmFS.default);
    FormData = await import("formdata-node")
      .then((esmFS) => {
        Blob = esmFS.Blob;
        return esmFS.FormData;
      });
    fileFromPath = await import("formdata-node/file-from-path")
      .then((esmFS) => esmFS.fileFromPath);
    global.options = {
      hostname: kernel.settings.system.domain,
      port: kernel.settings.system.httpPort,
      method: "GET"
    };
  });

  describe("REQUEST ", () => {
    it("request-get-query", (done) => {
      global.options.path = "/test/unit/request?foo=bar&bar=foo";
      const request = http.request(global.options, (res) => {
        assert.equal(res.statusCode, 200);
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          const res = JSON.parse(chunk);
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

    it("request-post-x-www-form-urlencoded", (done) => {
      global.options.path = "/test/unit/request";
      global.options.method = "POST";
      const data = {
        foo: "bar",
        bar: "foo"
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
          const res = JSON.parse(chunk);
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

    it("request-post-x-www-form-urlencoded-post", (done) => {
      global.options.path = "/test/unit/request?nodefony=2.0";
      global.options.method = "POST";
      const data = {
        foo: "bar",
        bar: "foo"
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
          const res = JSON.parse(chunk);
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

    it("request-post-x-www-form-urlencoded-post2", (done) => {
      global.options.path = "/test/unit/request?nodefony=2.0";
      global.options.method = "POST";
      const data = {
        "foo[ele]": "bar",
        "foo[ele2]": "bar2",
        "foo[ele3]": "bar3",
        "foo[ele4]": "bar4",
        "bar[ele]": "foo",
        "bar[ele1]": "foo",
        "bar[ele2]": "foo2",
        "bar[ele2][foo]": "foo2"
      };
      const dataObject = {
        foo: {
          ele: "bar",
          ele2: "bar2",
          ele3: "bar3",
          ele4: "bar4"
        },
        bar: {
          ele: "foo",
          ele1: "foo",
          ele2: ["foo2", {
            foo: "foo2"
          }]
        }
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
          const res = JSON.parse(chunk);
          assert.deepStrictEqual(res.method, "POST");
          assert.deepStrictEqual(res.query, nodefony.extend({}, dataObject, {
            nodefony: "2.0"
          }));
          assert.deepStrictEqual(res.queryPost, dataObject);
          assert.deepStrictEqual(res.queryGet, {
            nodefony: "2.0"
          });
          done();
        });
      });
      request.write(post_data);
      request.end();
    });

    it("request-exception-500", (done) => {
      global.options.path = "/test/unit/exception";
      global.options.method = "GET";
      global.options.headers = {};
      const request = http.request(global.options, (res) => {
        assert.equal(res.statusCode, 500);
        assert.deepStrictEqual(res.statusMessage, "My create Exception");
        done();
      });
      request.end();
    });

    it("request-exception-notDefined", (done) => {
      global.options.path = "/test/unit/exception/notDefined";
      global.options.method = "GET";
      global.options.headers = {};
      const request = http.request(global.options, (res) => {
        assert.equal(res.statusCode, 500);
        assert.deepStrictEqual(res.statusMessage, "Internal Server Error");
        done();
      });
      request.end();
    });

    it("request-exception-401", (done) => {
      global.options.path = "/test/unit/exception/401";
      global.options.method = "GET";
      global.options.headers = {};
      const request = http.request(global.options, (res) => {
        assert.equal(res.statusCode, 401);
        assert.deepStrictEqual(res.statusMessage, "My Unauthorized Exception");
        done();
      });
      request.end();
    });

    it("request-exception-404", (done) => {
      global.options.path = "/test/unit/exception/404";
      global.options.method = "GET";
      global.options.headers = {};
      const request = http.request(global.options, (res) => {
        assert.equal(res.statusCode, 404);
        assert.deepStrictEqual(res.statusMessage, "My not found Exception");
        done();
      });
      request.end();
    });

    it("request-exception-fire", (done) => {
      global.options.path = "/test/unit/exception/fire";
      global.options.method = "GET";
      global.options.headers = {};
      const request = http.request(global.options, (res) => {
        assert.equal(res.statusCode, 500);
        assert.deepStrictEqual(res.statusMessage, "My Fire Exception");
        done();
      });
      request.end();
    });

    it("request-exception-error", (done) => {
      global.options.path = "/test/unit/exception/error";
      global.options.method = "GET";
      global.options.headers = {};
      const request = http.request(global.options, (res) => {
        assert.equal(res.statusCode, 500);
        assert.deepStrictEqual(res.statusMessage, "varNotExit is not defined");
        done();
      });
      request.end();
    });

    it("request-exception-timeout", (done) => {
      global.options.path = "/test/unit/exception/408";
      global.options.method = "GET";
      global.options.headers = {};
      const request = http.request(global.options, (res) => {
        assert.equal(res.statusCode, 408);
        assert.deepStrictEqual(res.statusMessage, "My Timeout Exception");
        done();
      });
      request.end();
    });
    it("request-exception-timeout2", (done) => {
      global.options.path = "/test/unit/exception/timeout";
      global.options.method = "GET";
      global.options.headers = {};
      const request = http.request(global.options, (res) => {
        assert.equal(res.statusCode, 408);
        assert.deepStrictEqual(res.statusMessage, "Request Timeout");
        done();
      });
      request.end();
    });
    it("request-exception-action", (done) => {
      global.options.path = "/test/unit/exception/1001";
      global.options.method = "GET";
      global.options.headers = {};
      const request = http.request(global.options, (res) => {
        assert.equal(res.statusCode, 500);
        assert.deepStrictEqual(res.statusMessage, "Action not found");
        done();
      });
      request.end();
    });
  });

  describe("REQUEST FORM DATA", () => {
    it("request-post-formData", (done) => {
      global.options.path = "/test/unit/request/multipart";
      request.post(`http://${global.options.hostname}:${global.options.port}${global.options.path}`, {
        form: {
          key: "value",
          myval: "ézézézézézézézézézézézézé@@@@ê",
          "myval-special": "ézézézézézézézézézézézézé@@@@ê",
          "myval-spécial": "ézézézézézézé<<<<<>>>>>zézézézézézé@@@@ê",
          "ézézézézézézézézézézézézé@@@@ê": "ézézézézézézé<<<<<>>>>>zézézézézézé@@@@ê"
        }
      }, (err, httpResponse, body) => {
        if (err) {
          throw err;
        }
        const json = JSON.parse(body);
        assert.deepStrictEqual(json.query.key, "value");
        assert.deepStrictEqual(json.query.myval, "ézézézézézézézézézézézézé@@@@ê");
        assert.deepStrictEqual(json.query["myval-special"], "ézézézézézézézézézézézézé@@@@ê");
        assert.deepStrictEqual(json.query["myval-spécial"], "ézézézézézézé<<<<<>>>>>zézézézézézé@@@@ê");
        assert.deepStrictEqual(json.query["ézézézézézézézézézézézézé@@@@ê"], "ézézézézézézé<<<<<>>>>>zézézézézézé@@@@ê");
        done();
      });
    });
    it("request-query-post-formData", (done) => {
      global.options.path = "/test/unit/request/multipart";
      request.post(`http://${global.options.hostname}:${global.options.port}${global.options.path}`, {
        body: "{\"foo\":\"bar\",\"fôo\":\"bâr\"}",
        headers: {
          "Content-Type": "application/json"
        }
      }, (err, httpResponse, body) => {
        if (err) {
          throw err;
        }
        const json = JSON.parse(body);
        assert.deepStrictEqual(json.post.foo, "bar");
        assert.deepStrictEqual(json.post["fôo"], "bâr");
        assert.deepStrictEqual(json.query.foo, "bar");
        assert.deepStrictEqual(json.query["fôo"], "bâr");
        assert(nodefony.isArray(json.file));
        done();
      });
    });
    it("request-xml-post-formData", (done) => {
      global.options.path = "/test/unit/request/multipart";
      const xml = `<xml><nodefony>\
        <kernel name="${kernel.settings.name}" version="${kernel.settings.version}">\
          <server type="HTTP" port="${kernel.settings.system.httpPort}">http</server>\
          <server type="HTTPS" port="${kernel.settings.system.httpsPort}">https</server>\
        </kernel>\
      </nodefony></xml>`;
      request.post(`http://${global.options.hostname}:${global.options.port}${global.options.path}`, {
        body: xml,
        headers: {
          "Content-Type": "text/xml",
          "Accept": "application/json"
        }
      }, (err, httpResponse, body) => {
        if (err) {
          throw err;
        }
        const json = JSON.parse(body);
        assert(nodefony.isArray(json.file));
        done();
      });
    });
    it("request-query-post", (done) => {
      const params = new Url.URLSearchParams({
        "fôo": "bâr",
        foo: "bar"
      });
      global.options.path = `/test/unit/request/multipart?${params.toString()}`;
      const url = `http://${kernel.hostHttp}${global.options.path}`;
      request.post(url, {
        body: "mtText&ààààà",
        headers: {
          "Content-Type": "plain/text",
          "Accept": "application/json"
        }
      }, (err, httpResponse, body) => {
        if (err) {
          throw err;
        }
        const json = JSON.parse(body);
        // console.log(json)
        assert.deepStrictEqual(json.query.foo, "bar");
        assert.deepStrictEqual(json.query["fôo"], "bâr");
        assert.deepStrictEqual(json.data, "mtText&ààààà");
        done();
      });
    });

    it("fetch-query-post", async () => {
      const params = new Url.URLSearchParams({
        "fôo": "bâr",
        foo: "bar"
      });
      global.options.path = `/test/unit/request/multipart?${params.toString()}`;
      const url = `https://${kernel.hostHttps}${global.options.path}`;
      const myoptions = nodefony.extend({}, options, {
        method: "POST",
        body: "mtText&ààààà",
        headers: {
          "Content-Type": "plain/text",
          "Accept": "application/json"
        }
      });
      const uploadResponse = await fetch(url, myoptions);
      const json = await uploadResponse.json();
      // console.log(json)
      assert.deepStrictEqual(json.query.foo, "bar");
      assert.deepStrictEqual(json.query["fôo"], "bâr");
      assert.deepStrictEqual(json.data, "mtText&ààààà");
      return json;
    });

    it("fetch-query-post-octets", async () => {
      const params = new Url.URLSearchParams({
        "fôo": "bâr",
        foo: "bar"
      });
      global.options.path = `/test/unit/request/multipart?${params.toString()}`;
      const url = `https://${kernel.hostHttps}${global.options.path}`;
      const body = "mtText&ààààà12222@";
      const myoptions = nodefony.extend({}, options, {
        method: "POST",
        body,
        headers: {
          "Content-Type": "application/octet-stream",
          "Accept": "application/json"
        }
      });
      const uploadResponse = await fetch(url, myoptions);
      const json = await uploadResponse.json();
      // console.log(json)
      assert.deepStrictEqual(json.query.foo, "bar");
      assert.deepStrictEqual(json.query["fôo"], "bâr");
      assert.deepStrictEqual(json.data, body);
      return json;
    });
    it("fetch-query-post-buffer", async () => {
      const params = new Url.URLSearchParams({
        "fôo": "bâr",
        foo: "bar"
      });
      global.options.path = `/test/unit/request/multipart?${params.toString()}`;
      const url = `https://${kernel.hostHttps}${global.options.path}`;
      const body = new Buffer.from([1, 2, 3]);
      const myoptions = nodefony.extend({}, options, {
        method: "DELETE",
        body,
        headers: {
          "Content-Type": "application/octet-stream"
        }
      });
      const uploadResponse = await fetch(url, myoptions);
      const json = await uploadResponse.json();
      assert.deepStrictEqual(json.query.foo, "bar");
      assert.deepStrictEqual(json.query["fôo"], "bâr");
      assert.deepStrictEqual(json.data, body.toString());
      return json;
    });
  });

  describe("MULTIPART FORM DATA", () => {
    it("request-post-multiparts", (done) => {
      const formData = {
        // Pass a simple key-value pair
        my_field: "ézézézézézézé<<<<<>>>>>zézézézézézé@@@@ê",
        "myval-spécial": "ézézézézézézézézézézézézé@@@@ê",
        // Pass data via Buffers
        my_buffer: new Buffer.from([1, 2, 3]),
        // Pass data via Streams
        my_file: fs.createReadStream(path.resolve("..", __dirname, "images", "pdf.png")),
        custom_filé: {
          value: "ézézézézézézézézézézézézé@@@@ê",
          options: {
            filename: "topsecrêt.txt",
            contentType: "plain/text"
          }
        }
      };
      global.options.path = "/test/unit/request/multipart";
      request.post({
        url: `http://${global.options.hostname}:${global.options.port}${global.options.path}`,
        formData
      }, (err, httpResponse, body) => {
        if (err) {
          throw err;
        }
        const json = JSON.parse(body);
        // console.log( util.inspect(json, { depth: 8 }));
        assert.deepStrictEqual(json.query.my_field, ["ézézézézézézé<<<<<>>>>>zézézézézézé@@@@ê"]);
        assert.deepStrictEqual(json.query["myval-spécial"], ["ézézézézézézézézézézézézé@@@@ê"]);
        // assert.deepStrictEqual(json.file.my_buffer, new Buffer.from([1, 2, 3]).toString());
        assert.deepStrictEqual(json.get, {});
        assert(nodefony.isArray(json.file));
        assert.deepStrictEqual(json.file.length, 3);
        let name = 0;
        // console.log(json.file, json.file.length)
        for (let i = 0; i < json.file.length; i++) {
          switch (json.file[i].filename) {
          case "my_buffer":
            // name++
            // assert.deepStrictEqual(json.file.my_buffer, new Buffer([1, 2, 3]).toString());
            break;
          case "topsecrêt.txt":
          case "pdf.png":
            name++;
            break;
          default:
          }
        }
        assert.deepStrictEqual(name, 2);
        done();
      });
    });

    it("request-put-multiparts", (done) => {
      global.options.path = "/test/unit/request/multipart?fôo=bâr&foo=bar";
      const options = {
        method: "PUT",
        url: `http://${global.options.hostname}:${global.options.port}${global.options.path}`,
        headers: {
          "Accept": "application/json"
        },
        preambleCRLF: true,
        postambleCRLF: true,
        multipart: {
          chunked: false,
          data: [{
            "content-type": "application/json",
            name: "myname",
            body: JSON.stringify({
              foo: "bar",
              _attachments: {
                "message.txt": {
                  follows: true,
                  length: 18,
                  "content_type": "text/plain"
                }
              }
            })
          }, {
            "content-type": "plain/text",
            body: "I am an attâchment",
            name: "myname2"
          }, {
            body: new Buffer.from([1, 2, 3]),
            "content-type": "application/octet-stream"
          }, {
            body: fs.createReadStream(path.resolve("..", __dirname, "images", "pdf.png")),
            "content-type": "image/png"
          }]
        }
      };
      request(options, (error, response, body) => {
        if (error) {
          throw error;
        }
        const json = JSON.parse(body);
        // console.log( util.inspect(json, { depth: 8 }));
        assert.deepStrictEqual(json.query.foo, "bar");
        assert.deepStrictEqual(json.query["fôo"], "bâr");
        assert.deepStrictEqual(json.get.foo, "bar");
        assert.deepStrictEqual(json.get["fôo"], "bâr");
        assert.deepStrictEqual(json.post, {});
        assert.deepStrictEqual(json.file.length, 4);
        done();
      });
    });

    it("fetch-FormData-multiparts", async () => {
      global.options.path = "/test/unit/request/multipart?fôo=bâr&foo=bar";
      const form = new FormData();
      const text = "I' am an attâchment";
      form.append("myname", text);
      const obj = JSON.stringify({
        foo: "bar",
        myinterger: 3,
        "foo-bar": "3",
        _attachments: {
          "message.txt": {
            follows: true,
            length: 18,
            "content_type": "text/plain"
          }
        }
      });
      form.append("myname2", obj);
      form.append("my_buffer", new Buffer.from([1, 2, 3]));
      form.append("my_buffer2", new Blob(new Buffer.from([1, 2, 3])));

      const blob = new Blob(["Some content"], {type: "text/plain"});
      form.set("myblob", blob);

      // let img = fs.createReadStream(path.resolve("..", __dirname, "images", "pdf.png"))
      // console.log(img)
      // form.append('my_logo', new Blob(img));
      /* form.set('file', img, {
        filename: 'unicycle.png'
      });*/
      form.append("file", await fileFromPath(path.resolve("..", __dirname, "images", "pdf.png")), "unicycle.png");
      // form.append('file',new Blob(img), "unicycle.png")
      form.append("my_integer", 1);
      // form.append( 'my_boolean', true );

      const url = `https://${kernel.hostHttps}${global.options.path}`;
      const myoptions = nodefony.extend({}, options, {
        method: "POST",
        body: form
      });
      const uploadResponse = await fetch(url, myoptions);
      const json = await uploadResponse.json();
      // console.log(json)
      // console.log(json.post)
      assert.deepStrictEqual(json.query.foo, "bar");
      assert.deepStrictEqual(json.query["fôo"], "bâr");
      assert.deepStrictEqual(json.get.foo, "bar");
      assert.deepStrictEqual(json.get["fôo"], "bâr");
      assert.deepStrictEqual(json.post.myname2, [obj]);
      assert.deepStrictEqual(json.post.myname, [text]);
      assert.deepStrictEqual(json.post.my_buffer, ["\x01\x02\x03"]);
      assert.deepStrictEqual(json.file.length, 3);

      return json;
    });
  });
});
