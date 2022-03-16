const red = clc.red.bold;
const cyan = clc.cyan.bold;
const blue = clc.blueBright.bold;
const green = clc.green;
const yellow = clc.yellow.bold;

const formatDebug = function (debug) {
  switch (nodefony.typeOf(debug)) {
  case "boolean":
    return debug;
  case "string":
    if (debug === "false" ||
      debug === "undefined" ||
      debug === "null") {
      return false;
    }
    if (debug === "true") {
      return true;
    }
    const tab = debug.split(/,| /);
    if (tab[0] === "*") {
      return true;
    }
    return tab;
  case "undefined":
    return false;
  case "array":
    if (debug[0] === "*") {
      return true;
    }
    return debug;
  case "object":
    return false;
  default:
    return false;
  }
}

const conditionOptions = function (environment, debug = undefined) {
  debug = formatDebug(debug);
  let obj = null;
  if (environment === "development") {
    obj = {
      severity: {
        operator: "<=",
        data: (debug === false) ? 6 : 7
      }
    };
  } else {
    obj = {
      severity: {
        operator: "<=",
        data: (debug) ? 7 : 6
      }
    };
  }
  if (typeof debug === "object") {
    obj.msgid = {
      data: debug
    }
  }
  return obj;
};

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
const defaultSettings = {
  moduleName: "SYSLOG",
  msgid: "",
  maxStack: 100,
  rateLimit: false,
  burstLimit: 3,
  defaultSeverity: "DEBUG",
  checkConditions: "&&",
  async: false
};

const sysLogSeverity = nodefony.PDU.sysLogSeverity();

const operators = {
  "<": function (ele1, ele2) {
    return ele1 < ele2;
  },
  ">": function (ele1, ele2) {
    return ele1 > ele2;
  },
  "<=": function (ele1, ele2) {
    return ele1 <= ele2;
  },
  ">=": function (ele1, ele2) {
    return ele1 >= ele2;
  },
  "==": function (ele1, ele2) {
    return ele1 === ele2;
  },
  "!=": function (ele1, ele2) {
    return ele1 !== ele2;
  },
  "RegExp": function (ele1, ele2) {
    return (ele2.test(ele1));
  }
};

const conditionsObj = {
  severity: (pdu, condition) => {
    for (let sev in condition.data) {
      let res = operators[condition.operator](pdu.severity, condition.data[sev]);
      if (res) {
        return true;
      }
    }
    return false;
  },
  msgid: (pdu, condition) => {
    for (let sev in condition.data) {
      let res = operators[condition.operator](pdu.msgid, sev);
      if (res) {
        return true;
      }
    }
    return false;
  },
  date: (pdu, condition) => {
    return operators[condition.operator](pdu.timeStamp, condition.data);
  }
};

