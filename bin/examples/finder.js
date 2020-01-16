#!/usr/bin/env node
 // nodefony
let nodefony = null;
try {
  nodefony = require("nodefony");
} catch (e) {
  nodefony = require(require("path").resolve("src", "nodefony", "autoloader.es6"));
}



new nodefony.Finder2({
    json:true,
    recurse:true,
    exclude:/node_modules|tmp|docker/,
    onFinish() {
      console.log("onFinish")
    },
    onDirectory(ele){
      //console.log(ele.name)
    }
  })
  .find(path.resolve("."), {
    depth:10,
    followSymLink:true,
  })
  .then((ele) => {
    console.log(ele[0]);
    //console.log( ele[6].childrens );
    ele.forEach((item, i) => {
      console.log(item.name)
    });

  });
