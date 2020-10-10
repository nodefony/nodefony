(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["test"] = factory();
	else
		root["test"] = factory();
})(self, function() {
return /******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./js/test.js":
/*!********************!*\
  !*** ./js/test.js ***!
  \********************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module, __webpack_require__ */
/*! CommonJS bailout: module.exports is used directly at 20:0-14 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/*
 *
 *	ENTRY POINT WEBPACK DEMO BUNLDE
 *
 *
 *  Add your assets here with require  to an integration in webpack  bundle
 *
 *  require('jquery');
 *  require('../css/mycss.css')
 *
 */
__webpack_require__(/*! ../css/test.css */ "./css/test.css");

module.exports = function () {
  /*
   *	Class
   *
   *	Namespace test client side
   *
   */
  var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
  var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList;
  var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent;

  var test = /*#__PURE__*/function () {
    function test() {
      var _this = this;

      _classCallCheck(this, test);

      $(document).ready(function () {
        // init speakToText
        _this.speakToText(); // init textToSpeak
        //this.textToSpeak("Les sanglots longs Des violons De l’automne Blessent mon cœur D’une langueur Monotone.");


        _this.textToSpeak($("#version").html().replace(/^\s*|\s*$/g, '')); //this.textToSpeak($("#french").html().replace(/^\s*|\s*$/g, ''));
        //airplay
        //$("video").get(0).webkitShowPlaybackTargetPicker();

      });
    }

    _createClass(test, [{
      key: "speakToText",
      value: function speakToText() {
        this.recognizing = null;
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interim = true;
        this.button = $("#button").get(0);
        $("#button").on("click", this.toggleStartStop.bind(this));
        this.final_span = $("#final_span").get(0);
        this.interim_span = $("#interim_span").get(0);
        this.reset();
        this.recognition.onend = this.reset.bind(this);
        this.recognition.onresult = this.onresult.bind(this);
      }
    }, {
      key: "textToSpeak",
      value: function textToSpeak(text) {
        this.SpeechSynthesisUtterance = new SpeechSynthesisUtterance();
        this.SpeechSynthesisUtterance.text = text;
        this.SpeechSynthesisUtterance.lang = 'fr-FR';
        this.SpeechSynthesisUtterance.rate = 1.2;
        this.speechSynthesis = speechSynthesis; //this.SpeechSynthesisUtterance.onend = function(event) { alert('Finished in ' + event.elapsedTime + ' seconds.'); }

        this.speechSynthesis.speak(this.SpeechSynthesisUtterance);
      }
    }, {
      key: "onresult",
      value: function onresult(event) {
        var _final = "";
        var interim = "";

        for (var i = 0; i < event.results.length; ++i) {
          if (event.results[i]["final"]) {
            _final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        this.final_span.innerHTML = _final;
        this.interim_span.innerHTML = interim;
      }
    }, {
      key: "reset",
      value: function reset() {
        this.recognizing = false;
        this.button.innerHTML = "Click to Speak";
      }
    }, {
      key: "toggleStartStop",
      value: function toggleStartStop() {
        if (this.recognizing) {
          this.recognition.stop();
          this.reset();
        } else {
          this.recognition.start();
          this.recognizing = true;
          this.button.innerHTML = "Click to Stop";
          this.final_span.innerHTML = "";
          this.interim_span.innerHTML = "";
        }
      }
    }]);

    return test;
  }();

  return new test();
}();
/*
 * HMR
 *
 */


if (false) {}

/***/ }),

/***/ "./css/test.css":
/*!**********************!*\
  !*** ./css/test.css ***!
  \**********************/
/*! namespace exports */
/*! exports [not provided] [no usage info] */
/*! runtime requirements: __webpack_require__.r, __webpack_exports__, __webpack_require__.* */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(__webpack_module_cache__[moduleId]) {
/******/ 			return __webpack_module_cache__[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	// module exports must be returned from runtime so entry inlining is disabled
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__("./js/test.js");
/******/ })()
;
});
//# sourceMappingURL=test.js.map