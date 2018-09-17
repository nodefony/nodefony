(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["debugBar"] = factory();
	else
		root["debugBar"] = factory();
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
/******/ 	__webpack_require__.p = "monitoring-bundle/assets/";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./js/debugBar.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./css/debugBar.css":
/*!**************************!*\
  !*** ./css/debugBar.css ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

// extracted by mini-css-extract-plugin

/***/ }),

/***/ "./js/debugBar.js":
/*!************************!*\
  !*** ./js/debugBar.js ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

__webpack_require__(/*! ../css/debugBar.css */ "./css/debugBar.css");

module.exports = function () {
  var nativeBind = function () {
    return !!Function.prototype.bind;
  }();

  var setContext = null;

  if (!nativeBind) {
    // bind tools
    setContext = function () {
      var mergeArg = function () {
        if (Array.prototype.unshift) {
          return function (tab, args) {
            Array.prototype.unshift.apply(tab, args);
          };
        }

        return function (tab, args) {
          for (var i = args.length; i > 0; i--) {
            Array.prototype.splice.call(tab, 0, 0, args[i - 1]);
          }
        };
      }();

      return function () {
        var func = this;
        var context = Array.prototype.shift.call(arguments);
        var args = arguments;
        return function () {
          mergeArg(arguments, args);
          return func.apply(context, arguments);
        };
      };
    }();

    Function.prototype.bind = setContext;
  }

  var _listen = function () {
    if (document.addEventListener) {
      return function (event, handler, capture) {
        this.addEventListener(event, handler, capture || false);
        return handler;
      };
    }

    return function (event, handler
    /*, capture*/
    ) {
      this.attachEvent('on' + event, handler);
      return handler;
    };
  }();

  var trim = function () {
    // inspired  by jquery
    // Used for trimming whitespace
    var trimLeft = /^\s+/;
    var trimRight = /\s+$/;

    if (String.prototype.trim) {
      return function (text) {
        return text === null ? "" : String.prototype.trim.call(text);
      };
    }

    return function (text) {
      return text === null ? "" : text.toString().replace(trimLeft, "").replace(trimRight, "");
    };
  }(); // HTML5 Storage


  var browserStorage =
  /*#__PURE__*/
  function () {
    function browserStorage(type) {
      _classCallCheck(this, browserStorage);

      if (type === "local") {
        this.data = window.localStorage;
      } else {
        this.data = window.sessionStorage;
      }
    }

    _createClass(browserStorage, [{
      key: "get",
      value: function get(key) {
        var ele = this.data.getItem(key);

        if (ele === "" || ele === null || ele === undefined) {
          return null;
        }

        if (ele && _typeof(ele) === "object") {
          return JSON.parse(ele.value);
        }

        return JSON.parse(ele);
      }
    }, {
      key: "set",
      value: function set(key, value) {
        return this.data.setItem(key, JSON.stringify(value));
      }
    }, {
      key: "unset",
      value: function unset(key) {
        return this.data.removeItem(key);
      }
    }, {
      key: "clear",
      value: function clear() {
        return this.data.clear();
      }
    }, {
      key: "each",
      value: function each() {//TODO
      }
    }]);

    return browserStorage;
  }(); // EVENTS LOAD


  var load = function load() {
    this.debugbar = document.getElementById("nodefony-container");
    this.smallContainer = document.getElementById("nodefony-small");
    this.nodefonyClose = document.getElementById("nodefonyClose");
    var state = this.storage.get("nodefony_debug");

    if (state === false) {
      this.removeClass(this.smallContainer, "hidden");
      this.addClass(this.debugbar, "hidden");
    }

    this.listen(this.nodefonyClose, "click", function ()
    /*event*/
    {
      //var ev = new coreEvent(event);
      this.removeClass(this.smallContainer, "hidden");
      this.addClass(this.debugbar, "hidden");
      this.storage.set("nodefony_debug", false); //ev.stopPropagation();
    }.bind(this));
    this.listen(this.smallContainer, "click", function ()
    /*event*/
    {
      //var ev = new coreEvent(event);
      this.removeClass(this.debugbar, "hidden");
      this.addClass(this.smallContainer, "hidden");
      this.storage.set("nodefony_debug", true); //ev.stopPropagation();
    }.bind(this));
  };

  var Nodefony =
  /*#__PURE__*/
  function () {
    function Nodefony() {
      _classCallCheck(this, Nodefony);

      this.storage = new browserStorage("local");

      if (window.addEventListener) {
        window.addEventListener("load", load.bind(this), false);
      } else {
        window.attachEvent("onload", load.bind(this));
      }
    }

    _createClass(Nodefony, [{
      key: "listen",
      value: function listen(element, event, handler, capture) {
        if (element) {
          return _listen.call(element, event, handler, capture);
        }
      }
    }, {
      key: "removeClass",
      value: function removeClass(element, value) {
        if (value && typeof value === "string" || value === undefined) {
          var classNames = (value || "").split(/\s+/);

          if (element.nodeType === 1 && element.className) {
            if (value) {
              var className = (" " + element.className + " ").replace(/[\n\t]/g, " ");

              for (var c = 0, cl = classNames.length; c < cl; c++) {
                className = className.replace(" " + classNames[c] + " ", " ");
              }

              element.className = trim(className);
            } else {
              element.className = "";
            }
          }
        }
      }
    }, {
      key: "addClass",
      value: function addClass(element, value) {
        var classNames = (value || "").split(/\s+/);

        if (element.nodeType === 1) {
          if (!element.className) {
            element.className = value;
          } else {
            var className = " " + element.className + " ",
                setClass = element.className;

            for (var c = 0, cl = classNames.length; c < cl; c++) {
              if (className.indexOf(" " + classNames[c] + " ") < 0) {
                setClass += " " + classNames[c];
              }
            }

            element.className = trim(setClass);
          }
        }
      }
    }, {
      key: "monitoringWorkbox",
      value: function monitoringWorkbox(registration) {
        var _this = this;

        var serviceWorker = null;

        switch (true) {
          case !!registration.installing:
            serviceWorker = registration.installing;
            break;

          case !!registration.waiting:
            serviceWorker = registration.waiting;
            break;

          case !!registration.active:
            serviceWorker = registration.active;
            break;
        }

        if (serviceWorker) {
          this.eleWorkbox = document.getElementById("workbox");
          this.separatorWorkbox = document.getElementById("separator-workbox");
          this.versionWorker = document.getElementById("workbox-version");
          this.stateWorker = document.getElementById("workbox-state");

          if (this.eleWorkbox && this.separatorWorkbox) {
            this.removeClass(this.eleWorkbox, 'hidden');
            this.removeClass(this.separatorWorkbox, 'hidden');
          }

          if (this.stateWorker) {
            this.stateWorker.innerHTML = serviceWorker.state;
          }

          if (this.versionWorker) {
            this.versionWorker.innerHTML = "";
          }

          serviceWorker.addEventListener('statechange', function (e) {
            if (_this.stateWorker) {
              _this.stateWorker.innerHTML = e.target.state;
            }
          });
        }
      }
    }]);

    return Nodefony;
  }();

  var nodefony = new Nodefony();
  window.nodefony = nodefony;
  return nodefony;
}();

/***/ })

/******/ });
});
//# sourceMappingURL=debugBar.js.map