const logicCondition = {
  "&&": (myConditions, pdu) => {
    let res = null;
    for (let ele in myConditions) {
      res = conditionsObj[ele](pdu, myConditions[ele]);
      if (!res) {
        break;
      }
    }
    return res;
  },
  "||": (myConditions, pdu) => {
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

const checkFormatSeverity = (ele) => {
  let res = false;
  switch (nodefony.typeOf(ele)) {
  case "array":
    res = ele;
    break;
  case "string":
    res = ele.split(/,| /);
    break;
  case "number":
    res = [ele];
    break;
  default:
    console.trace(ele)
    let error = `checkFormatSeverity bad format type : ${nodefony.typeOf(ele)}`;
    throw new Error(error);
  }
  return res;
};

const checkFormatDate = function (ele) {
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

const checkFormatMsgId = function (ele) {
  let res = false;
  switch (nodefony.typeOf(ele)) {
  case "string":
    res = ele.split(/,| /);
    break;
  case "number":
    res = ele;
    break;
  case "RegExp":
    res = ele;
    break;
  case "array":
    res = ele;
    break;
  default:
    throw new Error("checkFormatMsgId bad format " + nodefony.typeOf(ele) + " : " + ele);
  }
  return res;
};

const severityToString = function (severity) {
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

const wrapperCondition = function (conditions, callback) {
  let myFuncCondition = null;
  let Conditions = null;
  try {
    if (conditions.checkConditions && conditions.checkConditions in logicCondition) {
      myFuncCondition = logicCondition[conditions.checkConditions];
      delete conditions.checkConditions;
    } else {
      myFuncCondition = logicCondition[this.settings.checkConditions];
    }
    Conditions = sanitizeConditions(conditions);
    //console.log("Sanitize : ", conditions)
    switch (nodefony.typeOf(callback)) {
    case "function":
      return (pdu) => {
        const res = myFuncCondition(Conditions, pdu);
        if (res) {
          callback(pdu);
        }
      };
    case "array":
      let tab = [];
      for (let i = 0; i < callback.length; i++) {
        const res = myFuncCondition(Conditions, callback[i]);
        if (res) {
          tab.push(callback[i]);
        }
      }
      return tab;
    default:
      throw new Error("");
    }
  } catch (e) {
    throw e;
  }
};

const sanitizeConditions = function (settingsCondition) {
  let res = true;
  if (nodefony.typeOf(settingsCondition) !== "object") {
    return false;
  }
  for (let ele in settingsCondition) {
    if (!(ele in conditionsObj)) {
      return false;
    }
    let condi = settingsCondition[ele];
    //console.log("condi ready : ",condi)

    if (condi.operator && !(condi.operator in operators)) {
      throw new Error("Contitions bad operator : " + condi.operator);
    }
    if (condi.data) {
      switch (ele) {
      case "severity":
        if (!condi.operator) {
          condi.operator = "==";
        }
        res = checkFormatSeverity(condi.data);
        //console.log(`checkFormatSeverity : `, condi.data, "==>" , res)
        if (res !== false) {
          condi.data = {};
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
        break;
      case "msgid":
        if (!condi.operator) {
          condi.operator = "==";
        }
        res = checkFormatMsgId(condi.data);
        if (res !== false) {
          let format = nodefony.typeOf(res);
          if (format === "array") {
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
  return settingsCondition;
  //console.log(settingsCondition);
};

const createPDU = function (payload, severity, moduleName, msgid, msg) {
  let myseverity = null;
  if (!severity) {
    myseverity = sysLogSeverity[this.settings.defaultSeverity];
  } else {
    myseverity = severity;
  }
  return new nodefony.PDU(payload, myseverity,
    moduleName,
    msgid,
    msg);
};

/**
 * A class for product log in nodefony.
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

  static formatDebug(debug) {
    return formatDebug(debug)
  }

  init(environment = nodefony.environment, debug = nodefony.debug, options = null) {
    return this.listenWithConditions(options || conditionOptions(environment, debug),
      (pdu) => {
        return Syslog.normalizeLog(pdu);
      });
  }

  clean() {
    return this.reset();
  }

  reset() {
    this.ringStack.length = 0;
    this.removeAllListeners();
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

  pushStack(pdu) {
    if (this.ringStack.length === this.settings.maxStack) {
      this.ringStack.shift();
    }
    let index = this.ringStack.push(pdu);
    this.valid++;
    return index;
  }

  /**
   * logger message
   * @method log
   * @param {void} payload payload for log. protocole controle information
   * @param {Number | String} severity severity syslog like.
   * @param {String} msgid informations for message. example(Name of function for debug)
   * @param {String} msg  message to add in log. example (I18N)
   */
  log(payload, severity, msgid, msg) {
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
          if (payload instanceof nodefony.PDU) {
            pdu = payload;
          } else {
            pdu = createPDU.call(this, payload, severity, this.settings.moduleName, msgid || this.settings.msgid, msg);
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
        if (payload instanceof nodefony.PDU) {
          pdu = payload;
        } else {
          pdu = createPDU.call(this, payload, severity, this.settings.moduleName, msgid || this.settings.msgid, msg);
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
  getLogs(conditions = null, stack = null) {
    if (conditions) {
      return wrapperCondition.call(this, conditions, stack || this.ringStack);
    }
    return this.ringStack;
  }

  /**
   * take the stack and build a JSON string
   * @method logToJson
   * @return {String} string in JSON format
   */
  logToJson(conditions, stack = null) {
    let res = null;
    if (conditions) {
      res = this.getLogs(conditions, stack);
    } else {
      res = this.ringStack;
    }
    return JSON.stringify(res);
  }

  /**
   * load the stack as JSON string
   * @method loadStack
   * @param {Object} json or string stack serialize
   * @param {boolean} fire conditions events  .
   * @param {function} callback before fire conditions events
   * @return {String}
   */
  loadStack(stack, doEvent = false, beforeConditions = null) {
    let st = null;
    if (!stack) {
      throw new Error("syslog loadStack : not stack in arguments ");
    }
    switch (nodefony.typeOf(stack)) {
    case "string":
      try {
        //console.log(stack);
        st = JSON.parse(stack);
        return this.loadStack(st, doEvent, beforeConditions);
      } catch (e) {
        throw e;
      }
      break;
    case "array":
    case "object":
      try {
        for (let i = 0; i < stack.length; i++) {
          let pdu = new nodefony.PDU(stack[i].payload, stack[i].severity, stack[i].moduleName || this.settings.moduleName, stack[i].msgid, stack[i].msg, stack[i].timeStamp);
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
   *    @method  filter
   *
   */
  filter(conditions = null, callback = null) {

    if (!conditions) {
      throw new Error("filter conditions not found ");
    }
    try {
      conditions = nodefony.extend(true, {}, conditions);
      const wrapper = wrapperCondition.call(this, conditions, callback);
      if (wrapper) {
        return super.on("onLog", wrapper);
      }
      return null;
    } catch (e) {
      throw e;
    }
  }

  /**
   *
   *    @method  listenWithConditions
   *
   */
  listenWithConditions(conditions, callback) {
    return this.filter(conditions, callback);
  }

  error(data) {
    return this.log(data, "ERROR");
  }

  warn(data) {
    return this.log(data, "WARNING");
  }

  warnning(data) {
    return this.log(data, "WARNING");
  }

  info(data) {
    return this.log(data, "INFO");
  }

  debug(data) {
    return this.log(data, "DEBUG");
  }

  trace(data) {
    return this.log(data, "NOTICE");
  }

  static wrapper(pdu) {
    if (!pdu) {
      throw new Error('Syslog pdu not defined')
    }
    const date = new Date(pdu.timeStamp);
    switch (pdu.severity) {
    case 0:
    case 1:
    case 2:
    case 3:
      return {
        logger: console.error,
        text: `${date.toDateString()} ${date.toLocaleTimeString()} ${red(pdu.severityName)} ${green(pdu.msgid)} : `
      }
    case 4:
      return {
        logger: console.warn,
        text: `${date.toDateString()} ${date.toLocaleTimeString()} ${yellow(pdu.severityName)} ${green(pdu.msgid)} : `
      }
    case 5:
      return {
        logger: console.log,
        text: `${date.toDateString()} ${date.toLocaleTimeString()} ${red(pdu.severityName)} ${green(pdu.msgid)} : `
      }
    case 6:
      return {
        logger: console.info,
        text: `${date.toDateString()} ${date.toLocaleTimeString()} ${blue(pdu.severityName)} ${green(pdu.msgid)} : `
      }
    case 7:
      return {
        logger: console.debug,
        text: `${date.toDateString()} ${date.toLocaleTimeString()} ${cyan(pdu.severityName)} ${green(pdu.msgid)} : `
      }
    default:
      return {
        logger: console.log,
        text: `${date.toDateString()} ${date.toLocaleTimeString()} ${cyan(pdu.severityName)} ${green(pdu.msgid)} : `
      }
    }
  }

  static normalizeLog(pdu, pid = "") {
    if (pdu.payload === "" || pdu.payload === undefined) {
      console.warn(`${pdu.severityName} ${pdu.msgid} : logger message empty !!!!`);
      console.trace(pdu);
      return pdu;
    }
    let message = pdu.payload;
    switch (typeof message) {
    case "object":
      switch (true) {
      case (message instanceof nodefony.Error):
        if (this.kernel && this.kernel.console) {
          message = message.message;
        }
        break;
      case (message instanceof Error):
        if (this.kernel && this.kernel.console) {
          message = message.message;
        } else {
          message = new nodefony.Error(message);
        }
        break;
      }
      break;
    default:
    }
    if (pdu.severity === -1) {
      process.stdout.write("\u001b[0G")
      process.stdout.write(`${green(pdu.msgid)} : ${message}`);
      process.stdout.write("\u001b[90m\u001b[0m")
      return pdu;
    }
    let wrap = Syslog.wrapper(pdu, message);
    wrap.logger(`${pid} ${wrap.text}`, message);
    return pdu;
  }
}

module.exports = Syslog;
