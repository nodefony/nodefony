const assert = require("assert");
const STATUS_CODES = require("http").STATUS_CODES;
const json = {
  configurable: true,
  writable: true,
  value: function () {
    let alt = {};
    const storeKey = function (key) {
      alt[key] = this[key];
    };
    Object.getOwnPropertyNames(this).forEach(storeKey, this);
    return alt;
  }
};
Object.defineProperty(Error.prototype, 'toJSON', json);

const exclude = {
  context:true,
  resolver:true,
  container:true
};
const jsonNodefony = {
  configurable: true,
  writable: true,
  value: function () {
    let alt = {};
    const storeKey = function (key) {
      if (key in exclude){
        return ;
      }
      alt[key] = this[key];
    };
    Object.getOwnPropertyNames(this).forEach(storeKey, this);
    return alt;
  }
};


const isSequelizeError = function (error) {
  try {
    return nodefony.sequelize.isError(error);
  } catch (e) {
    return false;
  }
};

const isMongooseError = function (error) {
  try {
    return nodefony.mongoose.isError(error);
  } catch (e) {
    return false;
  }
};

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

  toJSON(){

  }

  static isError(error) {
    switch (true) {
    case error instanceof ReferenceError:
      return "ReferenceError";
    case error instanceof TypeError:
      return "TypeError";
    case error instanceof SyntaxError:
      return "SyntaxError";
    case error instanceof assert.AssertionError:
      return "AssertionError";
    case isSequelizeError(error):
      return "SequelizeError";
    case isMongooseError(error):
      return "MongooseError";
    case error instanceof Error:
      if (error.errno) {
        return "SystemError";
      }
      if (error.bytesParsed) {
        return "ClientError";
      }
      try {
        return error.constructor.name || "Error";
      } catch (e) {
        return "Error";
      }
    }
    return false;
  }

  getType(error) {
    const errorType = nodefony.Error.isError(error);
    if (errorType) {
      switch (errorType) {
      case "TypeError":
      case "ReferenceError":
      case "SyntaxError":
        return errorType;
      case "AssertionError":
        this.actual = error.actual;
        this.expected = error.expected;
        this.operator = error.operator;
        return errorType;
      case "SystemError":
        this.errno = error.errno;
        this.syscall = error.syscall;
        this.address = error.address;
        this.port = error.port;
        this.stack = error.stack;
        return errorType;
      case "ClientError":
        this.bytesParsed = error.bytesParsed;
        this.rawPacket = error.rawPacket;
        return errorType;
      case "SequelizeError":
        this.name = error.name;
        this.message = error.message;
        if (error.errors) {
          this.errors = error.errors || [];
        }
        if (error.fields) {
          this.fields = error.fields;
        }
        if (error.parent) {
          this.parent = error.parent;
          if (this.parent.errno) {
            this.errno = this.parent.errno;
          }
          if (this.parent.code) {
            this.code = this.parent.code;
          }
        }
        if (error.sql) {
          this.sql = error.sql;
        }
        if (error.index) {
          this.index = error.index;
        }
        if (error.value) {
          this.value = error.value;
        }
        if (error.table) {
          this.table = error.table;
        }
        if (error.constraint) {
          this.constraint = error.constraint;
        }
        return errorType;
      default:
        return error.constructor.name;
      }
    }
    if (error && error.constructor) {
      return error.constructor.name;
    }
    return "Error";
  }

  toString() {
    let err = ``;
    switch (this.errorType) {
    case "Error":
      if (kernel && kernel.environment === "prod") {
        return err;
      }
      err = `${clc.blue("Name :")} ${this.name}
        ${clc.blue("Type :")} ${this.errorType}
        ${clc.red("Code :")} ${this.code}
        ${clc.red("Message :")} ${this.message}`;
      break;
    case "SystemError":
      if (kernel && kernel.environment === "prod") {
        return ` ${clc.blue("Type :")} ${this.errorType} ${clc.red(this.message)}`;
      }
      err = `${clc.blue("Name :")} ${this.name}
      ${clc.blue("Type :")} ${this.errorType}
      ${clc.red("Message :")} ${this.message}
      ${clc.red("Ernno :")} ${this.errno}
      ${clc.blue("Syscall :")} ${this.syscall}
      ${clc.blue("Address :")} ${this.address}
      ${clc.blue("Port :")} ${this.port}`;
      break;
    case "AssertionError":
      if (kernel && kernel.environment === "prod") {
        return ` ${clc.blue("Type :")} ${this.errorType} ${clc.red(this.message)}`;
      }
      err = `${clc.blue("Name :")} ${this.name}
      ${clc.blue("Type :")} ${this.errorType}
      ${clc.red("Code :")} ${this.code}
      ${clc.red("Message :")} ${this.message}
      ${clc.white("Actual :")} ${this.actual}
      ${clc.white("Expected :")} ${this.expected}
      ${clc.white("Operator :")} ${this.operator}`;
      break;
    case "ClientError":
      if (kernel && kernel.environment === "prod") {
        return ` ${clc.blue("Type :")} ${this.errorType} ${clc.red(this.message)}`;
      }
      err = `${clc.blue("Name :")} ${this.name}
      ${clc.blue("Type :")} ${this.errorType}
      ${clc.red("Code :")} ${this.code}
      ${clc.red("Message :")} ${this.message}
      ${clc.white("BytesParsed :")} ${this.bytesParsed}
      ${clc.white("RawPacket :")} ${this.rawPacket}`;
      break;
    case "SequelizeError":
      return nodefony.sequelize.errorToString(this);
    case "MongooseError":
      return nodefony.mongoose.errorToString(this);
    default:
      if (kernel && kernel.environment === "prod") {
        return ` ${clc.blue("Type :")} ${this.errorType} ${clc.red(this.message)}`;
      }
      err = `${clc.blue("Name :")} ${this.name}
        ${clc.blue("Type :")} ${this.errorType}
        ${clc.red("Message :")} ${this.message}`;
      break;
    }
    if (kernel.debug) {
      err += `
        ${clc.green("Stack :")} ${this.stack}`;
    }
    return err;
  }

  parseMessage(message) {
    this.errorType = this.getType(message);
    switch (nodefony.typeOf(message)) {
    case "Error":
      if (this.errorType === "SequelizeError") {
        break;
      }
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
    default:
      this.getDefaultMessage();
    }
  }

  getDefaultMessage() {
    if (!this.message && this.code) {
      let str = this.code.toString();
      if (str in STATUS_CODES) {
        this.message = STATUS_CODES[str];
      }
    }
  }

  logger() {
    return console.log(this.toString());
  }

}

Object.defineProperty(nodefonyError.prototype, 'toJSON', jsonNodefony);

nodefony.Error = nodefonyError;
module.exports = nodefonyError;
