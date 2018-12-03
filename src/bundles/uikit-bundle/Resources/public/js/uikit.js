/*
 *
 *	ENTRY POINT WEBPACK BUNLDE
 *
 *
 *  Add your assets here with require to an integration in webpack  bundle
 *
 *  require('jquery');
 *  require('../css/mycss.css')
 *
 */
require('bootstrap');
require("bootstrap-switch");
require("bootstrap-datepicker");

require("../../now-ui-kit/javascript/now-ui-kit.js");

require("../../now-ui-kit/sass/now-ui-kit.scss");
require("../../now-ui-kit/css/demo.css");

const nouislider = require("nouislider");
require("tether");


module.exports = function() {

  window.noUiSlider = nouislider;
  /*
   *	Class
   *
   *	Namespace uikit client side
   *
   */
  const uikit = class uikit {
    constructor() {
      $(document).ready(function() {

        // the body of this function is in assets/js/now-ui-kit.js
        nowuiKit.initSliders();
      });

      function scrollToDownload() {
        if ($('.section-download').length != 0) {
          $("html, body").animate({
            scrollTop: $('.section-download').offset().top
          }, 1000);
        }
      }
    }
  };

  return new uikit();
}();