module.exports = nodefony.register("requestError", function () {

  class requestError extends nodefony.httpError {

    constructor(message, response, container) {
      super(message, response.statusCode, container);
      this.response = response;
      if (this.response) {
        this.parserResponse();
      }
    }

    parserResponse() {
      let json = this.response.toJSON();
      if (json) {
        this.requestUrl = json.request.uri.href;
        this.code = json.statusCode;
        this.jsonResponse = JSON.stringify(json, null, " ");
      }
      this.parseMessage(json.body);
    }

    toString() {
      if (this.container) {
        return `${clc.red(this.message)}
      ${clc.blue("Name :")} ${this.name}
      ${clc.blue("Type :")} ${this.errorType}
      ${clc.blue("Url :")} ${this.url}
      ${clc.green("Bundle :")} ${this.bundle}
      ${clc.green("Controller :")} ${this.controller}
      ${clc.green("Action :")} ${this.action}
      ${clc.blue("clientRequest :")} ${this.requestUrl}
        ${clc.red("Code :")} ${this.code}
        ${clc.red("Message :")} ${this.message}
        ${clc.red("Response :")} ${this.jsonResponse}
      ${clc.green("Stack :")} ${this.stack}`;
      } else {
        return `${clc.red(this.message)}
      ${clc.blue("Name :")} ${this.name}
      ${clc.blue("Type :")} ${this.errorType}
      ${clc.blue("clientRequest :")} ${this.requestUrl}
        ${clc.red("Code :")} ${this.code}
        ${clc.red("Message :")} ${this.message}
        ${clc.red("Response :")} ${this.jsonResponse}
      ${clc.green("Stack :")} ${this.stack}`;
      }
    }
  }

  return requestError;
});