/*
 *  ENTRY POINT FRAMEWORK APP KERNEL
 */
"use strict;";
nodefony.require = require;
module.exports = class appKernel extends nodefony.kernel {
  constructor(type, environment, debug, settings) {
    // kernel constructor
    try {
      super(environment, debug, type, settings);
    } catch (e) {
      throw e;
    }
  }
};