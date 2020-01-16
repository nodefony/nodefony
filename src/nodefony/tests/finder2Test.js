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
const assert = require('assert');

describe("NODEFONY CORE FINDER", function() {

  describe('CONTRUSTROR ', function() {


    beforeEach(function() {});

    before(function() {
      try {
        global.finder = new nodefony.Finder2({
          //path:kernel.rootDir
        });
      } catch (e) {
        throw e;
      }
    });



    it("NEW", function(done) {
      var finder = null;
      assert.equal(typeof nodefony.Finder2, "function");

      assert.throws(() => {
        finder = new nodefony.finder({
          paths: "path not found "
        });
      });

      assert.throws(() => {
        finder = new nodefony.finder({
          paths: "path not found "
        });
      });

      finder = new nodefony.Finder2({});
      assert.equal(finder instanceof nodefony.Finder2, true);
      done();

    });

    it("PARSE ROOTDIR", async () => {

      var res = await finder.find({
        recurse: false,
        onFinish: function(error, result) {
          console.log("RESULT length :" + result.length());

        }
      });

    });

    it("RESULT JSON", async () => {
      await global.finder.find({
        recurse: false,
        json: true,
        onFinish: function(error, result) {
          //console.log("RESULT length :" + result.length());
          //console.log(result.json.nodefony.children.web)
        }
      });

      new nodefony.Finder2({
          path: kernel.rootDir,
          json: true,
          recurse: false,
          onFinish: (error, result) => {
            console.log("RESULT length :" + result.length());
            console.log(result.json.nodefony.children.web)

          }
        })



    });


  });

});
