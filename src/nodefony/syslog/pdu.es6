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
    "DEBUG",
    "SPINNER"
  ];
  sysLogSeverity.EMERGENCY = 0;
  sysLogSeverity.ALERT = 1;
  sysLogSeverity.CRITIC = 2;
  sysLogSeverity.ERROR = 3;
  sysLogSeverity.WARNING = 4;
  sysLogSeverity.NOTICE = 5;
  sysLogSeverity.INFO = 6;
  sysLogSeverity.DEBUG = 7;
  sysLogSeverity.SPINNER = -1;

  const translateSeverity = function (severity = "INFO") {
    let myseverity = null;
    if (severity in sysLogSeverity) {
      if (typeof severity === 'number') {
        myseverity = sysLogSeverity[sysLogSeverity[severity]];
      } else {
        myseverity = sysLogSeverity[severity];
      }
    } else {
      if (!severity) {
        return translateSeverity["INFO"];
      } else {
        throw new Error("not nodefony syslog severity :" + severity);
      }
    }
    return myseverity;
  };

  /**
   *  Protocol Data Unit
   * @class  PDU
   * @constructor
   * @module library
   * @return {PDU}
   */
  let guid = 0;
  class PDU {
    constructor(pci, severity, moduleName = "nodefony", msgid = "", msg = "", date = null) {
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
      this.msgid = msgid;
      /* msg */
      this.msg = msg;
      /* staus */
      this.status = "NOTDEFINED";
    }

    static sysLogSeverity() {
      return sysLogSeverity;
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

  nodefony.PDU = PDU;
  module.exports = PDU;
