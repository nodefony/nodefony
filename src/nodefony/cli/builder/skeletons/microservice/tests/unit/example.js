const path = require("path");
const assert = require('assert');
const config = require(path.resolve(__dirname, "..", "..", 'config', "config.js"));
const cci = require(path.resolve(__dirname, "..","..","src","index.js"));

describe("cci", () => {

  describe("test cci", () => {
    beforeEach(() => {

    });

    it("Example", (done) => {
      assert(cci);
      assert(config);
      done();
    });
  });
});
