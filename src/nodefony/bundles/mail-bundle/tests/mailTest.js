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
 *
 *
 */
const assert = require('assert');
//const http = require("http");

describe("BUNDLE mail", function () {

  describe('CORE', () => {

    beforeEach(() => {});

    before(() => {});

    // EXAMPLE  NODEFONY
    it("NAMESPACE LOADED", function (done) {
      // check nodefony namespace
      assert.equal(typeof nodefony, "object");
      // check instance kernel
      assert.equal(kernel instanceof nodefony.kernel, true);
      done();
    });
  });

  describe('ROUTE', () => {

    beforeEach(() => {});

    before(() => {});

    it("ROUTE mail ", (done) => {
      done();
    });

  });
});