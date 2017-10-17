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


describe("BUNDLE TEST", function () {

    before(function () {
        global.firewall = kernel.get("security");
        global.options = {
            hostname: kernel.settings.system.domain,
            port: kernel.settings.system.httpPort,
            method: 'GET',
            urlws: 'ws://' + kernel.settings.system.domain + ':' + kernel.settings.system.httpPort
        };
    });

    describe('FIREWALL CONFIG', () => {
        it("SETTINGS", (done) => {
            assert.deepStrictEqual(global.firewall.name, "firewall");
            assert.deepStrictEqual(global.firewall.sessionStrategy, "migrate");
            assert(global.firewall.sessionService);
            assert(global.firewall.orm);
            assert(global.firewall.securedAreas);
            assert(global.firewall.reader);
            done();
        });
        it("test-sasl-area", (done) => {
            assert(global.firewall.securedAreas["test-sasl-area"]);
            let sasl = global.firewall.securedAreas["test-sasl-area"];
            assert.deepStrictEqual(sasl.sessionContext, "default");
            assert.deepStrictEqual(sasl.redirect_Https, false);
            assert.deepStrictEqual(sasl.providerName, "nodefony");
            assert(sasl.provider);
            assert.deepStrictEqual(sasl.alwaysUseDefaultTarget, false);
            assert.deepStrictEqual(sasl.factoryName, "sasl");
            assert(sasl.factory);
            assert(sasl.cors);
            assert.deepStrictEqual(sasl.formLogin, "/test/login");
            assert.deepStrictEqual(sasl.checkLogin, "/test/firewall/check");
            assert.deepStrictEqual(sasl.regPartten, '^/test/firewall/test');
            try {
                let res = sasl.pattern.test("/test/firewall/test/myroute");
                assert.ok(res);
            } catch (e) {
                throw e;
            }
            done();
        });
        it("test-basic-area", (done) => {
            assert(global.firewall.securedAreas["test-basic-area"]);
            let basic = global.firewall.securedAreas["test-basic-area"];
            assert.deepStrictEqual(basic.sessionContext, "default");
            assert.deepStrictEqual(basic.redirect_Https, false);
            assert.deepStrictEqual(basic.providerName, "nodefony");
            assert(basic.provider);
            assert.deepStrictEqual(basic.alwaysUseDefaultTarget, false);
            assert.deepStrictEqual(basic.factoryName, "passport-basic");
            assert(basic.factory);
            assert.deepStrictEqual(basic.factory.name, "passport-basic");
            assert.deepStrictEqual(basic.cors, null);
            assert.deepStrictEqual(basic.formLogin, null);
            assert.deepStrictEqual(basic.checkLogin, "/test/firewall/basic");
            assert.deepStrictEqual(basic.regPartten, '^/test/firewall/basic');
            try {
                let res = basic.pattern.test("/test/firewall/basic/myroute");
                assert.ok(res);
            } catch (e) {
                throw e;
            }
            done();
        });
        it("test-digest-area", (done) => {
            assert(global.firewall.securedAreas["test-digest-area"]);
            let digest = global.firewall.securedAreas["test-digest-area"];
            assert.deepStrictEqual(digest.sessionContext, "default");
            assert.deepStrictEqual(digest.redirect_Https, false);
            assert.deepStrictEqual(digest.providerName, "nodefony");
            assert(digest.provider);
            assert.deepStrictEqual(digest.alwaysUseDefaultTarget, false);
            assert.deepStrictEqual(digest.factoryName, "passport-digest");
            assert(digest.factory);
            assert.deepStrictEqual(digest.factory.name, "passport-digest");
            assert.deepStrictEqual(digest.cors, null);
            assert.deepStrictEqual(digest.formLogin, null);
            assert.deepStrictEqual(digest.checkLogin, "/test/firewall/digest");
            assert.deepStrictEqual(digest.regPartten, '^/test/firewall/digest');
            try {
                let res = digest.pattern.test("/test/firewall/digest/myroute");
                assert.ok(res);
            } catch (e) {
                throw e;
            }
            done();
        });
        it("test-local-area", (done) => {
            assert(global.firewall.securedAreas["test-local-area"]);
            //console.log(global.firewall.securedAreas["test-local-area"] );
            let local = global.firewall.securedAreas["test-local-area"];
            assert.deepStrictEqual(local.sessionContext, "local");
            assert.deepStrictEqual(local.redirect_Https, false);
            assert.deepStrictEqual(local.providerName, "nodefony");
            assert(local.provider);
            assert.deepStrictEqual(local.alwaysUseDefaultTarget, false);
            assert.deepStrictEqual(local.factoryName, "passport-local");
            assert(local.factory);
            assert.deepStrictEqual(local.factory.name, "passport-local");
            assert(local.cors);
            assert.deepStrictEqual(local.formLogin, "/test/login");
            assert.deepStrictEqual(local.checkLogin, "/test/firewall/local");
            assert.deepStrictEqual(local.regPartten, '^/test/firewall/local');
            try {
                let res = local.pattern.test("/test/firewall/local/myroute");
                assert.ok(res);
            } catch (e) {
                throw e;
            }
            done();
        });

    });
});
