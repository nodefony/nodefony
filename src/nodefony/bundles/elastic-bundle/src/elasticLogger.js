module.exports = class classElasticLog {
  constructor( /*config*/ ) {
    this.logger("INIT SYSLOG ELASTIC ", "INFO");
  }

  error(data, ele) {
    let res = null;
    try {
      if (ele && ele !== "undefined") {
        try {
          let str = JSON.stringify(ele);
          res = data + " : " + str ? str : "";
        } catch (e) {
          res = data;
        }
      } else {
        res = data + " : " + JSON.stringify(ele);
      }
      return this.logger(res, "ERROR");
    } catch (e) {
      console.log(e);
    }
  }

  warning(data, ele) {
    let res = null;
    try {
      if (ele && ele !== "undefined") {
        try {
          let str = JSON.stringify(ele);
          res = data + " : " + str ? str : "";
        } catch (e) {
          res = data;
        }
      } else {
        res = data + " : " + JSON.stringify(ele);
      }
      return this.logger(res, "WARNING");
    } catch (e) {
      console.log(e);
    }
  }

  info(data, ele) {
    let res = null;
    try {
      if (ele && ele !== "undefined") {
        try {
          let str = JSON.stringify(ele);
          res = data + " : " + str ? str : "";
        } catch (e) {
          res = data;
        }
      } else {
        res = data + " : " + JSON.stringify(ele);
      }
      return this.logger(res, "INFO");
    } catch (e) {
      console.log(e);
    }
  }

  debug(data, ele) {
    let res = null;
    try {
      if (ele && ele !== "undefined") {
        try {
          let str = JSON.stringify(ele);
          res = data + " : " + str ? str : "";
        } catch (e) {
          res = data;
        }
      } else {
        res = data + " : " + JSON.stringify(ele);
      }
      return this.logger(res, "DEBUG");
    } catch (e) {
      console.log(e);
    }
  }

  trace(method, requestUrl, body /*, responseBody, responseStatus*/ ) {
    let res = null;
    try {
      let ele = {
        method: method,
        url: requestUrl,
        body: body
      };
      if (ele) {
        try {
          let str = JSON.stringify(ele);
          res = data + " : " + str ? str : "";
        } catch (e) {
          res = data;
        }
      } else {
        res = method + " : " + requestUrl;
      }
      return this.logger(res, "NOTICE");
    } catch (e) {
      console.log(e);
    }
  }
};