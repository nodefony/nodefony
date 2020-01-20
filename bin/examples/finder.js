#!/usr/bin/env node

// nodefony
let nodefony = null;
try {
  nodefony = require("nodefony");
} catch (e) {
  nodefony = require(require("path").resolve("src", "nodefony", "autoloader.es6"));
}

let files = 0;
let directories = 0;
let symlinks = 0;
let hidden = 0;

let myFind = async function (path) {
  let finder = new nodefony.Finder2({
    //excludeDir: /node_modules|tmp|docker|.git|assets|tests|test|doc|documentation|public/,
    recurse: true,
    seeHidden: true,
    followSymLink: true,
  });
  let result = await finder.in(path, {
      //depth: 10,
      //match: /.*.js$|.*.es6$/,
      onFinish(result, totals, finder) {
        console.log("FINISH", {
          files: files,
          directories: directories,
          symlinks: symlinks,
          hidden: hidden,
          totals: totals
        });
      },
      onsymbolicLink(ele) {
        //console.log(ele.name)
        symlinks++;
      },
      onDirectory(ele) {
        //console.log(ele.name);
        directories++;
      },
      onFile(ele) {
        //console.log(ele.name)
        files++
      },
      onHidden(ele) {
        //console.log(ele.name)
        hidden++
      },
      onError(e) {
        console.log(e.message)
      }
    })
    .then(async (result) => {
      //console.log(result)
      //console.log(result[0])
      return result[0].children;
    })
    .catch(e => {
      console.error(e);
    });
  console.log(finder);
};
myFind(path.resolve(".", "src", "nodefony", "tests", "data"))
  .then(async (result) => {
    //console.log(result)
    //console.log(result.toString())
    //console.log(result.sortByType().toString())
    //let json = await result.toJson()
    //console.log(json)
    //let ret = result.getFiles();
    //let ret = result.getDirectories();
    //console.log(ret.sortByName().toString())
    //console.log(ret.length)
    //console.log(await ret.toJson())
    //console.log(ret.length)
    //console.log(res[0].children[6])
    return result;
  });

//new nodefony.Finder2({}).in(path.resolve("."))