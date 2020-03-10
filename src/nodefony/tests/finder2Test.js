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
const assert = require('assert').strict;

describe("NODEFONY CORE FINDER", () => {

  before(function () {
    try {
      global.bundlePath = path.resolve("src", "bundles");
      global.nodefonyPath = path.resolve("src", "nodefony");
      global.dataPath = path.resolve("src", "nodefony", "tests", "data");
      global.arrayPath = [global.bundlePath, global.nodefonyPath];
      global.excludeDir = /node_modules|tmp|docker|.git|assets|tests|test|doc|documentation|public/;
      global.finderInstance = new nodefony.Finder2({
        //excludeDir: global.excludeDir
      });
      global.finder = global.finderInstance.in(global.bundlePath);

    } catch (e) {
      throw e;
    }
  });

  describe('CONTRUSTROR ', () => {

    beforeEach(() => {
      global.finder2 = new nodefony.Finder2({
        excludeDir: global.excludeDir,
        //match: /.*.js$|.*.es6$/,
        recurse: true,
        depth: 1,
        seeHidden: true,
        followSymLink: true,
      });
    });

    it("NEW", async () => {
      assert.equal(typeof nodefony.Finder2, "function");
      assert.equal(typeof global.finder2.in, "function");
      assert.equal(global.finder2 instanceof nodefony.Finder2, true);
      assert.equal(false, global.finderInstance.settings.recurse);
      assert.equal(10, global.finderInstance.settings.depth);
      assert.equal(false, global.finderInstance.settings.seeHidden);
      assert.equal(null, global.finderInstance.settings.match);
      assert.equal(null, global.finderInstance.settings.exclude);
      assert.equal(null, global.finderInstance.settings.excludeFile);
      assert.equal(null, global.finderInstance.settings.excludeDir);
      assert.equal(false, global.finderInstance.settings.followSymLink);
      return global.finderInstance;
    });

    it("PATH", async () => {
      assert.throws(() => {
        global.finder2.ckeckPath(path.resolve("src", "bundle"));
      });
      let result = global.finder2.ckeckPath(global.bundlePath);
      assert(result instanceof nodefony.FileResult);
      assert.strictEqual(result.length, 1);
      let file = result[0];
      assert(file);
      assert(file instanceof nodefony.fileClass);
      assert(file instanceof nodefony.File);
      assert.equal(file.type, "Directory");
      assert.equal(file.name, "bundles");
      assert.equal(file.path, global.bundlePath);
      assert.throws(() => {
        global.finder2.ckeckPath("bad path");
      });
      //array
      result = global.finder2.ckeckPath(global.arrayPath);
      assert.strictEqual(result.length, 2);
      file = result[0];
      assert(file instanceof nodefony.fileClass);
      assert.equal(file.type, "Directory");
      assert.equal(file.name, "bundles");
      let file2 = result[1];
      assert(file2 instanceof nodefony.fileClass);
      assert.equal(file2.type, "Directory");
      assert.equal(file2.name, "nodefony");
    });

    it("PARSE IN", async () => {
      assert.rejects(global.finder2.in("bad path"));
      let res = await global.finder2
        .in("bad path")
        .catch((e) => {
          assert.ok((e.message.indexOf("no such file or director") >= 0));
        });
      assert.equal(res, undefined);
      assert.rejects(async () => {
        res = await global.finder2
          .in("bad path")
          .catch((e) => {
            assert.match(e.message, /no such file or director/);
            throw e;
          });
      });

      res = await global.finder2
        .in(global.nodefonyPath)
        .then((result) => {
          assert(result);
          assert.strictEqual(result.length, 1);
          let file = result[0];
          assert(result instanceof nodefony.FileResult);
          assert.equal(file.name, "nodefony");
          assert.equal(file.path, global.nodefonyPath);
          return result;
        });
      assert(res);
      assert.strictEqual(res.length, 1);
    });
  });

  /* TEST REC
  src/nodefony/tests/data/
  ├── .gitignore
  ├── data.js
  ├── data.png
  ├── dir1
  │   ├── data1.js
  │   ├── data1.png
  │   └── dir2
  │       ├── .gitignore
  │       ├── data2.js
  │       ├── data2.pnng
  │       └── dir3
  │           ├── data3.js
  │           ├── dir2 -> ../../../dir2
  │           └── dir4
  └── dir2 -> dir1/dir2
  */
  describe('RESULT ', () => {

    beforeEach(() => {
      global.finder2 = new nodefony.Finder2({
        excludeDir: global.excludeDir
        //match: /.*.js$|.*.es6$/,
      });
    });

    it("SIMPLE RESULT ", async () => {
      let res = await global.finder2
        .in(global.dataPath, {
          recurse: false,
          seeHidden: true
        })
        .then((result) => {
          assert(result);
          assert.strictEqual(result.length, 1);
          assert(result[0]);
          assert.strictEqual(result[0].length, 5);
          assert.strictEqual(result[0].children.length, 5);
          let sort = result[0].children.sortByName();
          assert.strictEqual(sort[0].name, ".gitignore");
          assert.strictEqual(sort[0].isHidden(), true);
          assert.strictEqual(sort[0].isFile(), true);
          assert.strictEqual(sort[1].name, "data.js");
          assert.strictEqual(sort[1].isFile(), true);
          assert.strictEqual(sort[2].name, "data.png");
          assert.strictEqual(sort[2].isFile(), true);
          assert.strictEqual(sort[3].name, "dir1");
          assert.strictEqual(sort[3].isDirectory(), true);
          assert.strictEqual(sort[3].children.length, 0);
          assert.strictEqual(sort[4].name, "dir2");
          //assert.strictEqual(sort[4].isSymbolicLink(), true);
          assert.strictEqual(sort[4].children.length, 0);
          return result[0];
        });
      assert(res);
      assert(res instanceof nodefony.File);
    });

    it("HIDDEN", async () => {
      let res = await global.finder2
        .in(global.dataPath, {
          seeHidden: false
        })
        .then((result) => {
          assert(result[0]);
          //assert.strictEqual(result[0].length, 4);
          return result;
        });
      assert(res);
      assert(res instanceof nodefony.FileResult);
    });

    it("DEEP 2", async () => {
      let res = await global.finder2
        .in(global.dataPath, {
          seeHidden: true,
          recurse: true,
          depth: 2,
        })
        .then((result) => {
          assert(result[0]);
          assert.strictEqual(result[0].length, 5);
          let sort = result[0].children.sortByName();
          let dir1 = sort[3];
          assert.strictEqual(dir1.children.length, 3);
          assert.strictEqual(dir1.name, "dir1");
          let dir2 = dir1.children[2];
          assert.strictEqual(dir2.name, "dir2");
          assert.strictEqual(dir2.children.length, 0);
          return sort;
        });
      assert(res);
    });

    it("DEEP 3", async () => {
      let res = await global.finder2
        .in(global.dataPath, {
          seeHidden: true,
          recurse: true,
          depth: 3,
        })
        .then((result) => {
          assert(result[0]);
          let sort = result[0].children.sortByName();
          let dir1 = sort[3];
          let dir2 = dir1.children[2];
          assert.strictEqual(dir2.children.length, 4);
          let sort2 = dir2.children.sortByName();
          assert.strictEqual(sort2.length, 4);
          let dir3 = sort2[3];
          assert.strictEqual(dir3.name, "dir3");
          assert.strictEqual(dir3.children.length, 0);
          return sort;
        });
      assert(res);
    });

    it("Default DEEP ", async () => {
      let res = await global.finder2
        .in(global.dataPath, {
          recurse: true,
          seeHidden: true,
          followSymLink: true,
        })
        .then((result) => {
          let sort = result[0].children.sortByName();
          let dir1 = sort[3];
          let dir2 = dir1.children[2];
          let sort2 = dir2.children.sortByName();
          let dir3 = sort2[3];
          assert.strictEqual(dir3.children.length, 2);
          return sort;
        });
      assert(res);
    });

    describe('RESULT ', () => {
      it("TOTAL ", async () => {
        const finder = new nodefony.Finder2({
          excludeDir: global.excludeDir,
          seeHidden: true,
          recurse: true,
          followSymLink: true,
        });
        let res = await finder.in(global.dataPath, {
          onFinish: (res, totals) => {
            assert.strictEqual(totals.Directory, 4);
            assert.strictEqual(totals.File, 13);
            assert.strictEqual(totals.symbolicLink, 3);
            assert.strictEqual(totals.hidden, 3);
          }
        });
        res = await finder.in(global.dataPath, {
          seeHidden: false,
          onFinish: (res, totals) => {
            assert.strictEqual(totals.Directory, 4);
            assert.strictEqual(totals.File, 10);
            assert.strictEqual(totals.symbolicLink, 3);
            assert.strictEqual(totals.hidden, 0);
          }
        });
        res = await finder.in(global.dataPath, {
          followSymLink: false,
          onFinish: (res, totals) => {
            //console.log(res)
            //console.log( res[0].children.getDirectories() )
            //assert.strictEqual(totals.Directory, 4);
            assert.strictEqual(totals.File, 9);
            assert.strictEqual(totals.symbolicLink, 2);
            assert.strictEqual(totals.hidden, 2);
          }
        });
      });
    });

    describe('RESULT FIND', () => {
      beforeEach(() => {
        global.finder2 = new nodefony.Finder2({
          excludeDir: global.excludeDir,
          //match: /.*.js$|.*.es6$/,
          seeHidden: true,
          recurse: true,
          followSymLink: true,
        });
      });

      it("SIMPLE", async () => {
        const finder = new nodefony.Finder2({
          excludeDir: global.excludeDir,
          seeHidden: true,
          recurse: true,
          followSymLink: true,
        });
        let res = await finder.in(global.dataPath, {});
        //let ret = res[0].children.find(/^dir/);
      });

    });

    describe('RESULT JSON', () => {
      beforeEach(() => {
        global.finder2 = new nodefony.Finder2({
          excludeDir: global.excludeDir,
          //match: /.*.js$|.*.es6$/,
          seeHidden: true,
          recurse: true,
          followSymLink: true,
        });
      });
      it("SIMPLE RESULT JSON", async () => {
        let res = await global.finder2.in(global.dataPath);
        assert.strictEqual(res[0].children.length, 5);
        assert(res[0] instanceof Object);
        assert(res[0].children instanceof Array);
        //console.log(res[0].toJson())
        //console.log(res.toJson())
        //console.log(JSON.stringify(res.toJson()))
        /*console.log(util.inspect(res.toJson(), {
          depth: 100
        }));*/
      });
    });

  });
});
