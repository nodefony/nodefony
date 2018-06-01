(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["test"] = factory();
	else
		root["test"] = factory();
})(window, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "testBundle/assets/";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ({

/***/ "./css/test.css":
/*!**********************!*\
  !*** ./css/test.css ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

// extracted by mini-css-extract-plugin

/***/ }),

/***/ "./js/test.js":
/*!********************!*\
  !*** ./js/test.js ***!
  \********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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

  var test = function () {
    function test() {
      var _this = this;

      _classCallCheck(this, test);

      $(document).ready(function () {
        // init speakToText
        _this.speakToText();
        // init textToSpeak
        //this.textToSpeak("Les sanglots longs Des violons De l’automne Blessent mon cœur D’une langueur Monotone.");
        _this.textToSpeak($("#version").html().replace(/^\s*|\s*$/g, ''));
        //this.textToSpeak($("#french").html().replace(/^\s*|\s*$/g, ''));
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
        this.speechSynthesis = speechSynthesis;
        //this.SpeechSynthesisUtterance.onend = function(event) { alert('Finished in ' + event.elapsedTime + ' seconds.'); }
        this.speechSynthesis.speak(this.SpeechSynthesisUtterance);
      }
    }, {
      key: "onresult",
      value: function onresult(event) {
        var final = "";
        var interim = "";
        for (var i = 0; i < event.results.length; ++i) {
          if (event.results[i].final) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        this.final_span.innerHTML = final;
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

/***/ 0:
/*!**************************!*\
  !*** multi ./js/test.js ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(/*! ./js/test.js */"./js/test.js");


/***/ })

/******/ });
});
//# sourceMappingURL=test.js.map