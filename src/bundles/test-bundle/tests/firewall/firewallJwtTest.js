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
const request = require('request');

/*
test-api-area:
    pattern:                                ^/test/firewall/api
    stateless:                              true
    #provider:                              nodefony
    form_login:
      login_path:                           /test/firewall/local
    passport-jwt:
      algorithms:                           "RS256"
      certificats:
        private                             : "config/certificates/ca/private/ca.key.pem"
        public                              : "config/certificates/ca/public/public.key.pem"
      #secretOrKey:                         "Les sanglots longs Des violons De l’automne Blessent mon cœur D’une langueur Monotone."
      jwtFromRequest:                       # fromCookie fromHeader
        extractor:                          "fromCookie"
        params:
          - "jwt"
*/


describe("BUNDLE TEST", function () {

  before(function () {
    // cookies container
    let myjar = request.jar();
    global.firewall = kernel.get("security");
    global.options = {
      baseUrl: "http://" + kernel.settings.system.domain + ":" + kernel.settings.system.httpPort,
      url: "/test/firewall/api",
      method: 'GET',
      encoding: "utf8",
      jar: myjar,
      followRedirect: true,
      headers: {
        Accept: "application/json"
      }
    };
    global.optionsLocal = {
      baseUrl: "http://" + kernel.settings.system.domain + ":" + kernel.settings.system.httpPort,
      url: "/test/firewall/local",
      method: 'POST',
      encoding: "utf8",
      headers: {
        Accept: "application/json"
      },
      form: {
        username: "admin",
        passwd: "admin"
      },
      followRedirect: true,
      followAllRedirects: true,
      jar: myjar
    };
  });

  describe('AREA: test-api-area Factory: passport-jwt', () => {

    it("Settings test-api-area", (done) => {
      let apiArea = global.firewall.securedAreas["test-api-area"];
      assert(apiArea);
      assert.deepStrictEqual(apiArea.sessionContext, "default");
      assert.deepStrictEqual(apiArea.stateLess, true);
      assert.deepStrictEqual(apiArea.formLogin, "/test/firewall/local");
      assert(apiArea.factories.length);
      assert.deepStrictEqual(apiArea.factories.length, 1);
      assert.deepStrictEqual(apiArea.factories[0].name, "jwt");
      assert.deepStrictEqual(apiArea.stringPattern, '^/test/firewall/api');
      try {
        let res = apiArea.pattern.test("/test/firewall/api");
        assert.ok(res);
      } catch (e) {
        throw e;
      }
      done();
    });

    it("Enter AREA  follow redirect https", (done) => {
      request(global.options, (error /*, response, body*/ ) => {
        if (error) {
          done();
          return;
        }
        throw new Error("redirect https");
      });
    });

    it("Enter AREA  redirect https", (done) => {
      global.options.followRedirect = false;
      request(global.options, (error, response /*, body*/ ) => {
        if (error) {
          throw error;
        }
        assert.deepStrictEqual(response.statusCode, 301);
        assert.deepStrictEqual(response.statusMessage, "Moved Permanently");
        assert.deepStrictEqual(response.headers.location, "https://" + kernel.settings.system.domain + ":" + kernel.settings.system.httpsPort + global.options.url);
        done();
      });
    });

    it("Enter AREA json", (done) => {
      let service = kernel.get("httpsServer");
      let res = service.getCertificats();
      global.options.followRedirect = true;
      global.options.baseUrl = "https://" + kernel.settings.system.domain + ":" + kernel.settings.system.httpsPort;
      global.options.key = res.key;
      global.options.cert = res.cert;
      global.options.ca = res.ca;
      request(global.options, (error, response, body) => {
        if (error) {
          throw error;
        }
        assert.deepStrictEqual(response.statusCode, 401);
        assert.deepStrictEqual(response.statusMessage, 'No auth token');
        let json = JSON.parse(body);
        assert.equal(json.code, 401);
        assert.deepStrictEqual(json.message, "No auth token");
        assert.deepStrictEqual(json.url, global.options.baseUrl + global.options.url);
        assert(json.pdu);
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
        assert.deepStrictEqual(body, "");
        assert.deepStrictEqual(response.headers.location, "/test/firewall/local");
        assert.deepStrictEqual(response.statusCode, 302);
        assert.deepStrictEqual(response.statusMessage, 'No auth token');
        done();
      });
    });

    it("Authenticate Local Area", (done) => {
      request(global.optionsLocal, (error, response, body) => {
        if (error) {
          throw error;
        }
        assert.deepStrictEqual(response.statusCode, 200);
        let json = JSON.parse(body);
        assert(json.data);
        global.data = json.data;
        let jwt = response.headers["set-cookie"][0];
        assert(jwt);
        assert(new RegExp("^jwt=.*$").test(jwt));
        done();
      });
    });

    it("Valid Stateless Token", (done) => {
      global.options.url = "/test/firewall/api/stateless";
      request(global.options, (error, response, body) => {
        if (error) {
          throw error;
        }
        assert.deepStrictEqual(response.statusCode, 200);
        assert.deepStrictEqual(response.statusMessage, 'OK');
        let json = JSON.parse(body);
        // Valid API
        assert.deepStrictEqual(json.foo, "bar");
        // Valid user
        let user = json.user;
        assert.deepStrictEqual(user.username, "admin");
        assert.deepStrictEqual(nodefony.typeOf(user.roles), "array");
        assert.deepStrictEqual(user.roles[0], 'ROLE_ADMIN');
        assert.deepStrictEqual(user.lang, 'en_en');
        assert.deepStrictEqual(user.enabled, true);
        assert.deepStrictEqual(user.accountNonExpired, true);
        assert.deepStrictEqual(user.credentialsNonExpired, true);
        assert.deepStrictEqual(user.accountNonLocked, true);
        assert.deepStrictEqual(user.name, 'administrator');
        assert.deepStrictEqual(user.surname, 'nodefony');
        // Valid token
        let token = json.token;
        assert.deepStrictEqual(token.name, "jwt");
        assert.deepStrictEqual(token.authenticated, true);
        assert.deepStrictEqual(token.factory, "jwt");
        assert.deepStrictEqual(token.provider, null);
        assert.deepStrictEqual(token.user, json.user);
        assert(token.jwtToken);
        // valid token during authenticate local
        assert(token.jwtToken.data);
        assert.deepStrictEqual(token.jwtToken.data, global.data);
        done();
      });
    });

  });
});
