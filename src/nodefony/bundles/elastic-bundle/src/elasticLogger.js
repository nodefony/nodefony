module.exports = class classElasticLog {
  constructor (config) {
    this.log("INIT SYSLOG ELASTIC ", "INFO");
    this.config = config;
  }

  error (data) {
    switch (nodefony.typeOf(data)) {
    case "string":
    case "error":
      return this.log(data, "ERROR");
    default:
      console.log(data);
    }
  }

  warning (data) {
    switch (nodefony.typeOf(data)) {
    case "string":
      return this.log(data, "WARNING");
    default:
      try {
        const str = JSON.stringify(data);
        return this.log(str, "WARNING");
      } catch (e) {
        console.log(data);
      }
    }
  }

  info (data, ele) {
    let res = null;
    try {
      if (ele && ele !== "undefined") {
        try {
          const str = JSON.stringify(ele);
          res = `${data} : ${str}`;
        } catch (e) {
          res = `${data} : ${ele}`;
        }
      } else {
        res = data;
      }
      return this.log(res, "INFO");
    } catch (e) {
      console.log(e);
    }
  }

  debug (data, ele) {
    let res = null;
    try {
      if (ele && ele !== "undefined") {
        try {
          const str = JSON.stringify(ele, null, " ");
          res = `${data} : ${str}`;
        } catch (e) {
          res = `${data} : ${ele}`;
        }
      } else {
        res = data;
      }
      return this.log(res, "DEBUG");
    } catch (e) {
      console.log(e);
    }
  }

  trace (method, requestUrl, body, responseBody, responseStatus) {
    try {
      const ele = {
        method,
        url: `${requestUrl.protocol}${requestUrl.hostname}${requestUrl.port}${requestUrl.path}`,
        body,
        status: responseStatus
      };
      const str = JSON.stringify(ele, null, " ");
      this.log(str, "DEBUG");
      if (responseBody) {
        this.log(JSON.stringify(JSON.parse(responseBody), null, " "), "DEBUG", `${ele.method} : ${ele.url}`);
      }
    } catch (e) {
      console.log(e);
    }
  }
};
