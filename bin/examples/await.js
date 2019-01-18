#!/usr/bin/env node
 // nodefony
let nodefony = null;
try {
  nodefony = require("nodefony");
} catch (e) {
  nodefony = require(require("path").resolve("src", "nodefony", "autoloader.es6"));
}

class Sboob {
  constructor(name) {
    this.name = name;
  }

  async asyncCall() {
    console.log('calling');
    var result = await this.resolveAfter2Seconds();
    console.log(result);
    var result2 = await this.resolveAfter3Seconds();
    console.log("pass", result2);
  }

  resolveAfter2Seconds() {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve('resolved');
      }, 2000);
    });
  }

  resolveAfter3Seconds() {
    return new Promise(resolve => {
      setTimeout(() => {
        return resolve({
          ele: this.name
        });
      }, 3000);
    });
  }

}

let ele = new Sboob("cci");
ele.asyncCall();
/*function resolveAfter2Seconds() {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve('resolved');
    }, 2000);
  });
}

async function asyncCall() {
  console.log('calling');
  var result = await resolveAfter2Seconds();
  console.log(result);
  // expected output: 'resolved'
}

console.log(asyncCall());*/