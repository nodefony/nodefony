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

// const http = require("http");
// var https = require("https");
// const WebSocketClient = require('websocket').client;
const assert = require("assert");
// var querystring = require("querystring");
const request = require("request");

/*
test-local-area:
    pattern:                                ^/test/firewall/local
    provider:                               nodefony
    form_login:
      default_target_path:                  /
      login_path:                           /login/test-local-area
      check_path:                           /test/firewall/local
    passport-local:
      usernameField:                        'username'
      passwordField:                        'passwd'
    logout:                                 /logout
    #context:                               local
    redirectHttps:                          false
    crossDomain:
        allow-origin:
          - "http://mycrossdomain.com:5151"
          - "ws://mycrossdomain.com:5151"
        Access-Control:
          Access-Control-Allow-Methods:
           - GET
          Access-Control-Allow-Headers:
            - Authorization
            - X-CSRF-Token
            - X-Requested-With
            - Accept
            - Accept-Version
            - Content-Length
            - Content-MD5
            - Content-Type
            - Date
          Access-Control-Expose-Headers:
           - WWW-Authenticate
           - X-Json
          Access-Control-Allow-Credentials: true
          Access-Control-Max-Age:           10
*/

const myjar = request.jar();

describe("BUNDLE TEST", () => {
  before(() => {
    global.firewall = kernel.get("security");
    global.options = {
      baseUrl: `http://${kernel.settings.system.domain}:${kernel.settings.system.httpPort}`,
      url: "/test/firewall/local",
      method: "GET",
      encoding: "utf8",
      headers: {
        Accept: "application/json"
      }
    };
  });

  describe("AREA : test-api-area Factory: passpot-local", () => {
    it("Settings test-local-area", (done) => {
      assert(global.firewall.securedAreas["test-local-area"]);
      const local = global.firewall.securedAreas["test-local-area"];
      assert.deepStrictEqual(local.sessionContext, "default");
      assert.deepStrictEqual(local.redirect_Https, false);
      assert.deepStrictEqual(local.providerName, "nodefony");
      assert(local.provider);
      assert.deepStrictEqual(local.alwaysUseDefaultTarget, false);
      assert.deepStrictEqual(local.name, "test-local-area");
      assert(local.factories.length);
      assert.deepStrictEqual(local.factories.length, 1);
      assert.deepStrictEqual(local.factories[0].name, "local");
      assert(local.cors);
      assert.deepStrictEqual(local.formLogin, "/login/secure");
      assert.deepStrictEqual(local.checkLogin, "/test/firewall/local");
      assert.deepStrictEqual(local.stringPattern, "^/test/firewall/local");
      try {
        const res = local.pattern.test("/test/firewall/local/myroute");
        assert.ok(res);
      } catch (e) {
        throw e;
      }
      done();
    });

    it("Enter AREA  json", (done) => {
      request(global.options, (error, response, body) => {
        if (error) {
          throw error;
        }
        assert.deepStrictEqual(response.statusCode, 400);
        assert.deepStrictEqual(response.statusMessage, "Missing credentials");
        const json = JSON.parse(body);
        assert.equal(json.code, 400);
        assert.deepStrictEqual(json.message, "Missing credentials");
        assert.deepStrictEqual(json.url, global.options.baseUrl + global.options.url);
        // assert(json.pdu);
        done();
      });
    });

    it("Enter AREA http", (done) => {
      global.options.headers.Accept = "txt/html";
      global.options.followRedirect = false;
      request(global.options, (error, response, body) => {
        if (error) {
          throw error;
        }
        // assert.deepStrictEqual(body, "");
        // assert.deepStrictEqual(response.headers.location, "/login/secure");
        assert.deepStrictEqual(response.statusCode, 400);
        assert.deepStrictEqual(response.statusMessage, "Missing credentials");
        const session = response.headers["set-cookie"][0];
        assert(session);
        done();
      });
    });
    it("Authenticate Local Area", (done) => {
      global.options.method = "POST";
      global.options.headers.Accept = "application/json";
      global.options.form = {
        username: "admin",
        passwd: "admin"
      };
      request(global.options, (error, response, body) => {
        if (error) {
          throw error;
        }
        assert.deepStrictEqual(body, "");
        assert.deepStrictEqual(response.headers.location, "/test/firewall/jwt");
        assert.deepStrictEqual(response.statusCode, 301);
        assert.deepStrictEqual(response.statusMessage, "Moved Permanently");
        const session = response.headers["set-cookie"][0];
        assert(session);
        assert(new RegExp("^nodefony=.*$").test(session));
        done();
      });
    });

    it("Authenticate Local Area with followRedirect no cookie", (done) => {
      global.options.method = "POST";
      global.options.headers.Accept = "application/json";
      global.options.followRedirect = true;
      global.options.followAllRedirects = true;
      // global.options.jar = myjar;
      global.options.form = {
        username: "admin",
        passwd: "admin"
      };
      request(global.options, (error, response /* , body*/) => {
        if (error) {
          throw error;
        }
        assert.deepStrictEqual(response.statusCode, 401);
        assert.deepStrictEqual(response.statusMessage, "No Auth Token");
        // let session = response.headers["set-cookie"][0];
        // assert(session);
        done();
      });
    });

    it("Authenticate Local Area with followRedirect with follow cookie", (done) => {
      global.options.method = "POST";
      global.options.headers.Accept = "application/json";
      global.options.followRedirect = true;
      global.options.followAllRedirects = true;
      global.options.jar = myjar;
      global.options.form = {
        username: "admin",
        passwd: "admin"
      };
      request(global.options, (error, response, body) => {
        if (error) {
          throw error;
        }
        assert.deepStrictEqual(response.statusCode, 200);
        const json = JSON.parse(body);
        assert(json.data);
        global.data = json.data;
        const jwt = response.headers["set-cookie"][0];
        assert(jwt);
        assert(new RegExp("^jwt=.*$").test(jwt));
        done();
      });
    });

    it("Valid Token", (done) => {
      const service = kernel.get("httpsServer");
      const res = service.getCertificats();
      global.options.url = "/test/firewall/api/stateless";
      global.options.form = null;
      global.options.method = "GET";
      global.options.followRedirect = true;
      global.options.baseUrl = `https://${kernel.settings.system.domain}:${kernel.settings.system.httpsPort}`;
      global.options.key = res.key;
      global.options.cert = res.cert;
      global.options.ca = res.ca;
      request(global.options, (error, response, body) => {
        if (error) {
          throw error;
        }
        const json = JSON.parse(body);
        // Valid token
        const {token} = json;
        assert.deepStrictEqual(token.name, "jwt");
        assert.deepStrictEqual(token.authenticated, true);
        assert.deepStrictEqual(token.factory, "jwt");
        assert.deepStrictEqual(token.provider, null);
        assert.deepStrictEqual(token.user.username, json.user.username);
        assert.deepStrictEqual(token.user.name, json.user.name);
        assert.deepStrictEqual(token.user.surname, json.user.surname);
        // assert.deepStrictEqual(token.user, json.user);
        assert(token.jwtToken);
        // valid token during authenticate Local
        assert(token.jwtToken.data);
        assert.deepStrictEqual(token.jwtToken.data, global.data);
        done();
      });
    });
  });
});
