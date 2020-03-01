const path = require("path");
const assert = require('assert');

const service = require(path.resolve(__dirname, "..","..","src","node","index.js"));

describe("Service Unit Test", () => {

  describe("Simple Test", () => {
    beforeEach(function (){
      this.timeout(10000);
    });

    it("Settings", (done) => {
      assert(service);
      assert(service.settings);
      done();
    });

    it("Example", async () => {
      return new Promise((resolve, reject)=>{
        setTimeout(()=>{
          resolve();
        },4000)
      });
    });
  });
});
