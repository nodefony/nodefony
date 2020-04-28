/*
 *
 *
 *
 */
module.exports = function(nodefony) {

  'use strict';
  /*
   * default settings
   * <pre>
   *   moduleName:      "nodefony"
   *   maxStack:        100
   *   rateLimit:       false
   *   burstLimit:      3
   *   defaultSeverity: "DEBUG"
   *   checkConditions: "&&"
   *   async:         false
   *
   * </pre>
   */
  let defaultSettings = {
    moduleName: "SYSLOG",
    maxStack: 100,
    rateLimit: false,
    burstLimit: 3,
    defaultSeverity: "DEBUG",
    checkConditions: "&&",
    async: false
  };

  /*
   * Severity syslog
   * <pre>
   *    EMERGENCY   = 0
   *    ALERT       = 1
   *    CRITIC      = 2
   *    ERROR       = 3
   *    WARNING     = 4
   *    NOTICE      = 5
   *    INFO        = 6
   *    DEBUG       = 7
   * </pre>
   */
  const sysLogSeverity = [
    "EMERGENCY",
    "ALERT",
    "CRITIC",
    "ERROR",
    "WARNING",
    "NOTICE",
    "INFO",
    "DEBUG"
  ];
  sysLogSeverity.EMERGENCY = 0;
  sysLogSeverity.ALERT = 1;
  sysLogSeverity.CRITIC = 2;
  sysLogSeverity.ERROR = 3;
  sysLogSeverity.WARNING = 4;
  sysLogSeverity.NOTICE = 5;
  sysLogSeverity.INFO = 6;
  sysLogSeverity.DEBUG = 7;

  /**
   *  Protocol Data Unit
   * @class  PDU
   * @constructor
   * @module library
   * @return {PDU}
   */
  let guid = 0;
  class PDU {
    constructor(pci, severity, moduleName, msgid, msg, date) {
      /* timeStamp @type Date*/
      this.timeStamp = new Date(date).getTime() || new Date().getTime();
      /* uid */
      this.uid = ++guid;
      /* severity */
      this.severity = translateSeverity(severity);
      /* severityName */
      this.severityName = sysLogSeverity[this.severity];
      /* typePayload */
      this.typePayload = nodefony.typeOf(pci);
      /*
       * protocole controle information
       * @type Void
       */
      this.payload = pci;
      /* moduleName */
      this.moduleName = moduleName;
      /* msgid */
      this.msgid = msgid || "";
      /* msg */
      this.msg = msg || "";
      /* */
      this.status = "NOTDEFINED";
    }

    /**
     * Get Date in string format
     * @method getDate
     * @return {String} a date in string format .
     */
    getDate() {
      return new Date(this.timeStamp).toTimeString();
    }

    /**
     * get a string representating the PDU protocole
     * @method toString
     * @return {String}  .
     */
    toString() {
      return "TimeStamp:" + this.getDate() +
        "  Log:" + this.payload +
        "  ModuleName:" + this.moduleName +
        "  SeverityName:" + this.severityName +
        "  MessageID:" + this.msgid +
        "  UID:" + this.uid +
        "  Message:" + this.msg;
    }

    parseJson(str) {
      let json = null;
      try {
        json = JSON.parse(str);
        for (let ele in json) {
          if (ele in this) {
            this[ele] = json[ele];
          }
        }
      } catch (e) {
        throw e;
      }
      return json;
    }
  }

  const operators = {
    "<": function(ele1, ele2) {
      return ele1 < ele2;
    },
    ">": function(ele1, ele2) {
      return ele1 > ele2;
    },
    "<=": function(ele1, ele2) {
      return ele1 <= ele2;
    },
    ">=": function(ele1, ele2) {
      return ele1 >= ele2;
    },
    "==": function(ele1, ele2) {
      return ele1 === ele2;
    },
    "!=": function(ele1, ele2) {
      return ele1 !== ele2;
    },
    "RegExp": function(ele1, ele2) {
      return (ele2.test(ele1));
    }
  };

  const conditionsObj = {
    severity: function(pdu, condition) {
      if (condition.operator !== "==") {
        //console.log(pdu.severity);
        //console.log(condition.data)
        return operators[condition.operator](pdu.severity, condition.data);
      } else {
        for (let sev in condition.data) {
          if (sev === pdu.severityName) {
            return true;
          }
        }
      }
      return false;
    },
    msgid: function(pdu, condition) {
      if (condition.operator !== "==") {
        return operators[condition.operator](pdu.msgid, condition.data);
      } else {
        for (let sev in condition.data) {
          if (sev === pdu.msgid) {
            return true;
          }
        }
      }
      return false;
    },
    date: function(pdu, condition) {
      return operators[condition.operator](pdu.timeStamp, condition.data);
    }
  };

  const logicCondition = {
    "&&": function(myConditions, pdu) {
      let res = null;
      for (let ele in myConditions) {
        res = conditionsObj[ele](pdu, myConditions[ele]);
        //console.log("condition :" +ele +"  "+res)
        if (!res) {
          break;
        }
      }
      return res;
    },
    "||": function(myConditions, pdu) {
      let res = null;
      for (let ele in myConditions) {
        res = conditionsObj[ele](pdu, myConditions[ele]);
        if (res) {
          break;
        }
      }
      return res;
    }
  };

  const checkFormatSeverity = function(ele) {
    let res = false;
    switch (nodefony.typeOf(ele)) {
      case "string":
        res = ele.split(/,| /);
        break;
      case "number":
        res = ele;
        break;
      default:
        throw new Error("checkFormatSeverity bad format " + nodefony.typeOf(ele) + " : " + ele);
    }
    return res;
  };

  const checkFormatDate = function(ele) {
    let res = false;
    switch (nodefony.typeOf(ele)) {
      case "date":
        res = ele.getTime();
        break;
      case "string":
        res = new Date(ele);
        break;
      default:
        throw new Error("checkFormatDate bad format " + nodefony.typeOf(ele) + " : " + ele);
    }
    return res;
  };

  const checkFormatMsgId = function(ele) {
    let res = false;
    switch (nodefony.typeOf(ele)) {
      case "string":
        res = ele.split(/,| /);
        break;
      case "number":
        res = ele;
        break;
      case "object":
        if (ele instanceof RegExp) {
          res = ele;
        }
        break;
      default:
        throw new Error("checkFormatMsgId bad format " + nodefony.typeOf(ele) + " : " + ele);
    }
    return res;
  };

  const severityToString = function(severity) {
    let myint = parseInt(severity, 10);
    let ele = null;
    if (!isNaN(myint)) {
      ele = sysLogSeverity[myint];
    } else {
      ele = severity;
    }
    if (ele in sysLogSeverity) {
      return ele;
    }
    return false;
  };


  const sanitizeConditions = function(settingsCondition) {
    let res = true;
    if (nodefony.typeOf(settingsCondition) !== "object") {
      return false;
    }
    for (let ele in settingsCondition) {
      if (!(ele in conditionsObj)) {
        return false;
      }
      let condi = settingsCondition[ele];
      if (condi.operator && !(condi.operator in operators)) {
        throw new Error("Contitions bad operator : " + condi.operator);
      }
      if (condi.data) {
        switch (ele) {
          case "severity":
            if (condi.operator) {
              res = checkFormatSeverity(condi.data);
              if (res !== false) {
                condi.data = sysLogSeverity[severityToString(res[0])];
              } else {
                return false;
              }
            } else {
              condi.operator = "==";
              res = checkFormatSeverity(condi.data);
              if (res !== false) {
                condi.data = {};
                if (nodefony.typeOf(res) === "array") {
                  for (let i = 0; i < res.length; i++) {
                    let mySeverity = severityToString(res[i]);
                    if (mySeverity) {
                      condi.data[mySeverity] = sysLogSeverity[mySeverity];
                    } else {
                      return false;
                    }
                  }
                } else {
                  return false;
                }
              } else {
                return false;
              }
            }
            break;
          case "msgid":
            if (!condi.operator) {
              condi.operator = "==";
            }
            res = checkFormatMsgId(condi.data);
            if (res !== false) {
              if (nodefony.typeOf(res) === "array") {
                condi.data = {};
                for (let i = 0; i < res.length; i++) {
                  condi.data[res[i]] = "||";
                }
              } else {
                condi.data = res;
              }
            } else {
              return false;
            }
            break;
          case "date":
            res = checkFormatDate(condi.data);
            if (res) {
              condi.data = res;
            } else {
              return false;
            }
            break;
          default:
            return false;
        }
      } else {
        return false;
      }
    }
    //console.log(settingsCondition);
    return settingsCondition;
  };


  const translateSeverity = function(severity) {
    let myseverity = null;
    if (severity in sysLogSeverity) {
      if (typeof severity === 'number') {
        myseverity = sysLogSeverity[sysLogSeverity[severity]];
      } else {
        myseverity = sysLogSeverity[severity];
      }
    } else {
      if (!severity) {
        return null;
      } else {
        throw new Error("not nodefony syslog severity :" + severity);
      }
    }
    return myseverity;
  };

  const createPDU = function(payload, severity, moduleName, msgid, msg) {
    let myseverity = null;
    if (!severity) {
      myseverity = sysLogSeverity[this.settings.defaultSeverity];
    } else {
      myseverity = severity;
    }
    return new PDU(payload, myseverity,
      moduleName,
      msgid,
      msg);
  };

  /**
   * A class for product log in nodefony.
   * @example
   *
   *    var ERROR_DEFINE = {
   *       '-101': 'I18N string'
   *    };
   *
   *    var settings = {
   *        rateLimit:100,
   *        burstLimit:10,
   *        moduleName:"LIVE",
   *        defaultSeverity:"ERROR"
   *    };
   *
   *    var logIntance = new nodefony.Syslog(settings);
   *
   *
   *    controller.logIntance.listen(context,function(pdu){
   *        logView(pdu)
   *    } )
   *
   *    controller.logIntance.listenWithConditions(context,{
   *        checkConditions: "&&",
   *        severity:{
   *            data:"CRITIC,ERROR"
   *            //data:"1,7"
   *        },
   *        date:{
   *            operator:">=",
   *            data:new Date()
   *        },
   *        msgid:{
   *            data:"myFunction"
   *        }
   *
   *
   *    },function(pdu){
   *        logView(pdu)
   *    } )
   *
   *
   *    var myFunction = function(error){
   *        controller.logIntance.logger(error, "ERROR", "myFunction", ERROR_DEFINE[error] );
   *    }
   *
   *
   *
   *    @class syslog
   *    @module library
   *    @constructor
   *    @param {Object} settings The settings to extend.
   *    @return syslog
   */
  class Syslog extends nodefony.Events {

    constructor(settings) {

      super(settings);
      /**
       * extended settings
       * @property settings
       * @type Object
       * @see defaultSettings
       */
      this.settings = nodefony.extend({}, defaultSettings, settings);
      /**
       * ring buffer structure container instances of PDU
       * @property ringStack
       * @type Array
       */
      this.ringStack = [];
      /**
       * Ratelimit  Management log printed
       * @property burstPrinted
       * @type Number
       */
      this.burstPrinted = 0;
      /**
       * Ratelimit  Management log dropped
       * @property missed
       * @type Number
       */
      this.missed = 0;
      /**
       * Management log invalid
       * @property invalid
       * @type Number
       */
      this.invalid = 0;

      /**
       * Counter log valid
       * @property valid
       * @type Number
       */
      this.valid = 0;
      /**
       * Ratelimit  Management begin of burst
       * @property start
       * @private
       * @type Number
       */
      this.start = 0;

      this.fire = this.settings.async ? super.fireAsync : super.fire;
    }

    pushStack(pdu) {
      if (this.ringStack.length === this.settings.maxStack) {
        this.ringStack.shift();
      }
      let index = this.ringStack.push(pdu);
      //console.log(this);
      this.valid++;
      return index;
    }

    /**
     * logger message
     * @method logger
     * @param {void} payload payload for log. protocole controle information
     * @param {Number || String} severity severity syslog like.
     * @param {String} msgid informations for message. example(Name of function for debug)
     * @param {String} msg  message to add in log. example (I18N)
     */
    logger(payload, severity, msgid, msg) {
      let pdu = null;
      if (this.settings.rateLimit) {
        let now = new Date().getTime();
        this.start = this.start || now;
        if (now > this.start + this.settings.rateLimit) {
          this.burstPrinted = 0;
          this.missed = 0;
          this.start = 0;
        }
        if (this.settings.burstLimit && this.settings.burstLimit > this.burstPrinted) {
          try {
            if (payload instanceof PDU) {
              pdu = payload;
            } else {
              pdu = createPDU.call(this, payload, severity, this.settings.moduleName, msgid, msg);
            }
          } catch (e) {
            console.error(e);
            this.invalid++;
            pdu.status = "INVALID";
            return pdu;
          }
          this.pushStack(pdu);
          this.fire("onLog", pdu);
          this.burstPrinted++;
          pdu.status = "ACCEPTED";
          return pdu;
        }
        this.missed++;
        pdu.status = "DROPPED";
        return pdu;
      } else {
        try {
          if (payload instanceof PDU) {
            pdu = payload;
          } else {
            pdu = createPDU.call(this, payload, severity, this.settings.moduleName, msgid, msg);
          }
        } catch (e) {
          console.error(e);
          this.invalid++;
          pdu.status = "INVALID";
          return pdu;
        }
        this.pushStack(pdu);
        pdu.status = "ACCEPTED";
        this.fire("onLog", pdu);
        return pdu;
      }
    }

    /**
     * Clear stack of logs
     *
     * @method clearLogStack
     *
     *
     *
     */
    clearLogStack() {
      this.ringStack.length = 0;
    }

    /**
     * get hitory of stack
     * @method getLogStack
     * @param {Number} start .
     * @param {Number} end .
     * @return {array} new array between start end
     * @return {PDU} pdu
     */
    getLogStack(start, end, contition) {
      let stack = null;
      if (contition) {
        stack = this.getLogs(contition);
      } else {
        stack = this.ringStack;
      }
      if (arguments.length === 0) {
        return stack[stack.length - 1];
      }
      if (!end) {
        return stack.slice(start);
      }
      if (start === end) {
        return stack[stack.length - start - 1];
      }
      return stack.slice(start, end);
    }


    /**
     * get logs with conditions
     * @method getLogs
     * @param {Object} conditions .
     * @return {array} new array with matches conditions
     */
    getLogs(conditions, stack) {
      let myStack = stack || this.ringStack;
      let myFuncCondition = null;
      if (conditions.checkConditions && conditions.checkConditions in logicCondition) {
        myFuncCondition = logicCondition[conditions.checkConditions];
        delete conditions.checkConditions;
      } else {
        myFuncCondition = logicCondition[this.settings.checkConditions];
      }
      let tab = [];
      let Conditions = null;
      try {
        Conditions = sanitizeConditions(conditions);
      } catch (e) {
        throw new Error("registreNotification conditions format error: " + e);
      }
      if (Conditions) {
        for (let i = 0; i < myStack.length; i++) {
          let res = myFuncCondition(Conditions, myStack[i]);
          if (res) {
            tab.push(myStack[i]);
          }
        }
      }
      return tab;
    }


    /**
     * take the stack and build a JSON string
     * @method logToJson
     * @return {String} string in JSON format
     */
    logToJson(conditions) {
      let stack = null;
      if (conditions) {
        stack = this.getLogs(conditions);
      } else {
        stack = this.ringStack;
      }
      return JSON.stringify(stack);
    }

    /**
     * load the stack as JSON string
     * @method loadStack
     * @param {Object} json or string stack serialize
     * @param {boolean} fire conditions events  .
     * @param {function} callback before fire conditions events
     * @return {String}
     */
    loadStack(stack, doEvent, beforeConditions) {
      if (!stack) {
        throw new Error("syslog loadStack : not stack in arguments ");
      }
      let st = null;
      switch (nodefony.typeOf(stack)) {
        case "string":
          try {
            //console.log(stack);
            st = JSON.parse(stack);
            return this.loadStack(st, doEvent);
          } catch (e) {
            throw e;
          }
          break;
        case "array":
        case "object":
          try {
            for (let i = 0; i < stack.length; i++) {
              let pdu = new PDU(stack[i].payload, stack[i].severity, stack[i].moduleName || this.settings.moduleName, stack[i].msgid, stack[i].msg, stack[i].timeStamp);
              this.pushStack(pdu);
              if (doEvent) {
                if (beforeConditions && typeof beforeConditions === "function") {
                  beforeConditions.call(this, pdu, stack[i]);
                }
                this.fire("onLog", pdu);
              }
            }
          } catch (e) {
            throw e;
          }
          break;
        default:
          throw new Error("syslog loadStack : bad stack in arguments type");
      }
      return st || stack;
    }

    /**
     *
     *    @method  listenWithConditions
     *
     */
    listenWithConditions(context, conditions, callback) {
      let myFuncCondition = null;
      if (conditions.checkConditions && conditions.checkConditions in logicCondition) {
        myFuncCondition = logicCondition[conditions.checkConditions];
        delete conditions.checkConditions;
      } else {
        myFuncCondition = logicCondition[this.settings.checkConditions];
      }
      let Conditions = null;
      try {
        Conditions = sanitizeConditions(conditions);
      } catch (e) {
        throw new Error("registreNotification conditions format error: " + e);
      }
      if (Conditions) {
        const func = function(pdu) {
          let res = myFuncCondition(Conditions, pdu);
          if (res) {
            callback.apply(context || this, arguments);
          }
        };
        super.listen(this, "onLog", func);
        return func;
      }
    }

  }
  //nodefony.syslog = syslog;
  //nodefony.PDU = PDU;
  return {
    Syslog:Syslog,
    PDU:PDU
  };
};
