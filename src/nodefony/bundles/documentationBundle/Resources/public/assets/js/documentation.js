(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["documentation"] = factory();
	else
		root["documentation"] = factory();
})(this, function() {
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
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
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
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

__webpack_require__(0);

module.exports = function () {

	/*
 	 *
 	 *	Class Bundle App client side
 	 *
 	 *
 	 */
	var Documentation = function () {
		function Documentation() {
			_classCallCheck(this, Documentation);

			$("#version").change(function (ele) {
				window.location = this.value;
			});
			$("#langs").change(function (ele) {
				window.location.href = "?lang=" + this.value;
			});

			$.get("/api/git/getCurrentBranch", function (data) {
				var ele = $(".branch");
				ele.text(data.branch);
			}).fail(function (error) {
				throw error;
			});

			var search = $("#inputSearh");
			search.bind("keypress", function (event) {
				if (event.keyCode == 13) {
					event.stopPropagation();
					event.preventDefault();
					$("#buttonSearh").trigger("click");
					return false;
				}
			});
			$("#buttonSearh").click(function () {
				var ele = $("#search");
				var mysearch = search.val();
				var spinner = $("#spinner");
				if (mysearch) {
					$.ajax({
						url: "/documentation/search",
						data: {
							search: mysearch
						},
						beforeSend: function beforeSend() {
							console.log("before");
							ele.empty();
							spinner.show();
						},
						success: function success(data) {
							var text = null;
							for (var link in data) {
								var reg = new RegExp(mysearch, 'gi');
								var res = reg.exec(data[link].text);
								if (res) {
									text = data[link].text.replace(res[0], "<span style='background-color:yellow' >" + res[0] + "</span>");
								} else {
									continue;
								}
								var li = "<li class='list-group-item'>";
								li += "<a href='" + link + "'><span style=''>" + data[link].title + "</span></a>";
								li += "<div>  " + text + " </div>";
								li += "</li>";
								ele.append(li);
							}
							if (!text) {
								var li = "<li class='list-group-item'>";
								li += "<div>  No result </div>";
								li += "</li>";
								ele.append(li);
							}
						},
						complete: function complete() {
							spinner.hide();
							console.log("complete");
						}
					}).fail(function () {
						spinner.hide();
						console.log("ERROR");
					});
				} else {
					event.stopPropagation();
					event.preventDefault();
					return false;
				}
			});
		}

		_createClass(Documentation, [{
			key: "index",
			value: function index(bundle, section) {
				if (bundle === "nodefony" && section === null) {
					$.get("/api/git/getMostRecentCommit", function (data) {
						var ele = $("#commits");
						for (var i = 0; i < data.length; i++) {
							//var dt = new Date( data[i].date ) ;
							//var date = dt.toLocaleDateString() + " " + dt.toLocaleTimeString() ;
							var sha = data[i].sha.substr(0, 7);
							var shaLink = "https://github.com/nodefony/nodefony-core/commit/" + sha;

							var date = new Date(data[i].date).toDateString();
							var li = "<li class='list-group-item'>";
							li += "<span style='background-color:blue' class='badge'>" + data[i].author + "</span>";
							li += "<a href='" + shaLink + "'><span style=''>" + data[i].msg + "</span></a>";
							li += "<div> commit on " + date + " by " + data[i].author + " </div>";
							li += "</li>";
							ele.append(li);
						}
					}).fail(function () {
						console.log("ERROR");
					});

					/*$.get("/api/git/getStatus",function(data){
     	var ele = $("#status");
     	for (var i = 0 ; i < data.length ; i++){
     		var type = data[i].type[0].replace("WT_","") ;
     		var li = "<li class='list-group-item'>";
     		switch(type){
     			case "INDEX_NEW":
     				li += "<span style='background-color:blue' class='badge'>"+type+"</span>" ;
     				li += "<span style='cursor:context-menu' title="+data[i].path+"> " + stage.basename( data[i].path ) +"</span>" ;
     			break;
     			case "NEW":
     				li += "<span style='background-color:red' class='badge'>"+type+"</span>" ;
     				li += "<span style='cursor:context-menu' title="+data[i].path+"> " + stage.basename ( data[i].path ) +"</span>";
     			break;
     			default:
     				li += "<span  class='badge'>"+type+"</span>" ;
     				li += "<span style='cursor:context-menu' title="+ data[i].path +"> " + stage.basename ( data[i].path ) +"</span>";
     		}
     		li += "</li>";
     		ele.append(li);
     	}
     }).fail(function() {
     	console.log( "ERROR" );
     });*/

					$.get("https://api.github.com/repos/nodefony/nodefony/issues?state=open", function (data) {
						var ele = $("#issues");
						for (var i = 0; i < data.length; i++) {
							var date = new Date(data[i].created_at).toDateString();
							var li = "<li class='list-group-item'>";
							li += "<span style='background-color:blue' class='badge'>#" + data[i].number + "</span>";
							li += "<a href='https://github.com/nodefony/nodefony/issues/" + data[i].number + "'><span style=''>" + data[i].title + "</span></a>";
							li += "<div> opened on " + date + " by " + data[i].user.login + " </div>";
							li += "</li>";
							ele.append(li);
						}
					}).fail(function () {
						console.log("ERROR");
					});
				}
			}
		}]);

		return Documentation;
	}();

	return new Documentation();
}();

/***/ })
/******/ ]);
});
//# sourceMappingURL=documentation.js.map