/*
 *
 *   ENTRY POINT WEBPACK FRAMEWORK
 *
 */
require('bootstrap');
require('../../scss/custom.scss');

module.exports = function() {
  this.selectorLang = global.document.getElementById("langs");
  if (this.selectorLang) {
    this.selectorLang.addEventListener("change", function(e) {
      window.location.href = "?lang=" + this.value;
      e.preventDefault();
    });
  }
  return null;
}();