var login =
/******/ (function(modules) { // webpackBootstrap
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
/******/ 	return __webpack_require__(__webpack_require__.s = 16);
/******/ })
/************************************************************************/
/******/ ({

/***/ 16:
/***/ (function(module, exports) {

module.exports = function (){

	var handleLoginPageChangeBackground = function() {
		$('[data-click="change-bg"]').on('click', function() {
        		var targetImage = '[data-id="login-cover-image"]';
        		var targetImageSrc = $(this).find('img').attr('src');
        		var targetImageHtml = '<img src="'+ targetImageSrc +'" data-id="login-cover-image" />';

        		$('.login-cover-image').prepend(targetImageHtml);
        		$(targetImage).not('[src="'+ targetImageSrc +'"]').fadeOut('slow', function() {
            			$(this).remove();
        			});
        		$('[data-click="change-bg"]').closest('li').removeClass('active');
        		$(this).closest('li').addClass('active');
    		});
	};

	/* 05. Handle Page Load - Fade in
   	------------------------------------------------ */
	var handlePageContentView = function() {
    		"use strict";
    		$.when($('#page-loader').addClass('hide')).done(function() {
        		$('#page-container').addClass('in');
    		});
	};

	stage.appKernel.prototype.initializeLog = function(settings){
		this.syslog.listenWithConditions(this,{
			severity:{
				data:"ERROR,INFO"
			}
		},function(pdu){
			if (pdu.payload.stack ){
					console.error( "SYSLOG " + pdu.severityName +" " + pdu.msgid + " "+new Date(pdu.timeStamp) + " " + pdu.msg+" : "+  pdu.payload.stack);
			}else{
				$.gritter.add({
					title: "NODEFONY " + pdu.severityName ,
					text: pdu.payload
				});
			}
		});

		this.syslog.listenWithConditions(this,{
			severity:{
				data:"CRITIC,WARNING,DEBUG "
			}
		},function(pdu){
			switch( pdu.severityName){
				case "CRITIC" :
					console.error( "SYSLOG " + pdu.severityName +" " + pdu.msgid + " "+new Date(pdu.timeStamp) + " " + pdu.msg+" : "+ pdu.payload);
				break;
				case "WARNING" :
					console.warn ("SYSLOG " + pdu.severityName +" " + pdu.msgid + " "+new Date(pdu.timeStamp) + " " + pdu.msg+" : "+ pdu.payload);
				break;
				case "DEBUG" :
					console.log( "SYSLOG " + pdu.severityName +" " + pdu.msgid + " "+new Date(pdu.timeStamp) + " " + pdu.msg+" : "+ pdu.payload);
				break;
			}
		});

		return this.syslog ;
	}
	var kernel = new stage.appKernel("dev", {
		debug: true,
	        router:false,

		onBoot:function(kernel) {
			this.login = new stage.login(this, $("#login"));
		},
		onDomLoad: function() {
			try {
				handleLoginPageChangeBackground();
			}catch(e){
				console.log(e)
			}
		},
		onDomReady: function() {

			var error = $("#error");
			if (error.length) {
				var message = error.html();
				$("#error").remove();
				if ( message !== "Missing credentials" ){
					this.logger(message, "ERROR" ) ;
				}
			}

			var adduser = $("#adduser").html();
			if (adduser) {
				$("#adduser").remove();
				this.logger(adduser, "INFO" ) ;
			}

			switch(loginType){
				case "passport-local":
				break;
				case "nodefony-sasl":
					var path = $("#login").attr("action");
					$("#passwd").bind("focus", function(){
						this.login.request( path) ;
					}.bind(this));
					this.login.request( path) ;

					$("#login").bind("submit",function(e){

						var username = $("#email").val();
						var password = $("#passwd").val();
						if (! username || ! password)
							return false;
						if (this.login.authenticate){
							this.login.authenticate.register(username, password);
						}
						//e.preventDefault();
						//return false;
					}.bind(this))
				break;
				default:
					this.logger("FACTOY AUTHENTICATION : loginType NOT EXIST");

			}
			handlePageContentView()
		}
	});
	return kernel ;
}();


/***/ })

/******/ });
//# sourceMappingURL=login.js.map