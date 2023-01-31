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
const assert = require("assert");

describe("NODEFONY CORE FINDER", () => {
  describe("CONTRUSTROR ", () => {
    beforeEach(() => {});

    before(() => {
      try {
        global.finder = new nodefony.finder({
          // path:kernel.rootDir
        });
      } catch (e) {
        throw e;
      }
    });

    it("LIB LOADED", (done) => {
      assert.equal(typeof nodefony.finder, "function");
      done();
    });

    it("NEW", (done) => {
      let finder = null;
      assert.equal(typeof nodefony.finder, "function");

      assert.throws(() => {
        finder = new nodefony.finder({
          path: "path not found "
        });
      });

      finder = new nodefony.finder({});
      assert.equal(finder instanceof nodefony.finder, true);
      done();
    });

    it("PARSE ROOTDIR", (done) => {
      const res = finder.find({
        recurse: false,
        onFinish (error, result) {
          // console.log("RESULT length :" + result.length());
          done();
        }
      });
    });

    it("RESULT JSON", (done) => {
      const res = finder.find({
        recurse: false,
        json: true,
        onFinish (error, result) {
          // console.log("RESULT length :" + result.length());
          // console.log(result.json.nodefony.children.web)
        }
      });

      const finderJson = new nodefony.finder({
        path: kernel.rootDir,
        json: true,
        recurse: false,
        onFinish (error, result) {
          // console.log("RESULT length :" + result.length());
          // console.log(result.json.nodefony.children.web)
          done();
        }
      });

      // console.log(finderJson.)
    });
  });
});
