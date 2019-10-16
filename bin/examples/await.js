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
    try {
      //console.log('calling');
      let result = await this.resolveAfter2Seconds();
      //console.log(result);
      let result2 = await this.resolveAfter3Seconds();
      //console.log("pass", result2);
      return [result, result2];
    } catch (e) {
      throw e;
    }
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

  async dubbleCall() {
    try {
      console.log('calling');
      let res1 = await this.asyncCall();
      console.log('calling 2');
      let res2 = await this.asyncCall();
      return [res1, res2];
    }catch (e) {
      throw e;
    }
  }

}

let ele = new Sboob("cci");
ele.dubbleCall();
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
