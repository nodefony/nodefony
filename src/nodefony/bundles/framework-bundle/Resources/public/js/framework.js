/*
 *
 *   ENTRY POINT WEBPACK FRAMEWORK
 *
 */
const stage = require("@nodefony/stage");
require("bootstrap");
require("../less/style.less");

module.exports = function () {

  window.stage = stage;

  return null;
}();