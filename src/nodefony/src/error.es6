const assert = require("assert");
module.exports = nodefony.register("Error", function () {
  class nodefonyError extends Error {

    constructor(message, code) {
      super(message);
      this.name = this.constructor.name;
      this.code = null;
      this.errorType = this.name;
      if (code) {
        this.code = code;
      }
      if (message) {
        this.parseMessage(message);
      }
    }

    getType(error) {
      if (error instanceof TypeError) {
        return "TypeError";
      }
      if (error instanceof ReferenceError) {
        return "ReferenceError";
      }
      if (error instanceof SyntaxError) {
        return "SyntaxError";
      }
      if (error instanceof assert.AssertionError) {
        this.actual = error.actual;
        this.expected = error.expected;
        this.operator = error.operator;
        return "AssertionError";
      }
      if (error instanceof Error) {
        if (error.errno) {
          this.errno = error.errno;
          this.syscall = error.syscall;
          this.address = error.address;
          this.port = error.port;
          this.stack = error.stack;
          return "SystemError";
        }
        if (error.bytesParsed) {
          this.bytesParsed = error.bytesParsed;
          this.rawPacket = error.rawPacket;
          return "ClientError";
        }
      }
      return this.errorType;
    }

    toString() {
      switch (this.errorType) {
      case "Error":
        return ` ${clc.red(this.message)}
          ${clc.blue("Name :")} ${this.name}
          ${clc.blue("Type :")} ${this.errorType}
          ${clc.red("Code :")} ${this.code}
          ${clc.red("Message :")} ${this.message}
          ${clc.green("Stack :")} ${this.stack}`;
      case "httpError":
        return `${clc.red(this.message)}
        ${clc.blue("Name :")} ${this.name}
        ${clc.blue("Type :")} ${this.errorType}
        ${clc.blue("Url :")} ${this.url}
        ${clc.red("Code :")} ${this.code}
        ${clc.red("Message :")} ${this.message}
        ${clc.green("Bundle :")} ${this.bundle}
        ${clc.green("Controller :")} ${this.controller}
        ${clc.green("Action :")} ${this.action}
        ${clc.green("Stack :")} ${this.stack}`;
      case "SystemError":
        return `${clc.red(this.message)}
        ${clc.blue("Name :")} ${this.name}
        ${clc.blue("Type :")} ${this.errorType}
        ${clc.red("Message :")} ${this.message}
        ${clc.red("Ernno :")} ${this.errno}
        ${clc.blue("Syscall :")} ${this.syscall}
        ${clc.blue("Address :")} ${this.address}
        ${clc.blue("Port :")} ${this.port}
        ${clc.green("Stack :")} ${this.stack}`;
      case "AssertionError":
        return ` ${clc.red(this.message)}
        ${clc.blue("Name :")} ${this.name}
        ${clc.blue("Type :")} ${this.errorType}
        ${clc.red("Code :")} ${this.code}
        ${clc.red("Message :")} ${this.message}
        ${clc.white("Actual :")} ${this.actual}
        ${clc.white("Expected :")} ${this.expected}
        ${clc.white("Operator :")} ${this.operator}
        ${clc.green("Stack :")} ${this.stack}`;
      case "ClientError":
        return ` ${clc.red(this.message)}
            ${clc.blue("Name :")} ${this.name}
            ${clc.blue("Type :")} ${this.errorType}
            ${clc.red("Code :")} ${this.code}
            ${clc.red("Message :")} ${this.message}
            ${clc.white("BytesParsed :")} ${this.bytesParsed}
            ${clc.white("RawPacket :")} ${this.rawPacket}
            ${clc.green("Stack :")} ${this.stack}`;
      default:
        return ` ${clc.red(this.message)}
        ${clc.blue("Name :")} ${this.name}
        ${clc.blue("Type :")} ${this.errorType}
        ${clc.red("Message :")} ${this.message}
        ${clc.green("Stack :")} ${this.stack}`;
      }
    }

    parseMessage(message) {
      this.errorType = this.getType(message);
      switch (nodefony.typeOf(message)) {
      case "Error":
        this.message = message.message;
        if (message.code) {
          this.code = message.code;
        }
        this.stack = message.stack;
        break;
      case "object":
        // Capturing stack trace, excluding constructor call from it.
        Error.captureStackTrace(message, this.constructor);
        if (message.status) {
          this.code = message.status;
        }
        if (message.code) {
          this.code = message.code;
        }
        try {
          if (message.message) {
            this.message = message.message;
          } else {
            this.message = JSON.stringify(message);
          }
        } catch (e) {
          this.error = e;
        }
        break;
      }
    }

    logger() {
      return console.log(this.toString());
    }

  }
  return nodefonyError;
});