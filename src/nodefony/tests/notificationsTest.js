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


describe("NODEFONY Notifications Center", () => {
  describe("namespace", () => {
    before(() => {
      global.notificationsCenter = nodefony.notificationsCenter.create();
    });
    it("register", (done) => {
      assert(nodefony.notificationsCenter);
      assert(nodefony.notificationsCenter.notification);
      assert(global.notificationsCenter instanceof nodefony.notificationsCenter.notification);
      assert(nodefony.notificationsCenter.create);
      done();
    });
  });

  describe("sync", () => {
    it("sync", (done) => {
      const obj = {};
      global.notificationsCenter.on("myEvent", (count, args) => {
        assert.strictEqual(args, obj);
        if (count === 1) {
          done();
        } else {
          assert.strictEqual(count, 0);
        }
      });
      let i = 0;
      setTimeout(() => {
        global.notificationsCenter.fire("myEvent", i, obj);
        global.notificationsCenter.emit("myEvent", ++i, obj);
      }, 500);
    });
  });

  describe("async", () => {
    before(() => {
      // delete global.notificationsCenter;
      // global.notificationsCenter = nodefony.notificationsCenter.create();
    });
    beforeEach(() => {
      delete global.notificationsCenter;
      global.notificationsCenter = nodefony.notificationsCenter.create();
    });
    it("simple", async () => {
      const obj = {};
      global.notificationsCenter.on("myEvent", async (count, args) => new Promise((resolve) => {
        assert.strictEqual(args, obj);
        if (count === 1) {
          setTimeout(() => {
            resolve(count);
          }, 100);
        } else {
          assert.strictEqual(count, 0);
          setTimeout(() => {
            resolve(args);
          }, 500);
        }
      }));
      let i = 0;
      let res = await global.notificationsCenter.fireAsync("myEvent", i, obj);
      assert.strictEqual(res.length, 1);
      assert.strictEqual(res[0], obj);
      res = await global.notificationsCenter.emitAsync("myEvent", ++i, obj);
      assert.strictEqual(res.length, 1);
      assert.strictEqual(res[0], 1);
    });

    it("multi", async () => {
      const obj = {};
      global.notificationsCenter.on("myEvent", async (count, args) => new Promise((resolve) => {
        setTimeout(() => {
          resolve(args);
        }, 400);
      }));
      global.notificationsCenter.on("myEvent", async (count) => new Promise((resolve) => {
        setTimeout(() => {
          resolve(count + 1);
        }, 200);
      }));
      let i = 0;
      const res = await global.notificationsCenter.fireAsync("myEvent", i, obj);
      const res1 = await global.notificationsCenter.emitAsync("myEvent", ++i, obj);
      assert.strictEqual(res.length, 2);
      assert.strictEqual(res[0], obj);
      assert.strictEqual(res[1], 1);
      assert.strictEqual(res1.length, 2);
      assert.strictEqual(res1[0], obj);
      assert.strictEqual(res1[1], 2);

      const res2 = await global.notificationsCenter.emitAsync("myEvent", --i, res1);
      assert.strictEqual(res2.length, 2);
      assert.strictEqual(res2[0], res1);
      assert.strictEqual(res2[1], 1);
    });

    it("await", async () => {
      const myFunc = async function (count, args) {
        if (count === 0) {
          return count + 1;
        }
        return args;
      };
      const obj = {};
      const i = 0;
      global.notificationsCenter.on("myEvent", async (count, args) => await myFunc(count, args));
      global.notificationsCenter.on("myEvent", async (count, args) => await myFunc(count, args));
      const res = await global.notificationsCenter.fireAsync("myEvent", i, obj)
        .then((args) => {
          assert.strictEqual(args[0], 1);
          assert.strictEqual(args[1], 1);
          return args;
        });
      const res2 = await global.notificationsCenter.fireAsync("myEvent", res[0], obj)
        .then((args) => {
          assert.strictEqual(args[0], obj);
          assert.strictEqual(args[1], obj);
          return args;
        });
      assert.strictEqual(res[0], 1);
      assert.strictEqual(res[1], 1);
      assert.strictEqual(res2[0], obj);
      assert.strictEqual(res2[1], obj);
    });

    it("await error", async () => {
      const myFunc = async function (count, args) {
        if (count === 0) {
          return count + 1;
        }
        return args;
      };
      const obj = {};
      const i = 0;
      const myFunc2 = async function () {
        throw new Error("myError");
      };
      global.notificationsCenter.on("myEvent", async (count, args) => await myFunc(count, args));
      global.notificationsCenter.on("myEvent", async (count, args) => await myFunc2(count, args));
      let res = null;
      try {
        res = await global.notificationsCenter.fireAsync("myEvent", i, obj)
          .then((...args) => {
            console.log(args);
            throw new Error("then don't be call");
          })
          .catch((e) => {
            assert.strictEqual(e.message, "myError");
          });
        assert.strictEqual(res, undefined);
        res = null;
        res = global.notificationsCenter.fireAsync("myEvent", i, obj)
          .then((...args) => {
            console.log(args);
            throw new Error("then don't be call");
          })
          .catch((e) => {
            assert.strictEqual(e.message, "myError");
          });
        assert(nodefony.isPromise(res));
      } catch (e) {
        throw e;
      }
    });
  });
});
