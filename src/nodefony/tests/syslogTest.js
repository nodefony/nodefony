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

const defaultOptions = {
  severity: {
    operator: "<=",
    data: "7"
  }
};

describe("NODEFONY SYSLOG", function () {

  before(function () {
    global.syslog = new nodefony.Syslog();
    let ret = global.syslog.listenWithConditions(this, defaultOptions,
      (pdu) => {
        //nodefony.Syslog.normalizeLog(pdu);
        return true
      });
      global.logger = ()=>{
        global.syslog.log('info', "INFO");
        global.syslog.log('debug', "DEBUG");
        global.syslog.log('notice', "NOTICE");
        global.syslog.log('warning', "WARNING");
        global.syslog.log('error', "ERROR");
        global.syslog.log('alert', "ALERT");
        global.syslog.log('critic', "CRITIC");
        global.syslog.log('emergency', "EMERGENCY");
      }
  });

  describe('CONTRUSTROR ', function () {
    it("Constructor ", function (done) {
      let inst = new nodefony.Syslog({})
      assert.strict.equal(inst.ringStack.length, 0);
      done();
    });
    it("Check options moduleName ", function (done) {
      let inst = new nodefony.Syslog({
        moduleName: "MYMODULE"
      });
      inst.listenWithConditions(this, defaultOptions,
        (pdu) => {
          assert.strict.equal(pdu.moduleName, 'MYMODULE');
          assert.strict.equal(pdu.severity, 7);
          assert.strict.equal(pdu.payload, "test");
        });
      inst.log("test");
      done();
    });
    it("Check options sevirity ", function (done) {
      let inst = new nodefony.Syslog({
        moduleName: "MYMODULE2",
        defaultSeverity: "ALERT",
      });
      inst.listenWithConditions(this, defaultOptions,
        (pdu) => {
          assert.strict.equal(pdu.moduleName, 'MYMODULE2');
          assert.strict.equal(pdu.severity, 1);
          assert.strict.equal(pdu.payload, "test");
        });
      inst.log("test");
      done();
    });

    it("Change stack size ", function (done) {
      let inst = new nodefony.Syslog({
        maxStack: 500,
      });
      for (let i = 0; i < 1000; i++) {
        inst.log(i);
      }
      assert.strict.equal(inst.ringStack.length, 500);
      done();
    });

  });

  describe('RING STACK', function () {
    beforeEach(function () {
      //global.syslog.log(this.currentTest.title)
    });
    before(function () {});
    it("100 entries ", function (done) {
      for (let i = 0; i < 100; i++) {
        let pdu = global.syslog.log(i, i % 2 ? "INFO" : "DEBUG");
        assert.strict.equal(pdu.payload, i);
        //assert.strict.equal(pdu.uid, i + 1);
        assert.strict.equal(pdu.severity, i % 2 ? 6 : 7);
        assert.strict.equal(pdu.severityName, i % 2 ? "INFO" : "DEBUG");
        assert.strict.equal(pdu.status, 'ACCEPTED');
        assert.strict.equal(pdu.moduleName, 'SYSLOG');
        assert.strict.equal(pdu.typePayload, "number");
        assert.strict.equal(pdu.msgid, "");
        assert.strict.equal(pdu.msg, "");
      }
      assert.strict.equal(global.syslog.ringStack[0].payload, 0);
      assert.strict.equal(global.syslog.ringStack[99].payload, 99);
      assert.strict.equal(global.syslog.missed, 0);
      assert.strict.equal(global.syslog.invalid, 0);
      assert.strict.equal(global.syslog.valid, 100);
      assert.strict.equal(global.syslog._eventsCount, 1);
      assert.strict.equal(global.syslog._events["onLog"].length, 1);
      done();
    });

    it("1000  entries ", function (done) {
      let i = 0;
      let res = global.syslog.on("onLog",
        (pdu) => {
          return i++
        });
      for (let i = 0; i < 1000; i++) {
        let pdu = global.syslog.log(i, i % 2 ? "INFO" : "DEBUG");
      }
      assert.strict.equal(global.syslog.ringStack.length, 100);
      assert.strict.equal(global.syslog.ringStack[0].payload, 900);
      assert.strict.equal(global.syslog.ringStack[99].payload, 999);
      assert.strict.equal(global.syslog.missed, 0);
      assert.strict.equal(global.syslog.invalid, 0);
      assert.strict.equal(global.syslog.valid, 1100);
      assert.strict.equal(global.syslog._events["onLog"].length, 2);
      assert.strict.equal(i, 1000);
      done();
    });
  });

  describe('getLogStack', function () {
    it("reload 1000  entries ", function (done) {
      let res = global.syslog.getLogStack();
      assert.strict.equal(res.payload, 999);
      res = global.syslog.getLogStack(0,10);
      assert.strict.equal(res[0].payload, 900);
      assert.strict.equal(res[9].payload, 909);
      res = global.syslog.getLogStack(0);
      assert.strict.equal(res[0].payload, 900);
      assert.strict.equal(res[99].payload, 999);
      res = global.syslog.getLogStack(50);
      assert.strict.equal(res[0].payload, 950);
      assert.strict.equal(res[49].payload, 999);
      res = global.syslog.getLogStack(10,10);
      assert.strict.equal(res.payload, 989);
      done()
    });
  });

  describe('getLogs conditions ', function () {
    it("getLogs 1000  entries ", function (done) {
      let res = global.syslog.getLogs({
          severity:{
            data:"INFO"
          }
      });
      assert.strict.equal(res.length, 50);
      done();
    });
  });

  describe('loadStack ', function () {

    it("loadStack 1000  entries ", function (done) {
      let inst = new nodefony.Syslog({
        maxStack: 100
      });
      inst.loadStack(global.syslog.ringStack);
      assert.strict.equal(inst.ringStack.length, 100);
      done();
    });
    it("loadStack 1000 events  ", function (done) {
      let inst = new nodefony.Syslog({
        maxStack: 100
      });
      let i = 0;
      inst.listenWithConditions(this, {
        severity:{
          data:"INFO"
        }
      }, (pdu)=>{
        i++;
        //nodefony.Syslog.normalizeLog(pdu);
      });
      inst.loadStack(global.syslog.ringStack, true);
      assert.strict.equal(inst.ringStack.length, 100);
      assert.strict.equal(i, 50);
      done();
    });
    it("loadStack 1000 events  ", function (done) {
      let inst = new nodefony.Syslog({
        maxStack: 100
      });
      let i = 0;
      inst.listenWithConditions(this, {
        severity:{
          data:"INFO"
        }
      }, (pdu)=>{
        i++;
        //nodefony.Syslog.normalizeLog(pdu);
      });
      inst.loadStack(global.syslog.ringStack, true, (pdu)=>{
        pdu.before = "add";
      });
      assert.strict.equal(inst.ringStack.length, 100);
      assert.strict.equal(i, 50);
      assert.strict.equal(inst.getLogStack().before, "add");
      done();
    });
  });

  describe('BASE', function () {
    before(function () {
      global.syslog.reset();
    });
    it("LOG sevirity ", function (done) {
      let i = 0;
      global.syslog.listenWithConditions(this, defaultOptions,
        (pdu) => {
          switch (pdu.severityName) {
          case "EMERGENCY":
            {
              assert.strict.equal(pdu.severity, 0);
              assert.strict.equal(pdu.msgid, "MYMODULE0");
              i++;
              break;
            }
          case "ALERT":
            {
              i++;
              assert.strict.equal(pdu.severity, 1);
              assert.strict.equal(pdu.msgid, "MYMODULE1");
              break;
            }
          case "CRITIC":
            {
              assert.strict.equal(pdu.severity, 2);
              assert.strict.equal(pdu.msgid, "MYMODULE2");
              i++;
              break;
            }
          case "ERROR":
            {
              assert.strict.equal(pdu.severity, 3);
              assert.strict.equal(pdu.msgid, "MYMODULE3");
              i++;
              break;
            }
          case "WARNING":
            {
              assert.strict.equal(pdu.severity, 4);
              assert.strict.equal(pdu.msgid, "MYMODULE4");
              i++;
              break;
            }
          case "NOTICE":
            {
              assert.strict.equal(pdu.severity, 5);
              assert.strict.equal(pdu.msgid, "MYMODULE5");
              i++;
              break;
            }
          case "INFO":
            {
              assert.strict.equal(pdu.severity, 6);
              assert.strict.equal(pdu.msgid, "MYMODULE6");
              i++;
              break;
            }
          case "DEBUG":
            {
              assert.strict.equal(pdu.severity, 7);
              assert.strict.equal(pdu.msgid, "MYMODULE7");
              i++;
              break;
            }
          }
        });
      global.syslog.log("test", "EMERGENCY", "MYMODULE0");
      global.syslog.log("test", "ALERT", "MYMODULE1");
      global.syslog.log("test", "CRITIC", "MYMODULE2");
      global.syslog.log("test", "ERROR", "MYMODULE3");
      global.syslog.log("test", "WARNING", "MYMODULE4");
      global.syslog.log("test", "NOTICE", "MYMODULE5");
      global.syslog.log("test", "INFO", "MYMODULE6");
      global.syslog.log("test", "DEBUG", "MYMODULE7");
      assert.strict.equal(i, 8);
      done();
    });

  });

  describe('SEVERITY', function () {
    beforeEach(function () {
      global.syslog.reset();
      assert.strict.equal(global.syslog._eventsCount, 0);
    });

    it("listener ", function (done) {
      let i = 0;
      global.syslog.listenWithConditions(this, defaultOptions,
        (pdu) => {
          return i++
        });
      assert.strict.equal(global.syslog._eventsCount, 1);
      for (let i = 0; i < 10; i++) {
        let pdu = global.syslog.log(i, i % 2 ? "INFO" : "DEBUG");
      }
      assert.strict.equal(i, 10);
      done();
    });

    it("Other listener 2 ", function (done) {
      let i = 0;
      global.syslog.listenWithConditions(this, {
          severity: {
            operator: "<=",
            data: "INFO"
          }
        },
        (pdu) => {
          return i++
        });
      assert.strict.equal(global.syslog._eventsCount, 1);
      for (let i = 0; i < 10; i++) {
        let pdu = global.syslog.log(i, i % 2 ? "INFO" : "DEBUG");
      }
      assert.strict.equal(i, 5);
      done();
    });

    it("Other listener 3 ", function (done) {
      let i = 0;
      global.syslog.listenWithConditions(this, {
          severity: {
            operator: "<=",
            data: "INFO"
          }
        },
        (pdu) => {
          assert.strict.equal(pdu.severity, 6);
          assert.strict.equal(pdu.severityName, "INFO");
          return i++
        });
      assert.strict.equal(global.syslog._eventsCount, 1);
      for (let i = 0; i < 10; i++) {
        let pdu = global.syslog.log(i, i % 2 ? "INFO" : "DEBUG");
      }
      assert.strict.equal(i, 5);
      done();
    });

    it("listener condition severity interger ", function (done) {
      let i = 0;
      global.syslog.listenWithConditions(this, {
          severity: {
            data: 6
          }
        },
        (pdu) => {
          //nodefony.Syslog.normalizeLog(pdu);
          assert.strict.equal(pdu.severity, 6);
          assert.strict.equal(pdu.severityName, "INFO");
          return i++
        });
      for (let i = 0; i < 10; i++) {
        let pdu = global.syslog.log(i, i % 2 ? "INFO" : "DEBUG");
      }
      assert.strict.equal(i, 5);
      done();
    });

    it("listener condition severity operator == ", function (done) {
      let i = 0;
      global.syslog.listenWithConditions(this, {
          severity: {
            operator: "==",
            data: "7"
          }
        },
        (pdu) => {
          //nodefony.Syslog.normalizeLog(pdu);
          assert.strict.equal(pdu.severity, 7);
          assert.strict.equal(pdu.severityName, "DEBUG");
          return i++
        });
      assert.strict.equal(global.syslog._eventsCount, 1);
      for (let i = 0; i < 10; i++) {
        let pdu = global.syslog.log(i, i % 2 ? "INFO" : "DEBUG");
      }
      assert.strict.equal(i, 5);
      done();
    });

    it("listener condition severity listerner1 ", function (done) {
      let i = 0;
      global.syslog.listenWithConditions(this, {
          severity: {
            data: "INFO,DEBUG,WARNING"
          }
        },
        (pdu) => {
          //nodefony.Syslog.normalizeLog(pdu);
          return i++
        });
      global.logger();
      assert.strict.equal(i, 3);
      done();
    });
    it("listener condition severity listerner tab", function (done) {
      let i = 0;
      global.syslog.listenWithConditions(this, {
          severity: {
            data: ["INFO","WARNING","DEBUG"]
          }
        },
        (pdu) => {
          //nodefony.Syslog.normalizeLog(pdu);
          return i++
        });
      global.logger();
      assert.strict.equal(i, 3);
      done();
    });
    it("listener condition severity listerner tab string", function (done) {
      let i = 0;
      global.syslog.listenWithConditions(this, {
          severity: {
            data: ["6","4","7"]
          }
        },
        (pdu) => {
          //nodefony.Syslog.normalizeLog(pdu);
          return i++
        });
      global.logger();
      assert.strict.equal(i, 3);
      done();
    });
    it("listener condition severity listerner tab integer", function (done) {
      let i = 0;
      global.syslog.listenWithConditions(this, {
          severity: {
            data: [6,4,7]
          }
        },
        (pdu) => {
          //nodefony.Syslog.normalizeLog(pdu);
          return i++
        });
      global.logger();
      assert.strict.equal(i, 3);
      done();
    });

    it("listener condition severity listerner >=", function (done) {
      let i = 0;
      global.syslog.listenWithConditions(this, {
          severity: {
            operator:">=",
            data: 4
          }
        },
        (pdu) => {
          //nodefony.Syslog.normalizeLog(pdu);
          return i++
        });
      global.logger();
      assert.strict.equal(i, 4);
      done();
    });
    it("listener condition severity listerner >", function (done) {
      let i = 0;
      global.syslog.listenWithConditions(this, {
          severity: {
            operator:">",
            data: 4
          }
        },
        (pdu) => {
          //nodefony.Syslog.normalizeLog(pdu);
          return i++
        });
      global.logger();
      assert.strict.equal(i, 3);
      done();
    });
    it("listener condition severity listerner <", function (done) {
      let i = 0;
      global.syslog.listenWithConditions(this, {
          severity: {
            operator:"<",
            data: 4
          }
        },
        (pdu) => {
          //nodefony.Syslog.normalizeLog(pdu);
          return i++
        });
      global.logger();
      assert.strict.equal(i, 4);
      done();
    });
    it("listener condition severity listerner < string", function (done) {
      let i = 0;
      global.syslog.listenWithConditions(this, {
          severity: {
            operator:"<",
            data: "WARNING"
          }
        },
        (pdu) => {
          //nodefony.Syslog.normalizeLog(pdu);
          return i++
        });
      global.logger();
      assert.strict.equal(i, 4);
      done();
    });
  });

  describe('MSGID', function () {
    beforeEach(function () {
      global.syslog.reset();
    });
    it("listener condition MSGID ", () => {
      return new Promise((resolve, reject) => {
        let i = 0
        global.syslog.listenWithConditions(this, {
            msgid: {
              data: "NODEFONY"
            }
          },
          (pdu) => {
            i++;
            //nodefony.Syslog.normalizeLog(pdu);
            assert.strict.equal(pdu.msgid, "NODEFONY");
            assert.strict.equal(pdu.payload, "pass");
            if (i === 2) {
              resolve();
            }
          });
        global.syslog.log("pass", "INFO", "NODEFONY")
        global.syslog.log("nopass", "INFO")
        global.syslog.log("pass", "INFO", "NODEFONY")
      })

    });
  });

});
