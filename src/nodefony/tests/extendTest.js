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

describe("NODEFONY EXTEND", () => {
  describe("CONTRUSTROR ", () => {
    it("LIB LOADED", (done) => {
      assert.equal(typeof nodefony.extend, "function");
      done();
    });
    it("Simple empty", (done) => {
      const res = nodefony.extend();
      assert(nodefony.isEmptyObject(res));
      done();
    });
  });

  describe("Simple Object", () => {
    it("Simple Object", (done) => {
      const myobj = {
        foo: "bar"
      };
      let res = nodefony.extend({});
      assert(res === nodefony);
      res = nodefony.extend(true);
      assert(nodefony.isEmptyObject(res));
      res = nodefony.extend(myobj, {
        bar: "foo"
      });
      assert(res === myobj);
      let obj = {};
      res = nodefony.extend(obj, myobj, {
        bar: "foo"
      });
      assert(res === obj);
      assert.equal(res.foo, "bar");
      assert.equal(res.bar, "foo");
      res = nodefony.extend(myobj, {
        foo: "bar1"
      });
      assert(res === myobj);
      assert.equal(res.foo, "bar1");
      obj = {};
      res = nodefony.extend(obj, myobj, {
        foo: "bar2"
      });
      assert.equal(myobj.foo, "bar1");
      assert.equal(obj.foo, "bar2");
      assert.equal(obj.bar, "foo");
      done();
    });

    it("Deep Object", (done) => {
      const myobj = {
        foo: {
          bar: {
            ele: 1,
            obj: 1
          }
        }
      };
      res = nodefony.extend(myobj, {
        bar: "foo"
      });
      assert(myobj.bar, "foo");
      let obj = {};
      res = nodefony.extend(obj, myobj, {
        bar: "foo1"
      });
      assert(res, obj);
      assert.equal(res.foo, myobj.foo);
      assert.equal(res.bar, "foo1");
      assert.equal(myobj.bar, "foo");
      assert.equal(res.foo.bar.ele, 1);
      obj = {};
      res = nodefony.extend(obj, myobj, {
        foo: {
          bar: {
            ele: 2
          }
        }
      });
      assert.equal(res.bar, "foo");
      assert.equal(res.foo.bar.ele, 2);
      assert.equal(res.foo.bar.obj, undefined);
      obj = {};
      res = nodefony.extend(true, obj, myobj, {
        foo: {
          bar: {
            ele: 3
          }
        }
      });
      assert.equal(res.bar, "foo");
      assert.equal(res.foo.bar.ele, 3);
      assert.equal(res.foo.bar.obj, 1);
      obj = {};
      res = nodefony.extend(true, obj, myobj, {
        bar: "foo"
      });
      assert(res, obj);
      assert.notEqual(res.foo, myobj.foo);
      done();
    });
  });

  describe("Extend with Array", () => {
    it("Simple", (done) => {
      const myArray = [1, 2, 3];
      let res = nodefony.extend(myArray);
      assert.equal(res, nodefony);
      const myobj = {
        tab: myArray,
        foo: "bar"
      };
      res = nodefony.extend({}, myobj);
      assert.equal(res.tab, myArray);
      res = nodefony.extend(true, {}, myobj);
      assert.notEqual(res.tab, myArray);

      const tab = [4, 5, 6];
      res = nodefony.extend({}, myobj, {
        tab
      });
      assert.equal(res.tab, tab);
      res = nodefony.extend(true, {}, myobj, {
        tab
      });
      assert.notEqual(res.tab, tab);
      done();
    });
  });
});
