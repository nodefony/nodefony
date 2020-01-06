import 'babel-polyfill';

import api from "./api/api.js";
const version = require("../../package.json").version;

class Nodefony {
  constructor(env) {
    this.version = version;
    this.environment = env;
    this.api = api;
    window.addEventListener("load", () => {
      this.load();
    }, false);
  }

  load() {
    console.log(this)
  }

  basename(path) {
    return path.replace(/\\/g, '/').replace(/.*\//, '');
  }

  dirname(path) {
    return path.replace(/\\/g, '/').replace(/\/[^\/]*$/, '');
  }

  /**
   *  @method typeOf
   *  @param  value
   *  @return {String} type of value
   */
  typeOf(value) {
    let t = typeof value;
    if (t === 'object') {

      if (value === null) {
        return null;
      }
      if (Buffer.isBuffer(value)) {
        return "buffer";
      }
      if (this.isArray(value)) {
        return "array";
      }
      if (this.isFunction(value)) {
        return 'function';
      }
      if (value instanceof Date) {
        return "date";
      }
      if (this.isRegExp(value)) {
        return "RegExp";
      }
      if (value.callee) {
        return "arguments";
      }
      if (value instanceof SyntaxError) {
        return "SyntaxError";
      }
      if (value instanceof Error) {
        return "Error";
      }
    } else {
      if (t === 'function' && typeof value.call === 'undefined') {
        return 'object';
      }
    }
    return t;
  }

  extend() {
    let options, name, src, copy, copyIsArray, clone,
      target = arguments[0] || {},
      i = 1,
      length = arguments.length,
      deep = false;

    // Handle a deep copy situation
    if (typeof target === "boolean") {
      deep = target;
      // Skip the boolean and the target
      target = arguments[i] || {};
      i++;
    }
    // Handle case when target is a string or something (possible in deep copy)
    if (typeof target !== "object" && this.isFunction(target)) {
      target = {};
    }
    // Extend jQuery itself if only one argument is passed
    if (i === length) {
      target = this;
      i--;
    }
    for (; i < length; i++) {
      // Only deal with non-null/undefined values
      if ((options = arguments[i]) !== null) {
        // Extend the base object
        for (name in options) {
          src = target[name];
          copy = options[name];
          // Prevent never-ending loop
          if (target === copy) {
            continue;
          }
          // Recurse if we're merging plain objects or arrays
          let bool = this.typeOf(copy);
          if (deep && copy && (bool === "object" ||
              (copyIsArray = (bool === "array")))) {
            if (copyIsArray) {
              copyIsArray = false;
              clone = src && bool === "array" ? src : [];
            } else {
              clone = src && bool === "object" ? src : {};
            }
            // Never move original objects, clone them
            target[name] = this.extend(deep, clone, copy);
            // Don't bring in undefined values
          } else if (copy !== undefined) {
            target[name] = copy;
          }
        }
      }
    }
    // Return the modified object
    return target;
  }

  isFunction(it) {
    return Object.prototype.toString.call(it) === '[object Function]';
  }

  isArray(it) {
    return Object.prototype.toString.call(it) === '[object Array]';
  }

  isContainer(container) {
    if (container && container.protoService && container.protoParameters) {
      return true;
    }
    return false;
  }

  isPromise(obj) {
    switch (true) {
    case obj instanceof Promise:
      return true;
    default:
      return !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function';
    }
  }

}

export default new Nodefony(process.env.NODE_ENV);