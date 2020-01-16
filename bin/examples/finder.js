#!/usr/bin/env node
 // nodefony
let nodefony = null;
try {
  nodefony = require("nodefony");
} catch (e) {
  nodefony = require(require("path").resolve("src", "nodefony", "autoloader.es6"));
}



new nodefony.Finder2({
    onFinih() {
      console.log("pass")
    }
  })
  .find(path.resolve("."), {

  })
  .then((ele) => {
    //console.log(ele);
  });