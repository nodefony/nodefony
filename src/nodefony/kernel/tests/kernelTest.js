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
 *
 *
 */


const assert = require("assert");

describe("NODEFONY KERNEL", () => {
  describe("LIBRARY", () => {
    beforeEach(() => {
    });

    before(() => {

    });

    it("NAMESPACE LOADED", (done) => {
      // check nodefony namespace
      assert.equal(typeof nodefony, "object");
      done();
    });

    it("INSTANCE KERNEL LOADED", (done) => {
      // check instance kernel
      assert.equal(kernel instanceof nodefony.kernel, true);
      done();
    });
  });
});
