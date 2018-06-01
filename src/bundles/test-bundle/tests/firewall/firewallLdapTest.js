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
ldap_area:
  pattern:                                  ^/test/firewall/ldap
  provider:                                 nodefony
  form_login:
    login_path:                             /login/ldap_area
    check_path:                             /ldap
  #CHECK ./node_modules/.bin/ldapjs-search   -u ldap://ldap-server.com -b "dc=object,dc=com" "uid=user"
  passport-ldap:
    provider:                               false
    server:
      url:                                  'ldap://control-server.domain.com'
      searchBase:                           'dc=domain,dc=com'
      searchFilter:                         '(uid={{username}})'
    usernameField:                          'username'
    passwordField:                          'passwd'
    profile_wrapper:
      username:                             "profile.uid"
      name:                                 "profile.sn"
      surname:                              "profile.givenName"
      email:                                "profile.mail"
      displayName:                          "profile.cn"
  logout:                                   /logout
*/
global.firewall = kernel.get("security");
const ldapArea = global.firewall.securedAreas.ldap_area;
if (!ldapArea) {
  return;
}

describe("BUNDLE TEST", function () {

  before(function () {
    //store.removeCookies
    let myjar = request.jar();
    let service = kernel.get("httpsServer");
    let res = service.getCertificats();
    global.options = {
      baseUrl: "https://" + kernel.settings.system.domain + ":" + kernel.settings.system.httpsPort,
      url: "/test/firewall/ldap",
      method: 'GET',
      encoding: "utf8",
      followRedirect: true,
      //followAllRedirects: true,
      jar: myjar,
      headers: {
        Accept: "application/json"
      },
      key: res.key,
      cert: res.cert,
      ca: res.ca
    };
  });

  describe('AREA: ldap_area Factory: passport-ldap', () => {

    it("Settings ldap_area", (done) => {
      assert(ldapArea);
      assert.deepStrictEqual(ldapArea.sessionContext, "default");
      assert.deepStrictEqual(ldapArea.stateLess, false);
      assert.deepStrictEqual(ldapArea.formLogin, "/login/ldap_area");
      assert(ldapArea.factories.length);
      assert.deepStrictEqual(ldapArea.factories.length, 1);
      assert.deepStrictEqual(ldapArea.factories[0].name, "ldapauth");
      assert.deepStrictEqual(ldapArea.stringPattern, '^/test/firewall/ldap');
      try {
        let res = ldapArea.pattern.test("/test/firewall/ldap");
        assert.ok(res);
      } catch (e) {
        throw e;
      }
      done();
    });

    it("Enter AREA json", (done) => {

      request(global.options, (error, response, body) => {
        if (error) {
          throw error;
        }
        assert.deepStrictEqual(response.statusCode, 400);
        assert.deepStrictEqual(response.statusMessage, 'Missing credentials');
        let json = JSON.parse(body);
        assert.equal(json.code, 400);
        assert.equal(json.message, 'Missing credentials');
        done();
      });
    });

    it("Enter AREA http", (done) => {
      global.options.headers.Accept = "txt/html";
      global.options.followRedirect = false;
      request(global.options, (error, response /*, body*/ ) => {
        if (error) {
          throw error;
        }
        assert.deepStrictEqual(response.statusCode, 302);
        assert.deepStrictEqual(response.statusMessage, 'Unauthorized');

        done();
      });
    });

    it("Bad Authenticate Ldap Area", (done) => {
      global.options.form = {
        username: "cci",
        passwd: "admin"
      };
      global.options.headers.Accept = "application/json";
      global.options.method = "POST";
      global.options.followRedirect = true;
      request(global.options, (error, response, body) => {
        if (error) {
          throw error;
        }
        assert.deepStrictEqual(response.statusCode, 401);
        assert.deepStrictEqual(response.statusMessage, 'Unauthorized');
        let json = JSON.parse(body);
        assert.equal(json.code, 401);
        assert.equal(json.message, 'Unauthorized');
        assert.deepStrictEqual(json.url, global.options.baseUrl + global.options.url);
        assert(json.pdu);
        done();
      });
    });

    it("Authenticate Ldap Area", (done) => {
      global.options.form = {
        username: "cci",
        passwd: "91984869"
      };
      global.options.method = "POST";
      global.options.followRedirect = true;
      global.options.followAllRedirects = true;
      request(global.options, (error, response, body) => {
        if (error) {
          throw error;
        }
        assert.deepStrictEqual(response.statusCode, 200);
        assert.deepStrictEqual(response.statusMessage, 'OK');
        let json = JSON.parse(body);
        global.data = json.data;
        let jwt = response.headers["set-cookie"][0];
        assert(jwt);
        assert(new RegExp("^jwt=.*$").test(jwt));

        // valid ldap token
        let token = json.data;
        assert.deepStrictEqual(token.name, "ldap");
        assert.deepStrictEqual(token.authenticated, true);
        assert.deepStrictEqual(token.factory, "ldapauth");
        assert.deepStrictEqual(token.provider, ldapArea.factories[0].settings.server.url);
        assert(token.profile);
        done();
      });
    });

    it("Valid Token", (done) => {
      global.options.url = "/test/firewall/api/stateless";
      global.options.form = null;
      global.options.method = "GET";
      request(global.options, (error, response, body) => {
        if (error) {
          throw error;
        }
        let json = JSON.parse(body);
        // Valid token
        let token = json.token;
        assert.deepStrictEqual(token.name, "jwt");
        assert.deepStrictEqual(token.authenticated, true);
        assert.deepStrictEqual(token.factory, "jwt");
        assert.deepStrictEqual(token.provider, null);
        assert.deepStrictEqual(token.user, json.user);
        assert(token.jwtToken);
        // valid token during authenticate ldap
        assert(token.jwtToken.data);
        assert.deepStrictEqual(token.jwtToken.data, global.data);
        done();
      });
    });

  });
});