#!/usr/bin/env node
 // nodefony
let nodefony = null;
try {
  nodefony = require("nodefony");
} catch (e) {
  nodefony = require(require("path").resolve("src", "nodefony", "autoloader.es6"));
}

class Test {
  constructor(name) {
    this.name = name;
    this.mytab = [this.resolveAfter3Seconds, this.resolveAfter2Seconds];
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
        console.log('2000');
        resolve('resolved');
      }, 2000);
    });
  }

  resolveAfter3Seconds() {
    return new Promise(resolve => {
      setTimeout(() => {
        console.log('3000');
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
    } catch (e) {
      throw e;
    }
  }

  async testFor() {
    let tab = [];
    for await (let ele of this.mytab) {
      console.log(ele);
      tab.push(await ele.call(this));
    }
    console.log("end");
    return tab;
  }


  error() {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        reject(new Error("my error"));
      }, 1000);
    });
  }

  async testError() {
    try {
      return await this.error();
    } catch (e) {
      console.log("testError", e.message);
    }
  }

  async testError2(err) {
    try{
      if (err){
        throw err ;
      }
      return await this.error()
      .catch(e => {
        console.log("testError2 promise catch ", e.message);
      });
    }catch(e){
      console.log("testError2 native catch ", e.message);
    }
  }

}

let ele = new Test("cci");
//ele.dubbleCall();
//ele.testFor();
//ele.testError();
ele.testError2();
ele.testError2(new Error("my Error native"));
