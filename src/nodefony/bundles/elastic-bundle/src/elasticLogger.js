module.exports = class classElasticLog {
  constructor(config) {
    this.logger("INIT SYSLOG ELASTIC ", "INFO");
    this.config = config;
  }

  error(data) {
    switch (nodefony.typeOf(data)) {
      case "string":
      case "error":
        return this.logger(data, "ERROR");
      default:
        console.log(data);
    }
  }

  warning(data) {
    switch (nodefony.typeOf(data)) {
      case "string":
        return this.logger(data, "WARNING");
      default:
        try {
          let str = JSON.stringify(data);
          return this.logger(str, "WARNING");
        } catch (e) {
          console.log(data);
        }
    }
  }

  info(data, ele) {
    let res = null;
    try {
      if (ele && ele !== "undefined") {
        try {
          let str = JSON.stringify(ele);
          res = `${data} : ${str}`;
        } catch (e) {
          res = `${data} : ${ele}`;
        }
      } else {
        res = data;
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
          let str = JSON.stringify(ele, null, " ");
          res = `${data} : ${str}`;
        } catch (e) {
          res = `${data} : ${ele}`;
        }
      } else {
        res = data;
      }
      return this.logger(res, "DEBUG");
    } catch (e) {
      console.log(e);
    }
  }

  trace(method, requestUrl, body, responseBody, responseStatus) {
    try {
      let ele = {
        method: method,
        url: `${requestUrl.protocol}${requestUrl.hostname}${requestUrl.port}${requestUrl.path}`,
        body: body,
        status: responseStatus
      };
      let str = JSON.stringify(ele, null, " ");
      this.logger(str, "DEBUG");
      if (responseBody) {
        this.logger(JSON.stringify(JSON.parse(responseBody), null, " "), "DEBUG", `${ele.method} : ${ele.url}`);
      }
    } catch (e) {
      console.log(e);
    }
  }
};