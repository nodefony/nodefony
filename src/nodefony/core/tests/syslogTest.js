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
const assert = require('assert');
const chai = require('chai');


describe("NODEFONY SYSLOG", function () {

  describe('CONTRUSTROR ', function () {

    beforeEach(function () {});

    before(function () {
      global.myNotification = new nodefony.notificationsCenter.notification();
    });

    it("LIB", function (done) {
      done();
    });
    it("LIB 2", function (done) {
      done();
    });
  });

  describe('RING STACK', function () {

    beforeEach(function () {});

    before(function () {});

    it("100 entries ", function (done) {
      done();
      /*setTimeout(() =>{
          //asserts
          throw new Error("My Error")
      }, 5000)*/
    });
    it("1000  entries ", function (done) {
      done();
    });
  });

});
