const assert = require('assert');

const request = require("request");


describe("NODEFONY BUNDLE ELASTICSEARCH", function () {

  describe('CONFIGURATIONS ', function () {

    /*it("KERNEL", function(done){
    	console.log( kernel.settings.system.version );
    	done();
    });*/

  });

  describe('Connection', function () {

    beforeEach(async () => {
      global.elastic = kernel.get("elastic");
      let conn = await global.elastic.getConnection("main");
      global.client = conn.client;
    });

    it("HEALF-SERVICE", async () => {
      let res = await global.client.cluster.health();
      assert.deepStrictEqual(res.statusCode, 200);
    });

    it("PING-SERVICE", async () => {
      let res = await global.client.ping();
    });

  });


});