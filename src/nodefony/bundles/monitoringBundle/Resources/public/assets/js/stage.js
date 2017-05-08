/**
 *
 *	@module library
 *	@namespace stage
 *
 */
var stage = function(){


	// Traf indexOf IE8 
	var arrayProto = Array.prototype;

	var indexOf = function(){
		if (arrayProto.indexOf){
			return ;		
		}
		arrayProto.indexOf =  function( value, startIndex){
			var index = startIndex == null ? 0 : (startIndex < 0 ? Math.max(0, this.length + startIndex) : startIndex);
			for (var i = index; i < this.length; i++) {
				if (i in this && this[i] === value)
					return i;
			}
			return -1;
		}
	}();

	var typeOf = function(value){
		var t = typeof value;
		if (t === 'object'){
			if (value === null ) return "object";
			if (value instanceof Array ||
				(!(value instanceof Object) &&
           				(Object.prototype.toString.call((value)) === '[object Array]') ||
           				typeof value.length === 'number' &&
           				typeof value.splice !== 'undefined' &&
           				typeof value.propertyIsEnumerable !== 'undefined' &&
           				!value.propertyIsEnumerable('splice')
          			))
			{
				return "array";
			}
			if (!(value instanceof Object) &&
          			(Object.prototype.toString.call((value)) === '[object Function]' ||
          				typeof value.call !== 'undefined' &&
          				typeof value.propertyIsEnumerable !== 'undefined' &&
          				!value.propertyIsEnumerable('call'))
			) {
        			return 'function';
      			}
			if (value.nodeType === 1 )
				return "element";
			if (value.nodeType === 9)
				return "document";
			if (value === window)
				return "window";
			if (value instanceof Date)
				return "date";
			if (value.callee)
				return "arguments";
			if (value instanceof SyntaxError)
				return "SyntaxError";
			if (value instanceof Error)
				return "Error";
		} else {
			if (t === 'function' && typeof value.call === 'undefined') {
    				return 'object';
			}
		}
  		return t;
	};

	var getBrowser = function(){
		if (navigator.userAgent.indexOf('MSIE') > -1){
			return "MSIE";
		}
		if (navigator.userAgent.indexOf('Firefox') > -1){
			return "Firefox";
		}
		if (navigator.userAgent.indexOf('Chrome') > -1){
			return "Chrome";
		}
		if (navigator.userAgent.indexOf('Safari') > -1){
			return "Safari";
		}
		if (navigator.userAgent.indexOf('Opera') > -1){
			return "Opera";
		}
		if (navigator.userAgent.indexOf('Iceweasel') > -1){
			return "Firefox";
		}
		return "undefined";
	}();

	var getBrowserVersion = function(){

		if (/MSIE (\d+\.\d+);/.test(navigator.userAgent))
			return new Number(RegExp.$1)

		if (/Firefox[\/\s](\d+\.\d+)/.test(navigator.userAgent))
			return new Number(RegExp.$1)

		if (/Chrome[\/\s](\d+\.\d+)/.test(navigator.userAgent))
		//if (/Chrome[\/\s](\d+\.\d+\.?\d+)/.test(navigator.userAgent))
			return new Number(RegExp.$1)

		if (/Safari[\/\s](\d+\.\d+)/.test(navigator.userAgent))
			if (/Version[\/\s](\d+\.\d+)/.test(navigator.userAgent))
				return new Number(RegExp.$1)

		if (/Opera[\/\s](\d+\.\d+)/.test(navigator.userAgent))
			if (/Version[\/\s](\d+\.\d+)/.test(navigator.userAgent))
				return new Number(RegExp.$1)

		if (/Iceweasel[\/\s](\d+\.\d+)/.test(navigator.userAgent))
			return new Number(RegExp.$1)

		return "undefined"; 
	}();

	var useragent = navigator.userAgent.toLowerCase();

	/**
	 *	stage class   
	 *	The class is a **`stage client side `** .
	 *	@class stage
	 *	@constructor
	 *	@module library
	 *	@param {Object} jQuery
	 *	
	 */
	var stage = function(jQuery){
		
		this.typeOf = typeOf ;
		this.extend = jQuery.extend ;
		this.crypto = {};
		this.modules = {};
		this.controllers = {};
		this.browser = {
			navigator:getBrowser,
			version:getBrowserVersion,
			Ie:/msie/.test( useragent ) && !/opera/.test( useragent ),
			Gecko:navigator.userAgent.indexOf('Gecko') > -1 && navigator.userAgent.indexOf('KHTML') === -1,
			Webkit:/webkit/.test( useragent ),
			Opera:Object.prototype.toString.call(window.opera) == '[object Opera]',
			platform:navigator.userAgent.match(/ip(?:ad|od|hone)/) ? 'ios' : (navigator.userAgent.match(/(?:webos|android)/) || navigator.platform.toLowerCase().match(/mac|win|linux/) || ['other'])[0]
		};
	};

	stage.prototype.version = "1.0";
	stage.prototype.require = function(){};
	stage.prototype.provide = function(){};
	
	stage.prototype.register = function(name, closure){
		if (typeof closure === "function") {
			// exec closure 
			var register = closure(this, name);
		} else {
			var register = closure;
		}
		return this[name] = register;
	};

	stage.prototype.registerModule = function(name, closure){
		return this.register.call(this.modules, name, closure);
	};

	stage.prototype.registerController = function(name, closure){
		return this.register.call(this.controllers, name, closure);
	};


	stage.prototype.basename = function(path) {
		return path.replace(/\\/g,'/').replace( /.*\//, '' );
	};
 
	stage.prototype.dirname= function dirname(path) {
		return path.replace(/\\/g,'/').replace(/\/[^\/]*$/, '');
	};


	try{
		jQuery;		
		
	}catch(e){
		throw new Error("Before kernel loading you should have jQuery registred " + e);
	}
	return new stage(jQuery)

}();
/**
 *
 * @module library
 * @namespace functions
 * 
 */

stage.register("functions" , function(){

	
	var nativeBind = function(){
		return (!! Function.prototype.bind)  
	}();

	// Context tools
	var bind = function(){

		var mergeArg = function(){
			if ( Array.prototype.unshift ){
				return function(tab, args){
					Array.prototype.unshift.apply(tab, args);
				}
			}
			return function(tab, args){
				for ( var i = args.length ; i > 0; i-- ){
					Array.prototype.splice.call(tab, 0, 0, args[i-1] );
				}
			}
		}()
		
		return function(){
			var func = this;
			var context = Array.prototype.shift.call(arguments);
			var args = arguments;
			return function (){
				mergeArg(arguments, args);
				return func.apply(context, arguments)
			}
		}
	}();
	
	if ( ! nativeBind )
		Function.prototype.bind = bind;

	// IE specificity
	var recIECopy = function(head, proto, bck){
		if(proto.__proto__){
			recIECopy(head, proto.__proto__, bck);
		}
		
		for(var f in proto){
			if(!bck[f]){			
				if(f != "__proto__"){
					//console.log(f);
					if(stage.typeOf(proto[f]) == "function"){
						//head[f] = proto[f].setContext(head);
						head[f] = proto[f].bind(head);
					}else{
						head[f] = proto[f];
					}
				}
			}		
		}
	};
	
	// IE specificity
	var recIECopySuper = function(head, proto, context){
		if(proto.__proto__){
			recIECopySuper(head, proto.__proto__, context);
		}
		for(var f in proto){					
			if(f != "__proto__"){
				if(stage.typeOf(proto[f]) == "function" && f != "constructor" ){
					//head[f] = proto[f].setContext(context);
					head[f] = proto[f].bind(context);
				}
			}				
		}			
	};

	// Optimized for simple heritage
 	var heriteSimple = function(){
 		
 		if(stage.browser.Ie){
 			
 			// IE specificity
 			return function(){
				if ( ! arguments[0] || ! arguments[1] ){
					throw new Error ("stage HERITE CLASS NOT DEFINED !!!!");
				}	
 				var args = arguments;
	
				// Extend prototype 		
				var proto = new function(){}();
				proto["__proto__"] = stage.extend({},arguments[0].prototype);
				if(!proto["__proto__"]["__proto__"]){
					proto["__proto__"]["__proto__"] = arguments[1].prototype;
				}else{
					proto["__proto__"]["__proto__"] = stage.extend(proto["__proto__"]["__proto__"],arguments[1].prototype);
				}
				
								
				// Create returned new class
				var klass = function(){					
					
					// Backup prototype and constructor of super class to allow overload
					this.$super = {
						constructor : args[1].prototype.constructor.bind(this)
					};										
					recIECopySuper(this.$super, args[1].prototype, this );						
					
					
					// Copy functions to head instance
					var bck = {};
					for(var j in this){
						if(stage.typeOf(this[j]) == "function"){
							bck[j] = true;
						}
					} 
					recIECopy(this, this, bck);														
					
					// Call constructor class in new object context			
					args[0].prototype.constructor.apply(this,arguments);					
					
					// Delete backup of prototype and constructor super class
					// Must be used only in constructor of returned class, but can be backup in var
					delete this.$super;											
				}				
				
				// Copy extended prototype in new class prototype
				klass.prototype = proto;
				// Copy constructor in new class returned
				klass.prototype.constructor = klass;				
				return klass; 			
 			}
 			
		}else{
 		
 			return function(){ 				
				if ( ! arguments[0] || ! arguments[1]){
					throw new Error ("stage HERITE MOTHER CLASS NOT DEFINED !!!!");
				}
 				var args = arguments;
	
				// Extend prototype 		
				var proto = new function(){}();
				proto["__proto__"] = stage.extend({},arguments[0].prototype);
				//proto["__proto__"] = arguments[0].prototype;
				proto["__proto__"]["__proto__"] = arguments[1].prototype;
								
				// Create returned new class
				var klass = function(){					
					
					// Backup prototype and constructor of super class to allow overload
					this.$super = {
						constructor : args[1].prototype.constructor.bind(this)
					};
					
					// Set context of all super class methods
					for(var f in args[1].prototype.constructor.prototype){
						if(args[1].prototype[f] && typeof(args[1].prototype.constructor.prototype[f]) == "function" && f != "constructor" ){
							this.$super[f] =  args[1].prototype.constructor.prototype[f].bind(this);
						}					
					}					
					
					// Call constructor class in new object context			
					args[0].prototype.constructor.apply(this,arguments);
					
					// Delete backup of prototype and constructor super class
					// Must be used only in constructor of returned class, but can be backup in var
					delete this.$super;											
				}
							
				
				// Copy extended prototype in new class prototype
				klass.prototype = proto;
				// Copy constructor in new class returned
				klass.prototype.constructor = klass;	
					
				return klass; 				
 			}			
 		}		
 	}();


	// Multiple heritage
	var recHeriteMultiple = function(){
		
		if(stage.browser.Ie){
			
			// IE specificity
			return function(i, args, proto, head, tab){
			
				proto["__proto__"] = stage.extend({},args[(args.length - i)].prototype);
			
				if(i>1){			
						
					if(i != args.length)
						tab.push( args[(args.length - i)].prototype.constructor );
					var res = recHeriteMultiple( i-1, args, proto.__proto__, head, tab);				
					
					return res;
				}else{
					
					tab.push( args[(args.length - i)].prototype.constructor );
											
					var klass = function(){					
						
						this.$super = [];					
						
						for(var sup in tab){
							
							this.$super[sup] = stage.extend({}, tab[sup].prototype);
							this.$super[sup].constructor =  tab[sup].bind(this);
							
							for(var f in this.$super[sup]){
								if( typeof(this.$super[sup][f]) == "function" && f != "constructor"){
									this.$super[sup][f] =  this.$super[sup][f].bind(this);	
								}					
							}												
						}				
									
						args[0].prototype.constructor.apply(this,arguments);
						
						// IE copy
						var bck = {};
						for(var j in this){
							if(stage.typeOf(this[j]) == "function"){
								bck[j] = true;
							}
						}
						recIECopy(this, this, bck);	
										
						delete this.$super;											
					}		
					klass.prototype = head;
					klass.prototype.constructor = klass;
					return klass;
				}
			}		
		}
	
		return function(i, args, proto, head, tab){		
			
			proto["__proto__"] = stage.extend({},args[(args.length - i)].prototype);
			
			if(i>1){			
					
				if(i != args.length)
					tab.push( args[(args.length - i)].prototype.constructor );
				var res = recHeriteMultiple( i-1, args, proto.__proto__, head, tab);				
				
				return res;
			}else{
				
				tab.push( args[(args.length - i)].prototype.constructor );
										
				var klass = function(){					
					
					this.$super = [];					
					
					for(var sup in tab){
						
						this.$super[sup] = stage.extend({}, tab[sup].prototype);
						this.$super[sup].constructor =  tab[sup].bind(this);
						
						for(var f in this.$super[sup]){
							if( typeof(this.$super[sup][f]) == "function" && f != "constructor"){
								this.$super[sup][f] =  this.$super[sup][f].bind(this);	
							}					
						}												
					}				
								
					args[0].prototype.constructor.apply(this,arguments);				
					delete this.$super;											
				}		
				klass.prototype = head;
				klass.prototype.constructor = klass;
				
				return klass;
			}
		}
	}();

	var herite = function(){	
		if(arguments.length>2){				
			var proto = new function(){}();
   			return recHeriteMultiple(arguments.length, arguments, proto, proto, new Array() );			
		}else{
			// Optimized for simple heritage
   			return heriteSimple.apply(this, arguments);			
		}    	
	};

	Function.prototype.herite = function(){
		Array.prototype.splice.call(arguments, 0, 0, this );
		return herite.apply(this,arguments);
	};

	return {
		herite:	herite
	}

});
/**
 * @module library
 * @namespace NotificationCenter
 * 
 */
stage.provide("notificationsCenter");
 
 
 
stage.register("notificationsCenter", function(){
 
  
        var regListenOn = /^on(.*)$/;
   
       /**
         *      Events  
         *
         *      @class Notification
         *      @module library
         *      @param {Object} settings Object to pass to `settingToListen` method
         *      @param {Object} context  to apply `settingToListen` 
         *
         *      @example
         *
         *      
         */
        var Notification = function(settings, context) {
                this.events = {};
                this.garbageEvent = {};
                if (settings) {
                        this.settingsToListen(settings, context);
                }
        };
 
        /**
         *
         *      @method listen 
         *
         */
        Notification.prototype.listen = function(context, eventName, callback) {
                var event = arguments[1];
                var ContextClosure = this;
                if (! this.events[eventName]) {
                        this.events[eventName] = [];
                        this.garbageEvent[eventName] = [];
                }
                if (typeof callback === 'function') {
                        this.garbageEvent[eventName].push(callback);
                        this.events[eventName].push(function(args) {
                                callback.apply(context, args);
                        });
                }
                return function() {
                        Array.prototype.unshift.call(arguments, event)
                        return ContextClosure.fire.apply(ContextClosure, arguments);
                }
        };
 
        /**
         *
         *      @method clearNotifications 
         *
         */
        Notification.prototype.clearNotifications = function(eventName) {
                if (eventName){
                        if (this.events[eventName]) {
                                while (this.events[eventName].length > 0) {
                                        this.events[eventName].pop();
                                        this.garbageEvent[eventName].pop();
                                }
                                delete this.events[eventName];
                                delete this.garbageEvent[eventName];
                        }
                }else{
                        delete this.events ;
                        delete this.garbageEvent ;
                        this.events = {};
                        this.garbageEvent = {};
                }
        };
 
        /**
         *
         *      @method fire 
         *
         */
        Notification.prototype.fire = function(eventName) {
                var ret = true;
                if (this.events[eventName]) {
                        var args = Array.prototype.slice.call(arguments, 1);
                        for (var i = 0; i < this.events[eventName].length; i++) {
                                try {
                                        ret = this.events[eventName][i](args);
                                        if (ret) {
                                                break;
                                        }
                                } catch (e) {
                                        throw new Error(e);
                                }
                        }
                }
                return ret;
        };
 
        /**
         *
         *      @method settingsToListen 
         *
         */
        Notification.prototype.settingsToListen = function(localSettings, context) {
                for (var i in localSettings) {
                        var res = regListenOn.exec(i);
                        if (!res)
                                continue;
                        this.listen(context || this, res[0], localSettings[i]);
                }
        };
 
        Notification.prototype.unListen =function(eventName, callback){
		if ( this.events[eventName] ){
			if (callback){
                        	for (var i=0 ; i < this.garbageEvent[eventName].length ; i++){
                                	if ( this.garbageEvent[eventName][i] === callback ){
						this.events[eventName].splice(i, 1);
						this.garbageEvent[eventName].splice(i, 1);
                                	}
                        	}
			}else{
				return this.clearNotifications(eventName);	
			}
                }else{
			return this.clearNotifications();	
		}
        };

        return {
                notification:Notification,
                /**
                 *
                 *      @method create 
                 *
                 */
                create: function(settings, context) {
                        return new Notification(settings, context);
                }
        };
 
});
/*
 * Depandances PROVIDE :
 * =====================
 */
stage.provide("syslog");
/*
 * Depandances REQUIRE :
 * =====================
 */



/*
 *
 *
 *
 */
stage.register("syslog", function(){


   	/*
    	 * default settings
    	 * <pre>
    	 *   moduleName:      "stage"
    	 *   maxStack:        100
    	 *   rateLimit:       false
    	 *   burstLimit:      3
    	 *   defaultSeverity: "DEBUG"
   	 *   checkConditions: "&&"
   	 *   async:         false
    	 *
    	 * </pre>
    	 */
   	var defaultSettings = {
           	moduleName:"SYSLOG",
		maxStack: 100,
		rateLimit:false,
		burstLimit:3,
		defaultSeverity:"DEBUG",
		checkConditions:"&&",
		async:false
   	};

   	/*
    	 * Severity syslog
    	 * <pre>
    	 *    EMERGENCY   = 0
    	 *    ALERT       = 1
    	 *    CRITIC      = 2
    	 *    ERROR       = 3
    	 *    WARNING     = 4
    	 *    NOTICE      = 5
    	 *    INFO        = 6
    	 *    DEBUG       = 7
    	 * </pre>
    	 */
   	var sysLogSeverity = [
           	"EMERGENCY",
           	"ALERT",
           	"CRITIC",
           	"ERROR",
           	"WARNING",
           	"NOTICE",
           	"INFO",
           	"DEBUG"
   	];
   	sysLogSeverity["EMERGENCY"]=0;
   	sysLogSeverity["ALERT"]=1;
   	sysLogSeverity["CRITIC"]=2;
   	sysLogSeverity["ERROR"]=3;
   	sysLogSeverity["WARNING"]=4;
   	sysLogSeverity["NOTICE"]=5;
   	sysLogSeverity["INFO"]=6;
   	sysLogSeverity["DEBUG"]=7;



   	/**
    	 *  Protocol Data Unit
     	 * @class  PDU
    	 * @constructor
    	 * @module library
    	 * @return {PDU}
    	 */
   	var PDU = function(){
       		var guid = 0;
       		return function(pci, severity, moduleName, msgid, msg, date){
			/* timeStamp @type Date*/
               		this.timeStamp = new Date(date).getTime() || new Date().getTime();
           		/* uid */
               		this.uid =  ++guid;
           		/* severity */
               		this.severity = translateSeverity(severity);
           		/* severityName */
               		this.severityName = sysLogSeverity[this.severity];
            		/* typePayload */
               		this.typePayload = stage.typeOf(pci);
           		/*
             		* protocole controle information
             		* @type Void
             		*/
               		this.payload = pci;
           		/* moduleName */
               		this.moduleName = moduleName;
           		/* msgid */
               		this.msgid = msgid || "";
           		/* msg */
               		this.msg = msg || "";	
       		}
   	}();
   	stage.PDU = PDU;
   	/**
    	 * Get Date in string format
    	 * @method getDate
    	 * @return {String} a date in string format .
    	 */
   	PDU.prototype.getDate = function(){
       		return new Date(this.timeStamp).toTimeString();
   	};

   	/**
    	 * get a string representating the PDU protocole
    	 * @method toString
    	 * @return {String}  .
    	 */
   	PDU.prototype.toString = function(){

       		return  "TimeStamp:"+this.getDate() +
           		"  Log:" +this.payload +
           		"  ModuleName:" +this.moduleName +
           		"  SeverityName:"+this.severityName+
           		"  MessageID:"+this.msgid +
           		"  UID:"+this.uid +
                   	"  Message:"+this.msg;
   	};

	PDU.prototype.parseJson = function(str){
		try {
			var json = JSON.parse(str);
			for (var ele in json){
				if (ele in this){
					this[ele] = json[ele];
				}
			}
		}catch(e){
			throw e
		}
		return json
	};



   	var operators = {
       		"<":function(ele1, ele2){ return ele1 < ele2},
       		">":function(ele1, ele2){ return ele1 > ele2},
       		"<=":function(ele1, ele2){ return ele1 <= ele2},
       		">=":function(ele1, ele2){ return ele1 >= ele2},
       		"==":function(ele1, ele2){ return ele1 === ele2},
       		"!=":function(ele1, ele2){ return ele1 !== ele2},
		"RegExp":function(ele1, ele2){return  ( ele2.test(ele1) )}
   	}

   	var conditionsObj = {
       		severity:function(pdu, condition){
           		if (condition.operator !== "=="){
               			//console.log(pdu.severity);
               			//console.log(condition.data)
               			return  operators[condition.operator](pdu.severity, condition.data)
           		}else{
               			for (var sev in condition.data){
                   			if ( sev === pdu.severityName)
                       				return true
               			}
           		}
           		return false
       		},
       		msgid:function(pdu, condition){
			if (condition.operator !== "=="){
				return operators[condition.operator](pdu.msgid, condition.data)
			}else{
           			for (var sev in condition.data){
               				if ( sev === pdu.msgid)
                   				return true
           			}
			}
           		return false
       		},
       		date:function(pdu, condition){
           		return  operators[condition.operator](pdu.timeStamp, condition.data)
       		}
   	}

   	var logicCondition ={
       		"&&" : function(myConditions, pdu){
           		var res= null
           			for (var ele in myConditions){
               				var res = conditionsObj[ele](pdu, myConditions[ele] )
               					//console.log("condition :" +ele +"  "+res)
               					if ( ! res ){
                   					break;
               					}
           			}
           		return res
       		},
       		"||" : function(myConditions, pdu){
           		var res= null
           			for (var ele in myConditions){
               				var res = conditionsObj[ele](pdu, myConditions[ele] )
               					if ( res ){
                   					break;
               					}
           			}
           		return res
       		}
   	}

   	var checkFormatSeverity = function(ele){
       		var res = false;
       		switch ( stage.typeOf(ele) ){
           		case "string":
               			res = ele.split(/,| /);
           			break;
           		case "number" :
               			res = ele;
           			break;
			default:
				throw new Error("checkFormatSeverity bad format "+stage.typeOf(ele)+" : " + ele);
       		}
       		return res;
   	}

   	var checkFormatDate = function(ele){
       		var res = false;
       		switch ( stage.typeOf(ele) ){
           		case "date":
               			res = ele.getTime();
           			break;
           		case "string":
               			res = new Date(ele);
           			break;
			default:
				throw new Error("checkFormatDate bad format "+stage.typeOf(ele)+" : " + ele);
       		}
       		return res;
   	}

	var checkFormatMsgId = function(ele){
		var res = false;
       		switch ( stage.typeOf(ele) ){
           		case "string":
               			res = ele.split(/,| /);
           			break;
           		case "number" :
               			res = ele;
           			break;
			case "object" :
				if (ele instanceof RegExp ){
					res = ele;
				}
			break;
			default:
				throw new Error("checkFormatMsgId bad format "+stage.typeOf(ele)+" : " + ele);
       		}
       		return res;

	}

   	var severityToString = function(severity){
       		var myint = parseInt(severity,10) ;
       		if (! isNaN(myint)){
           		var ele = sysLogSeverity[myint];
       		}else{
           		var ele = severity;
       		}
       		if (ele in sysLogSeverity)
           		return ele;
        	return false;
   	};


   	var sanitizeConditions = function(settingsCondition){
       		var res = true;
       		if (stage.typeOf(settingsCondition) !== "object" )
           		return false;
       		for (var ele in settingsCondition){
           		if (! ele in conditionsObj){
               			return false;
           		}
           		var condi = settingsCondition[ele];

           		if (condi.operator && ! (condi.operator in operators) ){
				throw new Error("Contitions bad operator : " + condi.operator );
           		}
           		if ( condi.data ){
               			switch (ele){
                   			case "severity":
                       				if (condi.operator){
                           				res = checkFormatSeverity(condi.data);
                           				if (res !== false){
                               					condi.data = sysLogSeverity[severityToString(res[0])];
                           				}else{
                               					return false
                           				}
                       				}else{
                           				condi.operator = "==";
                           				res = checkFormatSeverity(condi.data);
                           				if (res !== false){
                               					condi.data = {};
                               					if (stage.typeOf(res) === "array"){
                                   					for (var i = 0 ; i < res.length; i++){
                                       						var mySeverity = severityToString(res[i]) ;
                                       						if (mySeverity){
                                           						condi.data[mySeverity] = sysLogSeverity[mySeverity];
                                       						}else{
                                           						return false;
                                       						}
                                   					}
                               					}else{
                                   					return false;
                               					}
                           				}else{
                               					return false
                           				}
                       				}
                   				break;
                   			case "msgid":
						if ( ! condi.operator){
							condi.operator = "==";	
						}
						res = checkFormatMsgId(condi.data);
                       				if (res !== false){
                           				if (stage.typeOf(res) === "array"){
								condi.data = {};
                               					for (var i = 0 ; i < res.length; i++){
                                   					condi.data[res[i]] = "||";
                               					}
                           				}else{
								condi.data = res;	
							}
                       				}else{
                           				return false
                       				}
                   				break;
                   			case "date":
                       				res =checkFormatDate(condi.data);
                       				if (res)
                           				condi.data = res;
                       				else
                           				return false;
                   				break;
                   			default:
                       				return false;
               			}
           		}else{
               			return false;
           		}
       		}
       		return settingsCondition ;
       		//console.log(settingsCondition);
   	};


   	var translateSeverity = function(severity){
       		if (severity in sysLogSeverity){
           		if (typeof severity === 'number')
               			var myseverity = sysLogSeverity[sysLogSeverity[severity]]
           		else
               			var myseverity = sysLogSeverity[severity];
       		}else{
			if (! severity)
				return null;
			else
				throw new Error ("not stage syslog severity :"+severity);
       		}
       		return myseverity;
   	};

   	var createPDU = function(payload, severity, moduleName, msgid, msg){
       		if ( ! severity ){
               		var myseverity = sysLogSeverity[this.settings.defaultSeverity];
           	}else{
           		var myseverity = severity;
           	}
       		return new PDU(payload, myseverity,
                           	moduleName,
                           	msgid,
                           	msg);
   	};

   	/**
    	 * A class for product log in stage.
    	 * @example
    	 *
    	 *    var ERROR_DEFINE = {
    	 *       '-101': 'I18N string'
    	 *    };
    	 *
    	 *    var settings = {
    	 *        rateLimit:100,
    	 *        burstLimit:10,
    	 *        moduleName:"LIVE",
    	 *        defaultSeverity:"ERROR"
    	 *    };
   	 *
    	 *    var logIntance = new stage.syslog(settings);
    	 *
    	 *
    	 *    controller.logIntance.listen(context,function(pdu){
    	 *        logView(pdu)
    	 *    } )
    	 *
    	 *    controller.logIntance.listenWithConditions(context,{
    	 *        checkConditions: "&&",
   	 *        severity:{
   	 *            data:"CRITIC,ERROR"
   	 *            //data:"1,7"
   	 *        },
   	 *        date:{
   	 *            operator:">=",
   	 *            data:new Date()
   	 *        },
   	 *        msgid:{
   	 *            data:"myFunction"
   	 *        }
   	 *
    	 *
    	 *    },function(pdu){
    	 *        logView(pdu)
    	 *    } )
    	 *
    	 *
    	 *    var myFunction = function(error){
    	 *        controller.logIntance.logger(error, "ERROR", "myFunction", ERROR_DEFINE[error] );
    	 *    }
    	 *
    	 *
    	 *
    	 *    @class syslog
   	 *    @module library
    	 *    @constructor
    	 *    @param {Object} settings The settings to extend.
    	 *    @return syslog
    	 */
   	var syslog = function(settings){

       		this.mother = this.$super;
       		/*
         	 * mother class notification center
         	 */
       		this.mother.constructor(settings);
       		/**
             	 * extended settings
        	 * @property settings
             	 * @type Object
             	 * @see defaultSettings
             	 */
           	this.settings = stage.extend({},defaultSettings, settings);
       		/**
             	 * ring buffer structure container instances of PDU
        	 * @property ringStack
             	 * @type Array
             	 */
           	this.ringStack = new Array();
       		/**
             	 * Ratelimit  Management log printed
        	 * @property burstPrinted
             	 * @type Number
             	 */
           	this.burstPrinted = 0;
       		/**
             	 * Ratelimit  Management log dropped
        	 * @property missed
             	 * @type Number
             	 */
           	this.missed =0;
       		/**
             	 * Management log invalid
        	 * @property invalid
             	 * @type Number
             	 */
       		this.invalid = 0;

       		/**
             	 * Counter log valid
        	 * @property valid
             	 * @type Number
             	 */
       		this.valid = 0;
       		/**
             	 * Ratelimit  Management begin of burst
        	 * @property start
             	 * @private
             	 * @type Number
             	 */
           	this.start = 0;

       		this.fire = this.settings.async ? this.mother.fireAsync : this.mother.fire ;
   	}.herite(stage.notificationsCenter.notification);



   	syslog.prototype.pushStack = function(pdu){
       		if (this.ringStack.length === this.settings.maxStack){
               		this.ringStack.shift();
           	}
       		var index = this.ringStack.push(pdu);
       		//console.log(this);
       		this.valid++;
       		return index;
   	};
   	/**
     	 * logger message
    	 * @method logger
     	 * @param {void} payload payload for log. protocole controle information
     	 * @param {Number || String} severity severity syslog like.
     	 * @param {String} msgid informations for message. example(Name of function for debug)
     	 * @param {String} msg  message to add in log. example (I18N)
     	 */
   	syslog.prototype.logger = function(payload, severity, msgid, msg){
           	if (this.settings.rateLimit){
               		var now = new Date().getTime();
               		this.start = this.start || now;
               		if (now > this.start + this.settings.rateLimit){
               			this.burstPrinted = 0;
               			this.missed =0;
               			this.start = 0;
               		}
               		if(this.settings.burstLimit && this.settings.burstLimit > this.burstPrinted ){
               			try {
                   			if (payload instanceof  PDU ){
                       				var pdu = payload
                   			}else{
                       				var pdu = createPDU.call(this, payload, severity, this.settings.moduleName, msgid, msg);
                   			}
               			}catch(e){
                   			this.invalid++;
                   			return "INVALID"
               			}
               			this.pushStack( pdu);
               			this.fire("onLog", pdu);
               			this.burstPrinted++;
               			return "ACCEPTED";
               		}
               		this.missed++;
               		return "DROPPED";
           	}else{
           		try {
               			if (payload instanceof  PDU ){
                   			var pdu = payload;
               			}else{
                   			var pdu = createPDU.call(this, payload, severity, this.settings.moduleName, msgid, msg);
               			}
           		}catch(e){
               			this.invalid++;
               			return "INVALID";
           		}
               		this.pushStack( pdu);
               		this.fire("onLog", pdu);
           		return "ACCEPTED";
           	}
   	}



   	/**
     	 * Clear stack of logs
     	 *
     	 * @method clearLogStack
      	 *
      	 *
     	 *
     	 */
   	syslog.prototype.clearLogStack = function(){
       		this.ringStack.length = 0;
   	}

   	/**
     	 * get hitory of stack
    	 * @method getLogStack
      	 * @param {Number} start .
     	 * @param {Number} end .
     	 * @return {array} new array between start end
     	 * @return {PDU} pdu
     	 */
   	syslog.prototype.getLogStack = function(start, end, contition){
		if (contition){
			var stack = this.getLogs(contition) ; 
		}else{
			var stack = this.ringStack ;
		}
           	if ( arguments.length  === 0)
               		return stack[stack.length-1];
           	if ( ! end)
               		return stack.slice(start);
           	if (start === end)
               		return stack[stack.length - start-1];
		return stack.slice(start, end );
   	}


   	/**
     	 * get logs with conditions
    	 * @method getLogs
      	 * @param {Object} conditions .
     	 * @return {array} new array with matches conditions
     	 */
   	syslog.prototype.getLogs = function(conditions, stack){
		var myStack = stack || this.ringStack ;
       		if ( conditions.checkConditions && conditions.checkConditions in logicCondition ){
           		var myFuncCondition = logicCondition[conditions.checkConditions];
           		delete conditions.checkConditions;
       		}else{
           		var myFuncCondition = logicCondition[this.settings.checkConditions];
       		}
       		var tab = [];
		try {
			var Conditions = sanitizeConditions(conditions);
		}catch(e){
			throw new Error("registreNotification conditions format error: "+ e);
		}
       		if (Conditions){
           		for (var i = 0 ; i<myStack.length; i++){
               			var res = myFuncCondition(Conditions,myStack[i])
               				if (res)
                   				tab.push(myStack[i]);
           		}
       		}
       		return tab;
   	};


   	/**
     	 * take the stack and build a JSON string
    	 * @method logToJson
     	 * @return {String} string in JSON format
     	 */
   	syslog.prototype.logToJson = function(conditions){
       		if (conditions)
           		var stack = this.getLogs(conditions)
       		else
           		var stack = this.ringStack
           			return JSON.stringify(stack);
   	};

   	/**
    	 * load the stack as JSON string
   	 * @method loadStack
   	 * @param {Object} json or string stack serialize
	 * @param {boolean} fire conditions events  .
	 * @param {function} callback before fire conditions events
    	 * @return {String}
    	 */
   	syslog.prototype.loadStack = function(stack, doEvent, beforeConditions){
       		if (! stack )
           		throw new Error("syslog loadStack : not stack in arguments ")
               			switch(stage.typeOf(stack)){
                   			case "string" :
                       				try {
							//console.log(stack);
                           				var st = JSON.parse(stack);
                           				return arguments.callee.call(this, st, doEvent);
                       				}catch(e){
                           				throw e;
                       				}
                       				break;
                   			case "array" :
                   			case "object" :
                       				try {
                           				for(var i= 0 ; i<stack.length ; i++){
                               					var pdu = new PDU(stack[i].payload, stack[i].severity, stack[i].moduleName || this.settings.moduleName , stack[i].msgid, stack[i].msg, stack[i].timeStamp)
                                   				this.pushStack( pdu);

                                   				if (doEvent) {
									if (beforeConditions && typeof beforeConditions  === "function")
										beforeConditions.call(this, pdu, stack[i]);
                                       					this.fire("onLog", pdu);
                                   				}
                           				}
                       				}catch(e){
                           				throw e;
                       				}
                       				break;
                   			default :
                       				throw new Error("syslog loadStack : bad stack in arguments type")
               			};
               	return st || stack;
   	};

   	
   	/**
     	 *
     	 *    @method  listenWithConditions
     	 *
     	 */
   	syslog.prototype.listenWithConditions = function(context, conditions, callback  ){
       		if ( conditions.checkConditions && conditions.checkConditions in logicCondition ){
           		var myFuncCondition = logicCondition[conditions.checkConditions];
           		delete conditions.checkConditions;
       		}else{
           		var myFuncCondition = logicCondition[this.settings.checkConditions];
       		}
		try {
			var Conditions = sanitizeConditions(conditions);
		}catch(e){
			throw new Error("registreNotification conditions format error: "+ e);	
		}
       		if (Conditions){
			var func = function(pdu){
               			var res = myFuncCondition(Conditions, pdu)
               			if (res){
                   			callback.apply(context || this, arguments)
               			}
           		};
           		this.mother.listen(this, "onLog", func);
			return func ;
       		}
   	};

	return syslog;

});

/*
 *
 *
 *
 *
 *
 *
 *
 */

stage.register("xml", function(){

	/**
   	* \brief changes the given string to XML doc.
   	*
   	* \param string an XML string
   	* \return  the document  node root
   	*/
  	var stringToDocumentXML = function(){

		if ( ! document.implementation.createDocument){
			return function(str){
				var doc = createDocument();
				doc.async="false";
				doc.loadXML(str);
				return doc;
			}
		}
		
		return function(str){
    			try{
				var oDomDoc = (new DOMParser()).parseFromString(str, 'application/xml');
      			}catch(e){
				throw Error('xml function stringToDocumentXML : '+e);
      			}
			return oDomDoc;
		}
  	}();
  	
  	var getDocumentRoot = function(doc){ 
		var type = stage.typeOf(doc);
		if ( type === "document" ){
			return (doc.documentElement || doc.childNodes[0]);		
		}
		if ( type === "element" ){
			var myDoc = doc.ownerDocument ;
			return (myDoc.documentElement || myDoc.childNodes[0]);
		}
  	};





	//parseXML
	var parseXml = function( xml ){
		switch (stage.typeOf(xml)){
			case "string":
				var root = getDocumentRoot(stringToDocumentXML(xml));
			break;
			case "document":
				var root = getDocumentRoot(xml);
			break;
			case "element":
				var root = xml;
			break;
			default:
				throw new Error("parseXml  bad type arguments");
		
		}
		return parseDOM( root );
	};

	var __force_array = null;
	var parseDOM = function(root){
		if ( ! root ) return null;
		var force_array = null;
		__force_array = {};
        	if ( force_array ) {
            		for( var i=0; i<force_array.length; i++ ) {
                		__force_array[force_array[i]] = 1;
            		}
        	}

        	var json = parseNode( root );   // parse root node
        	if ( __force_array[root.nodeName] ) {
            		json = [ json ];
        	}
        	if ( root.nodeType != 11 ) {            // DOCUMENT_FRAGMENT_NODE
            		var tmp = {};
            		tmp[root.nodeName] = json;          // root nodeName
            		json = tmp;
        	}
        	return json;
	};


	var attr_prefix ="@";
	var name_space = ":";
	var parseNode = function(node){
		if ( ! node ) return null;
		switch( node.nodeType ){
			// COMMENT_NODE
			case 7:
				return null;
			// TEXT_NODE 
			case 3:
			// CDATA_SECTION_NODE
			case 4:
				if ( node.nodeValue.match( /[^\x00-\x20]/ ) )
					return node.nodeValue;
				return null;
			break;		
		}
		var ret = null;
		var data = {};	

		// parse Attributes 
		if ( node.attributes && node.attributes.length ){
			ret = {};
			for ( var i=0; i<node.attributes.length; i++ ) {
				var key = node.attributes[i].nodeName;
                		if ( typeof(key) !== "string" ) continue;
                		var val =  node.attributes[i].value || node.attributes[i].nodeValue;
                		if ( ! val ) continue;
                		key = attr_prefix + key;
                		if ( typeof(data[key]) == "undefined" ) data[key] = 0;
                		data[key] ++;
				addNode( ret, key, data[key], val );
			}
			//console.log(data)
		}

		if ( node.childNodes && node.childNodes.length ) {
            		var textonly = true;
            		if ( ret ) textonly = false;        // some attributes exists
            		for ( var i=0; i<node.childNodes.length && textonly; i++ ) {
                		var ntype = node.childNodes[i].nodeType;
                		if ( ntype == 3 || ntype == 4 ) continue;
                		textonly = false;
            		}
            		if ( textonly ) {
                		if ( ! ret ) ret = "";
                		for ( var i=0; i<node.childNodes.length; i++ ) {
                    			ret += node.childNodes[i].nodeValue;
                		}
            		} else {
                		if ( ! ret ) ret = {};
                		for ( var i=0; i<node.childNodes.length; i++ ) {
                    			var key = node.childNodes[i].nodeName;
                    			if ( typeof(key) !== "string" ) continue;
                    			var val = parseNode( node.childNodes[i] );
                    			if ( ! val ) continue;
                    			if ( typeof(data[key]) === "undefined" ) data[key] = 0;
                    			data[key] ++;
                    			addNode( ret, key, data[key], val );
                		}
            		}
        	}
		return ret;
	};

	var addNode = function ( hash, key, cnts, val ) {
        	key = removeColon(key);
        	if ( __force_array && __force_array[key] ) {
            		if ( cnts == 1 ) hash[key] = [];
            		hash[key][hash[key].length] = val;      // push
        	} else if ( cnts == 1 ) {                   // 1st sibling
            		hash[key] = val;
        	} else if ( cnts == 2 ) {                   // 2nd sibling
            		hash[key] = [ hash[key], val ];
        	} else {                                    // 3rd sibling and more
            		hash[key][hash[key].length] = val;
        	}
	};
	
	var removeColon = function(name){
		return name ? (name.replace(':',name_space)): name;
	};



	return {
		parseXml:parseXml,
		//parseNode:parseDOM,
	  	stringToDocumentXML : stringToDocumentXML ,
	  	//getDocumentRoot :getDocumentRoot
	
	
	}


});
/*
 *
 *
 *
 *
 *
 *
 *
 *
 *
 */
stage.provide("io");



stage.require("jquery");



stage.register("io",function(){




	var isSameOrigin = function (url) {
		var loc = window.location;
		var a = urlToOject(url);
		return a.hostname == loc.hostname &&
			a.port == loc.port &&
			a.protocol == loc.protocol;
	};

	var isSecure = function(url){
		var loc = window.location;
		var a = urlToOject(url);
		return a.protocol === "https:" ;
	}

	/*
 	 *
 	 *   CLASS AUTHENTICATE
 	 *
 	 *
 	 *	EVENTS
 	 *
 	 *	onError: 
 	 *
 	 *
 	 *	onSuccess:
 	 *
 	 *
 	 */

	var authenticate = function(url, request, settings ){
		this.url = typeof url === "object" ? url : stage.io.urlToOject(url) ;
		this.crossDomain = ! stage.io.isSameOrigin(url);
		// notification center
		this.notificationCenter = stage.notificationsCenter.create(settings);
		// get header WWW-Authenticate
		var authenticate = request["WWW-Authenticate"].split(" ") ;
		//  get type authentification
		var authType = Array.prototype.shift.call(authenticate);
		var headers = request["WWW-Authenticate"].replace(authType+" ","") 
		//console.log(authType);
		this.method = "POST";
		var body = request.body;

		// intance of authentication
		var auth = this.getAuthenticationType(authType);
		this.authentication = new auth(this.url,  this.method, headers, body )
		this.ajax = false;
		if (settings.ajax){
			this.ajax = true;
		}
	};

	authenticate.prototype.getAuthenticationType = function(type){
		if (type in stage.io.authentication){
			return stage.io.authentication[type];
		}else{
			throw new Error("SSE client can't negociate : "+type )
		}
	};

	authenticate.prototype.register = function(username, password){

		var line = this.authentication.getAuthorization(username, password);
		this.notificationCenter.fire("onRegister", this, line);	
		if (this.ajax){
			$.ajax({
				type:		this.method,
				url:		this.url.href,
				cache:		false,
				crossDomain:	this.crossDomain ? false : true ,
				error:function(obj, type, message){
					this.notificationCenter.fire("onError", obj, type, message);	
				}.bind(this),
				beforeSend:function(xhr){
					xhr.setRequestHeader("Authorization", line );
					//if (this.crossDomain)
						//xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
				}.bind(this),
				success:function(data, state, obj){
					this.notificationCenter.fire("onSuccess", data, state, obj);
				}.bind(this)
			});
		}		
	};


	/**
 	 * We need our custom method because encodeURIComponent is too aggressive and doesn't follow
 	 * http://www.ietf.org/rfc/rfc3986.txt with regards to the character set (pchar) allowed in path
 	 * segments:
 	 *    segment       = *pchar
 	 *    pchar         = unreserved / pct-encoded / sub-delims / ":" / "@"
 	 *    pct-encoded   = "%" HEXDIG HEXDIG
 	 *    unreserved    = ALPHA / DIGIT / "-" / "." / "_" / "~"
 	 *    sub-delims    = "!" / "$" / "&" / "'" / "(" / ")"
 	 *                     / "*" / "+" / "," / ";" / "="
 	 */
	 var encodeUriSegment = function(val) {
  		return encodeUriQuery(val, true).
             		replace(/%26/gi, '&').
             		replace(/%3D/gi, '=').
             		replace(/%2B/gi, '+');
	};


	/**
 	 * This method is intended for encoding *key* or *value* parts of query component. We need a custom
 	 * method because encodeURIComponent is too aggressive and encodes stuff that doesn't have to be
 	 * encoded per http://tools.ietf.org/html/rfc3986:
 	 *    query       = *( pchar / "/" / "?" )
 	 *    pchar         = unreserved / pct-encoded / sub-delims / ":" / "@"
 	 *    unreserved    = ALPHA / DIGIT / "-" / "." / "_" / "~"
 	 *    pct-encoded   = "%" HEXDIG HEXDIG
 	 *    sub-delims    = "!" / "$" / "&" / "'" / "(" / ")"
 	 *                     / "*" / "+" / "," / ";" / "="
 	 */
	 var encodeUriQuery = function (val, pctEncodeSpaces) {
  		return encodeURIComponent(val).
             		replace(/%40/gi, '@').
             		replace(/%3A/gi, ':').
             		replace(/%24/g, '$').
             		replace(/%2C/gi, ',').
             		replace(/%3B/gi, ';').
             		replace(/%20/g, (pctEncodeSpaces ? '%20' : '+'));
	};

	
	var regSearch = /^\?(.*)/ ;
	var parseKeyValue = function(search){
		//console.log(search)
		var test = regSearch.exec(search) ;
		//console.log(test)
		if (test){
			search = test[1];	
		}
		var obj = {}, key_value, key;
		var tab = (search|| "").split('&') ;
		if (tab.length){
			for (var i = 0 ; i< tab.length;i++){
				try {
					var key_value = tab[i].replace(/\+/g,'%20').split('=');
					var key = decodeURIComponent(key_value[0]); 
					//console.log(key_value)
					//console.log(key)
					if ( key ){
						var val =  decodeURIComponent(key_value[1])
						if ( ! Object.prototype.hasOwnProperty.call(obj, key) ){
							obj[key] = val;
						}else{
							switch (stage.typeOf(obj[key])){
								case "array":
									obj[key].push(val);
								break;
								default:
									obj[key] = [obj[key],val];
							}
						}
					}
				}catch (e){
					//invalid
				}
			}
		}
		return obj	
	};

	var toKeyValue = function(obj){
		var parts = [];
		for (var ele in obj){
			switch(stage.typeOf(obj[ele])){
				case "array":
					for (var i = 0 ; i<obj[ele].length ;i++){
						parts.push(encodeUriQuery(ele, true) + (obj[ele][i] === true ? '' : '=' + encodeUriQuery(obj[ele][i], true)));	
					}
				break;
				case "string":
				case "boolean":
					parts.push( encodeUriQuery(ele, true) + (obj[ele] === true ? '' : '=' + encodeUriQuery(obj[ele], true)) );
				break;
				default:
					continue ;
			}
		}
		return parts.length ? parts.join('&') : '';
  	};


	var getHeaderJSON = function(xhr) {
  		var json = xhr.getResponseHeader("X-Json"); 
  		if (json) {
			try {
				return JSON.parse(json)
			}catch(e){
				return json;
			}
  		}
		return null;
	};

   

	var urlToOject = function(url){
		var result = {};

		var anchor = document.createElement('a');
		anchor.href = url;

		var keys = 'protocol hostname host pathname port search hash href'.split(' ');
		for (keyIndex in keys) {
			var currentKey = keys[keyIndex]; 
			result[currentKey] = anchor[currentKey];
		}

		result.toString = function() { return anchor.href; };
		result.requestUri = result.pathname + result.search;  

		result.basename = result.pathname.replace(/\\/g,'/').replace( /.*\//, '' ) ;
		result.dirname = result.pathname.replace(/\\/g,'/').replace(/\/[^\/]*$/, '') ;

		return result;	
	};

	var nativeWebSocket = window.WebSocket  ? true : false ; 

	var transportCore = function(url, settings, context){
		this.$super.constructor(settings, context || this);	
		// Manage Url
		if (url){
			this.url = urlToOject(url);
			this.crossDomain = !isSameOrigin(url);
			this.error = null;
		}else{
			this.fire("onError", new Error("Transport URL not defined") );
		}
	}.herite(stage.notificationsCenter.notification);

	return {
		nativeWebSocket: nativeWebSocket,
		urlToOject: urlToOject,
		parseKeyValue:parseKeyValue,
		toKeyValue:toKeyValue,
		encodeUriSegment:encodeUriSegment,
		encodeUriQuery:encodeUriQuery,
		getHeaderJSON: getHeaderJSON,
		isSameOrigin: isSameOrigin,
		isSecure:isSecure,
		protocols: {},
		authentication: {
			authenticate: authenticate,
			mechanisms: {}
		},
		transport: transportCore,
		transports: {}
	}

});


/*
 *
 *
 *
 *
 *
 *
 *
 */
stage.provide("base64");



stage.register.call(stage.crypto, "base64", function(){

	// private property
	var _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

	// public method for encoding
	var encode64 = function (input) {
		var output = "";
		var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
		var i = 0;

		input = _utf8_encode(input);

		while (i < input.length) {

			chr1 = input.charCodeAt(i++);
			chr2 = input.charCodeAt(i++);
			chr3 = input.charCodeAt(i++);

			enc1 = chr1 >> 2;
			enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
			enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
			enc4 = chr3 & 63;

			if (isNaN(chr2)) {
        			enc3 = enc4 = 64;
			} else if (isNaN(chr3)) {
        			enc4 = 64;
			}

			output = output +
			_keyStr.charAt(enc1) + _keyStr.charAt(enc2) +
			_keyStr.charAt(enc3) + _keyStr.charAt(enc4);

		}
		return output;
	};

    	// public method for decoding
	var decode64 = function (input) {
        	 var output = "";
        	 var chr1, chr2, chr3;
        	 var enc1, enc2, enc3, enc4;
        	 var i = 0;

        	 input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

        	 while (i < input.length) {

            		 enc1 = _keyStr.indexOf(input.charAt(i++));
            		 enc2 = _keyStr.indexOf(input.charAt(i++));
            		 enc3 = _keyStr.indexOf(input.charAt(i++));
            		 enc4 = _keyStr.indexOf(input.charAt(i++));

            		 chr1 = (enc1 << 2) | (enc2 >> 4);
            		 chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            		 chr3 = ((enc3 & 3) << 6) | enc4;

            		 output = output + String.fromCharCode(chr1);

            		 if (enc3 != 64) {
                		 output = output + String.fromCharCode(chr2);
            		 }
            		 if (enc4 != 64) {
                		 output = output + String.fromCharCode(chr3);
            		 }

        	 }

        	 if (i != input.length) {
			 throw new Error ("BASE64_BROKEN : There were invalid base64 characters in the input text.\n" +
	              			"Valid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\n" +
	              			"Expect errors in decoding.");
        	 }

        	 output = _utf8_decode(output);

        	 return output;

    	 };

	
	var decode =  function(input, arrayBuffer) {
		//get last chars to see if are valid
		var lkey1 = _keyStr.indexOf(input.charAt(input.length-1));		 
		var lkey2 = _keyStr.indexOf(input.charAt(input.length-2));		 

		var bytes = (input.length/4) * 3;
		if (lkey1 == 64) bytes--; //padding chars, so skip
		if (lkey2 == 64) bytes--; //padding chars, so skip

		var uarray;
		var chr1, chr2, chr3;
		var enc1, enc2, enc3, enc4;
		var i = 0;
		var j = 0;

		if (arrayBuffer)
			uarray = new Uint8Array(arrayBuffer);
		else
			uarray = new Uint8Array(bytes);

		input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

		for (i=0; i<bytes; i+=3) {	
			//get the 3 octects in 4 ascii chars
			enc1 = _keyStr.indexOf(input.charAt(j++));
			enc2 = _keyStr.indexOf(input.charAt(j++));
			enc3 = _keyStr.indexOf(input.charAt(j++));
			enc4 = _keyStr.indexOf(input.charAt(j++));

			chr1 = (enc1 << 2) | (enc2 >> 4);
			chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
			chr3 = ((enc3 & 3) << 6) | enc4;

			uarray[i] = chr1;			
			if (enc3 != 64) uarray[i+1] = chr2;
			if (enc4 != 64) uarray[i+2] = chr3;
		}
		return uarray;	
	}




    	 // private method for UTF-8 encoding
	var _utf8_encode = function (string) {
        	string = string.replace(/\r\n/g,"\n");
        	var utftext = "";

        	for (var n = 0; n < string.length; n++) {

            		var c = string.charCodeAt(n);

            		if (c < 128) {
                		utftext += String.fromCharCode(c);
            		}
            		else if((c > 127) && (c < 2048)) {
                		utftext += String.fromCharCode((c >> 6) | 192);
                		utftext += String.fromCharCode((c & 63) | 128);
            		}
            		else {
                		utftext += String.fromCharCode((c >> 12) | 224);
                		utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                		utftext += String.fromCharCode((c & 63) | 128);
            		};

        	};
        	return utftext;
    	};

    	// private method for UTF-8 decoding
	var _utf8_decode = function(utftext){
        	var string = "";
        	var i = 0;
        	var c = 0;
		//var c1 = 0;
		var c2 = 0;

        	while ( i < utftext.length ) {

            		c = utftext.charCodeAt(i);

            		if (c < 128) {
                		string += String.fromCharCode(c);
                		i++;
            		}
            		else if((c > 191) && (c < 224)) {
                		c2 = utftext.charCodeAt(i+1);
                		string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                		i += 2;
            		}
            		else {
                		c2 = utftext.charCodeAt(i+1);
                		var c3 = utftext.charCodeAt(i+2);
                		string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                		i += 3;
            		}

        	}
        	return string;
    	};


	/* will return a  Uint8Array type */
	var decodeArrayBuffer =  function(input) {
		var bytes = (input.length/4) * 3;
		var ab = new ArrayBuffer(bytes);
		decode(input, ab);
		return ab;
	};


	return {
		decodeArrayBuffer:decodeArrayBuffer,
		encode:encode64,
		decode:decode64
	}
});




/*
 * A JavaScript implementation of the RSA Data Security, Inc. MD5 Message
 * Digest Algorithm, as defined in RFC 1321.
 * Version 2.2 Copyright (C) Paul Johnston 1999 - 2009
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 * Distributed under the BSD License
 * See http://pajhome.org.uk/crypt/md5 for more info.
 */
stage.provide("md5");


stage.register.call(stage.crypto, "md5", function(){

	/*
 	 * Configurable variables. You may need to tweak these to be compatible with
 	 * the server-side, but the defaults work in most cases.
 	 */
	var hexcase = 0;   /* hex output format. 0 - lowercase; 1 - uppercase        */
	var b64pad  = "";  /* base-64 pad character. "=" for strict RFC compliance   */

	/*
 	 * Perform a simple self-test to see if the VM is working
 	 */
	var md5_vm_test = function()
	{
  		return hex_md5("abc").toLowerCase() == "900150983cd24fb0d6963f7d28e17f72";
	}

	/*
 	* Calculate the MD5 of a raw string
 	*/
	var rstr_md5 = function(s)
	{
  		return binl2rstr(binl_md5(rstr2binl(s), s.length * 8));
	}

	/*
 	* Calculate the HMAC-MD5, of a key and some data (raw strings)
 	*/
	var rstr_hmac_md5 = function (key, data)
	{
  		var bkey = rstr2binl(key);
  		if(bkey.length > 16) bkey = binl_md5(bkey, key.length * 8);

  		var ipad = Array(16), opad = Array(16);
  		for(var i = 0; i < 16; i++)
  		{
    			ipad[i] = bkey[i] ^ 0x36363636;
    			opad[i] = bkey[i] ^ 0x5C5C5C5C;
  		}

  		var hash = binl_md5(ipad.concat(rstr2binl(data)), 512 + data.length * 8);
  		return binl2rstr(binl_md5(opad.concat(hash), 512 + 128));
	}



	/*
 	 * Convert a raw string to a hex string
 	 */
	var rstr2hex = function(input)
	{
  		//try { hexcase } catch(e) { hexcase=0; }
  		var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
  		var output = "";
  		var x;
  		for(var i = 0; i < input.length; i++)
  		{
    			x = input.charCodeAt(i);
    			output += hex_tab.charAt((x >>> 4) & 0x0F)
           			+  hex_tab.charAt( x        & 0x0F);
  		}
  		return output;
	}

	/*
 	 * Convert a raw string to a base-64 string
 	 */
	var rstr2b64 = function(input)
	{
  		//try { b64pad } catch(e) { b64pad=''; }
  		var tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  		var output = "";
  		var len = input.length;
  		for(var i = 0; i < len; i += 3)
  		{
    			var triplet = (input.charCodeAt(i) << 16)
                		| (i + 1 < len ? input.charCodeAt(i+1) << 8 : 0)
                		| (i + 2 < len ? input.charCodeAt(i+2)      : 0);
    			for(var j = 0; j < 4; j++)
    			{
      				if(i * 8 + j * 6 > input.length * 8) output += b64pad;
      				else output += tab.charAt((triplet >>> 6*(3-j)) & 0x3F);
    			}
  		}
  		return output;
	}

	/*
 	 * Convert a raw string to an arbitrary string encoding
 	 */
	var rstr2any = function (input, encoding)
	{
  		var divisor = encoding.length;
  		var i, j, q, x, quotient;

  		/* Convert to an array of 16-bit big-endian values, forming the dividend */
  		var dividend = Array(Math.ceil(input.length / 2));
  		for(i = 0; i < dividend.length; i++)
  		{
    			dividend[i] = (input.charCodeAt(i * 2) << 8) | input.charCodeAt(i * 2 + 1);
  		}

  		/*
   		 * Repeatedly perform a long division. The binary array forms the dividend,
   		 * the length of the encoding is the divisor. Once computed, the quotient
   		 * forms the dividend for the next step. All remainders are stored for later
   		 * use.
   		 */
  		var full_length = Math.ceil(input.length * 8 /
                                (Math.log(encoding.length) / Math.log(2)));
  		var remainders = Array(full_length);
  		for(j = 0; j < full_length; j++)
  		{
    			quotient = Array();
    			x = 0;
    			for(i = 0; i < dividend.length; i++)
    			{
      				x = (x << 16) + dividend[i];
      				q = Math.floor(x / divisor);
      				x -= q * divisor;
      				if(quotient.length > 0 || q > 0)
        				quotient[quotient.length] = q;
    			}
    			remainders[j] = x;
    			dividend = quotient;
  		}

  		/* Convert the remainders to the output string */
  		var output = "";
  		for(i = remainders.length - 1; i >= 0; i--)
    			output += encoding.charAt(remainders[i]);

  		return output;
	}
	
	/*
 	 * Encode a string as utf-8.
 	 * For efficiency, this assumes the input is valid utf-16.
 	 */
	var str2rstr_utf8 = function (input)
	{
  		var output = "";
  		var i = -1;
  		var x, y;

  		while(++i < input.length)
  		{
    			/* Decode utf-16 surrogate pairs */
    			x = input.charCodeAt(i);
    			y = i + 1 < input.length ? input.charCodeAt(i + 1) : 0;
    			if(0xD800 <= x && x <= 0xDBFF && 0xDC00 <= y && y <= 0xDFFF)
    			{
      				x = 0x10000 + ((x & 0x03FF) << 10) + (y & 0x03FF);
      				i++;
    			}

    			/* Encode output as utf-8 */
    			if(x <= 0x7F)
      				output += String.fromCharCode(x);
    			else if(x <= 0x7FF)
      				output += String.fromCharCode(0xC0 | ((x >>> 6 ) & 0x1F),
                                    		0x80 | ( x         & 0x3F));
    			else if(x <= 0xFFFF)
      				output += String.fromCharCode(0xE0 | ((x >>> 12) & 0x0F),
                                    		0x80 | ((x >>> 6 ) & 0x3F),
                                    		0x80 | ( x         & 0x3F));
    			else if(x <= 0x1FFFFF)
      				output += String.fromCharCode(0xF0 | ((x >>> 18) & 0x07),
                                    		0x80 | ((x >>> 12) & 0x3F),
                                    		0x80 | ((x >>> 6 ) & 0x3F),
                                    		0x80 | ( x         & 0x3F));
  		}
  		return output;
	}

	/*
 	 * Encode a string as utf-16
 	 */
	var str2rstr_utf16le = function (input)
	{
  		var output = "";
  		for(var i = 0; i < input.length; i++)
    			output += String.fromCharCode( input.charCodeAt(i)        & 0xFF,
                                  	(input.charCodeAt(i) >>> 8) & 0xFF);
  		return output;
	}

	var str2rstr_utf16be = function (input)
	{
  		var output = "";
  		for(var i = 0; i < input.length; i++)
    			output += String.fromCharCode((input.charCodeAt(i) >>> 8) & 0xFF,
                                   	input.charCodeAt(i)        & 0xFF);
  		return output;
	}

	/*
 	 * Convert a raw string to an array of little-endian words
 	 * Characters >255 have their high-byte silently ignored.
 	 */
	var rstr2binl = function (input)
	{
  		var output = Array(input.length >> 2);
  		for(var i = 0; i < output.length; i++)
    			output[i] = 0;
  		for(var i = 0; i < input.length * 8; i += 8)
    			output[i>>5] |= (input.charCodeAt(i / 8) & 0xFF) << (i%32);
  		return output;
	}

	/*
 	 * Convert an array of little-endian words to a string
 	 */
	var binl2rstr = function (input)
	{
  		var output = "";
  		for(var i = 0; i < input.length * 32; i += 8)
    			output += String.fromCharCode((input[i>>5] >>> (i % 32)) & 0xFF);
  		return output;
	}

	/*
 	 * Calculate the MD5 of an array of little-endian words, and a bit length.
 	 */
	var binl_md5 = function (x, len)
	{
  		/* append padding */
  		x[len >> 5] |= 0x80 << ((len) % 32);
  		x[(((len + 64) >>> 9) << 4) + 14] = len;

  		var a =  1732584193;
  		var b = -271733879;
  		var c = -1732584194;
  		var d =  271733878;

  		for(var i = 0; i < x.length; i += 16)
  		{
    			var olda = a;
    			var oldb = b;
    			var oldc = c;
    			var oldd = d;

    			a = md5_ff(a, b, c, d, x[i+ 0], 7 , -680876936);
    			d = md5_ff(d, a, b, c, x[i+ 1], 12, -389564586);
    			c = md5_ff(c, d, a, b, x[i+ 2], 17,  606105819);
    			b = md5_ff(b, c, d, a, x[i+ 3], 22, -1044525330);
    			a = md5_ff(a, b, c, d, x[i+ 4], 7 , -176418897);
    			d = md5_ff(d, a, b, c, x[i+ 5], 12,  1200080426);
    			c = md5_ff(c, d, a, b, x[i+ 6], 17, -1473231341);
    			b = md5_ff(b, c, d, a, x[i+ 7], 22, -45705983);
    			a = md5_ff(a, b, c, d, x[i+ 8], 7 ,  1770035416);
    			d = md5_ff(d, a, b, c, x[i+ 9], 12, -1958414417);
    			c = md5_ff(c, d, a, b, x[i+10], 17, -42063);
    			b = md5_ff(b, c, d, a, x[i+11], 22, -1990404162);
    			a = md5_ff(a, b, c, d, x[i+12], 7 ,  1804603682);
    			d = md5_ff(d, a, b, c, x[i+13], 12, -40341101);
    			c = md5_ff(c, d, a, b, x[i+14], 17, -1502002290);
    			b = md5_ff(b, c, d, a, x[i+15], 22,  1236535329);

    			a = md5_gg(a, b, c, d, x[i+ 1], 5 , -165796510);
    			d = md5_gg(d, a, b, c, x[i+ 6], 9 , -1069501632);
    			c = md5_gg(c, d, a, b, x[i+11], 14,  643717713);
    			b = md5_gg(b, c, d, a, x[i+ 0], 20, -373897302);
    			a = md5_gg(a, b, c, d, x[i+ 5], 5 , -701558691);
    			d = md5_gg(d, a, b, c, x[i+10], 9 ,  38016083);
    			c = md5_gg(c, d, a, b, x[i+15], 14, -660478335);
    			b = md5_gg(b, c, d, a, x[i+ 4], 20, -405537848);
    			a = md5_gg(a, b, c, d, x[i+ 9], 5 ,  568446438);
    			d = md5_gg(d, a, b, c, x[i+14], 9 , -1019803690);
    			c = md5_gg(c, d, a, b, x[i+ 3], 14, -187363961);
    			b = md5_gg(b, c, d, a, x[i+ 8], 20,  1163531501);
    			a = md5_gg(a, b, c, d, x[i+13], 5 , -1444681467);
    			d = md5_gg(d, a, b, c, x[i+ 2], 9 , -51403784);
    			c = md5_gg(c, d, a, b, x[i+ 7], 14,  1735328473);
    			b = md5_gg(b, c, d, a, x[i+12], 20, -1926607734);

    			a = md5_hh(a, b, c, d, x[i+ 5], 4 , -378558);
    			d = md5_hh(d, a, b, c, x[i+ 8], 11, -2022574463);
    			c = md5_hh(c, d, a, b, x[i+11], 16,  1839030562);
    			b = md5_hh(b, c, d, a, x[i+14], 23, -35309556);
    			a = md5_hh(a, b, c, d, x[i+ 1], 4 , -1530992060);
    			d = md5_hh(d, a, b, c, x[i+ 4], 11,  1272893353);
    			c = md5_hh(c, d, a, b, x[i+ 7], 16, -155497632);
    			b = md5_hh(b, c, d, a, x[i+10], 23, -1094730640);
    			a = md5_hh(a, b, c, d, x[i+13], 4 ,  681279174);
    			d = md5_hh(d, a, b, c, x[i+ 0], 11, -358537222);
    			c = md5_hh(c, d, a, b, x[i+ 3], 16, -722521979);
    			b = md5_hh(b, c, d, a, x[i+ 6], 23,  76029189);
    			a = md5_hh(a, b, c, d, x[i+ 9], 4 , -640364487);
    			d = md5_hh(d, a, b, c, x[i+12], 11, -421815835);
    			c = md5_hh(c, d, a, b, x[i+15], 16,  530742520);
    			b = md5_hh(b, c, d, a, x[i+ 2], 23, -995338651);

    			a = md5_ii(a, b, c, d, x[i+ 0], 6 , -198630844);
    			d = md5_ii(d, a, b, c, x[i+ 7], 10,  1126891415);
    			c = md5_ii(c, d, a, b, x[i+14], 15, -1416354905);
    			b = md5_ii(b, c, d, a, x[i+ 5], 21, -57434055);
    			a = md5_ii(a, b, c, d, x[i+12], 6 ,  1700485571);
    			d = md5_ii(d, a, b, c, x[i+ 3], 10, -1894986606);
    			c = md5_ii(c, d, a, b, x[i+10], 15, -1051523);
    			b = md5_ii(b, c, d, a, x[i+ 1], 21, -2054922799);
    			a = md5_ii(a, b, c, d, x[i+ 8], 6 ,  1873313359);
    			d = md5_ii(d, a, b, c, x[i+15], 10, -30611744);
    			c = md5_ii(c, d, a, b, x[i+ 6], 15, -1560198380);
    			b = md5_ii(b, c, d, a, x[i+13], 21,  1309151649);
    			a = md5_ii(a, b, c, d, x[i+ 4], 6 , -145523070);
    			d = md5_ii(d, a, b, c, x[i+11], 10, -1120210379);
    			c = md5_ii(c, d, a, b, x[i+ 2], 15,  718787259);
    			b = md5_ii(b, c, d, a, x[i+ 9], 21, -343485551);

    			a = safe_add(a, olda);
    			b = safe_add(b, oldb);
    			c = safe_add(c, oldc);
    			d = safe_add(d, oldd);
  		}
  		return Array(a, b, c, d);
	}

	/*
 	 * These functions implement the four basic operations the algorithm uses.
 	 */
	var md5_cmn = function (q, a, b, x, s, t)
	{
  		return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s),b);
	}
	var md5_ff = function (a, b, c, d, x, s, t)
	{
  		return md5_cmn((b & c) | ((~b) & d), a, b, x, s, t);
	}
	var md5_gg = function (a, b, c, d, x, s, t)
	{
  		return md5_cmn((b & d) | (c & (~d)), a, b, x, s, t);
	}
	var md5_hh = function (a, b, c, d, x, s, t)
	{
  		return md5_cmn(b ^ c ^ d, a, b, x, s, t);
	}
	var md5_ii = function (a, b, c, d, x, s, t)
	{
  		return md5_cmn(c ^ (b | (~d)), a, b, x, s, t);
	}

	/*
 	 * Add integers, wrapping at 2^32. This uses 16-bit operations internally
 	 * to work around bugs in some JS interpreters.
 	 */
	var safe_add = function (x, y)
	{
  		var lsw = (x & 0xFFFF) + (y & 0xFFFF);
  		var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
  		return (msw << 16) | (lsw & 0xFFFF);
	}

	/*
 	 * Bitwise rotate a 32-bit number to the left.
 	 */
	var bit_rol = function (num, cnt)
	{
  		return (num << cnt) | (num >>> (32 - cnt));
	}

	return {
 		hex_md5:function(s){ 
			return rstr2hex(rstr_md5(str2rstr_utf8(s)));
		},
		hex_md5_noUTF8:function(s){ 
			return rstr2hex(rstr_md5(s)); 
		},
		str_md5:function(s){ 
			return rstr_md5(str2rstr_utf8(s)); 
		},
 		b64_md5:function(s){ 
			return rstr2b64(rstr_md5(str2rstr_utf8(s)));
		},
 		any_md5:function(s, e){
			return rstr2any(rstr_md5(str2rstr_utf8(s)), e); 
		},
 		hex_hmac_md5:function(k, d){
			return rstr2hex(rstr_hmac_md5(str2rstr_utf8(k), str2rstr_utf8(d))); 
		},
		str_hmac_md5:function(k, d){
			return rstr_hmac_md5(str2rstr_utf8(k), str2rstr_utf8(d)); 
		},
 		b64_hmac_md5:function(k, d){
			return rstr2b64(rstr_hmac_md5(str2rstr_utf8(k), str2rstr_utf8(d)));
		},
 		any_hmac_md5:function(k, d, e){ 
			return rstr2any(rstr_hmac_md5(str2rstr_utf8(k), str2rstr_utf8(d)), e);
		}
	}
})

/*
 *
 *
 *
 *
 *
 *
 *
 *
 *
 */
stage.provide("digest-md5");


stage.require("md5");
stage.require("base64");


stage.register.call(stage.io.authentication.mechanisms, "Digest",function(){

	var keyWord= {
		realm:true,
		qop:true,
		charset:true,
		algorithm:true,
		nonce:true
	}

	var reg =/^([^=]+)=(.+)$/;
	var parserAuthenticate = function(str){
		var ret = str.replace(/"/g,"");
		ret = ret.replace(/Digest /g,"");
		var head = ret.split(",");
		var obj = {}
		for (var i= 0 ; i < head.length ; i++){
			var res = reg.exec(head[i]);
			if (res && res[1])
				obj[res[1]] = res[2]
		}	
		return obj
	}

	var MD5 = stage.crypto.md5.hex_md5_noUTF8 ;
	var BASE64 = stage.crypto.base64.encode ;
	var DBASE64 = stage.crypto.base64.decode;

	var generateA1 = function(username, realm, password, nonce, cnonce){
		if (cnonce)
			var A1 = username + ":" + realm + ":" + password + ":" + nonce+ ":" + cnonce ;
		else
			var A1 = username + ":" + realm + ":" + password ;//+ ":" + nonce ;
		return MD5(A1); 
	};

	var generateA2 = function(method, uri, entity_body, qop){
		var A2 = "";
		if( ! qop || qop ===  "auth"){
			A2 = method +":" + uri ;
		} else if(qop === "auth-int"){
			if( entity_body ){
				var entity = MD5(entity_body);
				A2 = method + ":" + uri + ":" + entity ; 
			}else{
				A2 = method + ":" + uri + ":" + "d41d8cd98f00b204e9800998ecf8427e" ;
			}
		}
		return MD5(A2);
	};

	var responseDigest = function(A1, nonce, noncecount, cnonce, qop, A2){
		var res = "";
		if(qop === "auth" || qop === "auth-int"){
			res = A1 + ":" + nonce +":" + noncecount +":" + cnonce +":" + qop + ":" + A2 ;
		}else{
			res = A1 + ":" + nonce + ":" + A2 ;
		}
		return MD5(res);
	};


	var digestMd5 = function(url, method, headers, body){
		this.method = method ;
		this.entity_body = body;
		this.url = url;
		this.uri = this.url.requestUri;
		this.protocol = this.url.protocol.replace(":","");
		this.host = this.url.host;
		switch (typeof headers){
			case "object":
				this.parseChallenge(headers);
 			break;	
			default:
				throw new Error("digetMD5 bad format header")
		}
	}

	digestMd5.prototype.parseChallenge = function(headers){
		//console.log(headers)
		var parsing = {};
		switch (typeof headers){
			case "string" : 
			//TODO
				throw new Error("digetMD5 bad format challenge")
			break;	
			case "object" :
				for (var ele in headers ){
					switch (ele){
						case "challenge":
							if (typeof headers.challenge === "string"){
								try{
									this.challengeB64 = DBASE64(headers.challenge);
								}catch(e){
									this.challengeB64 = headers.challenge ;
									//throw new Error("DIGEST MD5 ERROR DECODE BAS64")	
								}
							
							}
						break;
						default:
							parsing[ele] = headers[ele];
							
					};
				}
			break;	
			default:
				throw new Error("digetMD5 bad format challenge")
		}
		var challenge = stage.extend(parserAuthenticate(this.challengeB64), parsing )
		//var challenge = parserAuthenticate(this.challengeB64);
		//console.log(challenge)
		for (var name in challenge){
			if (name in keyWord){
				this[name] = challenge[name];
			}else{
				console.warn("digestMd5 parser challenge header name dropped: "+name)
			}	
		}
	};


	digestMd5.prototype.generateAuthorization = function(username, password){

		var line = 'Digest username="'+username+'"';
		if (! this.realm){
			this.realm = username+"@"+this.url.host ;
		}

		var res ={
			nonce:'"'+this.nonce+'"',
			realm:'"'+this.realm+'"',
			response:null
		}

		this["digest-uri"] = this.protocol+"/"+this.host;
		//this["digest-uri"] = '"'+this.protocol+"/"+this.uri+'"';

		res["digest-uri"] = '"'+this["digest-uri"]+'"';

		/*if (this.charset){
			res["charset"]=this.charset;
		}*/

		if (this.qop){
			this.cnonce = BASE64( Math.floor( (Math.random()*100000000)) .toString() ) ;
			res["cnonce"]='"'+this.cnonce+'"';
			res["qop"]=this.qop;
		}
		if (this.opaque){
			res["opaque"]=this.opaque;
		}

		this.nc = "00000001";
		res["nc"]=this.nc;

		this.A1 = generateA1(username, this.realm, password/*, this.nonce, this.cnonce*/);	
		this.A2 = generateA2(this.method, this["digest-uri"], this.entity_body, this.qop);


		res.response = responseDigest(this.A1, this.nonce, this.nc, this.cnonce, this.qop, this.A2);	
		// generate Authorization 

		for (var ele in res){
			line+=","+ele+"="+res[ele];
		}
		//console.log(line)
		var toSend = BASE64(line);
		return toSend
				
	};


	stage.io.authentication["Digest"] = digestMd5 ;
	

	return digestMd5

})
/*
 *
 *
 *
 *
 *
 *
 *
 *
 *
 */
stage.provide("sasl");


stage.require("io");
stage.require("digest-md5");


stage.register.call(stage.io.authentication, "SASL",function(){

	

	var reg =/^([^=]+)=(.+)$/;
	var parserSasl = function(str){
		//console.log(str)
		var ret = str.replace(/"/g,"");
		var head = ret.split(",");
		var obj = {}
		for (var i= 0 ; i < head.length ; i++){
			var res = reg.exec(head[i])
			if (res && res[1])
				obj[res[1]] = res[2]
		}	
		return obj;
	};


	var Sasl = function(url , method, headers, body){
		this.method = method;
		this.url = url;
		this.headers = parserSasl(headers);
		this.body = body ;
		this.mechanisms = this.headers.mechanisms;
		var mechanism = this.getBestMechanism(this.mechanisms);
		if (mechanism){
			delete this.headers.mechanisms
			this.bestMechanism = mechanism.name
			this.mechanism = new mechanism.Class(this.url, this.method, this.headers, this.body);	
		}else{
			throw new Error("SALS mechanism not found")	
		}
	}
	
	Sasl.prototype.name= "sasl";


	Sasl.prototype.getBestMechanism = function(mechanism){
		var goodM = null;
		switch (typeof mechanism){
			case "object" :
				for (var i= 0 ; i < mechanism.length ; i++){
					if (mechanism[i] in stage.io.authentication.mechanisms){
						var goodM = stage.io.authentication.mechanisms[mechanism[i]];
						var name = mechanism[i];
						break;
					}
				}
			break;
			case "string" :
				//console.log(mechanism.split(" "));
				return this.getBestMechanism( mechanism.split(" ") );
			break;
			default:
				throw new Error("FORMAT SALS mechanism bad format")
		
		}
		return {
			name:name,
			Class:goodM
		}
	};

	Sasl.prototype.getAuthorization = function(user, password){
		return  'SASL mechanism="'+this.bestMechanism+'",'+this.mechanism.generateAuthorization(user, password);
	}


	
	return Sasl

})
/*
 *
 *
 *
 *
 *
 */

stage.provide("socket");

stage.register.call(stage.io, "socket", function(){


	var defaultSettings = {
		type:"websocket", //   websocket | poll | longPoll 
	}


	var bestTransport = function(){
	
	}; 



	var socket = function(url, localSettings){

		this.settings = stage.extend({}, defaultSettings, localSettings);
		this.$super.constructor(this.settings, this);	

		switch (this.settings.type){
			case "websocket":
				this.socket = stage.io.transports.websocket ; 
			break;
			case "poll":
				this.socket = stage.io.transports.ajax ;
			break;
			case "longPoll":
				this.socket = stage.io.transports.ajax ;
			break;
		}

		this.listen(this, "onConnect");
		this.listen(this, "onClose");
		this.listen(this, "onError");
		this.listen(this, "onMessage");
		this.listen(this, "onTimeout");

	}.herite(stage.notificationsCenter.notification);


	socket.prototype.write = function(settings){
		this.transport.send();
	};

	socket.prototype.close = function(settings){
		this.transport.close();
	};

	socket.prototype.connect = function(url, settings){

		this.transport = new this.socket(url, settings);
		this.transport.onmessage = this.listen(this, "onMessage");
		
	};


	socket.prototype.destroy = function(settings){
		this.transport = null ;
		this.clearNotifications();
	}



	return socket ;


});
/*
 *
 *	CLIENT
 *
 */

stage.register.call(stage.io.protocols, "bayeux",function(){

	var clientsCapabilities = function(){
		var tab = [];
		var websocket = stage.io.nativeWebSocket ? tab.push("websocket") : null ;
		var poll = stage.io.poll ? tab.push("poll") : null ;
		var longPoll = stage.io.longPoll ?  tab.push("long-polling") : null ; 
		var jsonp = stage.io.jsonp ?  tab.push("callback-polling") : null ; 
		return tab ;
	}();

	var onHandshakeResponse = function(message){
		if ( message.successful ){
			try {
				var socket  = this.getBestConnection(message.supportedConnectionTypes);
				this.socket = new socket.Class( socket.url );
				this.socket.onmessage = function(message){
					if (message.data )
						this.onMessage(message.data);
				}.bind(this); 
				this.socket.onopen = function(){
					this.socket.send( this.connect(message) );	
					this.notificationCenter.fire("onHandshake", message, this.socket);
				}.bind(this);
				this.socket.onerror = this.notificationCenter.listen(this, "onError");
				this.socket.onclose = function(err){
					delete this.socket ;
					this.notificationCenter.fire("onClose",err );
				}.bind(this)
			}catch(e){
				throw new Error (e)
			}
		}else{
			onError.call(this, message);
		}	
	};

	var reconnect  = function(){
		this.reconnect = true;
		this.notificationCenter.fire("reConnect", this);	
	};

	var onConnectResponse = function(message){
		if ( message.successful ){
			this.connected = true;	
			this.idconnection = message.clientId ;
			if ( message.advice ){
				for (var ele in message.advice ){
					switch(ele){
						case "reconnect" :
							if (message.advice[ele] === "retry" ){
								if ( ! this.reconnect ){
									this.notificationCenter.listen(this,"onClose", reconnect);
								}
							}
						break;
					}
				}
			}
			this.notificationCenter.fire("onConnect", message);
		}else{
			this.connected = false;	
			onError.call(this, message);
		}
	};

	var onDisconnectResponse = function(message){
		if ( message.successful ){
			if (this.socket){
				this.socket.close();
				this.socket = null ;
				this.notificationCenter.fire("onDisconnect", message)
			}
		}else{
			onError.call(this, message);
		}
	};

	var onSubscribeResponse = function(message){
		if ( message.successful ){
			this.notificationCenter.fire("onSubscribe", message);
		}else{
			onError.call(this, message);
		}
	};

	var onUnsubscribeResponse = function(message){
		if ( message.successful ){
			this.notificationCenter.fire("onUnsubscribe", message);
		}else{
			onError.call(this, message);
		}
	};

	var onError = function(message){
		if (message.error){
			try{ 
				switch (stage.typeOf(message.error)) {
					case "string":
						var res = message.error.split(":");
						var code = res[0];
						var arg = res[1];
						var mess = res[2];
					break;
					case "object":
						if (message.error){
							return arguments.callee.call(this, message.error)
						}
					break;
					case "Error":
						message.error = "500::"+message.error.message;
						return arguments.callee.call(this, message.error)
					break;
					default:
						throw new Error("Bad protocole error BAYEUX");
					
				}
				this.notificationCenter.fire("onError", code, arg, mess);
			}catch(e){
				throw new Error("Bad protocole error BAYEUX"+ e);
			}
		}
	};

	/*
 	 *	BAYEUX PROTOCOL
 	 *
 	 */
	var bayeux = function(url){
		this.name = "bayeux" ;	
		this.notificationCenter = stage.notificationsCenter.create(this.settings, this);
		this.url = url ; 
		this.socket = null;
		this.connected = false;
		this.request = {
			version:"1.0"
		}
	};

	bayeux.prototype.getBestConnection = function(supportedConnectionTypes){
		if (this.url.protocol === "https:" || this.url.protocol === "wss:")
			this.url.protocol = "wss:";
		else
			this.url.protocol = "ws:";
		this.socketType = "WEBSOCKET";
		return {
			Class: window.WebSocket,
			url:this.url.protocol+"//"+this.url.host+this.url.requestUri
		}	
	};

	bayeux.prototype.build = function(obj){
		var res = [];
		res.push(obj)
		return res ;
	};

	bayeux.prototype.handshake = function(){
		var req = JSON.stringify( stage.extend({}, this.request , {
			channel : "/meta/handshake",
			minimumVersion: "1.0",
			supportedConnectionTypes:clientsCapabilities
		}));
		return this.send(req);	
	};

	bayeux.prototype.connect = function(message){
		return JSON.stringify({
			channel: "/meta/connect",
			clientId: message.clientId,
			connectionType: this.socketType
		})
	};

	bayeux.prototype.stopReConnect = function(message){
		this.notificationCenter.unListen("onClose", reconnect);
	};


	bayeux.prototype.disconnect =function(){
		return JSON.stringify({
			channel: "/meta/disconnect",
			clientId: this.idconnection,
		});	
	};

	bayeux.prototype.subscribe = function(name, data){
		return JSON.stringify({
			channel: "/meta/subscribe",
			clientId: this.idconnection,
			subscription: "/service/"+name,
			data:data
		});
	};

	bayeux.prototype.unSubscribe = function(name, clientId, data){
		return JSON.stringify({
			channel: "/meta/unsubscribe",
			clientId: clientId,
			subscription: "/service/"+name,
			data:data
		});
	};

	bayeux.prototype.sendMessage = function(service, data, clientId){
		return JSON.stringify({
			channel: "/service/"+service,
			clientId: clientId,
			id: new Date().getTime(),
			data:data
		});	
	};

	bayeux.prototype.onMessage = function(message){
		try {
			if (typeof message === "string" ){
				message = JSON.parse(message);
			}
		}catch (e){
			message.error = e ;
			onError.call(this, message);
			return ;
		}
		switch (message.channel){
			case "/meta/handshake":
				return onHandshakeResponse.call(this, message);
			break;
			case "/meta/connect":
				return onConnectResponse.call(this, message);
			break;
			case "/meta/disconnect":
				return onDisconnectResponse.call(this, message);
			break;
			case "/meta/subscribe":
				return onSubscribeResponse.call(this, message);
			break;
			case "/meta/unsubscribe":
				return onUnsubscribeResponse.call(this, message);
			break;
			default:
				// /some/channel
				this.notificationCenter.fire("onMessage", message);
		}
	};

	bayeux.prototype.send = function(data){
		if ( this.socket ){
			return this.socket.send(data);	
		}
		return $.ajax({
            		method: 'POST',
		        cache:false,
            		url: this.url.href ,
		        dataType:"json",
		        contentType:"application/json",
		        data : data,		        
			success:function(data, type, xhr){
				this.onMessage(data);			
			}.bind(this),
            		error: function(obj, type, message) {
				this.notificationCenter.fire('onError', obj, type, message);
            		}.bind(this)
        	});
	};

	return bayeux ;
});

/*
 *
 *
 *
 *
 *
 *
 */
stage.register("realtime",function(){



	var defaultSettings = {
	
	};

	var settingsSyslog = {
		moduleName:"REALTIME",
		defaultSeverity:"INFO"
	};

	var realtime = function(urlServer, settings){
		if (! urlServer)
			throw new Error("realtime url server is not defined")
		this.settings = stage.extend({}, defaultSettings, settings); 
		this.notificationCenter = stage.notificationsCenter.create(this.settings, this);
		this.syslog =  new stage.syslog(settingsSyslog);
		this.url = stage.io.urlToOject(urlServer) ;
		//this.crossDomain =  ! stage.io.isSameOrigin(this.url.href);	
		this.protocol = new stage.io.protocols.bayeux(this.url); 
		this.services = null;
		this.subscribedService = {};
		this.nbSubscribed = 0 ;
		this.connected = false ;
		this.publicAddress = null;
		this.domain = null;

		/*
 		 *	EVENT REALTIME
 		 */
		this.notificationCenter.listen(this, "onAuthorized", function(){
			this.protocol.handshake(this.url.href)
		});

		/*
 		 *	EVENTS PROTOCOL BAYEUX
 		 */
		this.protocol.notificationCenter.listen(this, "onMessage", this.onMessage);
		this.protocol.notificationCenter.listen(this, "onHandshake", function(message, socket){
			if (message.ext && message.ext.address){
				var addr = JSON.parse(message.ext.address);
				this.publicAddress = addr.remoteAddress ;
				this.domain = addr.host;
			}
			this.notificationCenter.fire("onHandshake", message, socket, this)	
		});
		this.protocol.notificationCenter.listen(this, "onConnect", function(message){
			this.services = message.data;
			this.connected = true ;
			if (message.ext && message.ext.address){
				var addr = JSON.parse(message.ext.address);
				this.publicAddress = addr.remoteAddress ;
				this.domain = addr.host;
			}
			this.notificationCenter.fire("onConnect", message, this)
		}); 
		this.protocol.notificationCenter.listen(this, "onDisconnect", function(message){
			this.services = message.data;
			this.connected = false ;
			this.notificationCenter.fire("onDisconnect", message, this)
		});
		this.protocol.notificationCenter.listen(this, "reConnect", function(bayeux){
			setTimeout(function(){
				this.start();
			}.bind(this), 60000)
		});
		this.protocol.notificationCenter.listen(this, "onSubscribe", function(message){
			var service = message.subscription.split("/")[2];
			this.subscribedService[service] = message ;
			this.nbSubscribed ++ ;
			this.notificationCenter.fire("onSubscribe", service, message, this)
		}); 
		this.protocol.notificationCenter.listen(this, "onUnsubscribe", function(message){
			var service = message.subscription.split("/")[2];
			delete this.subscribedService[service];
			this.nbSubscribed -- ;
			this.notificationCenter.fire("onUnSubscribe", service, message, this)
		});
		this.protocol.notificationCenter.listen(this, "onError", function(code, arg, message){
			this.notificationCenter.fire("onError", code, arg, message);
		}); 
		this.protocol.notificationCenter.listen(this, "onClose", function(message){
			this.connected = false ;
			this.notificationCenter.fire("onClose", message);
			for(var service in this.subscribedService ){
				//this.unSubscribe(service);
				delete this.subscribedService[service];
			}
		});

		//this.start();	
	};

	realtime.prototype.listen = function(){
		return 	this.notificationCenter.listen.apply(this.notificationCenter, arguments);
	};

	realtime.prototype.unListen = function(){
		return 	this.notificationCenter.unListen.apply(this.notificationCenter, arguments);
	};


	realtime.prototype.start = function(){
		if ( this.connected ){
			//throw new Error("connection already started");
			this.notificationCenter.fire("onError", 500, this, "connection already started");
			return false;
		}
		var statusCode  = {
			
                	401: function(request, type, message) {
				var auth = request.getResponseHeader("WWW-Authenticate");
				var res = request.responseText;
				var obj =  {
					"WWW-Authenticate":request.getResponseHeader("WWW-Authenticate"),
					body:request.responseText
				}
				this.authenticate = new stage.io.authentication.authenticate(this.url, obj, {
					ajax:true,
					onSuccess:function(data, type, xhr){
						this.notificationCenter.fire('onAuthorized',data, type, xhr);
					}.bind(this),
					onError:function(obj, type, message){
						var res = stage.io.getHeaderJSON(obj);
						if (res){
							this.notificationCenter.fire('onError',401, obj, res)	
						}else{
							this.notificationCenter.fire('onError',401, obj, message)
						}
					}.bind(this)
				});
				this.notificationCenter.fire('onUnauthorized', this.authenticate , this);
                	}.bind(this),
			404:function(obj, type, message){
				// '404 - realtimeD server not available'
				this.notificationCenter.fire('onError',404, obj, message );	
			}.bind(this),
                	503: function(obj, type, message) {
				//  '503 - Service Unavailable'
			    	this.notificationCenter.fire('onError',503, obj, message);
                	}.bind(this)   
            	};

		return $.ajax({
            		method: 'GET',
		        cache:false,
            		url: this.url.href ,
            		statusCode:statusCode,
		        success:function(data, type, xhr){
				this.notificationCenter.fire('onAuthorized',data, type, xhr);
			}.bind(this),
            		error: function(obj, type, message) {
				if (obj.status in statusCode )
					return ;
				this.notificationCenter.fire('onError', obj.status, obj, message);
            		}.bind(this)
        	});
	};


	realtime.prototype.subscribe = function(name, data){
		if ( ! this.connected ){
			this.notificationCenter.fire('onError', 500, this, "Not connected");
			return false;
		}
		if ( name in this.services ){
			if (name in this.subscribedService ){
				this.notificationCenter.fire('onError', 500, this, "already subscribed");
				return false;
			}
			return send.call(this,  this.protocol.subscribe(name, data) ) ;	
		}	
		this.notificationCenter.fire('onError', 500, this, "service : "+ name + " not exist");	
		return false ;
	};

	realtime.prototype.unSubscribe = function(name, data){
		if ( ! this.connected ){
			this.notificationCenter.fire('onError', 500, this, "Not connected");	
			return false;
		}
		if ( name in this.services ){
			
			if (  name in this.subscribedService ){
				var clientId = this.subscribedService[name].clientId;
				return send.call(this,  this.protocol.unSubscribe(name, clientId, data) ) ;	
			}else{
				this.notificationCenter.fire('onError', 500, this, "service : "+ name + " not subcribed");	
				return false;
			}
		}
		this.notificationCenter.fire('onError', 404, this, "service : "+ name + " not exist");	
		return false;
	};

	var send = function(data){
		this.protocol.send(data)	
	};


	realtime.prototype.sendMessage = function(service , data){
		if ( ! this.connected ){
			this.notificationCenter.fire('onError', 500, this, "Not connected");	
			return false;
		}
		if ( service in this.services ){
			if (service in this.subscribedService ){
				var clientId = this.subscribedService[service].clientId;
				try {
					var proto = this.protocol.sendMessage(service, data, clientId) ;
					send.call(this,  proto );
					return JSON.parse(proto).id	
				}catch(e){
					this.fire("onError",500, e, e.message);
				}
			}else{
				this.notificationCenter.fire('onError', 500, this, "service : "+ service + " not subcribed");	
				return false;
			}
		}else{
			this.fire("onError",404, this, "service :"+service + " not exit");
		}
		return false;
	};


	realtime.prototype.stop = function(){
		if (  this.connected ){
			this.protocol.stopReConnect();
			for(var service in this.subscribedService ){
				//this.unSubscribe(service);
				delete this.subscribedService[service];
			}
			
			return send.call(this, this.protocol.disconnect() );
		}
		throw new Error("connection already stoped");
	};


	realtime.prototype.onMessage = function(message){
		if (message.error){
			if (message.channel)
				this.notificationCenter.fire("onError", message.error);
			else
				this.notificationCenter.fire("onError",message.id, message.successful );		
		}else{
			if (message.channel)
				this.notificationCenter.fire("onMessage", message.channel.split("/")[2], message.data);
			else
				this.notificationCenter.fire("onMessage",message.id, message.successful);
		}
	};



	return realtime ;

});
/*
 *
 *
 *
 *
 *
 *
 *
 *
 *
 */

stage.register("autoload", function(){

	var genarateId = function(){
		return new Date().getTime();
	};


	var loader = function(){
		
		var AJAX = {
			css : {
				mineType :	"text/css",
				tag:		"style",
				media:		"screen",
				type:		"stylesheet",
				position:	"HEAD"
			},
			js:{
				mineType :	"text/javascript",
				tag:		"script",
				position:	"BODY"
			}
		};

		var SCRIPT = {
			css : {
				mineType :	"text/css",
				tag:		"link",
				media:		"screen",
				type:		"stylesheet",
				position:	"HEAD"
			},
			js:{
				mineType :	"text/javascript",
				tag:		"script",
				position:	"BODY"
			}
		};

		var insert = function(position, script){
			switch(position){
				case "HEAD" :
					var head = document.getElementsByTagName('head')[0];
					head.appendChild(script);
				break;
				case "BODY" :
					var body = document.getElementsByTagName('body')[0]
					body.appendChild(script);
				break;
			}
		};


		return function(src, tag , id, transport, callback){
			//if (tag == "js") transport = "ajax";
			//if (tag == "css") transport = "ajax";
			switch (tag){
				case "js":
					/*var def = AJAX[tag];
					var script = document.createElement(def.tag);
					script.setAttribute('type', def.mineType);
					script.setAttribute('id', id + '_'+tag);
					if ( tag === "css" ){
						script.setAttribute('media', def.media);
					}
					$.ajax(src, {
						async:false,
						//cache:true,
						dataType:"text",
						success:function(data, status, xhr){
							this.cache[id] = script ;
							insert(def.position, script);
							$(script).text(data);
							this.logger("LOAD FILE :" + src,"DEBUG");
							callback(null, xhr);
						}.bind(this),
						error:function(xhr, status, message){
							this.logger(src+" :" +message,"ERROR");
							callback(message, xhr);
						}.bind(this)
					});*/
					 
					return $.ajax({
						url: src,
					        async:false,
						dataType: "script",
						success: function(data, status, xhr){
							//this.logger("LOAD FILE :" + src,"DEBUG");
							callback(null, xhr);	
						}.bind(this),
						error:function(xhr, status, message){
							this.logger(src+" :" +message,"ERROR");
							callback(message, xhr);
						}.bind(this)
					});
					



				break;
				case "css":
					var def = SCRIPT[tag];
					var script = document.createElement(def.tag);
					script.setAttribute('type', def.mineType);
					script.setAttribute('id', id + '_'+tag);
					if ( tag === "css" ){
						script.setAttribute('media', def.media);
						script.href = src;/*+ '?time=' + id;*/
						script.rel = def.type;
						script.async = false;
					}
					if (tag === "js"){
						script.src = src;/*+ '?time=' + id;*/
						script.async = false;
					}
					script.onload = function(){
						this.cache[id] = script;
						this.logger("LOAD FILE :" + src,"DEBUG");
						callback(null, script);
					}.bind(this);
					script.onerror = function(error){
						this.logger(src ,"ERROR");
						callback(error, script);
					}.bind(this);
					insert(def.position, script);
				break;
				default:
					this.logger( new Error ("autoload  type transport error "), "ERROR" );
					return null;
			}
			return script ;
		}
	}();
	

	var defaultSetting = {
		transport:"script",
		prefix:null
	};

	var autoload = function(kernel, settings){
		this.settings = jQuery.extend({}, defaultSetting, settings)
		this.cache = {};
		this.prefix = this.settings.prefix  ;
		this.syslog = kernel.syslog || null ;
		this.transport = this.settings.transport ;
	};

	var regType = /(.*)\.(js)$|(.*)\.(css)$/;
	autoload.prototype.load = function(file, callback){
		var id = genarateId();
		var res = regType.exec(file);
		if ( ! res) {
			this.logger("autoload error type file  ","ERROR")
			return null;
		}
		var script = loader.call(this, file, res[2] || res[4] , id, this.transport, callback)
		return id 
	};

	autoload.prototype.logger = function(pci, severity, msgid,  msg){
		if (this.syslog){
			if (! msgid) msgid = "AUTOLOADER  ";
			return this.syslog.logger(pci, severity , msgid,  msg);
		}else{
			console.log(pci);
		}
	};

	autoload.prototype.unLoad = function(id, callback){
		if (id in this.cache){
			var tag = this.cache[id]
			tag.parentNode.removeChild(tag);
			delete tag;
			delete 	this.cache[id] ;	
			return callback(id);
		}else{
			this.logger("Autoload unLoad no tag find :" +id ,"ERROR")
		}
	};

	return autoload ; 

});
/*
 *
 *
 *
 *	KERNEL stage JS
 *
 *
 *
 */

stage.register("kernel",function(){

	var settingsSyslog = {
		//rateLimit:100,
		//burstLimit:10,
		moduleName:"KERNEL",
		defaultSeverity:"INFO"
	};

	var defaultSettings = {
		debug:false,
		location:{
			html5Mode:false,
			hashPrefix:"/"
		}
	};

	var Kernel = function(environment, settings){
		this.container = null; 
		this.modules = {};
		this.settings = stage.extend(true, {}, defaultSettings , settings );
		this.environment = environment;
		this.debug = this.settings.debug ;
		this.booted = false;
		this.container = new stage.Container();
		this.container.set("kernel", this);
		this.isDomReady = false;
		this.uiContainer = null;

		// syslog
		this.syslog = this.initializeLog(settingsSyslog);
		this.container.set("syslog", this.syslog);

		// autoloader
		this.autoloader = new stage.autoload(this, {
			transport:"script"
		});
		this.container.set("autoloader", this.autoloader);

		// notificationsCenter
		this.notificationsCenter =  stage.notificationsCenter.create();
		this.container.set("notificationsCenter", this.notificationsCenter);
		
		// location
		this.initLocation();

		// Router
		this.initRouter();

		// template
		this.initTwig();

		// translation i18n
		this.initTranslation();

		// Service REST
		this.initRest()

		// EVENT NATIF
		$(document).ready(this.listen(this, "onDomReady", this.domReady));
		$(window).resize(this.listen(this,"onResize"));
		$(window).unload(this.listen(this,"onUnLoad"));	
		$(window).load(this.listen(this,"onLoad"));	

		//BOOT	
		this.listen(this, "onBoot" , this.boot)
		//READY
		this.listen(this, "onReady" , this.ready)

		this.notificationsCenter.settingsToListen(this.settings, this);
	};


	Kernel.prototype.set = function(name, value){
		return this.container.set(name, value);	
	};

	Kernel.prototype.get = function(name, value){
		return this.container.get(name, value);	
	};
		
	Kernel.prototype.setParameters =function(name, value){
		return this.container.setParameters(name, value);	
	};

	Kernel.prototype.getParameters = function(name){
		return this.container.getParameters(name);	
	};

	Kernel.prototype.initRouter = function(){
		this.router = new stage.router(this, this.container);
		this.container.set("router", this.router);
	};


	Kernel.prototype.initLocation = function(){
		this.locationService = new stage.location(this, this.settings.location) ;
		this.container.set("location", this.locationService);
	};


	Kernel.prototype.initRest = function(){
		if (stage.Rest) {
			this.restService = new stage.Rest(this.container);
			this.set("rest", this.restService);
		}
	};

	Kernel.prototype.initTranslation = function(){
		if ( ! stage.i18n ){
 		       	this.logger("you must load transation i18n services js file !!!!!", "ERROR")
			return
		}
		this.i18n = new stage.i18n(this, this.container);

		this.container.set("i18n", this.i18n);
	};

	/*
 	 *	OVERRIDE TWIG IMPORT TEMPLATE
 	 */
	var loadRemoteTwig = function(Twig, location, params, callback, error_callback){
		var id  = params.id,
		method      = params.method,
		async       = params.async,
		precompiled = params.precompiled,
		template    = null;

		// Default to async
		if (async === undefined) async = true;

		// Default to the URL so the template is cached.
		if (id === undefined) {
			id = location;
		}
		params.id = id;

		// Check for existing template
		if (Twig.cache && Twig.Templates.registry.hasOwnProperty(id)) {
			// A template is already saved with the given id.
			if (callback) {
				callback(Twig.Templates.registry[id]);
			}
			return Twig.Templates.registry[id];
		}
		//console.log(params.async)
		$.ajax({
			url:location,
			async:async,
			success:function(mydata, status, xhr){
				var moduleName = this.getModuleName( location )
			        if (precompiled === true) {
					mydata = JSON.parse(mydata);
				}
				params.url = location;
				params.data = mydata;
				template = new Twig.Template(params);
				if (this.modules[moduleName]){
					var module = this.modules[moduleName] ;
					var name = module.getTemplateName(location)
					module.registerTemplate(name, template, "template")
				}
				if (callback) {
					callback(template);
				}
			}.bind(this),
			error: function(xrh, status, message){
				error_callback(xrh, status, message)
			}.bind(this)
		})
		if (async === false) {
			return template;
		} else {
			// placeholder for now, should eventually return a deferred object.
			return true;
		}	
	};
	
	Kernel.prototype.initTwig = function(){
		this.logger("INITIALIZE TWIG SERVICE", "DEBUG");
		if (this.environment === "dev"){
			window.Twig.cache = false ;	
		}
		this.templateEngine = window.Twig.twig  ; 
		//extended log error traf
		window.Twig.extend(function(Twig){
			Twig.log.error = function(message){
				this.logger(message, "ERROR");
			}.bind(this)
		}.bind(this));

		window.Twig.extend(function(Twig){
			Twig.Templates.loadRemote = loadRemoteTwig.bind(this, Twig) 
		}.bind(this));

		//extended FUNCTION
		window.Twig.extendFunction("controller", function() {
			var pattern = Array.prototype.shift.call(arguments);
			var sp = pattern.split(":");
			var module = this.getModule(sp[0]);
			if (module){
				var controller = module.getController(sp[1]);
				if (controller){
					var action = sp[2];
					if ( controller[action] ){
						return controller[action].apply(controller, arguments);	
					}
				}
			}
		}.bind(this));
		this.container.set("twig", this.templateEngine);
		return this.templateEngine ;

	};

	Kernel.prototype.domReady = function(){
		if ( ! this.booted ) return ; 
		this.logger("domReady", "DEBUG");
		this.fire("onDomLoad", this);
		var element = this.uiContainer ? $(this.uiContainer) : $("body");
		try {
			if ( this.modules["app"] ){
				this.modules["app"].initialize(element);	
			}		
			for (var module in this.modules){
				if (module === "app") continue;
				this.modules[module].initialize(element);
			}	
			this.fire("onReady", this);
			this.isDomReady = true;
		}catch(e){
			this.logger(e,"ERROR");
		}
	};

	
	Kernel.prototype.listen = function(){
		return this.notificationsCenter.listen.apply(this.notificationsCenter, arguments);
	}

	Kernel.prototype.fire = function(event){
		this.logger("EVENT : " + event,"DEBUG");
		return this.notificationsCenter.fire.apply(this.notificationsCenter, arguments);
	};

	Kernel.prototype.getModule = function(name){
		return this.modules[name] ;
	};
	
	Kernel.prototype.logger = function(pci, severity, msgid,  msg){
		if (! msgid) msgid = "KERNEL "
		return this.syslog.logger(pci, severity, msgid,  msg);
	};

	Kernel.prototype.initializeLog = function(settings){
		
		var syslog =  new stage.syslog(settings);
		if (this.environment === "dev"){
		// CRITIC ERROR
			syslog.listenWithConditions(this,{
				severity:{
					data:"CRITIC,ERROR"
				}		
			},function(pdu){
					console.log(pdu.payload)
				if (pdu.payload.stack ){
						console.error( "SYSLOG " + pdu.severityName +" " + pdu.msgid + " "+new Date(pdu.timeStamp) + " " + pdu.msg+" : "+  pdu.payload.stack);
				}else{
					console.error( "SYSLOG " + pdu.severityName +" " + pdu.msgid + " "+new Date(pdu.timeStamp) + " " + pdu.msg+" : "+  pdu.payload);	
				}
				/*if (pdu.typePayload === "Error" ){
					if (pdu.payload.stack ){
						console.error( "SYSLOG " + pdu.severityName +" " + pdu.msgid + " "+new Date(pdu.timeStamp) + " " + pdu.msg+" : "+  pdu.payload.stack);
					}
					return;
				}
				console.error( "SYSLOG " + pdu.severityName +" " + pdu.msgid + " "+new Date(pdu.timeStamp) + " " + pdu.msg+" : "+  pdu.payload);*/	
			});
			// INFO DEBUG
			var data ;
			this.debug ? data = "INFO,DEBUG" : data = "INFO" ;
			syslog.listenWithConditions(this,{
				severity:{
					data:data
				}		
			},function(pdu){
				console.info( "SYSLOG " + pdu.severityName +" " + pdu.msgid + " "+new Date(pdu.timeStamp) + " " + pdu.msg+" : "+ pdu.payload);
			});
			syslog.listenWithConditions(this,{
				severity:{
					data:"WARNING"
				}		
			},function(pdu){
				console.warn( "SYSLOG " + pdu.severityName +" " + pdu.msgid + " "+new Date(pdu.timeStamp) + " " + pdu.msg+" : "+ pdu.payload);
			});
		}
		return syslog;
	};

	Kernel.prototype.boot = function(){
		this.booted = true;
	};

	Kernel.prototype.ready = function(){
		//this.fire("onUrlChange", this.router.url() )
	};

	Kernel.prototype.loadModule = function(url, settings){
		var res = stage.io.urlToOject(url);
		var moduleName = res.basename ;
				
		return $.ajax(url,stage.extend( {
			cache:false,
			method:"GET",
			//async:false,
			dataType:"xml",
			success:function(data, status, xhr){
				try {
					//FIXME try to parse with url
					var res = stage.xml.parseXml(data);
					var moduleName = res.module["@id"];
					var type = res.module["@type"];
					var moduleSrc = res.module["@src"];
				 
					switch ( type ){
						case "application/javascript" :
							if ( moduleSrc ){
								if (moduleName in this.modules) {
									this.modules[moduleName].initialize();
									this.modules[moduleName].fire("onInitialize", moduleName);	
									this.fire("onInitializeModule", moduleName);	
								} else {							
									this.autoloader.load(moduleSrc, function(error, transport){
										if (error){
											this.fire("onError", error);
											throw error;
										}
										this.registerModule(moduleName, res);
										if (moduleName === "app")
											this.fire("onBoot", this);
									}.bind(this));
								}
							}
						break;
					}
				}catch(e){
					this.logger(e, "ERROR");
					this.fire("onError", e);
					throw e ;
				}
			}.bind(this),
			error:function(xhr, status, message){
				this.fire("onGetConfigError", moduleName);
				this.fire("onError", message);	
			}.bind(this)
		}, settings))
	};

	Kernel.prototype.registerModule = function(name, xml){
		if (name in stage.modules){
			var kernelcontext = this;
			var Class = stage.modules[name].herite(stage.Module);
			this.container.addScope(name);
			Class.prototype.name = name;
			try {
				if (this.isDomReady){
						this.modules[name] = new Class(this, xml,{
							onReady:function(){
								if (this.initialize){
									try {
										this.initialize();
										this.fire("onInitialize", name);	
										kernelcontext.fire("onInitializeModule", name);
									}catch(e){
										this.logger("INITIALIZE MODULE : "+name +" "+e, "ERRROR");
										throw e;
									}
										
								}
							}});	
					
					
				}else{
					this.modules[name] = new Class(this, xml);
				}
				this.container.set(name, this.modules[name]);
			}catch(e){
				this.logger("INSTANCE MODULE : "+name +" "+e, "ERRROR")
				throw e;
			}
		}
	};

	Kernel.prototype.getModuleName = function(url){
		var module = stage.dirname(url);
		var tab = module.split("/")
		return tab[tab.indexOf("Resources")-1];
	};

	return  Kernel;
});
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory((function webpackLoadOptionalExternalModule() { try { return require("fs"); } catch(e) {} }()), require("path"));
	else if(typeof define === 'function' && define.amd)
		define(["fs", "path"], factory);
	else if(typeof exports === 'object')
		exports["Twig"] = factory((function webpackLoadOptionalExternalModule() { try { return require("fs"); } catch(e) {} }()), require("path"));
	else
		root["Twig"] = factory(root["fs"], root["path"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_19__, __WEBPACK_EXTERNAL_MODULE_20__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Twig.js 0.8.9
	 *
	 * @copyright 2011-2016 John Roepke and the Twig.js Contributors
	 * @license   Available under the BSD 2-Clause License
	 * @link      https://github.com/twigjs/twig.js
	 */

	var Twig = {
	    VERSION: '0.8.9'
	};

	__webpack_require__(1)(Twig);
	__webpack_require__(2)(Twig);
	__webpack_require__(3)(Twig);
	__webpack_require__(5)(Twig);
	__webpack_require__(6)(Twig);
	__webpack_require__(7)(Twig);
	__webpack_require__(17)(Twig);
	__webpack_require__(18)(Twig);
	__webpack_require__(21)(Twig);
	__webpack_require__(22)(Twig);
	__webpack_require__(23)(Twig);
	__webpack_require__(24)(Twig);
	__webpack_require__(25)(Twig);
	__webpack_require__(26)(Twig);

	module.exports = Twig.exports;


/***/ },
/* 1 */
/***/ function(module, exports) {

	// ## twig.core.js
	//
	// This file handles template level tokenizing, compiling and parsing.
	module.exports = function (Twig) {
	    "use strict";

	    Twig.trace = false;
	    Twig.debug = false;

	    // Default caching to true for the improved performance it offers
	    Twig.cache = true;

	    Twig.placeholders = {
	        parent: "{{|PARENT|}}"
	    };

	    /**
	     * Fallback for Array.indexOf for IE8 et al
	     */
	    Twig.indexOf = function (arr, searchElement /*, fromIndex */ ) {
	        if (Array.prototype.hasOwnProperty("indexOf")) {
	            return arr.indexOf(searchElement);
	        }
	        if (arr === void 0 || arr === null) {
	            throw new TypeError();
	        }
	        var t = Object(arr);
	        var len = t.length >>> 0;
	        if (len === 0) {
	            return -1;
	        }
	        var n = 0;
	        if (arguments.length > 0) {
	            n = Number(arguments[1]);
	            if (n !== n) { // shortcut for verifying if it's NaN
	                n = 0;
	            } else if (n !== 0 && n !== Infinity && n !== -Infinity) {
	                n = (n > 0 || -1) * Math.floor(Math.abs(n));
	            }
	        }
	        if (n >= len) {
	            // console.log("indexOf not found1 ", JSON.stringify(searchElement), JSON.stringify(arr));
	            return -1;
	        }
	        var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);
	        for (; k < len; k++) {
	            if (k in t && t[k] === searchElement) {
	                return k;
	            }
	        }
	        if (arr == searchElement) {
	            return 0;
	        }
	        // console.log("indexOf not found2 ", JSON.stringify(searchElement), JSON.stringify(arr));

	        return -1;
	    }

	    Twig.forEach = function (arr, callback, thisArg) {
	        if (Array.prototype.forEach ) {
	            return arr.forEach(callback, thisArg);
	        }

	        var T, k;

	        if ( arr == null ) {
	          throw new TypeError( " this is null or not defined" );
	        }

	        // 1. Let O be the result of calling ToObject passing the |this| value as the argument.
	        var O = Object(arr);

	        // 2. Let lenValue be the result of calling the Get internal method of O with the argument "length".
	        // 3. Let len be ToUint32(lenValue).
	        var len = O.length >>> 0; // Hack to convert O.length to a UInt32

	        // 4. If IsCallable(callback) is false, throw a TypeError exception.
	        // See: http://es5.github.com/#x9.11
	        if ( {}.toString.call(callback) != "[object Function]" ) {
	          throw new TypeError( callback + " is not a function" );
	        }

	        // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
	        if ( thisArg ) {
	          T = thisArg;
	        }

	        // 6. Let k be 0
	        k = 0;

	        // 7. Repeat, while k < len
	        while( k < len ) {

	          var kValue;

	          // a. Let Pk be ToString(k).
	          //   This is implicit for LHS operands of the in operator
	          // b. Let kPresent be the result of calling the HasProperty internal method of O with argument Pk.
	          //   This step can be combined with c
	          // c. If kPresent is true, then
	          if ( k in O ) {

	            // i. Let kValue be the result of calling the Get internal method of O with argument Pk.
	            kValue = O[ k ];

	            // ii. Call the Call internal method of callback with T as the this value and
	            // argument list containing kValue, k, and O.
	            callback.call( T, kValue, k, O );
	          }
	          // d. Increase k by 1.
	          k++;
	        }
	        // 8. return undefined
	    };

	    Twig.merge = function(target, source, onlyChanged) {
	        Twig.forEach(Object.keys(source), function (key) {
	            if (onlyChanged && !(key in target)) {
	                return;
	            }

	            target[key] = source[key]
	        });

	        return target;
	    };

	    /**
	     * Exception thrown by twig.js.
	     */
	    Twig.Error = function(message) {
	       this.message = message;
	       this.name = "TwigException";
	       this.type = "TwigException";
	    };

	    /**
	     * Get the string representation of a Twig error.
	     */
	    Twig.Error.prototype.toString = function() {
	        var output = this.name + ": " + this.message;

	        return output;
	    };

	    /**
	     * Wrapper for logging to the console.
	     */
	    Twig.log = {
	        trace: function() {if (Twig.trace && console) {console.log(Array.prototype.slice.call(arguments));}},
	        debug: function() {if (Twig.debug && console) {console.log(Array.prototype.slice.call(arguments));}}
	    };


	    if (typeof console !== "undefined") {
	        if (typeof console.error !== "undefined") {
	            Twig.log.error = function() {
	                console.error.apply(console, arguments);
	            }
	        } else if (typeof console.log !== "undefined") {
	            Twig.log.error = function() {
	                console.log.apply(console, arguments);
	            }
	        }
	    } else {
	        Twig.log.error = function(){};
	    }

	    /**
	     * Wrapper for child context objects in Twig.
	     *
	     * @param {Object} context Values to initialize the context with.
	     */
	    Twig.ChildContext = function(context) {
	        var ChildContext = function ChildContext() {};
	        ChildContext.prototype = context;
	        return new ChildContext();
	    };

	    /**
	     * Container for methods related to handling high level template tokens
	     *      (for example: {{ expression }}, {% logic %}, {# comment #}, raw data)
	     */
	    Twig.token = {};

	    /**
	     * Token types.
	     */
	    Twig.token.type = {
	        output:                 'output',
	        logic:                  'logic',
	        comment:                'comment',
	        raw:                    'raw',
	        output_whitespace_pre:  'output_whitespace_pre',
	        output_whitespace_post: 'output_whitespace_post',
	        output_whitespace_both: 'output_whitespace_both',
	        logic_whitespace_pre:   'logic_whitespace_pre',
	        logic_whitespace_post:  'logic_whitespace_post',
	        logic_whitespace_both:  'logic_whitespace_both'
	    };

	    /**
	     * Token syntax definitions.
	     */
	    Twig.token.definitions = [
	        {
	            type: Twig.token.type.raw,
	            open: '{% raw %}',
	            close: '{% endraw %}'
	        },
	        {
	            type: Twig.token.type.raw,
	            open: '{% verbatim %}',
	            close: '{% endverbatim %}'
	        },
	        // *Whitespace type tokens*
	        //
	        // These typically take the form `{{- expression -}}` or `{{- expression }}` or `{{ expression -}}`.
	        {
	            type: Twig.token.type.output_whitespace_pre,
	            open: '{{-',
	            close: '}}'
	        },
	        {
	            type: Twig.token.type.output_whitespace_post,
	            open: '{{',
	            close: '-}}'
	        },
	        {
	            type: Twig.token.type.output_whitespace_both,
	            open: '{{-',
	            close: '-}}'
	        },
	        {
	            type: Twig.token.type.logic_whitespace_pre,
	            open: '{%-',
	            close: '%}'
	        },
	        {
	            type: Twig.token.type.logic_whitespace_post,
	            open: '{%',
	            close: '-%}'
	        },
	        {
	            type: Twig.token.type.logic_whitespace_both,
	            open: '{%-',
	            close: '-%}'
	        },
	        // *Output type tokens*
	        //
	        // These typically take the form `{{ expression }}`.
	        {
	            type: Twig.token.type.output,
	            open: '{{',
	            close: '}}'
	        },
	        // *Logic type tokens*
	        //
	        // These typically take a form like `{% if expression %}` or `{% endif %}`
	        {
	            type: Twig.token.type.logic,
	            open: '{%',
	            close: '%}'
	        },
	        // *Comment type tokens*
	        //
	        // These take the form `{# anything #}`
	        {
	            type: Twig.token.type.comment,
	            open: '{#',
	            close: '#}'
	        }
	    ];


	    /**
	     * What characters start "strings" in token definitions. We need this to ignore token close
	     * strings inside an expression.
	     */
	    Twig.token.strings = ['"', "'"];

	    Twig.token.findStart = function (template) {
	        var output = {
	                position: null,
	                close_position: null,
	                def: null
	            },
	            i,
	            token_template,
	            first_key_position,
	            close_key_position;

	        for (i=0;i<Twig.token.definitions.length;i++) {
	            token_template = Twig.token.definitions[i];
	            first_key_position = template.indexOf(token_template.open);
	            close_key_position = template.indexOf(token_template.close);

	            Twig.log.trace("Twig.token.findStart: ", "Searching for ", token_template.open, " found at ", first_key_position);

	            //Special handling for mismatched tokens
	            if (first_key_position >= 0) {
	                //This token matches the template
	                if (token_template.open.length !== token_template.close.length) {
	                    //This token has mismatched closing and opening tags
	                    if (close_key_position < 0) {
	                        //This token's closing tag does not match the template
	                        continue;
	                    }
	                }
	            }
	            // Does this token occur before any other types?
	            if (first_key_position >= 0 && (output.position === null || first_key_position < output.position)) {
	                output.position = first_key_position;
	                output.def = token_template;
	                output.close_position = close_key_position;
	            } else if (first_key_position >= 0 && output.position !== null && first_key_position === output.position) {
	                /*This token exactly matches another token,
	                greedily match to check if this token has a greater specificity*/
	                if (token_template.open.length > output.def.open.length) {
	                    //This token's opening tag is more specific than the previous match
	                    output.position = first_key_position;
	                    output.def = token_template;
	                    output.close_position = close_key_position;
	                } else if (token_template.open.length === output.def.open.length) {
	                    if (token_template.close.length > output.def.close.length) {
	                        //This token's opening tag is as specific as the previous match,
	                        //but the closing tag has greater specificity
	                        if (close_key_position >= 0 && close_key_position < output.close_position) {
	                            //This token's closing tag exists in the template,
	                            //and it occurs sooner than the previous match
	                            output.position = first_key_position;
	                            output.def = token_template;
	                            output.close_position = close_key_position;
	                        }
	                    } else if (close_key_position >= 0 && close_key_position < output.close_position) {
	                        //This token's closing tag is not more specific than the previous match,
	                        //but it occurs sooner than the previous match
	                        output.position = first_key_position;
	                        output.def = token_template;
	                        output.close_position = close_key_position;
	                    }
	                }
	            }
	        }

	        delete output['close_position'];

	        return output;
	    };

	    Twig.token.findEnd = function (template, token_def, start) {
	        var end = null,
	            found = false,
	            offset = 0,

	            // String position variables
	            str_pos = null,
	            str_found = null,
	            pos = null,
	            end_offset = null,
	            this_str_pos = null,
	            end_str_pos = null,

	            // For loop variables
	            i,
	            l;

	        while (!found) {
	            str_pos = null;
	            str_found = null;
	            pos = template.indexOf(token_def.close, offset);

	            if (pos >= 0) {
	                end = pos;
	                found = true;
	            } else {
	                // throw an exception
	                throw new Twig.Error("Unable to find closing bracket '" + token_def.close +
	                                "'" + " opened near template position " + start);
	            }

	            // Ignore quotes within comments; just look for the next comment close sequence,
	            // regardless of what comes before it. https://github.com/justjohn/twig.js/issues/95
	            if (token_def.type === Twig.token.type.comment) {
	              break;
	            }
	            // Ignore quotes within raw tag
	            // Fixes #283
	            if (token_def.type === Twig.token.type.raw) {
	                break;
	            }

	            l = Twig.token.strings.length;
	            for (i = 0; i < l; i += 1) {
	                this_str_pos = template.indexOf(Twig.token.strings[i], offset);

	                if (this_str_pos > 0 && this_str_pos < pos &&
	                        (str_pos === null || this_str_pos < str_pos)) {
	                    str_pos = this_str_pos;
	                    str_found = Twig.token.strings[i];
	                }
	            }

	            // We found a string before the end of the token, now find the string's end and set the search offset to it
	            if (str_pos !== null) {
	                end_offset = str_pos + 1;
	                end = null;
	                found = false;
	                while (true) {
	                    end_str_pos = template.indexOf(str_found, end_offset);
	                    if (end_str_pos < 0) {
	                        throw "Unclosed string in template";
	                    }
	                    // Ignore escaped quotes
	                    if (template.substr(end_str_pos - 1, 1) !== "\\") {
	                        offset = end_str_pos + 1;
	                        break;
	                    } else {
	                        end_offset = end_str_pos + 1;
	                    }
	                }
	            }
	        }
	        return end;
	    };

	    /**
	     * Convert a template into high-level tokens.
	     */
	    Twig.tokenize = function (template) {
	        var tokens = [],
	            // An offset for reporting errors locations in the template.
	            error_offset = 0,

	            // The start and type of the first token found in the template.
	            found_token = null,
	            // The end position of the matched token.
	            end = null;

	        while (template.length > 0) {
	            // Find the first occurance of any token type in the template
	            found_token = Twig.token.findStart(template);

	            Twig.log.trace("Twig.tokenize: ", "Found token: ", found_token);

	            if (found_token.position !== null) {
	                // Add a raw type token for anything before the start of the token
	                if (found_token.position > 0) {
	                    tokens.push({
	                        type: Twig.token.type.raw,
	                        value: template.substring(0, found_token.position)
	                    });
	                }
	                template = template.substr(found_token.position + found_token.def.open.length);
	                error_offset += found_token.position + found_token.def.open.length;

	                // Find the end of the token
	                end = Twig.token.findEnd(template, found_token.def, error_offset);

	                Twig.log.trace("Twig.tokenize: ", "Token ends at ", end);

	                tokens.push({
	                    type:  found_token.def.type,
	                    value: template.substring(0, end).trim()
	                });

	                if (template.substr( end + found_token.def.close.length, 1 ) === "\n") {
	                    switch (found_token.def.type) {
	                        case "logic_whitespace_pre":
	                        case "logic_whitespace_post":
	                        case "logic_whitespace_both":
	                        case "logic":
	                            // Newlines directly after logic tokens are ignored
	                            end += 1;
	                            break;
	                    }
	                }

	                template = template.substr(end + found_token.def.close.length);

	                // Increment the position in the template
	                error_offset += end + found_token.def.close.length;

	            } else {
	                // No more tokens -> add the rest of the template as a raw-type token
	                tokens.push({
	                    type: Twig.token.type.raw,
	                    value: template
	                });
	                template = '';
	            }
	        }

	        return tokens;
	    };


	    Twig.compile = function (tokens) {
	        try {

	            // Output and intermediate stacks
	            var output = [],
	                stack = [],
	                // The tokens between open and close tags
	                intermediate_output = [],

	                token = null,
	                logic_token = null,
	                unclosed_token = null,
	                // Temporary previous token.
	                prev_token = null,
	                // Temporary previous output.
	                prev_output = null,
	                // Temporary previous intermediate output.
	                prev_intermediate_output = null,
	                // The previous token's template
	                prev_template = null,
	                // Token lookahead
	                next_token = null,
	                // The output token
	                tok_output = null,

	                // Logic Token values
	                type = null,
	                open = null,
	                next = null;

	            var compile_output = function(token) {
	                Twig.expression.compile.apply(this, [token]);
	                if (stack.length > 0) {
	                    intermediate_output.push(token);
	                } else {
	                    output.push(token);
	                }
	            };

	            var compile_logic = function(token) {
	                // Compile the logic token
	                logic_token = Twig.logic.compile.apply(this, [token]);

	                type = logic_token.type;
	                open = Twig.logic.handler[type].open;
	                next = Twig.logic.handler[type].next;

	                Twig.log.trace("Twig.compile: ", "Compiled logic token to ", logic_token,
	                                                 " next is: ", next, " open is : ", open);

	                // Not a standalone token, check logic stack to see if this is expected
	                if (open !== undefined && !open) {
	                    prev_token = stack.pop();
	                    prev_template = Twig.logic.handler[prev_token.type];

	                    if (Twig.indexOf(prev_template.next, type) < 0) {
	                        throw new Error(type + " not expected after a " + prev_token.type);
	                    }

	                    prev_token.output = prev_token.output || [];

	                    prev_token.output = prev_token.output.concat(intermediate_output);
	                    intermediate_output = [];

	                    tok_output = {
	                        type: Twig.token.type.logic,
	                        token: prev_token
	                    };
	                    if (stack.length > 0) {
	                        intermediate_output.push(tok_output);
	                    } else {
	                        output.push(tok_output);
	                    }
	                }

	                // This token requires additional tokens to complete the logic structure.
	                if (next !== undefined && next.length > 0) {
	                    Twig.log.trace("Twig.compile: ", "Pushing ", logic_token, " to logic stack.");

	                    if (stack.length > 0) {
	                        // Put any currently held output into the output list of the logic operator
	                        // currently at the head of the stack before we push a new one on.
	                        prev_token = stack.pop();
	                        prev_token.output = prev_token.output || [];
	                        prev_token.output = prev_token.output.concat(intermediate_output);
	                        stack.push(prev_token);
	                        intermediate_output = [];
	                    }

	                    // Push the new logic token onto the logic stack
	                    stack.push(logic_token);

	                } else if (open !== undefined && open) {
	                    tok_output = {
	                        type: Twig.token.type.logic,
	                        token: logic_token
	                    };
	                    // Standalone token (like {% set ... %}
	                    if (stack.length > 0) {
	                        intermediate_output.push(tok_output);
	                    } else {
	                        output.push(tok_output);
	                    }
	                }
	            };

	            while (tokens.length > 0) {
	                token = tokens.shift();
	                prev_output = output[output.length - 1];
	                prev_intermediate_output = intermediate_output[intermediate_output.length - 1];
	                next_token = tokens[0];
	                Twig.log.trace("Compiling token ", token);
	                switch (token.type) {
	                    case Twig.token.type.raw:
	                        if (stack.length > 0) {
	                            intermediate_output.push(token);
	                        } else {
	                            output.push(token);
	                        }
	                        break;

	                    case Twig.token.type.logic:
	                        compile_logic.call(this, token);
	                        break;

	                    // Do nothing, comments should be ignored
	                    case Twig.token.type.comment:
	                        break;

	                    case Twig.token.type.output:
	                        compile_output.call(this, token);
	                        break;

	                    //Kill whitespace ahead and behind this token
	                    case Twig.token.type.logic_whitespace_pre:
	                    case Twig.token.type.logic_whitespace_post:
	                    case Twig.token.type.logic_whitespace_both:
	                    case Twig.token.type.output_whitespace_pre:
	                    case Twig.token.type.output_whitespace_post:
	                    case Twig.token.type.output_whitespace_both:
	                        if (token.type !== Twig.token.type.output_whitespace_post && token.type !== Twig.token.type.logic_whitespace_post) {
	                            if (prev_output) {
	                                //If the previous output is raw, pop it off
	                                if (prev_output.type === Twig.token.type.raw) {
	                                    output.pop();

	                                    //If the previous output is not just whitespace, trim it
	                                    if (prev_output.value.match(/^\s*$/) === null) {
	                                        prev_output.value = prev_output.value.trim();
	                                        //Repush the previous output
	                                        output.push(prev_output);
	                                    }
	                                }
	                            }

	                            if (prev_intermediate_output) {
	                                //If the previous intermediate output is raw, pop it off
	                                if (prev_intermediate_output.type === Twig.token.type.raw) {
	                                    intermediate_output.pop();

	                                    //If the previous output is not just whitespace, trim it
	                                    if (prev_intermediate_output.value.match(/^\s*$/) === null) {
	                                        prev_intermediate_output.value = prev_intermediate_output.value.trim();
	                                        //Repush the previous intermediate output
	                                        intermediate_output.push(prev_intermediate_output);
	                                    }
	                                }
	                            }
	                        }

	                        //Compile this token
	                        switch (token.type) {
	                            case Twig.token.type.output_whitespace_pre:
	                            case Twig.token.type.output_whitespace_post:
	                            case Twig.token.type.output_whitespace_both:
	                                compile_output.call(this, token);
	                                break;
	                            case Twig.token.type.logic_whitespace_pre:
	                            case Twig.token.type.logic_whitespace_post:
	                            case Twig.token.type.logic_whitespace_both:
	                                compile_logic.call(this, token);
	                                break;
	                        }

	                        if (token.type !== Twig.token.type.output_whitespace_pre && token.type !== Twig.token.type.logic_whitespace_pre) {
	                            if (next_token) {
	                                //If the next token is raw, shift it out
	                                if (next_token.type === Twig.token.type.raw) {
	                                    tokens.shift();

	                                    //If the next token is not just whitespace, trim it
	                                    if (next_token.value.match(/^\s*$/) === null) {
	                                        next_token.value = next_token.value.trim();
	                                        //Unshift the next token
	                                        tokens.unshift(next_token);
	                                    }
	                                }
	                            }
	                        }

	                        break;
	                }

	                Twig.log.trace("Twig.compile: ", " Output: ", output,
	                                                 " Logic Stack: ", stack,
	                                                 " Pending Output: ", intermediate_output );
	            }

	            // Verify that there are no logic tokens left in the stack.
	            if (stack.length > 0) {
	                unclosed_token = stack.pop();
	                throw new Error("Unable to find an end tag for " + unclosed_token.type +
	                                ", expecting one of " + unclosed_token.next);
	            }
	            return output;
	        } catch (ex) {
	            Twig.log.error("Error compiling twig template " + this.id + ": ");
	            if (ex.stack) {
	                Twig.log.error(ex.stack);
	            } else {
	                Twig.log.error(ex.toString());
	            }

	            if (this.options.rethrow) throw ex;
	        }
	    };

	    /**
	     * Parse a compiled template.
	     *
	     * @param {Array} tokens The compiled tokens.
	     * @param {Object} context The render context.
	     *
	     * @return {string} The parsed template.
	     */
	    Twig.parse = function (tokens, context) {
	        try {
	            var output = [],
	                // Track logic chains
	                chain = true,
	                that = this;

	            Twig.forEach(tokens, function parseToken(token) {
	                Twig.log.debug("Twig.parse: ", "Parsing token: ", token);

	                switch (token.type) {
	                    case Twig.token.type.raw:
	                        output.push(Twig.filters.raw(token.value));
	                        break;

	                    case Twig.token.type.logic:
	                        var logic_token = token.token,
	                            logic = Twig.logic.parse.apply(that, [logic_token, context, chain]);

	                        if (logic.chain !== undefined) {
	                            chain = logic.chain;
	                        }
	                        if (logic.context !== undefined) {
	                            context = logic.context;
	                        }
	                        if (logic.output !== undefined) {
	                            output.push(logic.output);
	                        }
	                        break;

	                    case Twig.token.type.comment:
	                        // Do nothing, comments should be ignored
	                        break;

	                    //Fall through whitespace to output
	                    case Twig.token.type.output_whitespace_pre:
	                    case Twig.token.type.output_whitespace_post:
	                    case Twig.token.type.output_whitespace_both:
	                    case Twig.token.type.output:
	                        Twig.log.debug("Twig.parse: ", "Output token: ", token.stack);
	                        // Parse the given expression in the given context
	                        output.push(Twig.expression.parse.apply(that, [token.stack, context]));
	                        break;
	                }
	            });
	            return Twig.output.apply(this, [output]);
	        } catch (ex) {
	            Twig.log.error("Error parsing twig template " + this.id + ": ");
	            if (ex.stack) {
	                Twig.log.error(ex.stack);
	            } else {
	                Twig.log.error(ex.toString());
	            }

	            if (this.options.rethrow) throw ex;

	            if (Twig.debug) {
	                return ex.toString();
	            }
	        }
	    };

	    /**
	     * Tokenize and compile a string template.
	     *
	     * @param {string} data The template.
	     *
	     * @return {Array} The compiled tokens.
	     */
	    Twig.prepare = function(data) {
	        var tokens, raw_tokens;

	        // Tokenize
	        Twig.log.debug("Twig.prepare: ", "Tokenizing ", data);
	        raw_tokens = Twig.tokenize.apply(this, [data]);

	        // Compile
	        Twig.log.debug("Twig.prepare: ", "Compiling ", raw_tokens);
	        tokens = Twig.compile.apply(this, [raw_tokens]);

	        Twig.log.debug("Twig.prepare: ", "Compiled ", tokens);

	        return tokens;
	    };

	    /**
	     * Join the output token's stack and escape it if needed
	     *
	     * @param {Array} Output token's stack
	     *
	     * @return {string|String} Autoescaped output
	     */
	    Twig.output = function(output) {
	        if (!this.options.autoescape) {
	            return output.join("");
	        }

	        var strategy = 'html';
	        if(typeof this.options.autoescape == 'string')
	            strategy = this.options.autoescape;

	        // [].map would be better but it's not supported by IE8-
	        var escaped_output = [];
	        Twig.forEach(output, function (str) {
	            if (str && (str.twig_markup !== true && str.twig_markup != strategy)) {
	                str = Twig.filters.escape(str, [ strategy ]);
	            }
	            escaped_output.push(str);
	        });
	        return Twig.Markup(escaped_output.join(""));
	    }

	    // Namespace for template storage and retrieval
	    Twig.Templates = {
	        /**
	         * Registered template loaders - use Twig.Templates.registerLoader to add supported loaders
	         * @type {Object}
	         */
	        loaders: {},

	        /**
	         * Registered template parsers - use Twig.Templates.registerParser to add supported parsers
	         * @type {Object}
	         */
	        parsers: {},

	        /**
	         * Cached / loaded templates
	         * @type {Object}
	         */
	        registry: {}
	    };

	    /**
	     * Is this id valid for a twig template?
	     *
	     * @param {string} id The ID to check.
	     *
	     * @throws {Twig.Error} If the ID is invalid or used.
	     * @return {boolean} True if the ID is valid.
	     */
	    Twig.validateId = function(id) {
	        if (id === "prototype") {
	            throw new Twig.Error(id + " is not a valid twig identifier");
	        } else if (Twig.cache && Twig.Templates.registry.hasOwnProperty(id)) {
	            throw new Twig.Error("There is already a template with the ID " + id);
	        }
	        return true;
	    }

	    /**
	     * Register a template loader
	     *
	     * @example
	     * Twig.extend(function(Twig) {
	     *    Twig.Templates.registerLoader('custom_loader', function(location, params, callback, error_callback) {
	     *        // ... load the template ...
	     *        params.data = loadedTemplateData;
	     *        // create and return the template
	     *        var template = new Twig.Template(params);
	     *        if (typeof callback === 'function') {
	     *            callback(template);
	     *        }
	     *        return template;
	     *    });
	     * });
	     * 
	     * @param {String} method_name The method this loader is intended for (ajax, fs)
	     * @param {Function} func The function to execute when loading the template
	     * @param {Object|undefined} scope Optional scope parameter to bind func to
	     *
	     * @throws Twig.Error
	     *
	     * @return {void}
	     */
	    Twig.Templates.registerLoader = function(method_name, func, scope) {
	        if (typeof func !== 'function') {
	            throw new Twig.Error('Unable to add loader for ' + method_name + ': Invalid function reference given.');
	        }
	        if (scope) {
	            func = func.bind(scope);
	        }
	        this.loaders[method_name] = func;
	    };

	    /**
	     * Remove a registered loader
	     * 
	     * @param {String} method_name The method name for the loader you wish to remove
	     *
	     * @return {void}
	     */
	    Twig.Templates.unRegisterLoader = function(method_name) {
	        if (this.isRegisteredLoader(method_name)) {
	            delete this.loaders[method_name];
	        }
	    };

	    /**
	     * See if a loader is registered by its method name
	     * 
	     * @param {String} method_name The name of the loader you are looking for
	     *
	     * @return {boolean}
	     */
	    Twig.Templates.isRegisteredLoader = function(method_name) {
	        return this.loaders.hasOwnProperty(method_name);
	    };

	    /**
	     * Register a template parser
	     *
	     * @example
	     * Twig.extend(function(Twig) {
	     *    Twig.Templates.registerParser('custom_parser', function(params) {
	     *        // this template source can be accessed in params.data
	     *        var template = params.data
	     *
	     *        // ... custom process that modifies the template
	     *
	     *        // return the parsed template
	     *        return template;
	     *    });
	     * });
	     *
	     * @param {String} method_name The method this parser is intended for (twig, source)
	     * @param {Function} func The function to execute when parsing the template
	     * @param {Object|undefined} scope Optional scope parameter to bind func to
	     *
	     * @throws Twig.Error
	     *
	     * @return {void}
	     */
	    Twig.Templates.registerParser = function(method_name, func, scope) {
	        if (typeof func !== 'function') {
	            throw new Twig.Error('Unable to add parser for ' + method_name + ': Invalid function regerence given.');
	        }

	        if (scope) {
	            func = func.bind(scope);
	        }

	        this.parsers[method_name] = func;
	    };

	    /**
	     * Remove a registered parser
	     *
	     * @param {String} method_name The method name for the parser you wish to remove
	     *
	     * @return {void}
	     */
	    Twig.Templates.unRegisterParser = function(method_name) {
	        if (this.isRegisteredParser(method_name)) {
	            delete this.parsers[method_name];
	        }
	    };

	    /**
	     * See if a parser is registered by its method name
	     *
	     * @param {String} method_name The name of the parser you are looking for
	     *
	     * @return {boolean}
	     */
	    Twig.Templates.isRegisteredParser = function(method_name) {
	        return this.parsers.hasOwnProperty(method_name);
	    };

	    /**
	     * Save a template object to the store.
	     *
	     * @param {Twig.Template} template   The twig.js template to store.
	     */
	    Twig.Templates.save = function(template) {
	        if (template.id === undefined) {
	            throw new Twig.Error("Unable to save template with no id");
	        }
	        Twig.Templates.registry[template.id] = template;
	    };

	    /**
	     * Load a previously saved template from the store.
	     *
	     * @param {string} id   The ID of the template to load.
	     *
	     * @return {Twig.Template} A twig.js template stored with the provided ID.
	     */
	    Twig.Templates.load = function(id) {
	        if (!Twig.Templates.registry.hasOwnProperty(id)) {
	            return null;
	        }
	        return Twig.Templates.registry[id];
	    };

	    /**
	     * Load a template from a remote location using AJAX and saves in with the given ID.
	     *
	     * Available parameters:
	     *
	     *      async:       Should the HTTP request be performed asynchronously.
	     *                      Defaults to true.
	     *      method:      What method should be used to load the template
	     *                      (fs or ajax)
	     *      parser:      What method should be used to parse the template
	     *                      (twig or source)
	     *      precompiled: Has the template already been compiled.
	     *
	     * @param {string} location  The remote URL to load as a template.
	     * @param {Object} params The template parameters.
	     * @param {function} callback  A callback triggered when the template finishes loading.
	     * @param {function} error_callback  A callback triggered if an error occurs loading the template.
	     *
	     *
	     */
	    Twig.Templates.loadRemote = function(location, params, callback, error_callback) {
	        var loader;

	        // Default to async
	        if (params.async === undefined) {
	            params.async = true;
	        }

	        // Default to the URL so the template is cached.
	        if (params.id === undefined) {
	            params.id = location;
	        }

	        // Check for existing template
	        if (Twig.cache && Twig.Templates.registry.hasOwnProperty(params.id)) {
	            // A template is already saved with the given id.
	            if (typeof callback === 'function') {
	                callback(Twig.Templates.registry[params.id]);
	            }
	            // TODO: if async, return deferred promise
	            return Twig.Templates.registry[params.id];
	        }

	        //if the parser name hasn't been set, default it to twig
	        params.parser = params.parser || 'twig';

	        // Assume 'fs' if the loader is not defined
	        loader = this.loaders[params.method] || this.loaders.fs;
	        return loader.apply(this, arguments);
	    };

	    // Determine object type
	    function is(type, obj) {
	        var clas = Object.prototype.toString.call(obj).slice(8, -1);
	        return obj !== undefined && obj !== null && clas === type;
	    }

	    /**
	     * Create a new twig.js template.
	     *
	     * Parameters: {
	     *      data:   The template, either pre-compiled tokens or a string template
	     *      id:     The name of this template
	     *      blocks: Any pre-existing block from a child template
	     * }
	     *
	     * @param {Object} params The template parameters.
	     */
	    Twig.Template = function ( params ) {
	        var data = params.data,
	            id = params.id,
	            blocks = params.blocks,
	            macros = params.macros || {},
	            base = params.base,
	            path = params.path,
	            url = params.url,
	            name = params.name,
	            method = params.method,
	            // parser options
	            options = params.options;

	        // # What is stored in a Twig.Template
	        //
	        // The Twig Template hold several chucks of data.
	        //
	        //     {
	        //          id:     The token ID (if any)
	        //          tokens: The list of tokens that makes up this template.
	        //          blocks: The list of block this template contains.
	        //          base:   The base template (if any)
	        //            options:  {
	        //                Compiler/parser options
	        //
	        //                strict_variables: true/false
	        //                    Should missing variable/keys emit an error message. If false, they default to null.
	        //            }
	        //     }
	        //

	        this.id     = id;
	        this.method = method;
	        this.base   = base;
	        this.path   = path;
	        this.url    = url;
	        this.name   = name;
	        this.macros = macros;
	        this.options = options;

	        this.reset(blocks);

	        if (is('String', data)) {
	            this.tokens = Twig.prepare.apply(this, [data]);
	        } else {
	            this.tokens = data;
	        }

	        if (id !== undefined) {
	            Twig.Templates.save(this);
	        }
	    };

	    Twig.Template.prototype.reset = function(blocks) {
	        Twig.log.debug("Twig.Template.reset", "Reseting template " + this.id);
	        this.blocks = {};
	        this.importedBlocks = [];
	        this.originalBlockTokens = {};
	        this.child = {
	            blocks: blocks || {}
	        };
	        this.extend = null;
	    };

	    Twig.Template.prototype.render = function (context, params) {
	        params = params || {};

	        var output,
	            url;

	        this.context = context || {};

	        // Clear any previous state
	        this.reset();
	        if (params.blocks) {
	            this.blocks = params.blocks;
	        }
	        if (params.macros) {
	            this.macros = params.macros;
	        }

	        output = Twig.parse.apply(this, [this.tokens, this.context]);

	        // Does this template extend another
	        if (this.extend) {
	            var ext_template;

	            // check if the template is provided inline
	            if ( this.options.allowInlineIncludes ) {
	                ext_template = Twig.Templates.load(this.extend);
	                if ( ext_template ) {
	                    ext_template.options = this.options;
	                }
	            }

	            // check for the template file via include
	            if (!ext_template) {
	                url = Twig.path.parsePath(this, this.extend);

	                ext_template = Twig.Templates.loadRemote(url, {
	                    method: this.getLoaderMethod(),
	                    base: this.base,
	                    async:  false,
	                    id:     url,
	                    options: this.options
	                });
	            }

	            this.parent = ext_template;

	            return this.parent.render(this.context, {
	                blocks: this.blocks
	            });
	        }

	        if (params.output == 'blocks') {
	            return this.blocks;
	        } else if (params.output == 'macros') {
	            return this.macros;
	        } else {
	            return output;
	        }
	    };

	    Twig.Template.prototype.importFile = function(file) {
	        var url, sub_template;
	        if (!this.url && this.options.allowInlineIncludes) {
	            file = this.path ? this.path + '/' + file : file;
	            sub_template = Twig.Templates.load(file);

	            if (!sub_template) {
	                sub_template = Twig.Templates.loadRemote(url, {
	                    id: file,
	                    method: this.getLoaderMethod(),
	                    async: false,
	                    options: this.options
	                });

	                if (!sub_template) {
	                    throw new Twig.Error("Unable to find the template " + file);
	                }
	            }

	            sub_template.options = this.options;

	            return sub_template;
	        }

	        url = Twig.path.parsePath(this, file);

	        // Load blocks from an external file
	        sub_template = Twig.Templates.loadRemote(url, {
	            method: this.getLoaderMethod(),
	            base: this.base,
	            async: false,
	            options: this.options,
	            id: url
	        });

	        return sub_template;
	    };

	    Twig.Template.prototype.importBlocks = function(file, override) {
	        var sub_template = this.importFile(file),
	            context = this.context,
	            that = this,
	            key;

	        override = override || false;

	        sub_template.render(context);

	        // Mixin blocks
	        Twig.forEach(Object.keys(sub_template.blocks), function(key) {
	            if (override || that.blocks[key] === undefined) {
	                that.blocks[key] = sub_template.blocks[key];
	                that.importedBlocks.push(key);
	            }
	        });
	    };

	    Twig.Template.prototype.importMacros = function(file) {
	        var url = Twig.path.parsePath(this, file);

	        // load remote template
	        var remoteTemplate = Twig.Templates.loadRemote(url, {
	            method: this.getLoaderMethod(),
	            async: false,
	            id: url
	        });

	        return remoteTemplate;
	    };

	    Twig.Template.prototype.getLoaderMethod = function() {
	        if (this.path) {
	            return 'fs';
	        }
	        if (this.url) {
	            return 'ajax';
	        }
	        return this.method || 'fs';
	    };

	    Twig.Template.prototype.compile = function(options) {
	        // compile the template into raw JS
	        return Twig.compiler.compile(this, options);
	    };

	    /**
	     * Create safe output
	     *
	     * @param {string} Content safe to output
	     *
	     * @return {String} Content wrapped into a String
	     */

	    Twig.Markup = function(content, strategy) {
	        if(typeof strategy == 'undefined') {
	            strategy = true;
	        }

	        if (typeof content === 'string' && content.length > 0) {
	            content = new String(content);
	            content.twig_markup = strategy;
	        }
	        return content;
	    };

	    return Twig;

	};


/***/ },
/* 2 */
/***/ function(module, exports) {

	// ## twig.compiler.js
	//
	// This file handles compiling templates into JS
	module.exports = function (Twig) {
	    /**
	     * Namespace for compilation.
	     */
	    Twig.compiler = {
	        module: {}
	    };

	    // Compile a Twig Template to output.
	    Twig.compiler.compile = function(template, options) {
	        // Get tokens
	        var tokens = JSON.stringify(template.tokens)
	            , id = template.id
	            , output;

	        if (options.module) {
	            if (Twig.compiler.module[options.module] === undefined) {
	                throw new Twig.Error("Unable to find module type " + options.module);
	            }
	            output = Twig.compiler.module[options.module](id, tokens, options.twig);
	        } else {
	            output = Twig.compiler.wrap(id, tokens);
	        }
	        return output;
	    };

	    Twig.compiler.module = {
	        amd: function(id, tokens, pathToTwig) {
	            return 'define(["' + pathToTwig + '"], function (Twig) {\n\tvar twig, templates;\ntwig = Twig.twig;\ntemplates = ' + Twig.compiler.wrap(id, tokens) + '\n\treturn templates;\n});';
	        }
	        , node: function(id, tokens) {
	            return 'var twig = require("twig").twig;\n'
	                + 'exports.template = ' + Twig.compiler.wrap(id, tokens)
	        }
	        , cjs2: function(id, tokens, pathToTwig) {
	            return 'module.declare([{ twig: "' + pathToTwig + '" }], function (require, exports, module) {\n'
	                        + '\tvar twig = require("twig").twig;\n'
	                        + '\texports.template = ' + Twig.compiler.wrap(id, tokens)
	                    + '\n});'
	        }
	    };

	    Twig.compiler.wrap = function(id, tokens) {
	        return 'twig({id:"'+id.replace('"', '\\"')+'", data:'+tokens+', precompiled: true});\n';
	    };

	    return Twig;
	};


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	// ## twig.expression.js
	//
	// This file handles tokenizing, compiling and parsing expressions.
	module.exports = function (Twig) {
	    "use strict";

	    /**
	     * Namespace for expression handling.
	     */
	    Twig.expression = { };

	    __webpack_require__(4)(Twig);

	    /**
	     * Reserved word that can't be used as variable names.
	     */
	    Twig.expression.reservedWords = [
	        "true", "false", "null", "TRUE", "FALSE", "NULL", "_context", "and", "or", "in", "not in", "if"
	    ];

	    /**
	     * The type of tokens used in expressions.
	     */
	    Twig.expression.type = {
	        comma:      'Twig.expression.type.comma',
	        operator: {
	            unary:  'Twig.expression.type.operator.unary',
	            binary: 'Twig.expression.type.operator.binary'
	        },
	        string:     'Twig.expression.type.string',
	        bool:       'Twig.expression.type.bool',
	        slice:      'Twig.expression.type.slice',
	        array: {
	            start:  'Twig.expression.type.array.start',
	            end:    'Twig.expression.type.array.end'
	        },
	        object: {
	            start:  'Twig.expression.type.object.start',
	            end:    'Twig.expression.type.object.end'
	        },
	        parameter: {
	            start:  'Twig.expression.type.parameter.start',
	            end:    'Twig.expression.type.parameter.end'
	        },
	        subexpression: {
	            start:  'Twig.expression.type.subexpression.start',
	            end:    'Twig.expression.type.subexpression.end'
	        },
	        key: {
	            period:   'Twig.expression.type.key.period',
	            brackets: 'Twig.expression.type.key.brackets'
	        },
	        filter:     'Twig.expression.type.filter',
	        _function:  'Twig.expression.type._function',
	        variable:   'Twig.expression.type.variable',
	        number:     'Twig.expression.type.number',
	        _null:     'Twig.expression.type.null',
	        context:    'Twig.expression.type.context',
	        test:       'Twig.expression.type.test'
	    };

	    Twig.expression.set = {
	        // What can follow an expression (in general)
	        operations: [
	            Twig.expression.type.filter,
	            Twig.expression.type.operator.unary,
	            Twig.expression.type.operator.binary,
	            Twig.expression.type.array.end,
	            Twig.expression.type.object.end,
	            Twig.expression.type.parameter.end,
	            Twig.expression.type.subexpression.end,
	            Twig.expression.type.comma,
	            Twig.expression.type.test
	        ],
	        expressions: [
	            Twig.expression.type._function,
	            Twig.expression.type.bool,
	            Twig.expression.type.string,
	            Twig.expression.type.variable,
	            Twig.expression.type.number,
	            Twig.expression.type._null,
	            Twig.expression.type.context,
	            Twig.expression.type.parameter.start,
	            Twig.expression.type.array.start,
	            Twig.expression.type.object.start,
	            Twig.expression.type.subexpression.start
	        ]
	    };

	    // Most expressions allow a '.' or '[' after them, so we provide a convenience set
	    Twig.expression.set.operations_extended = Twig.expression.set.operations.concat([
	                    Twig.expression.type.key.period,
	                    Twig.expression.type.key.brackets,
	                    Twig.expression.type.slice]);

	    // Some commonly used compile and parse functions.
	    Twig.expression.fn = {
	        compile: {
	            push: function(token, stack, output) {
	                output.push(token);
	            },
	            push_both: function(token, stack, output) {
	                output.push(token);
	                stack.push(token);
	            }
	        },
	        parse: {
	            push: function(token, stack, context) {
	                stack.push(token);
	            },
	            push_value: function(token, stack, context) {
	                stack.push(token.value);
	            }
	        }
	    };

	    // The regular expressions and compile/parse logic used to match tokens in expressions.
	    //
	    // Properties:
	    //
	    //      type:  The type of expression this matches
	    //
	    //      regex: One or more regular expressions that matche the format of the token.
	    //
	    //      next:  Valid tokens that can occur next in the expression.
	    //
	    // Functions:
	    //
	    //      compile: A function that compiles the raw regular expression match into a token.
	    //
	    //      parse:   A function that parses the compiled token into output.
	    //
	    Twig.expression.definitions = [
	        {
	            type: Twig.expression.type.test,
	            regex: /^is\s+(not)?\s*([a-zA-Z_][a-zA-Z0-9_]*)/,
	            next: Twig.expression.set.operations.concat([Twig.expression.type.parameter.start]),
	            compile: function(token, stack, output) {
	                token.filter   = token.match[2];
	                token.modifier = token.match[1];
	                delete token.match;
	                delete token.value;
	                output.push(token);
	            },
	            parse: function(token, stack, context) {
	                var value = stack.pop(),
	                    params = token.params && Twig.expression.parse.apply(this, [token.params, context]),
	                    result = Twig.test(token.filter, value, params);

	                if (token.modifier == 'not') {
	                    stack.push(!result);
	                } else {
	                    stack.push(result);
	                }
	            }
	        },
	        {
	            type: Twig.expression.type.comma,
	            // Match a comma
	            regex: /^,/,
	            next: Twig.expression.set.expressions.concat([Twig.expression.type.array.end, Twig.expression.type.object.end]),
	            compile: function(token, stack, output) {
	                var i = stack.length - 1,
	                    stack_token;

	                delete token.match;
	                delete token.value;

	                // pop tokens off the stack until the start of the object
	                for(;i >= 0; i--) {
	                    stack_token = stack.pop();
	                    if (stack_token.type === Twig.expression.type.object.start
	                            || stack_token.type === Twig.expression.type.parameter.start
	                            || stack_token.type === Twig.expression.type.array.start) {
	                        stack.push(stack_token);
	                        break;
	                    }
	                    output.push(stack_token);
	                }
	                output.push(token);
	            }
	        },
	        {
	            /**
	             * Match a number (integer or decimal)
	             */
	            type: Twig.expression.type.number,
	            // match a number
	            regex: /^\-?\d+(\.\d+)?/,
	            next: Twig.expression.set.operations,
	            compile: function(token, stack, output) {
	                token.value = Number(token.value);
	                output.push(token);
	            },
	            parse: Twig.expression.fn.parse.push_value
	        },
	        {
	            type: Twig.expression.type.operator.binary,
	            // Match any of ?:, +, *, /, -, %, ~, <, <=, >, >=, !=, ==, **, ?, :, and, or, in, not in
	            // and, or, in, not in can be followed by a space or parenthesis
	            regex: /(^\?\:|^[\+\-~%\?]|^[\:](?!\d\])|^[!=]==?|^[!<>]=?|^\*\*?|^\/\/?|^(and)[\(|\s+]|^(or)[\(|\s+]|^(in)[\(|\s+]|^(not in)[\(|\s+]|^\.\.)/,
	            next: Twig.expression.set.expressions.concat([Twig.expression.type.operator.unary]),
	            transform: function(match, tokens) {
	                switch(match[0]) {
	                    case 'and(':
	                    case 'or(':
	                    case 'in(':
	                    case 'not in(':
	                        //Strip off the ( if it exists
	                        tokens[tokens.length - 1].value = match[2];
	                        return match[0];
	                        break;
	                    default:
	                        return '';
	                }
	            },
	            compile: function(token, stack, output) {
	                delete token.match;

	                token.value = token.value.trim();
	                var value = token.value,
	                    operator = Twig.expression.operator.lookup(value, token);

	                Twig.log.trace("Twig.expression.compile: ", "Operator: ", operator, " from ", value);

	                while (stack.length > 0 &&
	                       (stack[stack.length-1].type == Twig.expression.type.operator.unary || stack[stack.length-1].type == Twig.expression.type.operator.binary) &&
	                            (
	                                (operator.associativity === Twig.expression.operator.leftToRight &&
	                                 operator.precidence    >= stack[stack.length-1].precidence) ||

	                                (operator.associativity === Twig.expression.operator.rightToLeft &&
	                                 operator.precidence    >  stack[stack.length-1].precidence)
	                            )
	                       ) {
	                     var temp = stack.pop();
	                     output.push(temp);
	                }

	                if (value === ":") {
	                    // Check if this is a ternary or object key being set
	                    if (stack[stack.length - 1] && stack[stack.length-1].value === "?") {
	                        // Continue as normal for a ternary
	                    } else {
	                        // This is not a ternary so we push the token to the output where it can be handled
	                        //   when the assocated object is closed.
	                        var key_token = output.pop();

	                        if (key_token.type === Twig.expression.type.string ||
	                                key_token.type === Twig.expression.type.variable) {
	                            token.key = key_token.value;
	                        } else if (key_token.type === Twig.expression.type.number) {
	                            // Convert integer keys into string keys
	                            token.key = key_token.value.toString();
	                        } else if (key_token.expression &&
	                            (key_token.type === Twig.expression.type.parameter.end ||
	                            key_token.type == Twig.expression.type.subexpression.end)) {
	                            token.params = key_token.params;
	                        } else {
	                            throw new Twig.Error("Unexpected value before ':' of " + key_token.type + " = " + key_token.value);
	                        }

	                        output.push(token);
	                        return;
	                    }
	                } else {
	                    stack.push(operator);
	                }
	            },
	            parse: function(token, stack, context) {
	                if (token.key) {
	                    // handle ternary ':' operator
	                    stack.push(token);
	                } else if (token.params) {
	                    // handle "{(expression):value}"
	                    token.key = Twig.expression.parse.apply(this, [token.params, context]);
	                    stack.push(token);

	                    //If we're in a loop, we might need token.params later, especially in this form of "(expression):value"
	                    if (!context.loop) {
	                        delete(token.params);
	                    }
	                } else {
	                    Twig.expression.operator.parse(token.value, stack);
	                }
	            }
	        },
	        {
	            type: Twig.expression.type.operator.unary,
	            // Match any of not
	            regex: /(^not\s+)/,
	            next: Twig.expression.set.expressions,
	            compile: function(token, stack, output) {
	                delete token.match;

	                token.value = token.value.trim();
	                var value = token.value,
	                    operator = Twig.expression.operator.lookup(value, token);

	                Twig.log.trace("Twig.expression.compile: ", "Operator: ", operator, " from ", value);

	                while (stack.length > 0 &&
	                       (stack[stack.length-1].type == Twig.expression.type.operator.unary || stack[stack.length-1].type == Twig.expression.type.operator.binary) &&
	                            (
	                                (operator.associativity === Twig.expression.operator.leftToRight &&
	                                 operator.precidence    >= stack[stack.length-1].precidence) ||

	                                (operator.associativity === Twig.expression.operator.rightToLeft &&
	                                 operator.precidence    >  stack[stack.length-1].precidence)
	                            )
	                       ) {
	                     var temp = stack.pop();
	                     output.push(temp);
	                }

	                stack.push(operator);
	            },
	            parse: function(token, stack, context) {
	                Twig.expression.operator.parse(token.value, stack);
	            }
	        },
	        {
	            /**
	             * Match a string. This is anything between a pair of single or double quotes.
	             */
	            type: Twig.expression.type.string,
	            // See: http://blog.stevenlevithan.com/archives/match-quoted-string
	            regex: /^(["'])(?:(?=(\\?))\2[\s\S])*?\1/,
	            next: Twig.expression.set.operations_extended,
	            compile: function(token, stack, output) {
	                var value = token.value;
	                delete token.match

	                // Remove the quotes from the string
	                if (value.substring(0, 1) === '"') {
	                    value = value.replace('\\"', '"');
	                } else {
	                    value = value.replace("\\'", "'");
	                }
	                token.value = value.substring(1, value.length-1).replace( /\\n/g, "\n" ).replace( /\\r/g, "\r" );
	                Twig.log.trace("Twig.expression.compile: ", "String value: ", token.value);
	                output.push(token);
	            },
	            parse: Twig.expression.fn.parse.push_value
	        },
	        {
	            /**
	             * Match a subexpression set start.
	             */
	            type: Twig.expression.type.subexpression.start,
	            regex: /^\(/,
	            next: Twig.expression.set.expressions.concat([Twig.expression.type.subexpression.end]),
	            compile: function(token, stack, output) {
	                token.value = '(';
	                output.push(token);
	                stack.push(token);
	            },
	            parse: Twig.expression.fn.parse.push
	        },
	        {
	            /**
	             * Match a subexpression set end.
	             */
	            type: Twig.expression.type.subexpression.end,
	            regex: /^\)/,
	            next: Twig.expression.set.operations_extended,
	            validate: function(match, tokens) {
	                // Iterate back through previous tokens to ensure we follow a subexpression start
	                var i = tokens.length - 1,
	                    found_subexpression_start = false,
	                    next_subexpression_start_invalid = false,
	                    unclosed_parameter_count = 0;

	                while(!found_subexpression_start && i >= 0) {
	                    var token = tokens[i];

	                    found_subexpression_start = token.type === Twig.expression.type.subexpression.start;

	                    // If we have previously found a subexpression end, then this subexpression start is the start of
	                    // that subexpression, not the subexpression we are searching for
	                    if (found_subexpression_start && next_subexpression_start_invalid) {
	                        next_subexpression_start_invalid = false;
	                        found_subexpression_start = false;
	                    }

	                    // Count parameter tokens to ensure we dont return truthy for a parameter opener
	                    if (token.type === Twig.expression.type.parameter.start) {
	                        unclosed_parameter_count++;
	                    } else if (token.type === Twig.expression.type.parameter.end) {
	                        unclosed_parameter_count--;
	                    } else if (token.type === Twig.expression.type.subexpression.end) {
	                        next_subexpression_start_invalid = true;
	                    }

	                    i--;
	                }

	                // If we found unclosed parameters, return false
	                // If we didnt find subexpression start, return false
	                // Otherwise return true

	                return (found_subexpression_start && (unclosed_parameter_count === 0));
	            },
	            compile: function(token, stack, output) {
	                // This is basically a copy of parameter end compilation
	                var stack_token,
	                    end_token = token;

	                stack_token = stack.pop();
	                while(stack.length > 0 && stack_token.type != Twig.expression.type.subexpression.start) {
	                    output.push(stack_token);
	                    stack_token = stack.pop();
	                }

	                // Move contents of parens into preceding filter
	                var param_stack = [];
	                while(token.type !== Twig.expression.type.subexpression.start) {
	                    // Add token to arguments stack
	                    param_stack.unshift(token);
	                    token = output.pop();
	                }

	                param_stack.unshift(token);

	                var is_expression = false;

	                //If the token at the top of the *stack* is a function token, pop it onto the output queue.
	                // Get the token preceding the parameters
	                stack_token = stack[stack.length-1];

	                if (stack_token === undefined ||
	                    (stack_token.type !== Twig.expression.type._function &&
	                    stack_token.type !== Twig.expression.type.filter &&
	                    stack_token.type !== Twig.expression.type.test &&
	                    stack_token.type !== Twig.expression.type.key.brackets)) {

	                    end_token.expression = true;

	                    // remove start and end token from stack
	                    param_stack.pop();
	                    param_stack.shift();

	                    end_token.params = param_stack;

	                    output.push(end_token);
	                } else {
	                    // This should never be hit
	                    end_token.expression = false;
	                    stack_token.params = param_stack;
	                }
	            },
	            parse: function(token, stack, context) {
	                var new_array = [],
	                    array_ended = false,
	                    value = null;

	                if (token.expression) {
	                    value = Twig.expression.parse.apply(this, [token.params, context]);
	                    stack.push(value);
	                } else {
	                    throw new Twig.Error("Unexpected subexpression end when token is not marked as an expression");
	                }
	            }
	        },
	        {
	            /**
	             * Match a parameter set start.
	             */
	            type: Twig.expression.type.parameter.start,
	            regex: /^\(/,
	            next: Twig.expression.set.expressions.concat([Twig.expression.type.parameter.end]),
	            validate: function(match, tokens) {
	                var last_token = tokens[tokens.length - 1];
	                // We can't use the regex to test if we follow a space because expression is trimmed
	                return last_token && (Twig.indexOf(Twig.expression.reservedWords, last_token.value.trim()) < 0);
	            },
	            compile: Twig.expression.fn.compile.push_both,
	            parse: Twig.expression.fn.parse.push
	        },
	        {
	            /**
	             * Match a parameter set end.
	             */
	            type: Twig.expression.type.parameter.end,
	            regex: /^\)/,
	            next: Twig.expression.set.operations_extended,
	            compile: function(token, stack, output) {
	                var stack_token,
	                    end_token = token;

	                stack_token = stack.pop();
	                while(stack.length > 0 && stack_token.type != Twig.expression.type.parameter.start) {
	                    output.push(stack_token);
	                    stack_token = stack.pop();
	                }

	                // Move contents of parens into preceding filter
	                var param_stack = [];
	                while(token.type !== Twig.expression.type.parameter.start) {
	                    // Add token to arguments stack
	                    param_stack.unshift(token);
	                    token = output.pop();
	                }
	                param_stack.unshift(token);

	                var is_expression = false;

	                // Get the token preceding the parameters
	                token = output[output.length-1];

	                if (token === undefined ||
	                    (token.type !== Twig.expression.type._function &&
	                    token.type !== Twig.expression.type.filter &&
	                    token.type !== Twig.expression.type.test &&
	                    token.type !== Twig.expression.type.key.brackets)) {

	                    end_token.expression = true;

	                    // remove start and end token from stack
	                    param_stack.pop();
	                    param_stack.shift();

	                    end_token.params = param_stack;

	                    output.push(end_token);

	                } else {
	                    end_token.expression = false;
	                    token.params = param_stack;
	                }
	            },
	            parse: function(token, stack, context) {
	                var new_array = [],
	                    array_ended = false,
	                    value = null;

	                if (token.expression) {
	                    value = Twig.expression.parse.apply(this, [token.params, context])
	                    stack.push(value);

	                } else {

	                    while (stack.length > 0) {
	                        value = stack.pop();
	                        // Push values into the array until the start of the array
	                        if (value && value.type && value.type == Twig.expression.type.parameter.start) {
	                            array_ended = true;
	                            break;
	                        }
	                        new_array.unshift(value);
	                    }

	                    if (!array_ended) {
	                        throw new Twig.Error("Expected end of parameter set.");
	                    }

	                    stack.push(new_array);
	                }
	            }
	        },
	        {
	            type: Twig.expression.type.slice,
	            regex: /^\[(\d*\:\d*)\]/,
	            next: Twig.expression.set.operations_extended,
	            compile: function(token, stack, output) {
	                var sliceRange = token.match[1].split(':');

	                //sliceStart can be undefined when we pass parameters to the slice filter later
	                var sliceStart = (sliceRange[0]) ? parseInt(sliceRange[0]) : undefined;
	                var sliceEnd = (sliceRange[1]) ? parseInt(sliceRange[1]) : undefined;

	                token.value = 'slice';
	                token.params = [sliceStart, sliceEnd];

	                //sliceEnd can't be undefined as the slice filter doesn't check for this, but it does check the length
	                //of the params array, so just shorten it.
	                if (!sliceEnd) {
	                    token.params = [sliceStart];
	                }

	                output.push(token);
	            },
	            parse: function(token, stack, context) {
	                var input = stack.pop(),
	                    params = token.params;

	                stack.push(Twig.filter.apply(this, [token.value, input, params]));
	            }
	        },
	        {
	            /**
	             * Match an array start.
	             */
	            type: Twig.expression.type.array.start,
	            regex: /^\[/,
	            next: Twig.expression.set.expressions.concat([Twig.expression.type.array.end]),
	            compile: Twig.expression.fn.compile.push_both,
	            parse: Twig.expression.fn.parse.push
	        },
	        {
	            /**
	             * Match an array end.
	             */
	            type: Twig.expression.type.array.end,
	            regex: /^\]/,
	            next: Twig.expression.set.operations_extended,
	            compile: function(token, stack, output) {
	                var i = stack.length - 1,
	                    stack_token;
	                // pop tokens off the stack until the start of the object
	                for(;i >= 0; i--) {
	                    stack_token = stack.pop();
	                    if (stack_token.type === Twig.expression.type.array.start) {
	                        break;
	                    }
	                    output.push(stack_token);
	                }
	                output.push(token);
	            },
	            parse: function(token, stack, context) {
	                var new_array = [],
	                    array_ended = false,
	                    value = null;

	                while (stack.length > 0) {
	                    value = stack.pop();
	                    // Push values into the array until the start of the array
	                    if (value.type && value.type == Twig.expression.type.array.start) {
	                        array_ended = true;
	                        break;
	                    }
	                    new_array.unshift(value);
	                }
	                if (!array_ended) {
	                    throw new Twig.Error("Expected end of array.");
	                }

	                stack.push(new_array);
	            }
	        },
	        // Token that represents the start of a hash map '}'
	        //
	        // Hash maps take the form:
	        //    { "key": 'value', "another_key": item }
	        //
	        // Keys must be quoted (either single or double) and values can be any expression.
	        {
	            type: Twig.expression.type.object.start,
	            regex: /^\{/,
	            next: Twig.expression.set.expressions.concat([Twig.expression.type.object.end]),
	            compile: Twig.expression.fn.compile.push_both,
	            parse: Twig.expression.fn.parse.push
	        },

	        // Token that represents the end of a Hash Map '}'
	        //
	        // This is where the logic for building the internal
	        // representation of a hash map is defined.
	        {
	            type: Twig.expression.type.object.end,
	            regex: /^\}/,
	            next: Twig.expression.set.operations_extended,
	            compile: function(token, stack, output) {
	                var i = stack.length-1,
	                    stack_token;

	                // pop tokens off the stack until the start of the object
	                for(;i >= 0; i--) {
	                    stack_token = stack.pop();
	                    if (stack_token && stack_token.type === Twig.expression.type.object.start) {
	                        break;
	                    }
	                    output.push(stack_token);
	                }
	                output.push(token);
	            },
	            parse: function(end_token, stack, context) {
	                var new_object = {},
	                    object_ended = false,
	                    token = null,
	                    token_key = null,
	                    has_value = false,
	                    value = null;

	                while (stack.length > 0) {
	                    token = stack.pop();
	                    // Push values into the array until the start of the object
	                    if (token && token.type && token.type === Twig.expression.type.object.start) {
	                        object_ended = true;
	                        break;
	                    }
	                    if (token && token.type && (token.type === Twig.expression.type.operator.binary || token.type === Twig.expression.type.operator.unary) && token.key) {
	                        if (!has_value) {
	                            throw new Twig.Error("Missing value for key '" + token.key + "' in object definition.");
	                        }
	                        new_object[token.key] = value;

	                        // Preserve the order that elements are added to the map
	                        // This is necessary since JavaScript objects don't
	                        // guarantee the order of keys
	                        if (new_object._keys === undefined) new_object._keys = [];
	                        new_object._keys.unshift(token.key);

	                        // reset value check
	                        value = null;
	                        has_value = false;

	                    } else {
	                        has_value = true;
	                        value = token;
	                    }
	                }
	                if (!object_ended) {
	                    throw new Twig.Error("Unexpected end of object.");
	                }

	                stack.push(new_object);
	            }
	        },

	        // Token representing a filter
	        //
	        // Filters can follow any expression and take the form:
	        //    expression|filter(optional, args)
	        //
	        // Filter parsing is done in the Twig.filters namespace.
	        {
	            type: Twig.expression.type.filter,
	            // match a | then a letter or _, then any number of letters, numbers, _ or -
	            regex: /^\|\s?([a-zA-Z_][a-zA-Z0-9_\-]*)/,
	            next: Twig.expression.set.operations_extended.concat([
	                    Twig.expression.type.parameter.start]),
	            compile: function(token, stack, output) {
	                token.value = token.match[1];
	                output.push(token);
	            },
	            parse: function(token, stack, context) {
	                var input = stack.pop(),
	                    params = token.params && Twig.expression.parse.apply(this, [token.params, context]);

	                stack.push(Twig.filter.apply(this, [token.value, input, params]));
	            }
	        },
	        {
	            type: Twig.expression.type._function,
	            // match any letter or _, then any number of letters, numbers, _ or - followed by (
	            regex: /^([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/,
	            next: Twig.expression.type.parameter.start,
	            validate: function(match, tokens) {
	                // Make sure this function is not a reserved word
	                return match[1] && (Twig.indexOf(Twig.expression.reservedWords, match[1]) < 0);
	            },
	            transform: function(match, tokens) {
	                return '(';
	            },
	            compile: function(token, stack, output) {
	                var fn = token.match[1];
	                token.fn = fn;
	                // cleanup token
	                delete token.match;
	                delete token.value;

	                output.push(token);
	            },
	            parse: function(token, stack, context) {
	                var params = token.params && Twig.expression.parse.apply(this, [token.params, context]),
	                    fn     = token.fn,
	                    value;

	                if (Twig.functions[fn]) {
	                    // Get the function from the built-in functions
	                    value = Twig.functions[fn].apply(this, params);

	                } else if (typeof context[fn] == 'function') {
	                    // Get the function from the user/context defined functions
	                    value = context[fn].apply(context, params);

	                } else {
	                    throw new Twig.Error(fn + ' function does not exist and is not defined in the context');
	                }

	                stack.push(value);
	            }
	        },

	        // Token representing a variable.
	        //
	        // Variables can contain letters, numbers, underscores and
	        // dashes, but must start with a letter or underscore.
	        //
	        // Variables are retrieved from the render context and take
	        // the value of 'undefined' if the given variable doesn't
	        // exist in the context.
	        {
	            type: Twig.expression.type.variable,
	            // match any letter or _, then any number of letters, numbers, _ or -
	            regex: /^[a-zA-Z_][a-zA-Z0-9_]*/,
	            next: Twig.expression.set.operations_extended.concat([
	                    Twig.expression.type.parameter.start]),
	            compile: Twig.expression.fn.compile.push,
	            validate: function(match, tokens) {
	                return (Twig.indexOf(Twig.expression.reservedWords, match[0]) < 0);
	            },
	            parse: function(token, stack, context) {
	                // Get the variable from the context
	                var value = Twig.expression.resolve.apply(this, [context[token.value], context]);
	                stack.push(value);
	            }
	        },
	        {
	            type: Twig.expression.type.key.period,
	            regex: /^\.([a-zA-Z0-9_]+)/,
	            next: Twig.expression.set.operations_extended.concat([
	                    Twig.expression.type.parameter.start]),
	            compile: function(token, stack, output) {
	                token.key = token.match[1];
	                delete token.match;
	                delete token.value;

	                output.push(token);
	            },
	            parse: function(token, stack, context, next_token) {
	                var params = token.params && Twig.expression.parse.apply(this, [token.params, context]),
	                    key = token.key,
	                    object = stack.pop(),
	                    value;

	                if (object === null || object === undefined) {
	                    if (this.options.strict_variables) {
	                        throw new Twig.Error("Can't access a key " + key + " on an null or undefined object.");
	                    } else {
	                        value = undefined;
	                    }
	                } else {
	                    var capitalize = function (value) {
	                        return value.substr(0, 1).toUpperCase() + value.substr(1);
	                    };

	                    // Get the variable from the context
	                    if (typeof object === 'object' && key in object) {
	                        value = object[key];
	                    } else if (object["get" + capitalize(key)] !== undefined) {
	                        value = object["get" + capitalize(key)];
	                    } else if (object["is" + capitalize(key)] !== undefined) {
	                        value = object["is" + capitalize(key)];
	                    } else {
	                        value = undefined;
	                    }
	                }

	                // When resolving an expression we need to pass next_token in case the expression is a function
	                stack.push(Twig.expression.resolve.apply(this, [value, context, params, next_token]));
	            }
	        },
	        {
	            type: Twig.expression.type.key.brackets,
	            regex: /^\[([^\]\:]*)\]/,
	            next: Twig.expression.set.operations_extended.concat([
	                    Twig.expression.type.parameter.start]),
	            compile: function(token, stack, output) {
	                var match = token.match[1];
	                delete token.value;
	                delete token.match;

	                // The expression stack for the key
	                token.stack = Twig.expression.compile({
	                    value: match
	                }).stack;

	                output.push(token);
	            },
	            parse: function(token, stack, context, next_token) {
	                // Evaluate key
	                var params = token.params && Twig.expression.parse.apply(this, [token.params, context]),
	                    key = Twig.expression.parse.apply(this, [token.stack, context]),
	                    object = stack.pop(),
	                    value;

	                if (object === null || object === undefined) {
	                    if (this.options.strict_variables) {
	                        throw new Twig.Error("Can't access a key " + key + " on an null or undefined object.");
	                    } else {
	                        return null;
	                    }
	                }

	                // Get the variable from the context
	                if (typeof object === 'object' && key in object) {
	                    value = object[key];
	                } else {
	                    value = null;
	                }

	                // When resolving an expression we need to pass next_token in case the expression is a function
	                stack.push(Twig.expression.resolve.apply(this, [value, object, params, next_token]));
	            }
	        },
	        {
	            /**
	             * Match a null value.
	             */
	            type: Twig.expression.type._null,
	            // match a number
	            regex: /^(null|NULL|none|NONE)/,
	            next: Twig.expression.set.operations,
	            compile: function(token, stack, output) {
	                delete token.match;
	                token.value = null;
	                output.push(token);
	            },
	            parse: Twig.expression.fn.parse.push_value
	        },
	        {
	            /**
	             * Match the context
	             */
	            type: Twig.expression.type.context,
	            regex: /^_context/,
	            next: Twig.expression.set.operations_extended.concat([
	                    Twig.expression.type.parameter.start]),
	            compile: Twig.expression.fn.compile.push,
	            parse: function(token, stack, context) {
	                stack.push(context);
	            }
	        },
	        {
	            /**
	             * Match a boolean
	             */
	            type: Twig.expression.type.bool,
	            regex: /^(true|TRUE|false|FALSE)/,
	            next: Twig.expression.set.operations,
	            compile: function(token, stack, output) {
	                token.value = (token.match[0].toLowerCase( ) === "true");
	                delete token.match;
	                output.push(token);
	            },
	            parse: Twig.expression.fn.parse.push_value
	        }
	    ];

	    /**
	     * Resolve a context value.
	     *
	     * If the value is a function, it is executed with a context parameter.
	     *
	     * @param {string} key The context object key.
	     * @param {Object} context The render context.
	     */
	    Twig.expression.resolve = function(value, context, params, next_token) {
	        if (typeof value == 'function') {
	            /*
	            If value is a function, it will have been impossible during the compile stage to determine that a following
	            set of parentheses were parameters for this function.

	            Those parentheses will have therefore been marked as an expression, with their own parameters, which really
	            belong to this function.

	            Those parameters will also need parsing in case they are actually an expression to pass as parameters.
	             */
	            if (next_token && next_token.type === Twig.expression.type.parameter.end) {
	                //When parsing these parameters, we need to get them all back, not just the last item on the stack.
	                var tokens_are_parameters = true;

	                params = next_token.params && Twig.expression.parse.apply(this, [next_token.params, context, tokens_are_parameters]);

	                //Clean up the parentheses tokens on the next loop
	                next_token.cleanup = true;
	            }
	            return value.apply(context, params || []);
	        } else {
	            return value;
	        }
	    };

	    /**
	     * Registry for logic handlers.
	     */
	    Twig.expression.handler = {};

	    /**
	     * Define a new expression type, available at Twig.logic.type.{type}
	     *
	     * @param {string} type The name of the new type.
	     */
	    Twig.expression.extendType = function (type) {
	        Twig.expression.type[type] = "Twig.expression.type." + type;
	    };

	    /**
	     * Extend the expression parsing functionality with a new definition.
	     *
	     * Token definitions follow this format:
	     *  {
	     *      type:     One of Twig.expression.type.[type], either pre-defined or added using
	     *                    Twig.expression.extendType
	     *
	     *      next:     Array of types from Twig.expression.type that can follow this token,
	     *
	     *      regex:    A regex or array of regex's that should match the token.
	     *
	     *      compile: function(token, stack, output) called when this token is being compiled.
	     *                   Should return an object with stack and output set.
	     *
	     *      parse:   function(token, stack, context) called when this token is being parsed.
	     *                   Should return an object with stack and context set.
	     *  }
	     *
	     * @param {Object} definition A token definition.
	     */
	    Twig.expression.extend = function (definition) {
	        if (!definition.type) {
	            throw new Twig.Error("Unable to extend logic definition. No type provided for " + definition);
	        }
	        Twig.expression.handler[definition.type] = definition;
	    };

	    // Extend with built-in expressions
	    while (Twig.expression.definitions.length > 0) {
	        Twig.expression.extend(Twig.expression.definitions.shift());
	    }

	    /**
	     * Break an expression into tokens defined in Twig.expression.definitions.
	     *
	     * @param {string} expression The string to tokenize.
	     *
	     * @return {Array} An array of tokens.
	     */
	    Twig.expression.tokenize = function (expression) {
	        var tokens = [],
	            // Keep an offset of the location in the expression for error messages.
	            exp_offset = 0,
	            // The valid next tokens of the previous token
	            next = null,
	            // Match information
	            type, regex, regex_array,
	            // The possible next token for the match
	            token_next,
	            // Has a match been found from the definitions
	            match_found, invalid_matches = [], match_function;

	        match_function = function () {
	            var match = Array.prototype.slice.apply(arguments),
	                string = match.pop(),
	                offset = match.pop();

	            Twig.log.trace("Twig.expression.tokenize",
	                           "Matched a ", type, " regular expression of ", match);

	            if (next && Twig.indexOf(next, type) < 0) {
	                invalid_matches.push(
	                    type + " cannot follow a " + tokens[tokens.length - 1].type +
	                           " at template:" + exp_offset + " near '" + match[0].substring(0, 20) +
	                           "...'"
	                );
	                // Not a match, don't change the expression
	                return match[0];
	            }

	            // Validate the token if a validation function is provided
	            if (Twig.expression.handler[type].validate &&
	                    !Twig.expression.handler[type].validate(match, tokens)) {
	                return match[0];
	            }

	            invalid_matches = [];

	            tokens.push({
	                type:  type,
	                value: match[0],
	                match: match
	            });

	            match_found = true;
	            next = token_next;
	            exp_offset += match[0].length;

	            // Does the token need to return output back to the expression string
	            // e.g. a function match of cycle( might return the '(' back to the expression
	            // This allows look-ahead to differentiate between token types (e.g. functions and variable names)
	            if (Twig.expression.handler[type].transform) {
	                return Twig.expression.handler[type].transform(match, tokens);
	            }
	            return '';
	        };

	        Twig.log.debug("Twig.expression.tokenize", "Tokenizing expression ", expression);

	        while (expression.length > 0) {
	            expression = expression.trim();
	            for (type in Twig.expression.handler) {
	                if (Twig.expression.handler.hasOwnProperty(type)) {
	                    token_next = Twig.expression.handler[type].next;
	                    regex = Twig.expression.handler[type].regex;
	                    Twig.log.trace("Checking type ", type, " on ", expression);
	                    if (regex instanceof Array) {
	                        regex_array = regex;
	                    } else {
	                        regex_array = [regex];
	                    }

	                    match_found = false;
	                    while (regex_array.length > 0) {
	                        regex = regex_array.pop();
	                        expression = expression.replace(regex, match_function);
	                    }
	                    // An expression token has been matched. Break the for loop and start trying to
	                    //  match the next template (if expression isn't empty.)
	                    if (match_found) {
	                        break;
	                    }
	                }
	            }
	            if (!match_found) {
	                if (invalid_matches.length > 0) {
	                    throw new Twig.Error(invalid_matches.join(" OR "));
	                } else {
	                    throw new Twig.Error("Unable to parse '" + expression + "' at template position" + exp_offset);
	                }
	            }
	        }

	        Twig.log.trace("Twig.expression.tokenize", "Tokenized to ", tokens);
	        return tokens;
	    };

	    /**
	     * Compile an expression token.
	     *
	     * @param {Object} raw_token The uncompiled token.
	     *
	     * @return {Object} The compiled token.
	     */
	    Twig.expression.compile = function (raw_token) {
	        var expression = raw_token.value,
	            // Tokenize expression
	            tokens = Twig.expression.tokenize(expression),
	            token = null,
	            output = [],
	            stack = [],
	            token_template = null;

	        Twig.log.trace("Twig.expression.compile: ", "Compiling ", expression);

	        // Push tokens into RPN stack using the Shunting-yard algorithm
	        // See http://en.wikipedia.org/wiki/Shunting_yard_algorithm

	        while (tokens.length > 0) {
	            token = tokens.shift();
	            token_template = Twig.expression.handler[token.type];

	            Twig.log.trace("Twig.expression.compile: ", "Compiling ", token);

	            // Compile the template
	            token_template.compile && token_template.compile(token, stack, output);

	            Twig.log.trace("Twig.expression.compile: ", "Stack is", stack);
	            Twig.log.trace("Twig.expression.compile: ", "Output is", output);
	        }

	        while(stack.length > 0) {
	            output.push(stack.pop());
	        }

	        Twig.log.trace("Twig.expression.compile: ", "Final output is", output);

	        raw_token.stack = output;
	        delete raw_token.value;

	        return raw_token;
	    };


	    /**
	     * Parse an RPN expression stack within a context.
	     *
	     * @param {Array} tokens An array of compiled expression tokens.
	     * @param {Object} context The render context to parse the tokens with.
	     *
	     * @return {Object} The result of parsing all the tokens. The result
	     *                  can be anything, String, Array, Object, etc... based on
	     *                  the given expression.
	     */
	    Twig.expression.parse = function (tokens, context, tokens_are_parameters) {
	        var that = this;

	        // If the token isn't an array, make it one.
	        if (!(tokens instanceof Array)) {
	            tokens = [tokens];
	        }

	        // The output stack
	        var stack = [],
	            next_token,
	            token_template = null,
	            loop_token_fixups = [];

	        Twig.forEach(tokens, function (token, index) {
	            //If the token is marked for cleanup, we don't need to parse it
	            if (token.cleanup) {
	                return;
	            }

	            //Determine the token that follows this one so that we can pass it to the parser
	            if (tokens.length > index + 1) {
	                next_token = tokens[index + 1];
	            }

	            token_template = Twig.expression.handler[token.type];

	            token_template.parse && token_template.parse.apply(that, [token, stack, context, next_token]);

	            //Store any binary tokens for later if we are in a loop.
	            if (context.loop && token.type === Twig.expression.type.operator.binary) {
	                loop_token_fixups.push(token);
	            }
	        });

	        //Check every fixup and remove "key" as long as they still have "params". This covers the use case where
	        //a ":" operator is used in a loop with a "(expression):" statement. We need to be able to evaluate the expression
	        Twig.forEach(loop_token_fixups, function (loop_token_fixup) {
	            if (loop_token_fixup.params && loop_token_fixup.key) {
	                delete loop_token_fixup["key"];
	            }
	        });

	        //If parse has been called with a set of tokens that are parameters, we need to return the whole stack,
	        //wrapped in an Array.
	        if (tokens_are_parameters) {
	            var params = [];
	            while (stack.length > 0) {
	                params.unshift(stack.pop());
	            }

	            stack.push(params);
	        }

	        // Pop the final value off the stack
	        return stack.pop();
	    };

	    return Twig;

	};


/***/ },
/* 4 */
/***/ function(module, exports) {

	// ## twig.expression.operator.js
	//
	// This file handles operator lookups and parsing.
	module.exports = function (Twig) {
	    "use strict";

	    /**
	     * Operator associativity constants.
	     */
	    Twig.expression.operator = {
	        leftToRight: 'leftToRight',
	        rightToLeft: 'rightToLeft'
	    };

	    var containment = function(a, b) {
	        if (b === undefined || b === null) {
	            return null;
	        } else if (b.indexOf !== undefined) {
	            // String
	            return a === b || a !== '' && b.indexOf(a) > -1;
	        } else {
	            var el;
	            for (el in b) {
	                if (b.hasOwnProperty(el) && b[el] === a) {
	                    return true;
	                }
	            }
	            return false;
	        }
	    };

	    /**
	     * Get the precidence and associativity of an operator. These follow the order that C/C++ use.
	     * See http://en.wikipedia.org/wiki/Operators_in_C_and_C++ for the table of values.
	     */
	    Twig.expression.operator.lookup = function (operator, token) {
	        switch (operator) {
	            case "..":
	                token.precidence = 20;
	                token.associativity = Twig.expression.operator.leftToRight;
	                break;

	            case ',':
	                token.precidence = 18;
	                token.associativity = Twig.expression.operator.leftToRight;
	                break;

	            // Ternary
	            case '?:':
	            case '?':
	            case ':':
	                token.precidence = 16;
	                token.associativity = Twig.expression.operator.rightToLeft;
	                break;

	            case 'or':
	                token.precidence = 14;
	                token.associativity = Twig.expression.operator.leftToRight;
	                break;

	            case 'and':
	                token.precidence = 13;
	                token.associativity = Twig.expression.operator.leftToRight;
	                break;

	            case '==':
	            case '!=':
	                token.precidence = 9;
	                token.associativity = Twig.expression.operator.leftToRight;
	                break;

	            case '<':
	            case '<=':
	            case '>':
	            case '>=':
	            case 'not in':
	            case 'in':
	                token.precidence = 8;
	                token.associativity = Twig.expression.operator.leftToRight;
	                break;

	            case '~': // String concatination
	            case '+':
	            case '-':
	                token.precidence = 6;
	                token.associativity = Twig.expression.operator.leftToRight;
	                break;

	            case '//':
	            case '**':
	            case '*':
	            case '/':
	            case '%':
	                token.precidence = 5;
	                token.associativity = Twig.expression.operator.leftToRight;
	                break;

	            case 'not':
	                token.precidence = 3;
	                token.associativity = Twig.expression.operator.rightToLeft;
	                break;

	            default:
	                throw new Twig.Error("Failed to lookup operator: " + operator + " is an unknown operator.");
	        }
	        token.operator = operator;
	        return token;
	    };

	    /**
	     * Handle operations on the RPN stack.
	     *
	     * Returns the updated stack.
	     */
	    Twig.expression.operator.parse = function (operator, stack) {
	        Twig.log.trace("Twig.expression.operator.parse: ", "Handling ", operator);
	        var a, b, c;

	        if (operator === '?') {
	            c = stack.pop();
	        }

	        b = stack.pop();
	        if (operator !== 'not') {
	            a = stack.pop();
	        }

	        if (operator !== 'in' && operator !== 'not in') {
	            if (a && Array.isArray(a)) {
	                a = a.length;
	            }

	            if (b && Array.isArray(b)) {
	                b = b.length;
	            }
	        }

	        switch (operator) {
	            case ':':
	                // Ignore
	                break;

	            case '?:':
	                if (Twig.lib.boolval(a)) {
	                    stack.push(a);
	                } else {
	                    stack.push(b);
	                }
	                break;
	            case '?':
	                if (a === undefined) {
	                    //An extended ternary.
	                    a = b;
	                    b = c;
	                    c = undefined;
	                }

	                if (Twig.lib.boolval(a)) {
	                    stack.push(b);
	                } else {
	                    stack.push(c);
	                }
	                break;

	            case '+':
	                b = parseFloat(b);
	                a = parseFloat(a);
	                stack.push(a + b);
	                break;

	            case '-':
	                b = parseFloat(b);
	                a = parseFloat(a);
	                stack.push(a - b);
	                break;

	            case '*':
	                b = parseFloat(b);
	                a = parseFloat(a);
	                stack.push(a * b);
	                break;

	            case '/':
	                b = parseFloat(b);
	                a = parseFloat(a);
	                stack.push(a / b);
	                break;

	            case '//':
	                b = parseFloat(b);
	                a = parseFloat(a);
	                stack.push(Math.floor(a / b));
	                break;

	            case '%':
	                b = parseFloat(b);
	                a = parseFloat(a);
	                stack.push(a % b);
	                break;

	            case '~':
	                stack.push( (a != null ? a.toString() : "")
	                          + (b != null ? b.toString() : "") );
	                break;

	            case 'not':
	            case '!':
	                stack.push(!Twig.lib.boolval(b));
	                break;

	            case '<':
	                stack.push(a < b);
	                break;

	            case '<=':
	                stack.push(a <= b);
	                break;

	            case '>':
	                stack.push(a > b);
	                break;

	            case '>=':
	                stack.push(a >= b);
	                break;

	            case '===':
	                stack.push(a === b);
	                break;

	            case '==':
	                stack.push(a == b);
	                break;

	            case '!==':
	                stack.push(a !== b);
	                break;

	            case '!=':
	                stack.push(a != b);
	                break;

	            case 'or':
	                stack.push(a || b);
	                break;

	            case 'and':
	                stack.push(a && b);
	                break;

	            case '**':
	                stack.push(Math.pow(a, b));
	                break;

	            case 'not in':
	                stack.push( !containment(a, b) );
	                break;

	            case 'in':
	                stack.push( containment(a, b) );
	                break;

	            case '..':
	                stack.push( Twig.functions.range(a, b) );
	                break;

	            default:
	                debugger;
	                throw new Twig.Error("Failed to parse operator: " + operator + " is an unknown operator.");
	        }
	    };

	    return Twig;

	};


/***/ },
/* 5 */
/***/ function(module, exports) {

	// ## twig.filters.js
	//
	// This file handles parsing filters.
	module.exports = function (Twig) {

	    // Determine object type
	    function is(type, obj) {
	        var clas = Object.prototype.toString.call(obj).slice(8, -1);
	        return obj !== undefined && obj !== null && clas === type;
	    }

	    Twig.filters = {
	        // String Filters
	        upper:  function(value) {
	            if ( typeof value !== "string" ) {
	               return value;
	            }

	            return value.toUpperCase();
	        },
	        lower: function(value) {
	            if ( typeof value !== "string" ) {
	               return value;
	            }

	            return value.toLowerCase();
	        },
	        capitalize: function(value) {
	            if ( typeof value !== "string" ) {
	                 return value;
	            }

	            return value.substr(0, 1).toUpperCase() + value.toLowerCase().substr(1);
	        },
	        title: function(value) {
	            if ( typeof value !== "string" ) {
	               return value;
	            }

	            return value.toLowerCase().replace( /(^|\s)([a-z])/g , function(m, p1, p2){
	                return p1 + p2.toUpperCase();
	            });
	        },
	        length: function(value) {
	            if (Twig.lib.is("Array", value) || typeof value === "string") {
	                return value.length;
	            } else if (Twig.lib.is("Object", value)) {
	                if (value._keys === undefined) {
	                    return Object.keys(value).length;
	                } else {
	                    return value._keys.length;
	                }
	            } else {
	                return 0;
	            }
	        },

	        // Array/Object Filters
	        reverse: function(value) {
	            if (is("Array", value)) {
	                return value.reverse();
	            } else if (is("String", value)) {
	                return value.split("").reverse().join("");
	            } else if (is("Object", value)) {
	                var keys = value._keys || Object.keys(value).reverse();
	                value._keys = keys;
	                return value;
	            }
	        },
	        sort: function(value) {
	            if (is("Array", value)) {
	                return value.sort();
	            } else if (is('Object', value)) {
	                // Sorting objects isn't obvious since the order of
	                // returned keys isn't guaranteed in JavaScript.
	                // Because of this we use a "hidden" key called _keys to
	                // store the keys in the order we want to return them.

	                delete value._keys;
	                var keys = Object.keys(value),
	                    sorted_keys = keys.sort(function(a, b) {
	                        var a1, a2;

	                        // if a and b are comparable, we're fine :-)
	                        if((value[a] > value[b]) == !(value[a] <= value[b])) {
	                            return value[a] > value[b] ? 1 :
				           value[a] < value[b] ? -1 :
					   0;
	                        }
	                        // if a and b can be parsed as numbers, we can compare
	                        // their numeric value
	                        else if(!isNaN(a1 = parseFloat(value[a])) &&
	                                !isNaN(b1 = parseFloat(value[b]))) {
	                            return a1 > b1 ? 1 :
				           a1 < b1 ? -1 :
					   0;
	                        }
	                        // if one of the values is a string, we convert the
	                        // other value to string as well
	                        else if(typeof value[a] == 'string') {
	                            return value[a] > value[b].toString() ? 1 :
	                                   value[a] < value[b].toString() ? -1 :
					   0;
	                        }
	                        else if(typeof value[b] == 'string') {
	                            return value[a].toString() > value[b] ? 1 :
	                                   value[a].toString() < value[b] ? -1 :
					   0;
	                        }
	                        // everything failed - return 'null' as sign, that
	                        // the values are not comparable
	                        else {
	                            return null;
	                        }
	                    });
	                value._keys = sorted_keys;
	                return value;
	            }
	        },
	        keys: function(value) {
	            if (value === undefined || value === null){
	                return;
	           }

	            var keyset = value._keys || Object.keys(value),
	                output = [];

	            Twig.forEach(keyset, function(key) {
	                if (key === "_keys") return; // Ignore the _keys property
	                if (value.hasOwnProperty(key)) {
	                    output.push(key);
	                }
	            });
	            return output;
	        },
	        url_encode: function(value) {
	            if (value === undefined || value === null){
	                return;
	            }

	            var result = encodeURIComponent(value);
	            result = result.replace("'", "%27");
	            return result;
	        },
	        join: function(value, params) {
	            if (value === undefined || value === null){
	                return;
	            }

	            var join_str = "",
	                output = [],
	                keyset = null;

	            if (params && params[0]) {
	                join_str = params[0];
	            }
	            if (is("Array", value)) {
	                output = value;
	            } else {
	                keyset = value._keys || Object.keys(value);
	                Twig.forEach(keyset, function(key) {
	                    if (key === "_keys") return; // Ignore the _keys property
	                    if (value.hasOwnProperty(key)) {
	                        output.push(value[key]);
	                    }
	                });
	            }
	            return output.join(join_str);
	        },
	        "default": function(value, params) {
	            if (params !== undefined && params.length > 1) {
	                throw new Twig.Error("default filter expects one argument");
	            }
	            if (value === undefined || value === null || value === '' ) {
	                if (params === undefined) {
	                    return '';
	                }

	                return params[0];
	            } else {
	                return value;
	            }
	        },
	        json_encode: function(value) {
	            if(value === undefined || value === null) {
	                return "null";
	            }
	            else if ((typeof value == 'object') && (is("Array", value))) {
	                output = [];

	                Twig.forEach(value, function(v) {
	                    output.push(Twig.filters.json_encode(v));
	                });

	                return "[" + output.join(",") + "]";
	            }
	            else if (typeof value == 'object') {
	                var keyset = value._keys || Object.keys(value),
	                output = [];

	                Twig.forEach(keyset, function(key) {
	                    output.push(JSON.stringify(key) + ":" + Twig.filters.json_encode(value[key]));
	                });

	                return "{" + output.join(",") + "}";
	            }
	            else {
	                return JSON.stringify(value);
	            }
	        },
	        merge: function(value, params) {
	            var obj = [],
	                arr_index = 0,
	                keyset = [];

	            // Check to see if all the objects being merged are arrays
	            if (!is("Array", value)) {
	                // Create obj as an Object
	                obj = { };
	            } else {
	                Twig.forEach(params, function(param) {
	                    if (!is("Array", param)) {
	                        obj = { };
	                    }
	                });
	            }
	            if (!is("Array", obj)) {
	                obj._keys = [];
	            }

	            if (is("Array", value)) {
	                Twig.forEach(value, function(val) {
	                    if (obj._keys) obj._keys.push(arr_index);
	                    obj[arr_index] = val;
	                    arr_index++;
	                });
	            } else {
	                keyset = value._keys || Object.keys(value);
	                Twig.forEach(keyset, function(key) {
	                    obj[key] = value[key];
	                    obj._keys.push(key);

	                    // Handle edge case where a number index in an object is greater than
	                    //   the array counter. In such a case, the array counter is increased
	                    //   one past the index.
	                    //
	                    // Example {{ ["a", "b"]|merge({"4":"value"}, ["c", "d"])
	                    // Without this, d would have an index of "4" and overwrite the value
	                    //   of "value"
	                    var int_key = parseInt(key, 10);
	                    if (!isNaN(int_key) && int_key >= arr_index) {
	                        arr_index = int_key + 1;
	                    }
	                });
	            }

	            // mixin the merge arrays
	            Twig.forEach(params, function(param) {
	                if (is("Array", param)) {
	                    Twig.forEach(param, function(val) {
	                        if (obj._keys) obj._keys.push(arr_index);
	                        obj[arr_index] = val;
	                        arr_index++;
	                    });
	                } else {
	                    keyset = param._keys || Object.keys(param);
	                    Twig.forEach(keyset, function(key) {
	                        if (!obj[key]) obj._keys.push(key);
	                        obj[key] = param[key];

	                        var int_key = parseInt(key, 10);
	                        if (!isNaN(int_key) && int_key >= arr_index) {
	                            arr_index = int_key + 1;
	                        }
	                    });
	                }
	            });
	            if (params.length === 0) {
	                throw new Twig.Error("Filter merge expects at least one parameter");
	            }

	            return obj;
	        },
	        date: function(value, params) {
	            var date = Twig.functions.date(value);
	            var format = params && params.length ? params[0] : 'F j, Y H:i';
	            return Twig.lib.date(format, date);
	        },

	        date_modify: function(value, params) {
	            if (value === undefined || value === null) {
	                return;
	            }
	            if (params === undefined || params.length !== 1) {
	                throw new Twig.Error("date_modify filter expects 1 argument");
	            }

	            var modifyText = params[0], time;

	            if (Twig.lib.is("Date", value)) {
	                time = Twig.lib.strtotime(modifyText, value.getTime() / 1000);
	            }
	            if (Twig.lib.is("String", value)) {
	                time = Twig.lib.strtotime(modifyText, Twig.lib.strtotime(value));
	            }
	            if (Twig.lib.is("Number", value)) {
	                time = Twig.lib.strtotime(modifyText, value);
	            }

	            return new Date(time * 1000);
	        },

	        replace: function(value, params) {
	            if (value === undefined||value === null){
	                return;
	            }

	            var pairs = params[0],
	                tag;
	            for (tag in pairs) {
	                if (pairs.hasOwnProperty(tag) && tag !== "_keys") {
	                    value = Twig.lib.replaceAll(value, tag, pairs[tag]);
	                }
	            }
	            return value;
	        },

	        format: function(value, params) {
	            if (value === undefined || value === null){
	                return;
	            }

	            return Twig.lib.vsprintf(value, params);
	        },

	        striptags: function(value) {
	            if (value === undefined || value === null){
	                return;
	            }

	            return Twig.lib.strip_tags(value);
	        },

	        escape: function(value, params) {
	            if (value === undefined|| value === null){
	                return;
	            }

	            var strategy = "html";
	            if(params && params.length && params[0] !== true)
	                strategy = params[0];

	            if(strategy == "html") {
	                var raw_value = value.toString().replace(/&/g, "&amp;")
	                            .replace(/</g, "&lt;")
	                            .replace(/>/g, "&gt;")
	                            .replace(/"/g, "&quot;")
	                            .replace(/'/g, "&#039;");
	                return Twig.Markup(raw_value, 'html');
	            } else if(strategy == "js") {
	                var raw_value = value.toString();
	                var result = "";

	                for(var i = 0; i < raw_value.length; i++) {
	                    if(raw_value[i].match(/^[a-zA-Z0-9,\._]$/))
	                        result += raw_value[i];
	                    else {
	                        var char_code = raw_value.charCodeAt(i);

	                        if(char_code < 0x80)
	                            result += "\\x" + char_code.toString(16).toUpperCase();
	                        else
	                            result += Twig.lib.sprintf("\\u%04s", char_code.toString(16).toUpperCase());
	                    }
	                }

	                return Twig.Markup(result, 'js');
	            } else if(strategy == "css") {
	                var raw_value = value.toString();
	                var result = "";

	                for(var i = 0; i < raw_value.length; i++) {
	                    if(raw_value[i].match(/^[a-zA-Z0-9]$/))
	                        result += raw_value[i];
	                    else {
	                        var char_code = raw_value.charCodeAt(i);
	                        result += "\\" + char_code.toString(16).toUpperCase() + " ";
	                    }
	                }

	                return Twig.Markup(result, 'css');
	            } else if(strategy == "url") {
	                var result = Twig.filters.url_encode(value);
	                return Twig.Markup(result, 'url');
	            } else if(strategy == "html_attr") {
	                var raw_value = value.toString();
	                var result = "";

	                for(var i = 0; i < raw_value.length; i++) {
	                    if(raw_value[i].match(/^[a-zA-Z0-9,\.\-_]$/))
	                        result += raw_value[i];
	                    else if(raw_value[i].match(/^[&<>"]$/))
	                        result += raw_value[i].replace(/&/g, "&amp;")
	                                .replace(/</g, "&lt;")
	                                .replace(/>/g, "&gt;")
	                                .replace(/"/g, "&quot;");
	                    else {
	                        var char_code = raw_value.charCodeAt(i);

	                        // The following replaces characters undefined in HTML with
	                        // the hex entity for the Unicode replacement character.
	                        if(char_code <= 0x1f && char_code != 0x09 && char_code != 0x0a && char_code != 0x0d)
	                            result += "&#xFFFD;";
	                        else if(char_code < 0x80)
	                            result += Twig.lib.sprintf("&#x%02s;", char_code.toString(16).toUpperCase());
	                        else
	                            result += Twig.lib.sprintf("&#x%04s;", char_code.toString(16).toUpperCase());
	                    }
	                }

	                return Twig.Markup(result, 'html_attr');
	            } else {
	                throw new Twig.Error("escape strategy unsupported");
	            }
	        },

	        /* Alias of escape */
	        "e": function(value, params) {
	            return Twig.filters.escape(value, params);
	        },

	        nl2br: function(value) {
	            if (value === undefined || value === null){
	                return;
	            }
	            var linebreak_tag = "BACKSLASH_n_replace",
	                br = "<br />" + linebreak_tag;

	            value = Twig.filters.escape(value)
	                        .replace(/\r\n/g, br)
	                        .replace(/\r/g, br)
	                        .replace(/\n/g, br);

	            value = Twig.lib.replaceAll(value, linebreak_tag, "\n");

	            return Twig.Markup(value);
	        },

	        /**
	         * Adapted from: http://phpjs.org/functions/number_format:481
	         */
	        number_format: function(value, params) {
	            var number = value,
	                decimals = (params && params[0]) ? params[0] : undefined,
	                dec      = (params && params[1] !== undefined) ? params[1] : ".",
	                sep      = (params && params[2] !== undefined) ? params[2] : ",";

	            number = (number + '').replace(/[^0-9+\-Ee.]/g, '');
	            var n = !isFinite(+number) ? 0 : +number,
	                prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
	                s = '',
	                toFixedFix = function (n, prec) {
	                    var k = Math.pow(10, prec);
	                    return '' + Math.round(n * k) / k;
	                };
	            // Fix for IE parseFloat(0.55).toFixed(0) = 0;
	            s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.');
	            if (s[0].length > 3) {
	                s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
	            }
	            if ((s[1] || '').length < prec) {
	                s[1] = s[1] || '';
	                s[1] += new Array(prec - s[1].length + 1).join('0');
	            }
	            return s.join(dec);
	        },

	        trim: function(value, params) {
	            if (value === undefined|| value === null){
	                return;
	            }

	            var str = Twig.filters.escape( '' + value ),
	                whitespace;
	            if ( params && params[0] ) {
	                whitespace = '' + params[0];
	            } else {
	                whitespace = ' \n\r\t\f\x0b\xa0\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u200b\u2028\u2029\u3000';
	            }
	            for (var i = 0; i < str.length; i++) {
	                if (whitespace.indexOf(str.charAt(i)) === -1) {
	                    str = str.substring(i);
	                    break;
	                }
	            }
	            for (i = str.length - 1; i >= 0; i--) {
	                if (whitespace.indexOf(str.charAt(i)) === -1) {
	                    str = str.substring(0, i + 1);
	                    break;
	                }
	            }
	            return whitespace.indexOf(str.charAt(0)) === -1 ? str : '';
	        },

	        truncate: function (value, params) {
	            var length = 30,
	                preserve = false,
	                separator = '...';

	            value =  value + '';
	            if (params) {
	                if (params[0]) {
	                    length = params[0];
	                }
	                if (params[1]) {
	                    preserve = params[1];
	                }
	                if (params[2]) {
	                    separator = params[2];
	                }
	            }

	            if (value.length > length) {

	                if (preserve) {
	                    length = value.indexOf(' ', length);
	                    if (length === -1) {
	                        return value;
	                    }
	                }

	                value =  value.substr(0, length) + separator;
	            }

	            return value;
	        },

	        slice: function(value, params) {
	            if (value === undefined || value === null) {
	                return;
	            }
	            if (params === undefined || params.length < 1) {
	                throw new Twig.Error("slice filter expects at least 1 argument");
	            }

	            // default to start of string
	            var start = params[0] || 0;
	            // default to length of string
	            var length = params.length > 1 ? params[1] : value.length;
	            // handle negative start values
	            var startIndex = start >= 0 ? start : Math.max( value.length + start, 0 );

	            if (Twig.lib.is("Array", value)) {
	                var output = [];
	                for (var i = startIndex; i < startIndex + length && i < value.length; i++) {
	                    output.push(value[i]);
	                }
	                return output;
	            } else if (Twig.lib.is("String", value)) {
	                return value.substr(startIndex, length);
	            } else {
	                throw new Twig.Error("slice filter expects value to be an array or string");
	            }
	        },

	        abs: function(value) {
	            if (value === undefined || value === null) {
	                return;
	            }

	            return Math.abs(value);
	        },

	        first: function(value) {
	            if (is("Array", value)) {
	                return value[0];
	            } else if (is("Object", value)) {
	                if ('_keys' in value) {
	                    return value[value._keys[0]];
	                }
	            } else if ( typeof value === "string" ) {
	                return value.substr(0, 1);
	            }

	            return;
	        },

	        split: function(value, params) {
	            if (value === undefined || value === null) {
	                return;
	            }
	            if (params === undefined || params.length < 1 || params.length > 2) {
	                throw new Twig.Error("split filter expects 1 or 2 argument");
	            }
	            if (Twig.lib.is("String", value)) {
	                var delimiter = params[0],
	                    limit = params[1],
	                    split = value.split(delimiter);

	                if (limit === undefined) {

	                    return split;

	                } else if (limit < 0) {

	                    return value.split(delimiter, split.length + limit);

	                } else {

	                    var limitedSplit = [];

	                    if (delimiter == '') {
	                        // empty delimiter
	                        // "aabbcc"|split('', 2)
	                        //     -> ['aa', 'bb', 'cc']

	                        while(split.length > 0) {
	                            var temp = "";
	                            for (var i=0; i<limit && split.length > 0; i++) {
	                                temp += split.shift();
	                            }
	                            limitedSplit.push(temp);
	                        }

	                    } else {
	                        // non-empty delimiter
	                        // "one,two,three,four,five"|split(',', 3)
	                        //     -> ['one', 'two', 'three,four,five']

	                        for (var i=0; i<limit-1 && split.length > 0; i++) {
	                            limitedSplit.push(split.shift());
	                        }

	                        if (split.length > 0) {
	                            limitedSplit.push(split.join(delimiter));
	                        }
	                    }

	                    return limitedSplit;
	                }

	            } else {
	                throw new Twig.Error("split filter expects value to be a string");
	            }
	        },
	        last: function(value) {
	            if (Twig.lib.is('Object', value)) {
	                var keys;

	                if (value._keys === undefined) {
	                    keys = Object.keys(value);
	                } else {
	                    keys = value._keys;
	                }

	                return value[keys[keys.length - 1]];
	            }

	            // string|array
	            return value[value.length - 1];
	        },
	        raw: function(value) {
	            return Twig.Markup(value);
	        },
	        batch: function(items, params) {
	            var size = params.shift(),
	                fill = params.shift(),
	                result,
	                last,
	                missing;

	            if (!Twig.lib.is("Array", items)) {
	                throw new Twig.Error("batch filter expects items to be an array");
	            }

	            if (!Twig.lib.is("Number", size)) {
	                throw new Twig.Error("batch filter expects size to be a number");
	            }

	            size = Math.ceil(size);

	            result = Twig.lib.chunkArray(items, size);

	            if (fill && items.length % size != 0) {
	                last = result.pop();
	                missing = size - last.length;

	                while (missing--) {
	                    last.push(fill);
	                }

	                result.push(last);
	            }

	            return result;
	        },
	        round: function(value, params) {
	            params = params || [];

	            var precision = params.length > 0 ? params[0] : 0,
	                method = params.length > 1 ? params[1] : "common";

	            value = parseFloat(value);

	            if(precision && !Twig.lib.is("Number", precision)) {
	                throw new Twig.Error("round filter expects precision to be a number");
	            }

	            if (method === "common") {
	                return Twig.lib.round(value, precision);
	            }

	            if(!Twig.lib.is("Function", Math[method])) {
	                throw new Twig.Error("round filter expects method to be 'floor', 'ceil', or 'common'");
	            }

	            return Math[method](value * Math.pow(10, precision)) / Math.pow(10, precision);
	        }
	    };

	    Twig.filter = function(filter, value, params) {
	        if (!Twig.filters[filter]) {
	            throw "Unable to find filter " + filter;
	        }
	        return Twig.filters[filter].apply(this, [value, params]);
	    };

	    Twig.filter.extend = function(filter, definition) {
	        Twig.filters[filter] = definition;
	    };

	    return Twig;

	};


/***/ },
/* 6 */
/***/ function(module, exports) {

	// ## twig.functions.js
	//
	// This file handles parsing filters.
	module.exports = function (Twig) {
	    /**
	     * @constant
	     * @type {string}
	     */
	    var TEMPLATE_NOT_FOUND_MESSAGE = 'Template "{name}" is not defined.';

	    // Determine object type
	    function is(type, obj) {
	        var clas = Object.prototype.toString.call(obj).slice(8, -1);
	        return obj !== undefined && obj !== null && clas === type;
	    }

	    Twig.functions = {
	        //  attribute, block, constant, date, dump, parent, random,.

	        // Range function from http://phpjs.org/functions/range:499
	        // Used under an MIT License
	        range: function (low, high, step) {
	            // http://kevin.vanzonneveld.net
	            // +   original by: Waldo Malqui Silva
	            // *     example 1: range ( 0, 12 );
	            // *     returns 1: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
	            // *     example 2: range( 0, 100, 10 );
	            // *     returns 2: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
	            // *     example 3: range( 'a', 'i' );
	            // *     returns 3: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i']
	            // *     example 4: range( 'c', 'a' );
	            // *     returns 4: ['c', 'b', 'a']
	            var matrix = [];
	            var inival, endval, plus;
	            var walker = step || 1;
	            var chars = false;

	            if (!isNaN(low) && !isNaN(high)) {
	                inival = parseInt(low, 10);
	                endval = parseInt(high, 10);
	            } else if (isNaN(low) && isNaN(high)) {
	                chars = true;
	                inival = low.charCodeAt(0);
	                endval = high.charCodeAt(0);
	            } else {
	                inival = (isNaN(low) ? 0 : low);
	                endval = (isNaN(high) ? 0 : high);
	            }

	            plus = ((inival > endval) ? false : true);
	            if (plus) {
	                while (inival <= endval) {
	                    matrix.push(((chars) ? String.fromCharCode(inival) : inival));
	                    inival += walker;
	                }
	            } else {
	                while (inival >= endval) {
	                    matrix.push(((chars) ? String.fromCharCode(inival) : inival));
	                    inival -= walker;
	                }
	            }

	            return matrix;
	        },
	        cycle: function(arr, i) {
	            var pos = i % arr.length;
	            return arr[pos];
	        },
	        dump: function() {
	            var EOL = '\n',
	                indentChar = '  ',
	                indentTimes = 0,
	                out = '',
	                args = Array.prototype.slice.call(arguments),
	                indent = function(times) {
	                    var ind  = '';
	                    while (times > 0) {
	                        times--;
	                        ind += indentChar;
	                    }
	                    return ind;
	                },
	                displayVar = function(variable) {
	                    out += indent(indentTimes);
	                    if (typeof(variable) === 'object') {
	                        dumpVar(variable);
	                    } else if (typeof(variable) === 'function') {
	                        out += 'function()' + EOL;
	                    } else if (typeof(variable) === 'string') {
	                        out += 'string(' + variable.length + ') "' + variable + '"' + EOL;
	                    } else if (typeof(variable) === 'number') {
	                        out += 'number(' + variable + ')' + EOL;
	                    } else if (typeof(variable) === 'boolean') {
	                        out += 'bool(' + variable + ')' + EOL;
	                    }
	                },
	                dumpVar = function(variable) {
	                    var i;
	                    if (variable === null) {
	                        out += 'NULL' + EOL;
	                    } else if (variable === undefined) {
	                        out += 'undefined' + EOL;
	                    } else if (typeof variable === 'object') {
	                        out += indent(indentTimes) + typeof(variable);
	                        indentTimes++;
	                        out += '(' + (function(obj) {
	                            var size = 0, key;
	                            for (key in obj) {
	                                if (obj.hasOwnProperty(key)) {
	                                    size++;
	                                }
	                            }
	                            return size;
	                        })(variable) + ') {' + EOL;
	                        for (i in variable) {
	                            out += indent(indentTimes) + '[' + i + ']=> ' + EOL;
	                            displayVar(variable[i]);
	                        }
	                        indentTimes--;
	                        out += indent(indentTimes) + '}' + EOL;
	                    } else {
	                        displayVar(variable);
	                    }
	                };

	            // handle no argument case by dumping the entire render context
	            if (args.length == 0) args.push(this.context);

	            Twig.forEach(args, function(variable) {
	                dumpVar(variable);
	            });

	            return out;
	        },
	        date: function(date, time) {
	            var dateObj;
	            if (date === undefined || date === null || date === "") {
	                dateObj = new Date();
	            } else if (Twig.lib.is("Date", date)) {
	                dateObj = date;
	            } else if (Twig.lib.is("String", date)) {
	                if (date.match(/^[0-9]+$/)) {
	                    dateObj = new Date(date * 1000);
	                }
	                else {
	                    dateObj = new Date(Twig.lib.strtotime(date) * 1000);
	                }
	            } else if (Twig.lib.is("Number", date)) {
	                // timestamp
	                dateObj = new Date(date * 1000);
	            } else {
	                throw new Twig.Error("Unable to parse date " + date);
	            }
	            return dateObj;
	        },
	        block: function(block) {
	            if (this.originalBlockTokens[block]) {
	                return Twig.logic.parse.apply(this, [this.originalBlockTokens[block], this.context]).output;
	            } else {
	                return this.blocks[block];
	            }
	        },
	        parent: function() {
	            // Add a placeholder
	            return Twig.placeholders.parent;
	        },
	        attribute: function(object, method, params) {
	            if (Twig.lib.is('Object', object)) {
	                if (object.hasOwnProperty(method)) {
	                    if (typeof object[method] === "function") {
	                        return object[method].apply(undefined, params);
	                    }
	                    else {
	                        return object[method];
	                    }
	                }
	            }
	            // Array will return element 0-index
	            return object[method] || undefined;
	        },
	        max: function(values) {
	            if(Twig.lib.is("Object", values)) {
	                delete values["_keys"];
	                return Twig.lib.max(values);
	            }

	            return Twig.lib.max.apply(null, arguments);
	        },
	        min: function(values) {
	            if(Twig.lib.is("Object", values)) {
	                delete values["_keys"];
	                return Twig.lib.min(values);
	            }

	            return Twig.lib.min.apply(null, arguments);
	        },
	        template_from_string: function(template) {
	            if (template === undefined) {
	                template = '';
	            }
	            return Twig.Templates.parsers.twig({
	                options: this.options,
	                data: template
	            });
	        },
	        random: function(value) {
	            var LIMIT_INT31 = 0x80000000;

	            function getRandomNumber(n) {
	                var random = Math.floor(Math.random() * LIMIT_INT31);
	                var limits = [0, n];
	                var min = Math.min.apply(null, limits),
	                    max = Math.max.apply(null, limits);
	                return min + Math.floor((max - min + 1) * random / LIMIT_INT31);
	            }

	            if(Twig.lib.is("Number", value)) {
	                return getRandomNumber(value);
	            }

	            if(Twig.lib.is("String", value)) {
	                return value.charAt(getRandomNumber(value.length-1));
	            }

	            if(Twig.lib.is("Array", value)) {
	                return value[getRandomNumber(value.length-1)];
	            }

	            if(Twig.lib.is("Object", value)) {
	                var keys = Object.keys(value);
	                return value[keys[getRandomNumber(keys.length-1)]];
	            }

	            return getRandomNumber(LIMIT_INT31-1);
	        },

	        /**
	         * Returns the content of a template without rendering it
	         * @param {string} name
	         * @param {boolean} [ignore_missing=false]
	         * @returns {string}
	         */
	        source: function(name, ignore_missing) {
	            var templateSource;
	            var templateFound = false;
	            var isNodeEnvironment = typeof module !== 'undefined' && typeof module.exports !== 'undefined' && typeof window === 'undefined';
	            var loader;
	            var path;

	            //if we are running in a node.js environment, set the loader to 'fs' and ensure the
	            // path is relative to the CWD of the running script
	            //else, set the loader to 'ajax' and set the path to the value of name
	            if (isNodeEnvironment) {
	                loader = 'fs';
	                path = __dirname + '/' + name;
	            } else {
	                loader = 'ajax';
	                path = name;
	            }

	            //build the params object
	            var params = {
	                id: name,
	                path: path,
	                method: loader,
	                parser: 'source',
	                async: false,
	                fetchTemplateSource: true
	            };

	            //default ignore_missing to false
	            if (typeof ignore_missing === 'undefined') {
	                ignore_missing = false;
	            }

	            //try to load the remote template
	            //
	            //on exception, log it
	            try {
	                templateSource = Twig.Templates.loadRemote(name, params);

	                //if the template is undefined or null, set the template to an empty string and do NOT flip the
	                // boolean indicating we found the template
	                //
	                //else, all is good! flip the boolean indicating we found the template
	                if (typeof templateSource === 'undefined' || templateSource === null) {
	                    templateSource = '';
	                } else {
	                    templateFound = true;
	                }
	            } catch (e) {
	                Twig.log.debug('Twig.functions.source: ', 'Problem loading template  ', e);
	            }

	            //if the template was NOT found AND we are not ignoring missing templates, return the same message
	            // that is returned by the PHP implementation of the twig source() function
	            //
	            //else, return the template source
	            if (!templateFound && !ignore_missing) {
	                return TEMPLATE_NOT_FOUND_MESSAGE.replace('{name}', name);
	            } else {
	                return templateSource;
	            }
	        }
	    };

	    Twig._function = function(_function, value, params) {
	        if (!Twig.functions[_function]) {
	            throw "Unable to find function " + _function;
	        }
	        return Twig.functions[_function](value, params);
	    };

	    Twig._function.extend = function(_function, definition) {
	        Twig.functions[_function] = definition;
	    };

	    return Twig;

	};


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	// ## twig.lib.js
	//
	// This file contains 3rd party libraries used within twig.
	//
	// Copies of the licenses for the code included here can be found in the
	// LICENSES.md file.
	//

	module.exports = function(Twig) {

	    // Namespace for libraries
	    Twig.lib = { };

	    Twig.lib.sprintf = __webpack_require__(8);
	    Twig.lib.vsprintf = __webpack_require__(9);
	    Twig.lib.round = __webpack_require__(10);
	    Twig.lib.max = __webpack_require__(11);
	    Twig.lib.min = __webpack_require__(12);
	    Twig.lib.strip_tags = __webpack_require__(13);
	    Twig.lib.strtotime = __webpack_require__(14);
	    Twig.lib.date = __webpack_require__(15);
	    Twig.lib.boolval = __webpack_require__(16);

	    Twig.lib.is = function(type, obj) {
	        var clas = Object.prototype.toString.call(obj).slice(8, -1);
	        return obj !== undefined && obj !== null && clas === type;
	    };

	    // shallow-copy an object
	    Twig.lib.copy = function(src) {
	        var target = {},
	            key;
	        for (key in src)
	            target[key] = src[key];

	        return target;
	    };

	    Twig.lib.extend = function (src, add) {
	        var keys = Object.keys(add),
	            i;

	        i = keys.length;

	        while (i--) {
	            src[keys[i]] = add[keys[i]];
	        }

	        return src;
	    };

	    Twig.lib.replaceAll = function(string, search, replace) {
	        return string.split(search).join(replace);
	    };

	    // chunk an array (arr) into arrays of (size) items, returns an array of arrays, or an empty array on invalid input
	    Twig.lib.chunkArray = function (arr, size) {
	        var returnVal = [],
	            x = 0,
	            len = arr.length;

	        if (size < 1 || !Twig.lib.is("Array", arr)) {
	            return [];
	        }

	        while (x < len) {
	            returnVal.push(arr.slice(x, x += size));
	        }

	        return returnVal;
	    };

	    return Twig;
	};


/***/ },
/* 8 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function sprintf() {
	  //  discuss at: http://locutus.io/php/sprintf/
	  // original by: Ash Searle (http://hexmen.com/blog/)
	  // improved by: Michael White (http://getsprink.com)
	  // improved by: Jack
	  // improved by: Kevin van Zonneveld (http://kvz.io)
	  // improved by: Kevin van Zonneveld (http://kvz.io)
	  // improved by: Kevin van Zonneveld (http://kvz.io)
	  // improved by: Dj
	  // improved by: Allidylls
	  //    input by: Paulo Freitas
	  //    input by: Brett Zamir (http://brett-zamir.me)
	  //   example 1: sprintf("%01.2f", 123.1)
	  //   returns 1: '123.10'
	  //   example 2: sprintf("[%10s]", 'monkey')
	  //   returns 2: '[    monkey]'
	  //   example 3: sprintf("[%'#10s]", 'monkey')
	  //   returns 3: '[####monkey]'
	  //   example 4: sprintf("%d", 123456789012345)
	  //   returns 4: '123456789012345'
	  //   example 5: sprintf('%-03s', 'E')
	  //   returns 5: 'E00'

	  var regex = /%%|%(\d+\$)?([\-+'#0 ]*)(\*\d+\$|\*|\d+)?(?:\.(\*\d+\$|\*|\d+))?([scboxXuideEfFgG])/g;
	  var a = arguments;
	  var i = 0;
	  var format = a[i++];

	  var _pad = function _pad(str, len, chr, leftJustify) {
	    if (!chr) {
	      chr = ' ';
	    }
	    var padding = str.length >= len ? '' : new Array(1 + len - str.length >>> 0).join(chr);
	    return leftJustify ? str + padding : padding + str;
	  };

	  var justify = function justify(value, prefix, leftJustify, minWidth, zeroPad, customPadChar) {
	    var diff = minWidth - value.length;
	    if (diff > 0) {
	      if (leftJustify || !zeroPad) {
	        value = _pad(value, minWidth, customPadChar, leftJustify);
	      } else {
	        value = [value.slice(0, prefix.length), _pad('', diff, '0', true), value.slice(prefix.length)].join('');
	      }
	    }
	    return value;
	  };

	  var _formatBaseX = function _formatBaseX(value, base, prefix, leftJustify, minWidth, precision, zeroPad) {
	    // Note: casts negative numbers to positive ones
	    var number = value >>> 0;
	    prefix = prefix && number && {
	      '2': '0b',
	      '8': '0',
	      '16': '0x'
	    }[base] || '';
	    value = prefix + _pad(number.toString(base), precision || 0, '0', false);
	    return justify(value, prefix, leftJustify, minWidth, zeroPad);
	  };

	  // _formatString()
	  var _formatString = function _formatString(value, leftJustify, minWidth, precision, zeroPad, customPadChar) {
	    if (precision !== null && precision !== undefined) {
	      value = value.slice(0, precision);
	    }
	    return justify(value, '', leftJustify, minWidth, zeroPad, customPadChar);
	  };

	  // doFormat()
	  var doFormat = function doFormat(substring, valueIndex, flags, minWidth, precision, type) {
	    var number, prefix, method, textTransform, value;

	    if (substring === '%%') {
	      return '%';
	    }

	    // parse flags
	    var leftJustify = false;
	    var positivePrefix = '';
	    var zeroPad = false;
	    var prefixBaseX = false;
	    var customPadChar = ' ';
	    var flagsl = flags.length;
	    var j;
	    for (j = 0; j < flagsl; j++) {
	      switch (flags.charAt(j)) {
	        case ' ':
	          positivePrefix = ' ';
	          break;
	        case '+':
	          positivePrefix = '+';
	          break;
	        case '-':
	          leftJustify = true;
	          break;
	        case "'":
	          customPadChar = flags.charAt(j + 1);
	          break;
	        case '0':
	          zeroPad = true;
	          customPadChar = '0';
	          break;
	        case '#':
	          prefixBaseX = true;
	          break;
	      }
	    }

	    // parameters may be null, undefined, empty-string or real valued
	    // we want to ignore null, undefined and empty-string values
	    if (!minWidth) {
	      minWidth = 0;
	    } else if (minWidth === '*') {
	      minWidth = +a[i++];
	    } else if (minWidth.charAt(0) === '*') {
	      minWidth = +a[minWidth.slice(1, -1)];
	    } else {
	      minWidth = +minWidth;
	    }

	    // Note: undocumented perl feature:
	    if (minWidth < 0) {
	      minWidth = -minWidth;
	      leftJustify = true;
	    }

	    if (!isFinite(minWidth)) {
	      throw new Error('sprintf: (minimum-)width must be finite');
	    }

	    if (!precision) {
	      precision = 'fFeE'.indexOf(type) > -1 ? 6 : type === 'd' ? 0 : undefined;
	    } else if (precision === '*') {
	      precision = +a[i++];
	    } else if (precision.charAt(0) === '*') {
	      precision = +a[precision.slice(1, -1)];
	    } else {
	      precision = +precision;
	    }

	    // grab value using valueIndex if required?
	    value = valueIndex ? a[valueIndex.slice(0, -1)] : a[i++];

	    switch (type) {
	      case 's':
	        return _formatString(value + '', leftJustify, minWidth, precision, zeroPad, customPadChar);
	      case 'c':
	        return _formatString(String.fromCharCode(+value), leftJustify, minWidth, precision, zeroPad);
	      case 'b':
	        return _formatBaseX(value, 2, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
	      case 'o':
	        return _formatBaseX(value, 8, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
	      case 'x':
	        return _formatBaseX(value, 16, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
	      case 'X':
	        return _formatBaseX(value, 16, prefixBaseX, leftJustify, minWidth, precision, zeroPad).toUpperCase();
	      case 'u':
	        return _formatBaseX(value, 10, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
	      case 'i':
	      case 'd':
	        number = +value || 0;
	        // Plain Math.round doesn't just truncate
	        number = Math.round(number - number % 1);
	        prefix = number < 0 ? '-' : positivePrefix;
	        value = prefix + _pad(String(Math.abs(number)), precision, '0', false);
	        return justify(value, prefix, leftJustify, minWidth, zeroPad);
	      case 'e':
	      case 'E':
	      case 'f': // @todo: Should handle locales (as per setlocale)
	      case 'F':
	      case 'g':
	      case 'G':
	        number = +value;
	        prefix = number < 0 ? '-' : positivePrefix;
	        method = ['toExponential', 'toFixed', 'toPrecision']['efg'.indexOf(type.toLowerCase())];
	        textTransform = ['toString', 'toUpperCase']['eEfFgG'.indexOf(type) % 2];
	        value = prefix + Math.abs(number)[method](precision);
	        return justify(value, prefix, leftJustify, minWidth, zeroPad)[textTransform]();
	      default:
	        return substring;
	    }
	  };

	  return format.replace(regex, doFormat);
	};
	//# sourceMappingURL=sprintf.js.map

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	module.exports = function vsprintf(format, args) {
	  //  discuss at: http://locutus.io/php/vsprintf/
	  // original by: ejsanders
	  //   example 1: vsprintf('%04d-%02d-%02d', [1988, 8, 1])
	  //   returns 1: '1988-08-01'

	  var sprintf = __webpack_require__(8);

	  return sprintf.apply(this, [format].concat(args));
	};
	//# sourceMappingURL=vsprintf.js.map

/***/ },
/* 10 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function round(value, precision, mode) {
	  //  discuss at: http://locutus.io/php/round/
	  // original by: Philip Peterson
	  //  revised by: Onno Marsman (https://twitter.com/onnomarsman)
	  //  revised by: T.Wild
	  //  revised by: Rafał Kukawski (http://blog.kukawski.pl)
	  //    input by: Greenseed
	  //    input by: meo
	  //    input by: William
	  //    input by: Josep Sanz (http://www.ws3.es/)
	  // bugfixed by: Brett Zamir (http://brett-zamir.me)
	  //      note 1: Great work. Ideas for improvement:
	  //      note 1: - code more compliant with developer guidelines
	  //      note 1: - for implementing PHP constant arguments look at
	  //      note 1: the pathinfo() function, it offers the greatest
	  //      note 1: flexibility & compatibility possible
	  //   example 1: round(1241757, -3)
	  //   returns 1: 1242000
	  //   example 2: round(3.6)
	  //   returns 2: 4
	  //   example 3: round(2.835, 2)
	  //   returns 3: 2.84
	  //   example 4: round(1.1749999999999, 2)
	  //   returns 4: 1.17
	  //   example 5: round(58551.799999999996, 2)
	  //   returns 5: 58551.8

	  var m, f, isHalf, sgn; // helper variables
	  // making sure precision is integer
	  precision |= 0;
	  m = Math.pow(10, precision);
	  value *= m;
	  // sign of the number
	  sgn = value > 0 | -(value < 0);
	  isHalf = value % 1 === 0.5 * sgn;
	  f = Math.floor(value);

	  if (isHalf) {
	    switch (mode) {
	      case 'PHP_ROUND_HALF_DOWN':
	        // rounds .5 toward zero
	        value = f + (sgn < 0);
	        break;
	      case 'PHP_ROUND_HALF_EVEN':
	        // rouds .5 towards the next even integer
	        value = f + f % 2 * sgn;
	        break;
	      case 'PHP_ROUND_HALF_ODD':
	        // rounds .5 towards the next odd integer
	        value = f + !(f % 2);
	        break;
	      default:
	        // rounds .5 away from zero
	        value = f + (sgn > 0);
	    }
	  }

	  return (isHalf ? value : Math.round(value)) / m;
	};
	//# sourceMappingURL=round.js.map

/***/ },
/* 11 */
/***/ function(module, exports) {

	'use strict';

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

	module.exports = function max() {
	  //  discuss at: http://locutus.io/php/max/
	  // original by: Onno Marsman (https://twitter.com/onnomarsman)
	  //  revised by: Onno Marsman (https://twitter.com/onnomarsman)
	  // improved by: Jack
	  //      note 1: Long code cause we're aiming for maximum PHP compatibility
	  //   example 1: max(1, 3, 5, 6, 7)
	  //   returns 1: 7
	  //   example 2: max([2, 4, 5])
	  //   returns 2: 5
	  //   example 3: max(0, 'hello')
	  //   returns 3: 0
	  //   example 4: max('hello', 0)
	  //   returns 4: 'hello'
	  //   example 5: max(-1, 'hello')
	  //   returns 5: 'hello'
	  //   example 6: max([2, 4, 8], [2, 5, 7])
	  //   returns 6: [2, 5, 7]

	  var ar;
	  var retVal;
	  var i = 0;
	  var n = 0;
	  var argv = arguments;
	  var argc = argv.length;
	  var _obj2Array = function _obj2Array(obj) {
	    if (Object.prototype.toString.call(obj) === '[object Array]') {
	      return obj;
	    } else {
	      var ar = [];
	      for (var i in obj) {
	        if (obj.hasOwnProperty(i)) {
	          ar.push(obj[i]);
	        }
	      }
	      return ar;
	    }
	  };
	  var _compare = function _compare(current, next) {
	    var i = 0;
	    var n = 0;
	    var tmp = 0;
	    var nl = 0;
	    var cl = 0;

	    if (current === next) {
	      return 0;
	    } else if ((typeof current === 'undefined' ? 'undefined' : _typeof(current)) === 'object') {
	      if ((typeof next === 'undefined' ? 'undefined' : _typeof(next)) === 'object') {
	        current = _obj2Array(current);
	        next = _obj2Array(next);
	        cl = current.length;
	        nl = next.length;
	        if (nl > cl) {
	          return 1;
	        } else if (nl < cl) {
	          return -1;
	        }
	        for (i = 0, n = cl; i < n; ++i) {
	          tmp = _compare(current[i], next[i]);
	          if (tmp === 1) {
	            return 1;
	          } else if (tmp === -1) {
	            return -1;
	          }
	        }
	        return 0;
	      }
	      return -1;
	    } else if ((typeof next === 'undefined' ? 'undefined' : _typeof(next)) === 'object') {
	      return 1;
	    } else if (isNaN(next) && !isNaN(current)) {
	      if (current === 0) {
	        return 0;
	      }
	      return current < 0 ? 1 : -1;
	    } else if (isNaN(current) && !isNaN(next)) {
	      if (next === 0) {
	        return 0;
	      }
	      return next > 0 ? 1 : -1;
	    }

	    if (next === current) {
	      return 0;
	    }

	    return next > current ? 1 : -1;
	  };

	  if (argc === 0) {
	    throw new Error('At least one value should be passed to max()');
	  } else if (argc === 1) {
	    if (_typeof(argv[0]) === 'object') {
	      ar = _obj2Array(argv[0]);
	    } else {
	      throw new Error('Wrong parameter count for max()');
	    }
	    if (ar.length === 0) {
	      throw new Error('Array must contain at least one element for max()');
	    }
	  } else {
	    ar = argv;
	  }

	  retVal = ar[0];
	  for (i = 1, n = ar.length; i < n; ++i) {
	    if (_compare(retVal, ar[i]) === 1) {
	      retVal = ar[i];
	    }
	  }

	  return retVal;
	};
	//# sourceMappingURL=max.js.map

/***/ },
/* 12 */
/***/ function(module, exports) {

	'use strict';

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

	module.exports = function min() {
	  //  discuss at: http://locutus.io/php/min/
	  // original by: Onno Marsman (https://twitter.com/onnomarsman)
	  //  revised by: Onno Marsman (https://twitter.com/onnomarsman)
	  // improved by: Jack
	  //      note 1: Long code cause we're aiming for maximum PHP compatibility
	  //   example 1: min(1, 3, 5, 6, 7)
	  //   returns 1: 1
	  //   example 2: min([2, 4, 5])
	  //   returns 2: 2
	  //   example 3: min(0, 'hello')
	  //   returns 3: 0
	  //   example 4: min('hello', 0)
	  //   returns 4: 'hello'
	  //   example 5: min(-1, 'hello')
	  //   returns 5: -1
	  //   example 6: min([2, 4, 8], [2, 5, 7])
	  //   returns 6: [2, 4, 8]

	  var ar;
	  var retVal;
	  var i = 0;
	  var n = 0;
	  var argv = arguments;
	  var argc = argv.length;
	  var _obj2Array = function _obj2Array(obj) {
	    if (Object.prototype.toString.call(obj) === '[object Array]') {
	      return obj;
	    }
	    var ar = [];
	    for (var i in obj) {
	      if (obj.hasOwnProperty(i)) {
	        ar.push(obj[i]);
	      }
	    }
	    return ar;
	  };

	  var _compare = function _compare(current, next) {
	    var i = 0;
	    var n = 0;
	    var tmp = 0;
	    var nl = 0;
	    var cl = 0;

	    if (current === next) {
	      return 0;
	    } else if ((typeof current === 'undefined' ? 'undefined' : _typeof(current)) === 'object') {
	      if ((typeof next === 'undefined' ? 'undefined' : _typeof(next)) === 'object') {
	        current = _obj2Array(current);
	        next = _obj2Array(next);
	        cl = current.length;
	        nl = next.length;
	        if (nl > cl) {
	          return 1;
	        } else if (nl < cl) {
	          return -1;
	        }
	        for (i = 0, n = cl; i < n; ++i) {
	          tmp = _compare(current[i], next[i]);
	          if (tmp === 1) {
	            return 1;
	          } else if (tmp === -1) {
	            return -1;
	          }
	        }
	        return 0;
	      }
	      return -1;
	    } else if ((typeof next === 'undefined' ? 'undefined' : _typeof(next)) === 'object') {
	      return 1;
	    } else if (isNaN(next) && !isNaN(current)) {
	      if (current === 0) {
	        return 0;
	      }
	      return current < 0 ? 1 : -1;
	    } else if (isNaN(current) && !isNaN(next)) {
	      if (next === 0) {
	        return 0;
	      }
	      return next > 0 ? 1 : -1;
	    }

	    if (next === current) {
	      return 0;
	    }

	    return next > current ? 1 : -1;
	  };

	  if (argc === 0) {
	    throw new Error('At least one value should be passed to min()');
	  } else if (argc === 1) {
	    if (_typeof(argv[0]) === 'object') {
	      ar = _obj2Array(argv[0]);
	    } else {
	      throw new Error('Wrong parameter count for min()');
	    }

	    if (ar.length === 0) {
	      throw new Error('Array must contain at least one element for min()');
	    }
	  } else {
	    ar = argv;
	  }

	  retVal = ar[0];

	  for (i = 1, n = ar.length; i < n; ++i) {
	    if (_compare(retVal, ar[i]) === -1) {
	      retVal = ar[i];
	    }
	  }

	  return retVal;
	};
	//# sourceMappingURL=min.js.map

/***/ },
/* 13 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function strip_tags(input, allowed) {
	  // eslint-disable-line camelcase
	  //  discuss at: http://locutus.io/php/strip_tags/
	  // original by: Kevin van Zonneveld (http://kvz.io)
	  // improved by: Luke Godfrey
	  // improved by: Kevin van Zonneveld (http://kvz.io)
	  //    input by: Pul
	  //    input by: Alex
	  //    input by: Marc Palau
	  //    input by: Brett Zamir (http://brett-zamir.me)
	  //    input by: Bobby Drake
	  //    input by: Evertjan Garretsen
	  // bugfixed by: Kevin van Zonneveld (http://kvz.io)
	  // bugfixed by: Onno Marsman (https://twitter.com/onnomarsman)
	  // bugfixed by: Kevin van Zonneveld (http://kvz.io)
	  // bugfixed by: Kevin van Zonneveld (http://kvz.io)
	  // bugfixed by: Eric Nagel
	  // bugfixed by: Kevin van Zonneveld (http://kvz.io)
	  // bugfixed by: Tomasz Wesolowski
	  //  revised by: Rafał Kukawski (http://blog.kukawski.pl)
	  //   example 1: strip_tags('<p>Kevin</p> <br /><b>van</b> <i>Zonneveld</i>', '<i><b>')
	  //   returns 1: 'Kevin <b>van</b> <i>Zonneveld</i>'
	  //   example 2: strip_tags('<p>Kevin <img src="someimage.png" onmouseover="someFunction()">van <i>Zonneveld</i></p>', '<p>')
	  //   returns 2: '<p>Kevin van Zonneveld</p>'
	  //   example 3: strip_tags("<a href='http://kvz.io'>Kevin van Zonneveld</a>", "<a>")
	  //   returns 3: "<a href='http://kvz.io'>Kevin van Zonneveld</a>"
	  //   example 4: strip_tags('1 < 5 5 > 1')
	  //   returns 4: '1 < 5 5 > 1'
	  //   example 5: strip_tags('1 <br/> 1')
	  //   returns 5: '1  1'
	  //   example 6: strip_tags('1 <br/> 1', '<br>')
	  //   returns 6: '1 <br/> 1'
	  //   example 7: strip_tags('1 <br/> 1', '<br><br/>')
	  //   returns 7: '1 <br/> 1'

	  // making sure the allowed arg is a string containing only tags in lowercase (<a><b><c>)
	  allowed = (((allowed || '') + '').toLowerCase().match(/<[a-z][a-z0-9]*>/g) || []).join('');

	  var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;
	  var commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;

	  return input.replace(commentsAndPhpTags, '').replace(tags, function ($0, $1) {
	    return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : '';
	  });
	};
	//# sourceMappingURL=strip_tags.js.map

/***/ },
/* 14 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function strtotime(text, now) {
	  //  discuss at: http://locutus.io/php/strtotime/
	  // original by: Caio Ariede (http://caioariede.com)
	  // improved by: Kevin van Zonneveld (http://kvz.io)
	  // improved by: Caio Ariede (http://caioariede.com)
	  // improved by: A. Matías Quezada (http://amatiasq.com)
	  // improved by: preuter
	  // improved by: Brett Zamir (http://brett-zamir.me)
	  // improved by: Mirko Faber
	  //    input by: David
	  // bugfixed by: Wagner B. Soares
	  // bugfixed by: Artur Tchernychev
	  // bugfixed by: Stephan Bösch-Plepelits (http://github.com/plepe)
	  //      note 1: Examples all have a fixed timestamp to prevent
	  //      note 1: tests to fail because of variable time(zones)
	  //   example 1: strtotime('+1 day', 1129633200)
	  //   returns 1: 1129719600
	  //   example 2: strtotime('+1 week 2 days 4 hours 2 seconds', 1129633200)
	  //   returns 2: 1130425202
	  //   example 3: strtotime('last month', 1129633200)
	  //   returns 3: 1127041200
	  //   example 4: strtotime('2009-05-04 08:30:00 GMT')
	  //   returns 4: 1241425800
	  //   example 5: strtotime('2009-05-04 08:30:00+00')
	  //   returns 5: 1241425800
	  //   example 6: strtotime('2009-05-04 08:30:00+02:00')
	  //   returns 6: 1241418600
	  //   example 7: strtotime('2009-05-04T08:30:00Z')
	  //   returns 7: 1241425800

	  var parsed;
	  var match;
	  var today;
	  var year;
	  var date;
	  var days;
	  var ranges;
	  var len;
	  var times;
	  var regex;
	  var i;
	  var fail = false;

	  if (!text) {
	    return fail;
	  }

	  // Unecessary spaces
	  text = text.replace(/^\s+|\s+$/g, '').replace(/\s{2,}/g, ' ').replace(/[\t\r\n]/g, '').toLowerCase();

	  // in contrast to php, js Date.parse function interprets:
	  // dates given as yyyy-mm-dd as in timezone: UTC,
	  // dates with "." or "-" as MDY instead of DMY
	  // dates with two-digit years differently
	  // etc...etc...
	  // ...therefore we manually parse lots of common date formats
	  var pattern = new RegExp(['^(\\d{1,4})', '([\\-\\.\\/:])', '(\\d{1,2})', '([\\-\\.\\/:])', '(\\d{1,4})', '(?:\\s(\\d{1,2}):(\\d{2})?:?(\\d{2})?)?', '(?:\\s([A-Z]+)?)?$'].join(''));
	  match = text.match(pattern);

	  if (match && match[2] === match[4]) {
	    if (match[1] > 1901) {
	      switch (match[2]) {
	        case '-':
	          // YYYY-M-D
	          if (match[3] > 12 || match[5] > 31) {
	            return fail;
	          }

	          return new Date(match[1], parseInt(match[3], 10) - 1, match[5], match[6] || 0, match[7] || 0, match[8] || 0, match[9] || 0) / 1000;
	        case '.':
	          // YYYY.M.D is not parsed by strtotime()
	          return fail;
	        case '/':
	          // YYYY/M/D
	          if (match[3] > 12 || match[5] > 31) {
	            return fail;
	          }

	          return new Date(match[1], parseInt(match[3], 10) - 1, match[5], match[6] || 0, match[7] || 0, match[8] || 0, match[9] || 0) / 1000;
	      }
	    } else if (match[5] > 1901) {
	      switch (match[2]) {
	        case '-':
	          // D-M-YYYY
	          if (match[3] > 12 || match[1] > 31) {
	            return fail;
	          }

	          return new Date(match[5], parseInt(match[3], 10) - 1, match[1], match[6] || 0, match[7] || 0, match[8] || 0, match[9] || 0) / 1000;
	        case '.':
	          // D.M.YYYY
	          if (match[3] > 12 || match[1] > 31) {
	            return fail;
	          }

	          return new Date(match[5], parseInt(match[3], 10) - 1, match[1], match[6] || 0, match[7] || 0, match[8] || 0, match[9] || 0) / 1000;
	        case '/':
	          // M/D/YYYY
	          if (match[1] > 12 || match[3] > 31) {
	            return fail;
	          }

	          return new Date(match[5], parseInt(match[1], 10) - 1, match[3], match[6] || 0, match[7] || 0, match[8] || 0, match[9] || 0) / 1000;
	      }
	    } else {
	      switch (match[2]) {
	        case '-':
	          // YY-M-D
	          if (match[3] > 12 || match[5] > 31 || match[1] < 70 && match[1] > 38) {
	            return fail;
	          }

	          year = match[1] >= 0 && match[1] <= 38 ? +match[1] + 2000 : match[1];
	          return new Date(year, parseInt(match[3], 10) - 1, match[5], match[6] || 0, match[7] || 0, match[8] || 0, match[9] || 0) / 1000;
	        case '.':
	          // D.M.YY or H.MM.SS
	          if (match[5] >= 70) {
	            // D.M.YY
	            if (match[3] > 12 || match[1] > 31) {
	              return fail;
	            }

	            return new Date(match[5], parseInt(match[3], 10) - 1, match[1], match[6] || 0, match[7] || 0, match[8] || 0, match[9] || 0) / 1000;
	          }
	          if (match[5] < 60 && !match[6]) {
	            // H.MM.SS
	            if (match[1] > 23 || match[3] > 59) {
	              return fail;
	            }

	            today = new Date();
	            return new Date(today.getFullYear(), today.getMonth(), today.getDate(), match[1] || 0, match[3] || 0, match[5] || 0, match[9] || 0) / 1000;
	          }

	          // invalid format, cannot be parsed
	          return fail;
	        case '/':
	          // M/D/YY
	          if (match[1] > 12 || match[3] > 31 || match[5] < 70 && match[5] > 38) {
	            return fail;
	          }

	          year = match[5] >= 0 && match[5] <= 38 ? +match[5] + 2000 : match[5];
	          return new Date(year, parseInt(match[1], 10) - 1, match[3], match[6] || 0, match[7] || 0, match[8] || 0, match[9] || 0) / 1000;
	        case ':':
	          // HH:MM:SS
	          if (match[1] > 23 || match[3] > 59 || match[5] > 59) {
	            return fail;
	          }

	          today = new Date();
	          return new Date(today.getFullYear(), today.getMonth(), today.getDate(), match[1] || 0, match[3] || 0, match[5] || 0) / 1000;
	      }
	    }
	  }

	  // other formats and "now" should be parsed by Date.parse()
	  if (text === 'now') {
	    return now === null || isNaN(now) ? new Date().getTime() / 1000 | 0 : now | 0;
	  }
	  if (!isNaN(parsed = Date.parse(text))) {
	    return parsed / 1000 | 0;
	  }
	  // Browsers !== Chrome have problems parsing ISO 8601 date strings, as they do
	  // not accept lower case characters, space, or shortened time zones.
	  // Therefore, fix these problems and try again.
	  // Examples:
	  //   2015-04-15 20:33:59+02
	  //   2015-04-15 20:33:59z
	  //   2015-04-15t20:33:59+02:00
	  pattern = new RegExp(['^([0-9]{4}-[0-9]{2}-[0-9]{2})', '[ t]', '([0-9]{2}:[0-9]{2}:[0-9]{2}(\\.[0-9]+)?)', '([\\+-][0-9]{2}(:[0-9]{2})?|z)'].join(''));
	  match = text.match(pattern);
	  if (match) {
	    // @todo: time zone information
	    if (match[4] === 'z') {
	      match[4] = 'Z';
	    } else if (match[4].match(/^([\+-][0-9]{2})$/)) {
	      match[4] = match[4] + ':00';
	    }

	    if (!isNaN(parsed = Date.parse(match[1] + 'T' + match[2] + match[4]))) {
	      return parsed / 1000 | 0;
	    }
	  }

	  date = now ? new Date(now * 1000) : new Date();
	  days = {
	    'sun': 0,
	    'mon': 1,
	    'tue': 2,
	    'wed': 3,
	    'thu': 4,
	    'fri': 5,
	    'sat': 6
	  };
	  ranges = {
	    'yea': 'FullYear',
	    'mon': 'Month',
	    'day': 'Date',
	    'hou': 'Hours',
	    'min': 'Minutes',
	    'sec': 'Seconds'
	  };

	  function lastNext(type, range, modifier) {
	    var diff;
	    var day = days[range];

	    if (typeof day !== 'undefined') {
	      diff = day - date.getDay();

	      if (diff === 0) {
	        diff = 7 * modifier;
	      } else if (diff > 0 && type === 'last') {
	        diff -= 7;
	      } else if (diff < 0 && type === 'next') {
	        diff += 7;
	      }

	      date.setDate(date.getDate() + diff);
	    }
	  }

	  function process(val) {
	    // @todo: Reconcile this with regex using \s, taking into account
	    // browser issues with split and regexes
	    var splt = val.split(' ');
	    var type = splt[0];
	    var range = splt[1].substring(0, 3);
	    var typeIsNumber = /\d+/.test(type);
	    var ago = splt[2] === 'ago';
	    var num = (type === 'last' ? -1 : 1) * (ago ? -1 : 1);

	    if (typeIsNumber) {
	      num *= parseInt(type, 10);
	    }

	    if (ranges.hasOwnProperty(range) && !splt[1].match(/^mon(day|\.)?$/i)) {
	      return date['set' + ranges[range]](date['get' + ranges[range]]() + num);
	    }

	    if (range === 'wee') {
	      return date.setDate(date.getDate() + num * 7);
	    }

	    if (type === 'next' || type === 'last') {
	      lastNext(type, range, num);
	    } else if (!typeIsNumber) {
	      return false;
	    }

	    return true;
	  }

	  times = '(years?|months?|weeks?|days?|hours?|minutes?|min|seconds?|sec' + '|sunday|sun\\.?|monday|mon\\.?|tuesday|tue\\.?|wednesday|wed\\.?' + '|thursday|thu\\.?|friday|fri\\.?|saturday|sat\\.?)';
	  regex = '([+-]?\\d+\\s' + times + '|' + '(last|next)\\s' + times + ')(\\sago)?';

	  match = text.match(new RegExp(regex, 'gi'));
	  if (!match) {
	    return fail;
	  }

	  for (i = 0, len = match.length; i < len; i++) {
	    if (!process(match[i])) {
	      return fail;
	    }
	  }

	  return date.getTime() / 1000;
	};
	//# sourceMappingURL=strtotime.js.map

/***/ },
/* 15 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function date(format, timestamp) {
	  //  discuss at: http://locutus.io/php/date/
	  // original by: Carlos R. L. Rodrigues (http://www.jsfromhell.com)
	  // original by: gettimeofday
	  //    parts by: Peter-Paul Koch (http://www.quirksmode.org/js/beat.html)
	  // improved by: Kevin van Zonneveld (http://kvz.io)
	  // improved by: MeEtc (http://yass.meetcweb.com)
	  // improved by: Brad Touesnard
	  // improved by: Tim Wiel
	  // improved by: Bryan Elliott
	  // improved by: David Randall
	  // improved by: Theriault (https://github.com/Theriault)
	  // improved by: Theriault (https://github.com/Theriault)
	  // improved by: Brett Zamir (http://brett-zamir.me)
	  // improved by: Theriault (https://github.com/Theriault)
	  // improved by: Thomas Beaucourt (http://www.webapp.fr)
	  // improved by: JT
	  // improved by: Theriault (https://github.com/Theriault)
	  // improved by: Rafał Kukawski (http://blog.kukawski.pl)
	  // improved by: Theriault (https://github.com/Theriault)
	  //    input by: Brett Zamir (http://brett-zamir.me)
	  //    input by: majak
	  //    input by: Alex
	  //    input by: Martin
	  //    input by: Alex Wilson
	  //    input by: Haravikk
	  // bugfixed by: Kevin van Zonneveld (http://kvz.io)
	  // bugfixed by: majak
	  // bugfixed by: Kevin van Zonneveld (http://kvz.io)
	  // bugfixed by: Brett Zamir (http://brett-zamir.me)
	  // bugfixed by: omid (http://locutus.io/php/380:380#comment_137122)
	  // bugfixed by: Chris (http://www.devotis.nl/)
	  //      note 1: Uses global: locutus to store the default timezone
	  //      note 1: Although the function potentially allows timezone info
	  //      note 1: (see notes), it currently does not set
	  //      note 1: per a timezone specified by date_default_timezone_set(). Implementers might use
	  //      note 1: $locutus.currentTimezoneOffset and
	  //      note 1: $locutus.currentTimezoneDST set by that function
	  //      note 1: in order to adjust the dates in this function
	  //      note 1: (or our other date functions!) accordingly
	  //   example 1: date('H:m:s \\m \\i\\s \\m\\o\\n\\t\\h', 1062402400)
	  //   returns 1: '07:09:40 m is month'
	  //   example 2: date('F j, Y, g:i a', 1062462400)
	  //   returns 2: 'September 2, 2003, 12:26 am'
	  //   example 3: date('Y W o', 1062462400)
	  //   returns 3: '2003 36 2003'
	  //   example 4: var $x = date('Y m d', (new Date()).getTime() / 1000)
	  //   example 4: $x = $x + ''
	  //   example 4: var $result = $x.length // 2009 01 09
	  //   returns 4: 10
	  //   example 5: date('W', 1104534000)
	  //   returns 5: '52'
	  //   example 6: date('B t', 1104534000)
	  //   returns 6: '999 31'
	  //   example 7: date('W U', 1293750000.82); // 2010-12-31
	  //   returns 7: '52 1293750000'
	  //   example 8: date('W', 1293836400); // 2011-01-01
	  //   returns 8: '52'
	  //   example 9: date('W Y-m-d', 1293974054); // 2011-01-02
	  //   returns 9: '52 2011-01-02'
	  //        test: skip-1 skip-2 skip-5

	  var jsdate, f;
	  // Keep this here (works, but for code commented-out below for file size reasons)
	  // var tal= [];
	  var txtWords = ['Sun', 'Mon', 'Tues', 'Wednes', 'Thurs', 'Fri', 'Satur', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
	  // trailing backslash -> (dropped)
	  // a backslash followed by any character (including backslash) -> the character
	  // empty string -> empty string
	  var formatChr = /\\?(.?)/gi;
	  var formatChrCb = function formatChrCb(t, s) {
	    return f[t] ? f[t]() : s;
	  };
	  var _pad = function _pad(n, c) {
	    n = String(n);
	    while (n.length < c) {
	      n = '0' + n;
	    }
	    return n;
	  };
	  f = {
	    // Day
	    d: function d() {
	      // Day of month w/leading 0; 01..31
	      return _pad(f.j(), 2);
	    },
	    D: function D() {
	      // Shorthand day name; Mon...Sun
	      return f.l().slice(0, 3);
	    },
	    j: function j() {
	      // Day of month; 1..31
	      return jsdate.getDate();
	    },
	    l: function l() {
	      // Full day name; Monday...Sunday
	      return txtWords[f.w()] + 'day';
	    },
	    N: function N() {
	      // ISO-8601 day of week; 1[Mon]..7[Sun]
	      return f.w() || 7;
	    },
	    S: function S() {
	      // Ordinal suffix for day of month; st, nd, rd, th
	      var j = f.j();
	      var i = j % 10;
	      if (i <= 3 && parseInt(j % 100 / 10, 10) === 1) {
	        i = 0;
	      }
	      return ['st', 'nd', 'rd'][i - 1] || 'th';
	    },
	    w: function w() {
	      // Day of week; 0[Sun]..6[Sat]
	      return jsdate.getDay();
	    },
	    z: function z() {
	      // Day of year; 0..365
	      var a = new Date(f.Y(), f.n() - 1, f.j());
	      var b = new Date(f.Y(), 0, 1);
	      return Math.round((a - b) / 864e5);
	    },

	    // Week
	    W: function W() {
	      // ISO-8601 week number
	      var a = new Date(f.Y(), f.n() - 1, f.j() - f.N() + 3);
	      var b = new Date(a.getFullYear(), 0, 4);
	      return _pad(1 + Math.round((a - b) / 864e5 / 7), 2);
	    },

	    // Month
	    F: function F() {
	      // Full month name; January...December
	      return txtWords[6 + f.n()];
	    },
	    m: function m() {
	      // Month w/leading 0; 01...12
	      return _pad(f.n(), 2);
	    },
	    M: function M() {
	      // Shorthand month name; Jan...Dec
	      return f.F().slice(0, 3);
	    },
	    n: function n() {
	      // Month; 1...12
	      return jsdate.getMonth() + 1;
	    },
	    t: function t() {
	      // Days in month; 28...31
	      return new Date(f.Y(), f.n(), 0).getDate();
	    },

	    // Year
	    L: function L() {
	      // Is leap year?; 0 or 1
	      var j = f.Y();
	      return j % 4 === 0 & j % 100 !== 0 | j % 400 === 0;
	    },
	    o: function o() {
	      // ISO-8601 year
	      var n = f.n();
	      var W = f.W();
	      var Y = f.Y();
	      return Y + (n === 12 && W < 9 ? 1 : n === 1 && W > 9 ? -1 : 0);
	    },
	    Y: function Y() {
	      // Full year; e.g. 1980...2010
	      return jsdate.getFullYear();
	    },
	    y: function y() {
	      // Last two digits of year; 00...99
	      return f.Y().toString().slice(-2);
	    },

	    // Time
	    a: function a() {
	      // am or pm
	      return jsdate.getHours() > 11 ? 'pm' : 'am';
	    },
	    A: function A() {
	      // AM or PM
	      return f.a().toUpperCase();
	    },
	    B: function B() {
	      // Swatch Internet time; 000..999
	      var H = jsdate.getUTCHours() * 36e2;
	      // Hours
	      var i = jsdate.getUTCMinutes() * 60;
	      // Minutes
	      // Seconds
	      var s = jsdate.getUTCSeconds();
	      return _pad(Math.floor((H + i + s + 36e2) / 86.4) % 1e3, 3);
	    },
	    g: function g() {
	      // 12-Hours; 1..12
	      return f.G() % 12 || 12;
	    },
	    G: function G() {
	      // 24-Hours; 0..23
	      return jsdate.getHours();
	    },
	    h: function h() {
	      // 12-Hours w/leading 0; 01..12
	      return _pad(f.g(), 2);
	    },
	    H: function H() {
	      // 24-Hours w/leading 0; 00..23
	      return _pad(f.G(), 2);
	    },
	    i: function i() {
	      // Minutes w/leading 0; 00..59
	      return _pad(jsdate.getMinutes(), 2);
	    },
	    s: function s() {
	      // Seconds w/leading 0; 00..59
	      return _pad(jsdate.getSeconds(), 2);
	    },
	    u: function u() {
	      // Microseconds; 000000-999000
	      return _pad(jsdate.getMilliseconds() * 1000, 6);
	    },

	    // Timezone
	    e: function e() {
	      // Timezone identifier; e.g. Atlantic/Azores, ...
	      // The following works, but requires inclusion of the very large
	      // timezone_abbreviations_list() function.
	      /*              return that.date_default_timezone_get();
	       */
	      var msg = 'Not supported (see source code of date() for timezone on how to add support)';
	      throw new Error(msg);
	    },
	    I: function I() {
	      // DST observed?; 0 or 1
	      // Compares Jan 1 minus Jan 1 UTC to Jul 1 minus Jul 1 UTC.
	      // If they are not equal, then DST is observed.
	      var a = new Date(f.Y(), 0);
	      // Jan 1
	      var c = Date.UTC(f.Y(), 0);
	      // Jan 1 UTC
	      var b = new Date(f.Y(), 6);
	      // Jul 1
	      // Jul 1 UTC
	      var d = Date.UTC(f.Y(), 6);
	      return a - c !== b - d ? 1 : 0;
	    },
	    O: function O() {
	      // Difference to GMT in hour format; e.g. +0200
	      var tzo = jsdate.getTimezoneOffset();
	      var a = Math.abs(tzo);
	      return (tzo > 0 ? '-' : '+') + _pad(Math.floor(a / 60) * 100 + a % 60, 4);
	    },
	    P: function P() {
	      // Difference to GMT w/colon; e.g. +02:00
	      var O = f.O();
	      return O.substr(0, 3) + ':' + O.substr(3, 2);
	    },
	    T: function T() {
	      // The following works, but requires inclusion of the very
	      // large timezone_abbreviations_list() function.
	      /*              var abbr, i, os, _default;
	      if (!tal.length) {
	        tal = that.timezone_abbreviations_list();
	      }
	      if ($locutus && $locutus.default_timezone) {
	        _default = $locutus.default_timezone;
	        for (abbr in tal) {
	          for (i = 0; i < tal[abbr].length; i++) {
	            if (tal[abbr][i].timezone_id === _default) {
	              return abbr.toUpperCase();
	            }
	          }
	        }
	      }
	      for (abbr in tal) {
	        for (i = 0; i < tal[abbr].length; i++) {
	          os = -jsdate.getTimezoneOffset() * 60;
	          if (tal[abbr][i].offset === os) {
	            return abbr.toUpperCase();
	          }
	        }
	      }
	      */
	      return 'UTC';
	    },
	    Z: function Z() {
	      // Timezone offset in seconds (-43200...50400)
	      return -jsdate.getTimezoneOffset() * 60;
	    },

	    // Full Date/Time
	    c: function c() {
	      // ISO-8601 date.
	      return 'Y-m-d\\TH:i:sP'.replace(formatChr, formatChrCb);
	    },
	    r: function r() {
	      // RFC 2822
	      return 'D, d M Y H:i:s O'.replace(formatChr, formatChrCb);
	    },
	    U: function U() {
	      // Seconds since UNIX epoch
	      return jsdate / 1000 | 0;
	    }
	  };

	  var _date = function _date(format, timestamp) {
	    jsdate = timestamp === undefined ? new Date() // Not provided
	    : timestamp instanceof Date ? new Date(timestamp) // JS Date()
	    : new Date(timestamp * 1000) // UNIX timestamp (auto-convert to int)
	    ;
	    return format.replace(formatChr, formatChrCb);
	  };

	  return _date(format, timestamp);
	};
	//# sourceMappingURL=date.js.map

/***/ },
/* 16 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function boolval(mixedVar) {
	  // original by: Will Rowe
	  //   example 1: boolval(true)
	  //   returns 1: true
	  //   example 2: boolval(false)
	  //   returns 2: false
	  //   example 3: boolval(0)
	  //   returns 3: false
	  //   example 4: boolval(0.0)
	  //   returns 4: false
	  //   example 5: boolval('')
	  //   returns 5: false
	  //   example 6: boolval('0')
	  //   returns 6: false
	  //   example 7: boolval([])
	  //   returns 7: false
	  //   example 8: boolval('')
	  //   returns 8: false
	  //   example 9: boolval(null)
	  //   returns 9: false
	  //   example 10: boolval(undefined)
	  //   returns 10: false
	  //   example 11: boolval('true')
	  //   returns 11: true

	  if (mixedVar === false) {
	    return false;
	  }

	  if (mixedVar === 0 || mixedVar === 0.0) {
	    return false;
	  }

	  if (mixedVar === '' || mixedVar === '0') {
	    return false;
	  }

	  if (Array.isArray(mixedVar) && mixedVar.length === 0) {
	    return false;
	  }

	  if (mixedVar === null || mixedVar === undefined) {
	    return false;
	  }

	  return true;
	};
	//# sourceMappingURL=boolval.js.map

/***/ },
/* 17 */
/***/ function(module, exports) {

	module.exports = function(Twig) {
	    'use strict';

	    Twig.Templates.registerLoader('ajax', function(location, params, callback, error_callback) {
	        var template,
	            xmlhttp,
	            precompiled = params.precompiled,
	            parser = this.parsers[params.parser] || this.parser.twig;

	        if (typeof XMLHttpRequest === "undefined") {
	            throw new Twig.Error('Unsupported platform: Unable to do ajax requests ' +
	                                 'because there is no "XMLHTTPRequest" implementation');
	        }

	        xmlhttp = new XMLHttpRequest();
	        xmlhttp.onreadystatechange = function() {
	            var data = null;

	            if(xmlhttp.readyState === 4) {
	                if (xmlhttp.status === 200 || (window.cordova && xmlhttp.status == 0)) {
	                    Twig.log.debug("Got template ", xmlhttp.responseText);

	                    if (precompiled === true) {
	                        data = JSON.parse(xmlhttp.responseText);
	                    } else {
	                        data = xmlhttp.responseText;
	                    }

	                    params.url = location;
	                    params.data = data;

	                    template = parser.call(this, params);

	                    if (typeof callback === 'function') {
	                        callback(template);
	                    }
	                } else {
	                    if (typeof error_callback === 'function') {
	                        error_callback(xmlhttp);
	                    }
	                }
	            }
	        };
	        xmlhttp.open("GET", location, !!params.async);
	        xmlhttp.send();

	        if (params.async) {
	            // TODO: return deferred promise
	            return true;
	        } else {
	            return template;
	        }
	    });

	};


/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = function(Twig) {
	    'use strict';

	    var fs, path;

	    try {
	    	// require lib dependencies at runtime
	    	fs = __webpack_require__(19);
	    	path = __webpack_require__(20);
	    } catch (e) {
	    	// NOTE: this is in a try/catch to avoid errors cross platform
	    }

	    Twig.Templates.registerLoader('fs', function(location, params, callback, error_callback) {
	        var template,
	            data = null,
	            precompiled = params.precompiled,
	            parser = this.parsers[params.parser] || this.parser.twig;

	        if (!fs || !path) {
	            throw new Twig.Error('Unsupported platform: Unable to load from file ' +
	                                 'because there is no "fs" or "path" implementation');
	        }

	        var loadTemplateFn = function(err, data) {
	            if (err) {
	                if (typeof error_callback === 'function') {
	                    error_callback(err);
	                }
	                return;
	            }

	            if (precompiled === true) {
	                data = JSON.parse(data);
	            }

	            params.data = data;
	            params.path = params.path || location;

	            // template is in data
	            template = parser.call(this, params);

	            if (typeof callback === 'function') {
	                callback(template);
	            }
	        };
	        params.path = params.path || location;

	        if (params.async) {
	            fs.stat(params.path, function (err, stats) {
	                if (err || !stats.isFile()) {
	                    throw new Twig.Error('Unable to find template file ' + params.path);
	                }
	                fs.readFile(params.path, 'utf8', loadTemplateFn);
	            });
	            // TODO: return deferred promise
	            return true;
	        } else {
	            try {
	                if (!fs.statSync(params.path).isFile()) {
	                    throw new Twig.Error('Unable to find template file ' + params.path);
	                }
	            } catch (err) {
	                throw new Twig.Error('Unable to find template file ' + params.path);
	            }
	            data = fs.readFileSync(params.path, 'utf8');
	            loadTemplateFn(undefined, data);
	            return template
	        }
	    });

	};


/***/ },
/* 19 */
/***/ function(module, exports) {

	module.exports = require("fs");

/***/ },
/* 20 */
/***/ function(module, exports) {

	module.exports = require("path");

/***/ },
/* 21 */
/***/ function(module, exports) {

	// ## twig.logic.js
	//
	// This file handles tokenizing, compiling and parsing logic tokens. {% ... %}
	module.exports = function (Twig) {
	    "use strict";

	    /**
	     * Namespace for logic handling.
	     */
	    Twig.logic = {};

	    /**
	     * Logic token types.
	     */
	    Twig.logic.type = {
	        if_:       'Twig.logic.type.if',
	        endif:     'Twig.logic.type.endif',
	        for_:      'Twig.logic.type.for',
	        endfor:    'Twig.logic.type.endfor',
	        else_:     'Twig.logic.type.else',
	        elseif:    'Twig.logic.type.elseif',
	        set:       'Twig.logic.type.set',
	        setcapture:'Twig.logic.type.setcapture',
	        endset:    'Twig.logic.type.endset',
	        filter:    'Twig.logic.type.filter',
	        endfilter: 'Twig.logic.type.endfilter',
	        shortblock: 'Twig.logic.type.shortblock',
	        block:     'Twig.logic.type.block',
	        endblock:  'Twig.logic.type.endblock',
	        extends_:  'Twig.logic.type.extends',
	        use:       'Twig.logic.type.use',
	        include:   'Twig.logic.type.include',
	        spaceless: 'Twig.logic.type.spaceless',
	        endspaceless: 'Twig.logic.type.endspaceless',
	        macro:     'Twig.logic.type.macro',
	        endmacro:  'Twig.logic.type.endmacro',
	        import_:   'Twig.logic.type.import',
	        from:      'Twig.logic.type.from',
	        embed:     'Twig.logic.type.embed',
	        endembed:  'Twig.logic.type.endembed'
	    };


	    // Regular expressions for handling logic tokens.
	    //
	    // Properties:
	    //
	    //      type:  The type of expression this matches
	    //
	    //      regex: A regular expression that matches the format of the token
	    //
	    //      next:  What logic tokens (if any) pop this token off the logic stack. If empty, the
	    //             logic token is assumed to not require an end tag and isn't push onto the stack.
	    //
	    //      open:  Does this tag open a logic expression or is it standalone. For example,
	    //             {% endif %} cannot exist without an opening {% if ... %} tag, so open = false.
	    //
	    //  Functions:
	    //
	    //      compile: A function that handles compiling the token into an output token ready for
	    //               parsing with the parse function.
	    //
	    //      parse:   A function that parses the compiled token into output (HTML / whatever the
	    //               template represents).
	    Twig.logic.definitions = [
	        {
	            /**
	             * If type logic tokens.
	             *
	             *  Format: {% if expression %}
	             */
	            type: Twig.logic.type.if_,
	            regex: /^if\s+([\s\S]+)$/,
	            next: [
	                Twig.logic.type.else_,
	                Twig.logic.type.elseif,
	                Twig.logic.type.endif
	            ],
	            open: true,
	            compile: function (token) {
	                var expression = token.match[1];
	                // Compile the expression.
	                token.stack = Twig.expression.compile.apply(this, [{
	                    type:  Twig.expression.type.expression,
	                    value: expression
	                }]).stack;
	                delete token.match;
	                return token;
	            },
	            parse: function (token, context, chain) {
	                var output = '',
	                    // Parse the expression
	                    result = Twig.expression.parse.apply(this, [token.stack, context]);

	                // Start a new logic chain
	                chain = true;

	                if (Twig.lib.boolval(result)) {
	                    chain = false;
	                    // parse if output
	                    output = Twig.parse.apply(this, [token.output, context]);
	                }
	                return {
	                    chain: chain,
	                    output: output
	                };
	            }
	        },
	        {
	            /**
	             * Else if type logic tokens.
	             *
	             *  Format: {% elseif expression %}
	             */
	            type: Twig.logic.type.elseif,
	            regex: /^elseif\s+([^\s].*)$/,
	            next: [
	                Twig.logic.type.else_,
	                Twig.logic.type.elseif,
	                Twig.logic.type.endif
	            ],
	            open: false,
	            compile: function (token) {
	                var expression = token.match[1];
	                // Compile the expression.
	                token.stack = Twig.expression.compile.apply(this, [{
	                    type:  Twig.expression.type.expression,
	                    value: expression
	                }]).stack;
	                delete token.match;
	                return token;
	            },
	            parse: function (token, context, chain) {
	                var output = '',
	                    result = Twig.expression.parse.apply(this, [token.stack, context]);

	                if (chain && Twig.lib.boolval(result)) {
	                    chain = false;
	                    // parse if output
	                    output = Twig.parse.apply(this, [token.output, context]);
	                }

	                return {
	                    chain: chain,
	                    output: output
	                };
	            }
	        },
	        {
	            /**
	             * Else if type logic tokens.
	             *
	             *  Format: {% elseif expression %}
	             */
	            type: Twig.logic.type.else_,
	            regex: /^else$/,
	            next: [
	                Twig.logic.type.endif,
	                Twig.logic.type.endfor
	            ],
	            open: false,
	            parse: function (token, context, chain) {
	                var output = '';
	                if (chain) {
	                    output = Twig.parse.apply(this, [token.output, context]);
	                }
	                return {
	                    chain: chain,
	                    output: output
	                };
	            }
	        },
	        {
	            /**
	             * End if type logic tokens.
	             *
	             *  Format: {% endif %}
	             */
	            type: Twig.logic.type.endif,
	            regex: /^endif$/,
	            next: [ ],
	            open: false
	        },
	        {
	            /**
	             * For type logic tokens.
	             *
	             *  Format: {% for expression %}
	             */
	            type: Twig.logic.type.for_,
	            regex: /^for\s+([a-zA-Z0-9_,\s]+)\s+in\s+([^\s].*?)(?:\s+if\s+([^\s].*))?$/,
	            next: [
	                Twig.logic.type.else_,
	                Twig.logic.type.endfor
	            ],
	            open: true,
	            compile: function (token) {
	                var key_value = token.match[1],
	                    expression = token.match[2],
	                    conditional = token.match[3],
	                    kv_split = null;

	                token.key_var = null;
	                token.value_var = null;

	                if (key_value.indexOf(",") >= 0) {
	                    kv_split = key_value.split(',');
	                    if (kv_split.length === 2) {
	                        token.key_var = kv_split[0].trim();
	                        token.value_var = kv_split[1].trim();
	                    } else {
	                        throw new Twig.Error("Invalid expression in for loop: " + key_value);
	                    }
	                } else {
	                    token.value_var = key_value;
	                }

	                // Valid expressions for a for loop
	                //   for item     in expression
	                //   for key,item in expression

	                // Compile the expression.
	                token.expression = Twig.expression.compile.apply(this, [{
	                    type:  Twig.expression.type.expression,
	                    value: expression
	                }]).stack;

	                // Compile the conditional (if available)
	                if (conditional) {
	                    token.conditional = Twig.expression.compile.apply(this, [{
	                        type:  Twig.expression.type.expression,
	                        value: conditional
	                    }]).stack;
	                }

	                delete token.match;
	                return token;
	            },
	            parse: function (token, context, continue_chain) {
	                // Parse expression
	                var result = Twig.expression.parse.apply(this, [token.expression, context]),
	                    output = [],
	                    len,
	                    index = 0,
	                    keyset,
	                    that = this,
	                    conditional = token.conditional,
	                    buildLoop = function(index, len) {
	                        var isConditional = conditional !== undefined;
	                        return {
	                            index: index+1,
	                            index0: index,
	                            revindex: isConditional?undefined:len-index,
	                            revindex0: isConditional?undefined:len-index-1,
	                            first: (index === 0),
	                            last: isConditional?undefined:(index === len-1),
	                            length: isConditional?undefined:len,
	                            parent: context
	                        };
	                    },
	                    // run once for each iteration of the loop
	                    loop = function(key, value) {
	                        var inner_context = Twig.ChildContext(context);

	                        inner_context[token.value_var] = value;

	                        if (token.key_var) {
	                            inner_context[token.key_var] = key;
	                        }

	                        // Loop object
	                        inner_context.loop = buildLoop(index, len);

	                        if (conditional === undefined ||
	                            Twig.expression.parse.apply(that, [conditional, inner_context]))
	                        {
	                            output.push(Twig.parse.apply(that, [token.output, inner_context]));
	                            index += 1;
	                        }

	                        // Delete loop-related variables from the context
	                        delete inner_context['loop'];
	                        delete inner_context[token.value_var];
	                        delete inner_context[token.key_var];

	                        // Merge in values that exist in context but have changed
	                        // in inner_context.
	                        Twig.merge(context, inner_context, true);
	                    };


	                if (Twig.lib.is('Array', result)) {
	                    len = result.length;
	                    Twig.forEach(result, function (value) {
	                        var key = index;

	                        loop(key, value);
	                    });
	                } else if (Twig.lib.is('Object', result)) {
	                    if (result._keys !== undefined) {
	                        keyset = result._keys;
	                    } else {
	                        keyset = Object.keys(result);
	                    }
	                    len = keyset.length;
	                    Twig.forEach(keyset, function(key) {
	                        // Ignore the _keys property, it's internal to twig.js
	                        if (key === "_keys") return;

	                        loop(key,  result[key]);
	                    });
	                }

	                // Only allow else statements if no output was generated
	                continue_chain = (output.length === 0);

	                return {
	                    chain: continue_chain,
	                    output: Twig.output.apply(this, [output])
	                };
	            }
	        },
	        {
	            /**
	             * End if type logic tokens.
	             *
	             *  Format: {% endif %}
	             */
	            type: Twig.logic.type.endfor,
	            regex: /^endfor$/,
	            next: [ ],
	            open: false
	        },
	        {
	            /**
	             * Set type logic tokens.
	             *
	             *  Format: {% set key = expression %}
	             */
	            type: Twig.logic.type.set,
	            regex: /^set\s+([a-zA-Z0-9_,\s]+)\s*=\s*([\s\S]+)$/,
	            next: [ ],
	            open: true,
	            compile: function (token) {
	                var key = token.match[1].trim(),
	                    expression = token.match[2],
	                    // Compile the expression.
	                    expression_stack  = Twig.expression.compile.apply(this, [{
	                        type:  Twig.expression.type.expression,
	                        value: expression
	                    }]).stack;

	                token.key = key;
	                token.expression = expression_stack;

	                delete token.match;
	                return token;
	            },
	            parse: function (token, context, continue_chain) {
	                var value = Twig.expression.parse.apply(this, [token.expression, context]),
	                    key = token.key;

	                if (value === context) {
	                    /*  If storing the context in a variable, it needs to be a clone of the current state of context.
	                        Otherwise we have a context with infinite recursion.
	                        Fixes #341
	                     */
	                    value = Twig.lib.copy(value);
	                }

	                context[key] = value;

	                return {
	                    chain: continue_chain,
	                    context: context
	                };
	            }
	        },
	        {
	            /**
	             * Set capture type logic tokens.
	             *
	             *  Format: {% set key %}
	             */
	            type: Twig.logic.type.setcapture,
	            regex: /^set\s+([a-zA-Z0-9_,\s]+)$/,
	            next: [
	                Twig.logic.type.endset
	            ],
	            open: true,
	            compile: function (token) {
	                var key = token.match[1].trim();

	                token.key = key;

	                delete token.match;
	                return token;
	            },
	            parse: function (token, context, continue_chain) {

	                var value = Twig.parse.apply(this, [token.output, context]),
	                    key = token.key;

	                // set on both the global and local context
	                this.context[key] = value;
	                context[key] = value;

	                return {
	                    chain: continue_chain,
	                    context: context
	                };
	            }
	        },
	        {
	            /**
	             * End set type block logic tokens.
	             *
	             *  Format: {% endset %}
	             */
	            type: Twig.logic.type.endset,
	            regex: /^endset$/,
	            next: [ ],
	            open: false
	        },
	        {
	            /**
	             * Filter logic tokens.
	             *
	             *  Format: {% filter upper %} or {% filter lower|escape %}
	             */
	            type: Twig.logic.type.filter,
	            regex: /^filter\s+(.+)$/,
	            next: [
	                Twig.logic.type.endfilter
	            ],
	            open: true,
	            compile: function (token) {
	                var expression = "|" + token.match[1].trim();
	                // Compile the expression.
	                token.stack = Twig.expression.compile.apply(this, [{
	                    type:  Twig.expression.type.expression,
	                    value: expression
	                }]).stack;
	                delete token.match;
	                return token;
	            },
	            parse: function (token, context, chain) {
	                var unfiltered = Twig.parse.apply(this, [token.output, context]),
	                    stack = [{
	                        type: Twig.expression.type.string,
	                        value: unfiltered
	                    }].concat(token.stack);

	                var output = Twig.expression.parse.apply(this, [stack, context]);

	                return {
	                    chain: chain,
	                    output: output
	                };
	            }
	        },
	        {
	            /**
	             * End filter logic tokens.
	             *
	             *  Format: {% endfilter %}
	             */
	            type: Twig.logic.type.endfilter,
	            regex: /^endfilter$/,
	            next: [ ],
	            open: false
	        },
	        {
	            /**
	             * Block logic tokens.
	             *
	             *  Format: {% block title %}
	             */
	            type: Twig.logic.type.block,
	            regex: /^block\s+([a-zA-Z0-9_]+)$/,
	            next: [
	                Twig.logic.type.endblock
	            ],
	            open: true,
	            compile: function (token) {
	                token.block = token.match[1].trim();
	                delete token.match;
	                return token;
	            },
	            parse: function (token, context, chain) {
	                var block_output,
	                    output,
	                    isImported = Twig.indexOf(this.importedBlocks, token.block) > -1,
	                    hasParent = this.blocks[token.block] && Twig.indexOf(this.blocks[token.block], Twig.placeholders.parent) > -1;

	                // Don't override previous blocks unless they're imported with "use"
	                // Loops should be exempted as well.
	                if (this.blocks[token.block] === undefined || isImported || hasParent || context.loop || token.overwrite) {
	                    if (token.expression) {
	                        // Short blocks have output as an expression on the open tag (no body)
	                        block_output = Twig.expression.parse.apply(this, [{
	                            type: Twig.expression.type.string,
	                            value: Twig.expression.parse.apply(this, [token.output, context])
	                        }, context]);
	                    } else {
	                        block_output = Twig.expression.parse.apply(this, [{
	                            type: Twig.expression.type.string,
	                            value: Twig.parse.apply(this, [token.output, context])
	                        }, context]);
	                    }

	                    if (isImported) {
	                        // once the block is overridden, remove it from the list of imported blocks
	                        this.importedBlocks.splice(this.importedBlocks.indexOf(token.block), 1);
	                    }

	                    if (hasParent) {
	                        this.blocks[token.block] = Twig.Markup(this.blocks[token.block].replace(Twig.placeholders.parent, block_output));
	                    } else {
	                        this.blocks[token.block] = block_output;
	                    }

	                    this.originalBlockTokens[token.block] = {
	                        type: token.type,
	                        block: token.block,
	                        output: token.output,
	                        overwrite: true
	                    };
	                }

	                // Check if a child block has been set from a template extending this one.
	                if (this.child.blocks[token.block]) {
	                    output = this.child.blocks[token.block];
	                } else {
	                    output = this.blocks[token.block];
	                }

	                return {
	                    chain: chain,
	                    output: output
	                };
	            }
	        },
	        {
	            /**
	             * Block shorthand logic tokens.
	             *
	             *  Format: {% block title expression %}
	             */
	            type: Twig.logic.type.shortblock,
	            regex: /^block\s+([a-zA-Z0-9_]+)\s+(.+)$/,
	            next: [ ],
	            open: true,
	            compile: function (token) {
	                token.expression = token.match[2].trim();

	                token.output = Twig.expression.compile({
	                    type: Twig.expression.type.expression,
	                    value: token.expression
	                }).stack;

	                token.block = token.match[1].trim();
	                delete token.match;
	                return token;
	            },
	            parse: function (token, context, chain) {
	                return Twig.logic.handler[Twig.logic.type.block].parse.apply(this, arguments);
	            }
	        },
	        {
	            /**
	             * End block logic tokens.
	             *
	             *  Format: {% endblock %}
	             */
	            type: Twig.logic.type.endblock,
	            regex: /^endblock(?:\s+([a-zA-Z0-9_]+))?$/,
	            next: [ ],
	            open: false
	        },
	        {
	            /**
	             * Block logic tokens.
	             *
	             *  Format: {% extends "template.twig" %}
	             */
	            type: Twig.logic.type.extends_,
	            regex: /^extends\s+(.+)$/,
	            next: [ ],
	            open: true,
	            compile: function (token) {
	                var expression = token.match[1].trim();
	                delete token.match;

	                token.stack   = Twig.expression.compile.apply(this, [{
	                    type:  Twig.expression.type.expression,
	                    value: expression
	                }]).stack;

	                return token;
	            },
	            parse: function (token, context, chain) {
	                var template,
	                    innerContext = Twig.ChildContext(context);
	                // Resolve filename
	                var file = Twig.expression.parse.apply(this, [token.stack, context]);

	                // Set parent template
	                this.extend = file;

	                if (file instanceof Twig.Template) {
	                    template = file;
	                } else {
	                    // Import file
	                    template = this.importFile(file);
	                }

	                // Render the template in case it puts anything in its context
	                template.render(innerContext);

	                // Extend the parent context with the extended context
	                Twig.lib.extend(context, innerContext);

	                return {
	                    chain: chain,
	                    output: ''
	                };
	            }
	        },
	        {
	            /**
	             * Block logic tokens.
	             *
	             *  Format: {% use "template.twig" %}
	             */
	            type: Twig.logic.type.use,
	            regex: /^use\s+(.+)$/,
	            next: [ ],
	            open: true,
	            compile: function (token) {
	                var expression = token.match[1].trim();
	                delete token.match;

	                token.stack = Twig.expression.compile.apply(this, [{
	                    type:  Twig.expression.type.expression,
	                    value: expression
	                }]).stack;

	                return token;
	            },
	            parse: function (token, context, chain) {
	                // Resolve filename
	                var file = Twig.expression.parse.apply(this, [token.stack, context]);

	                // Import blocks
	                this.importBlocks(file);

	                return {
	                    chain: chain,
	                    output: ''
	                };
	            }
	        },
	        {
	            /**
	             * Block logic tokens.
	             *
	             *  Format: {% includes "template.twig" [with {some: 'values'} only] %}
	             */
	            type: Twig.logic.type.include,
	            regex: /^include\s+(.+?)(?:\s|$)(ignore missing(?:\s|$))?(?:with\s+([\S\s]+?))?(?:\s|$)(only)?$/,
	            next: [ ],
	            open: true,
	            compile: function (token) {
	                var match = token.match,
	                    expression = match[1].trim(),
	                    ignoreMissing = match[2] !== undefined,
	                    withContext = match[3],
	                    only = ((match[4] !== undefined) && match[4].length);

	                delete token.match;

	                token.only = only;
	                token.ignoreMissing = ignoreMissing;

	                token.stack = Twig.expression.compile.apply(this, [{
	                    type:  Twig.expression.type.expression,
	                    value: expression
	                }]).stack;

	                if (withContext !== undefined) {
	                    token.withStack = Twig.expression.compile.apply(this, [{
	                        type:  Twig.expression.type.expression,
	                        value: withContext.trim()
	                    }]).stack;
	                }

	                return token;
	            },
	            parse: function (token, context, chain) {
	                // Resolve filename
	                var innerContext = {},
	                    withContext,
	                    i,
	                    template;

	                if (!token.only) {
	                    innerContext = Twig.ChildContext(context);
	                }

	                if (token.withStack !== undefined) {
	                    withContext = Twig.expression.parse.apply(this, [token.withStack, context]);

	                    for (i in withContext) {
	                        if (withContext.hasOwnProperty(i))
	                            innerContext[i] = withContext[i];
	                    }
	                }

	                var file = Twig.expression.parse.apply(this, [token.stack, context]);

	                if (file instanceof Twig.Template) {
	                    template = file;
	                } else {
	                    // Import file
	                    try {
	                        template = this.importFile(file);
	                    } catch (err) {
	                        if (token.ignoreMissing) {
	                            return {
	                                chain: chain,
	                                output: ''
	                            }
	                        }

	                        throw err;
	                    }
	                }

	                return {
	                    chain: chain,
	                    output: template.render(innerContext)
	                };
	            }
	        },
	        {
	            type: Twig.logic.type.spaceless,
	            regex: /^spaceless$/,
	            next: [
	                Twig.logic.type.endspaceless
	            ],
	            open: true,

	            // Parse the html and return it without any spaces between tags
	            parse: function (token, context, chain) {
	                var // Parse the output without any filter
	                    unfiltered = Twig.parse.apply(this, [token.output, context]),
	                    // A regular expression to find closing and opening tags with spaces between them
	                    rBetweenTagSpaces = />\s+</g,
	                    // Replace all space between closing and opening html tags
	                    output = unfiltered.replace(rBetweenTagSpaces,'><').trim();

	                return {
	                    chain: chain,
	                    output: output
	                };
	            }
	        },

	        // Add the {% endspaceless %} token
	        {
	            type: Twig.logic.type.endspaceless,
	            regex: /^endspaceless$/,
	            next: [ ],
	            open: false
	        },
	        {
	            /**
	             * Macro logic tokens.
	             *
	             * Format: {% maro input(name, value, type, size) %}
	             *
	             */
	            type: Twig.logic.type.macro,
	            regex: /^macro\s+([a-zA-Z0-9_]+)\s*\(\s*((?:[a-zA-Z0-9_]+(?:,\s*)?)*)\s*\)$/,
	            next: [
	                Twig.logic.type.endmacro
	            ],
	            open: true,
	            compile: function (token) {
	                var macroName = token.match[1],
	                    parameters = token.match[2].split(/[\s,]+/);

	                //TODO: Clean up duplicate check
	                for (var i=0; i<parameters.length; i++) {
	                    for (var j=0; j<parameters.length; j++){
	                        if (parameters[i] === parameters[j] && i !== j) {
	                            throw new Twig.Error("Duplicate arguments for parameter: "+ parameters[i]);
	                        }
	                    }
	                }

	                token.macroName = macroName;
	                token.parameters = parameters;

	                delete token.match;
	                return token;
	            },
	            parse: function (token, context, chain) {
	                var template = this;
	                this.macros[token.macroName] = function() {
	                    // Pass global context and other macros
	                    var macroContext = {
	                        _self: template.macros
	                    }
	                    // Add parameters from context to macroContext
	                    for (var i=0; i<token.parameters.length; i++) {
	                        var prop = token.parameters[i];
	                        if(typeof arguments[i] !== 'undefined') {
	                            macroContext[prop] = arguments[i];
	                        } else {
	                            macroContext[prop] = undefined;
	                        }
	                    }
	                    // Render
	                    return Twig.parse.apply(template, [token.output, macroContext])
	                };

	                return {
	                    chain: chain,
	                    output: ''
	                };

	            }
	        },
	        {
	            /**
	             * End macro logic tokens.
	             *
	             * Format: {% endmacro %}
	             */
	             type: Twig.logic.type.endmacro,
	             regex: /^endmacro$/,
	             next: [ ],
	             open: false
	        },
	        {
	            /*
	            * import logic tokens.
	            *
	            * Format: {% import "template.twig" as form %}
	            */
	            type: Twig.logic.type.import_,
	            regex: /^import\s+(.+)\s+as\s+([a-zA-Z0-9_]+)$/,
	            next: [ ],
	            open: true,
	            compile: function (token) {
	                var expression = token.match[1].trim(),
	                    contextName = token.match[2].trim();
	                delete token.match;

	                token.expression = expression;
	                token.contextName = contextName;

	                token.stack = Twig.expression.compile.apply(this, [{
	                    type: Twig.expression.type.expression,
	                    value: expression
	                }]).stack;

	                return token;
	            },
	            parse: function (token, context, chain) {
	                if (token.expression !== "_self") {
	                    var file = Twig.expression.parse.apply(this, [token.stack, context]);
	                    var template = this.importFile(file || token.expression);
	                    context[token.contextName] = template.render({}, {output: 'macros'});
	                }
	                else {
	                    context[token.contextName] = this.macros;
	                }

	                return {
	                    chain: chain,
	                    output: ''
	                }

	            }
	        },
	        {
	            /*
	            * from logic tokens.
	            *
	            * Format: {% from "template.twig" import func as form %}
	            */
	            type: Twig.logic.type.from,
	            regex: /^from\s+(.+)\s+import\s+([a-zA-Z0-9_, ]+)$/,
	            next: [ ],
	            open: true,
	            compile: function (token) {
	                var expression = token.match[1].trim(),
	                    macroExpressions = token.match[2].trim().split(/[ ,]+/),
	                    macroNames = {};

	                for (var i=0; i<macroExpressions.length; i++) {
	                    var res = macroExpressions[i];

	                    // match function as variable
	                    var macroMatch = res.match(/^([a-zA-Z0-9_]+)\s+(.+)\s+as\s+([a-zA-Z0-9_]+)$/);
	                    if (macroMatch) {
	                        macroNames[macroMatch[1].trim()] = macroMatch[2].trim();
	                    }
	                    else if (res.match(/^([a-zA-Z0-9_]+)$/)) {
	                        macroNames[res] = res;
	                    }
	                    else {
	                        // ignore import
	                    }

	                }

	                delete token.match;

	                token.expression = expression;
	                token.macroNames = macroNames;

	                token.stack = Twig.expression.compile.apply(this, [{
	                    type: Twig.expression.type.expression,
	                    value: expression
	                }]).stack;

	                return token;
	            },
	            parse: function (token, context, chain) {
	                var macros;

	                if (token.expression !== "_self") {
	                    var file = Twig.expression.parse.apply(this, [token.stack, context]);
	                    var template = this.importFile(file || token.expression);
	                    macros = template.render({}, {output: 'macros'});
	                }
	                else {
	                    macros = this.macros;
	                }

	                for (var macroName in token.macroNames) {
	                    if (macros.hasOwnProperty(macroName)) {
	                        context[token.macroNames[macroName]] = macros[macroName];
	                    }
	                }

	                return {
	                    chain: chain,
	                    output: ''
	                }

	            }
	        },
	        {
	            /**
	             * The embed tag combines the behaviour of include and extends.
	             * It allows you to include another template's contents, just like include does.
	             *
	             *  Format: {% embed "template.twig" [with {some: 'values'} only] %}
	             */
	            type: Twig.logic.type.embed,
	            regex: /^embed\s+(.+?)(?:\s|$)(ignore missing(?:\s|$))?(?:with\s+([\S\s]+?))?(?:\s|$)(only)?$/,
	            next: [
	                Twig.logic.type.endembed
	            ],
	            open: true,
	            compile: function (token) {
	                var match = token.match,
	                    expression = match[1].trim(),
	                    ignoreMissing = match[2] !== undefined,
	                    withContext = match[3],
	                    only = ((match[4] !== undefined) && match[4].length);

	                delete token.match;

	                token.only = only;
	                token.ignoreMissing = ignoreMissing;

	                token.stack = Twig.expression.compile.apply(this, [{
	                    type:  Twig.expression.type.expression,
	                    value: expression
	                }]).stack;

	                if (withContext !== undefined) {
	                    token.withStack = Twig.expression.compile.apply(this, [{
	                        type:  Twig.expression.type.expression,
	                        value: withContext.trim()
	                    }]).stack;
	                }

	                return token;
	            },
	            parse: function (token, context, chain) {
	                // Resolve filename
	                var innerContext = {},
	                    withContext,
	                    i,
	                    template;

	                if (!token.only) {
	                    for (i in context) {
	                        if (context.hasOwnProperty(i))
	                            innerContext[i] = context[i];
	                    }
	                }

	                if (token.withStack !== undefined) {
	                    withContext = Twig.expression.parse.apply(this, [token.withStack, context]);

	                    for (i in withContext) {
	                        if (withContext.hasOwnProperty(i))
	                            innerContext[i] = withContext[i];
	                    }
	                }

	                var file = Twig.expression.parse.apply(this, [token.stack, innerContext]);

	                if (file instanceof Twig.Template) {
	                    template = file;
	                } else {
	                    // Import file
	                    try {
	                        template = this.importFile(file);
	                    } catch (err) {
	                        if (token.ignoreMissing) {
	                            return {
	                                chain: chain,
	                                output: ''
	                            }
	                        }

	                        throw err;
	                    }
	                }

	                // reset previous blocks
	                this.blocks = {};

	                // parse tokens. output will be not used
	                var output = Twig.parse.apply(this, [token.output, innerContext]);

	                // render tempalte with blocks defined in embed block
	                return {
	                    chain: chain,
	                    output: template.render(innerContext, {'blocks':this.blocks})
	                };
	            }
	        },
	        /* Add the {% endembed %} token
	         *
	         */
	        {
	            type: Twig.logic.type.endembed,
	            regex: /^endembed$/,
	            next: [ ],
	            open: false
	        }

	    ];


	    /**
	     * Registry for logic handlers.
	     */
	    Twig.logic.handler = {};

	    /**
	     * Define a new token type, available at Twig.logic.type.{type}
	     */
	    Twig.logic.extendType = function (type, value) {
	        value = value || ("Twig.logic.type" + type);
	        Twig.logic.type[type] = value;
	    };

	    /**
	     * Extend the logic parsing functionality with a new token definition.
	     *
	     * // Define a new tag
	     * Twig.logic.extend({
	     *     type: Twig.logic.type.{type},
	     *     // The pattern to match for this token
	     *     regex: ...,
	     *     // What token types can follow this token, leave blank if any.
	     *     next: [ ... ]
	     *     // Create and return compiled version of the token
	     *     compile: function(token) { ... }
	     *     // Parse the compiled token with the context provided by the render call
	     *     //   and whether this token chain is complete.
	     *     parse: function(token, context, chain) { ... }
	     * });
	     *
	     * @param {Object} definition The new logic expression.
	     */
	    Twig.logic.extend = function (definition) {

	        if (!definition.type) {
	            throw new Twig.Error("Unable to extend logic definition. No type provided for " + definition);
	        } else {
	            Twig.logic.extendType(definition.type);
	        }
	        Twig.logic.handler[definition.type] = definition;
	    };

	    // Extend with built-in expressions
	    while (Twig.logic.definitions.length > 0) {
	        Twig.logic.extend(Twig.logic.definitions.shift());
	    }

	    /**
	     * Compile a logic token into an object ready for parsing.
	     *
	     * @param {Object} raw_token An uncompiled logic token.
	     *
	     * @return {Object} A compiled logic token, ready for parsing.
	     */
	    Twig.logic.compile = function (raw_token) {
	        var expression = raw_token.value.trim(),
	            token = Twig.logic.tokenize.apply(this, [expression]),
	            token_template = Twig.logic.handler[token.type];

	        // Check if the token needs compiling
	        if (token_template.compile) {
	            token = token_template.compile.apply(this, [token]);
	            Twig.log.trace("Twig.logic.compile: ", "Compiled logic token to ", token);
	        }

	        return token;
	    };

	    /**
	     * Tokenize logic expressions. This function matches token expressions against regular
	     * expressions provided in token definitions provided with Twig.logic.extend.
	     *
	     * @param {string} expression the logic token expression to tokenize
	     *                (i.e. what's between {% and %})
	     *
	     * @return {Object} The matched token with type set to the token type and match to the regex match.
	     */
	    Twig.logic.tokenize = function (expression) {
	        var token = {},
	            token_template_type = null,
	            token_type = null,
	            token_regex = null,
	            regex_array = null,
	            regex = null,
	            match = null;

	        // Ignore whitespace around expressions.
	        expression = expression.trim();

	        for (token_template_type in Twig.logic.handler) {
	            if (Twig.logic.handler.hasOwnProperty(token_template_type)) {
	                // Get the type and regex for this template type
	                token_type = Twig.logic.handler[token_template_type].type;
	                token_regex = Twig.logic.handler[token_template_type].regex;

	                // Handle multiple regular expressions per type.
	                regex_array = [];
	                if (token_regex instanceof Array) {
	                    regex_array = token_regex;
	                } else {
	                    regex_array.push(token_regex);
	                }

	                // Check regular expressions in the order they were specified in the definition.
	                while (regex_array.length > 0) {
	                    regex = regex_array.shift();
	                    match = regex.exec(expression.trim());
	                    if (match !== null) {
	                        token.type  = token_type;
	                        token.match = match;
	                        Twig.log.trace("Twig.logic.tokenize: ", "Matched a ", token_type, " regular expression of ", match);
	                        return token;
	                    }
	                }
	            }
	        }

	        // No regex matches
	        throw new Twig.Error("Unable to parse '" + expression.trim() + "'");
	    };

	    /**
	     * Parse a logic token within a given context.
	     *
	     * What are logic chains?
	     *      Logic chains represent a series of tokens that are connected,
	     *          for example:
	     *          {% if ... %} {% else %} {% endif %}
	     *
	     *      The chain parameter is used to signify if a chain is open of closed.
	     *      open:
	     *          More tokens in this chain should be parsed.
	     *      closed:
	     *          This token chain has completed parsing and any additional
	     *          tokens (else, elseif, etc...) should be ignored.
	     *
	     * @param {Object} token The compiled token.
	     * @param {Object} context The render context.
	     * @param {boolean} chain Is this an open logic chain. If false, that means a
	     *                        chain is closed and no further cases should be parsed.
	     */
	    Twig.logic.parse = function (token, context, chain) {
	        var output = '',
	            token_template;

	        context = context || { };

	        Twig.log.debug("Twig.logic.parse: ", "Parsing logic token ", token);

	        token_template = Twig.logic.handler[token.type];

	        if (token_template.parse) {
	            output = token_template.parse.apply(this, [token, context, chain]);
	        }
	        return output;
	    };

	    return Twig;

	};


/***/ },
/* 22 */
/***/ function(module, exports) {

	module.exports = function(Twig) {
	    'use strict';

	    Twig.Templates.registerParser('source', function(params) {
	        return params.data || '';
	    });
	};


/***/ },
/* 23 */
/***/ function(module, exports) {

	module.exports = function(Twig) {
	    'use strict';

	    Twig.Templates.registerParser('twig', function(params) {
	        return new Twig.Template(params);
	    });
	};


/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	// ## twig.path.js
	//
	// This file handles path parsing
	module.exports = function (Twig) {
	    "use strict";

	    /**
	     * Namespace for path handling.
	     */
	    Twig.path = {};

	    /**
	     * Generate the canonical version of a url based on the given base path and file path and in
	     * the previously registered namespaces.
	     *
	     * @param  {string} template The Twig Template
	     * @param  {string} file     The file path, may be relative and may contain namespaces.
	     *
	     * @return {string}          The canonical version of the path
	     */
	     Twig.path.parsePath = function(template, file) {
	        var namespaces = null,
	            file = file || "";

	        if (typeof template === 'object' && typeof template.options === 'object') {
	            namespaces = template.options.namespaces;
	        }

	        if (typeof namespaces === 'object' && (file.indexOf('::') > 0) || file.indexOf('@') >= 0){
	            for (var k in namespaces){
	                if (namespaces.hasOwnProperty(k)) {
	                    file = file.replace(k + '::', namespaces[k]);
	                    file = file.replace('@' + k, namespaces[k]);
	                }
	            }

	            return file;
	        }

	        return Twig.path.relativePath(template, file);
	    };

	    /**
	     * Generate the relative canonical version of a url based on the given base path and file path.
	     *
	     * @param {Twig.Template} template The Twig.Template.
	     * @param {string} file The file path, relative to the base path.
	     *
	     * @return {string} The canonical version of the path.
	     */
	    Twig.path.relativePath = function(template, file) {
	        var base,
	            base_path,
	            sep_chr = "/",
	            new_path = [],
	            file = file || "",
	            val;

	        if (template.url) {
	            if (typeof template.base !== 'undefined') {
	                base = template.base + ((template.base.charAt(template.base.length-1) === '/') ? '' : '/');
	            } else {
	                base = template.url;
	            }
	        } else if (template.path) {
	            // Get the system-specific path separator
	            var path = __webpack_require__(20),
	                sep = path.sep || sep_chr,
	                relative = new RegExp("^\\.{1,2}" + sep.replace("\\", "\\\\"));
	            file = file.replace(/\//g, sep);

	            if (template.base !== undefined && file.match(relative) == null) {
	                file = file.replace(template.base, '');
	                base = template.base + sep;
	            } else {
	                base = path.normalize(template.path);
	            }

	            base = base.replace(sep+sep, sep);
	            sep_chr = sep;
	        } else if ((template.name || template.id) && template.method && template.method !== 'fs' && template.method !== 'ajax') {
	            // Custom registered loader
	            base = template.base || template.name || template.id;
	        } else {
	            throw new Twig.Error("Cannot extend an inline template.");
	        }

	        base_path = base.split(sep_chr);

	        // Remove file from url
	        base_path.pop();
	        base_path = base_path.concat(file.split(sep_chr));

	        while (base_path.length > 0) {
	            val = base_path.shift();
	            if (val == ".") {
	                // Ignore
	            } else if (val == ".." && new_path.length > 0 && new_path[new_path.length-1] != "..") {
	                new_path.pop();
	            } else {
	                new_path.push(val);
	            }
	        }

	        return new_path.join(sep_chr);
	    };

	    return Twig;
	};


/***/ },
/* 25 */
/***/ function(module, exports) {

	// ## twig.tests.js
	//
	// This file handles expression tests. (is empty, is not defined, etc...)
	module.exports = function (Twig) {
	    "use strict";
	    Twig.tests = {
	        empty: function(value) {
	            if (value === null || value === undefined) return true;
	            // Handler numbers
	            if (typeof value === "number") return false; // numbers are never "empty"
	            // Handle strings and arrays
	            if (value.length && value.length > 0) return false;
	            // Handle objects
	            for (var key in value) {
	                if (value.hasOwnProperty(key)) return false;
	            }
	            return true;
	        },
	        odd: function(value) {
	            return value % 2 === 1;
	        },
	        even: function(value) {
	            return value % 2 === 0;
	        },
	        divisibleby: function(value, params) {
	            return value % params[0] === 0;
	        },
	        defined: function(value) {
	            return value !== undefined;
	        },
	        none: function(value) {
	            return value === null;
	        },
	        'null': function(value) {
	            return this.none(value); // Alias of none
	        },
	        sameas: function(value, params) {
	            return value === params[0];
	        },
	        iterable: function(value) {
	            return value && (Twig.lib.is("Array", value) || Twig.lib.is("Object", value));
	        }
	        /*
	        constant ?
	         */
	    };

	    Twig.test = function(test, value, params) {
	        if (!Twig.tests[test]) {
	            throw "Test " + test + " is not defined.";
	        }
	        return Twig.tests[test](value, params);
	    };

	    Twig.test.extend = function(test, definition) {
	        Twig.tests[test] = definition;
	    };

	    return Twig;
	};


/***/ },
/* 26 */
/***/ function(module, exports) {

	// ## twig.exports.js
	//
	// This file provides extension points and other hooks into the twig functionality.

	module.exports = function (Twig) {
	    "use strict";
	    Twig.exports = {
	        VERSION: Twig.VERSION
	    };

	    /**
	     * Create and compile a twig.js template.
	     *
	     * @param {Object} param Paramteres for creating a Twig template.
	     *
	     * @return {Twig.Template} A Twig template ready for rendering.
	     */
	    Twig.exports.twig = function twig(params) {
	        'use strict';
	        var id = params.id,
	            options = {
	                strict_variables: params.strict_variables || false,
	                // TODO: turn autoscape on in the next major version
	                autoescape: params.autoescape != null && params.autoescape || false,
	                allowInlineIncludes: params.allowInlineIncludes || false,
	                rethrow: params.rethrow || false,
	                namespaces: params.namespaces
	            };

	        if (Twig.cache && id) {
	            Twig.validateId(id);
	        }

	        if (params.debug !== undefined) {
	            Twig.debug = params.debug;
	        }
	        if (params.trace !== undefined) {
	            Twig.trace = params.trace;
	        }

	        if (params.data !== undefined) {
	            return Twig.Templates.parsers.twig({
	                data: params.data,
	                path: params.hasOwnProperty('path') ? params.path : undefined,
	                module: params.module,
	                id:   id,
	                options: options
	            });

	        } else if (params.ref !== undefined) {
	            if (params.id !== undefined) {
	                throw new Twig.Error("Both ref and id cannot be set on a twig.js template.");
	            }
	            return Twig.Templates.load(params.ref);
	        
	        } else if (params.method !== undefined) {
	            if (!Twig.Templates.isRegisteredLoader(params.method)) {
	                throw new Twig.Error('Loader for "' + params.method + '" is not defined.');
	            }
	            return Twig.Templates.loadRemote(params.name || params.href || params.path || id || undefined, {
	                id: id,
	                method: params.method,
	                parser: params.parser || 'twig',
	                base: params.base,
	                module: params.module,
	                precompiled: params.precompiled,
	                async: params.async,
	                options: options

	            }, params.load, params.error);

	        } else if (params.href !== undefined) {
	            return Twig.Templates.loadRemote(params.href, {
	                id: id,
	                method: 'ajax',
	                parser: params.parser || 'twig',
	                base: params.base,
	                module: params.module,
	                precompiled: params.precompiled,
	                async: params.async,
	                options: options

	            }, params.load, params.error);

	        } else if (params.path !== undefined) {
	            return Twig.Templates.loadRemote(params.path, {
	                id: id,
	                method: 'fs',
	                parser: params.parser || 'twig',
	                base: params.base,
	                module: params.module,
	                precompiled: params.precompiled,
	                async: params.async,
	                options: options

	            }, params.load, params.error);
	        }
	    };

	    // Extend Twig with a new filter.
	    Twig.exports.extendFilter = function(filter, definition) {
	        Twig.filter.extend(filter, definition);
	    };

	    // Extend Twig with a new function.
	    Twig.exports.extendFunction = function(fn, definition) {
	        Twig._function.extend(fn, definition);
	    };

	    // Extend Twig with a new test.
	    Twig.exports.extendTest = function(test, definition) {
	        Twig.test.extend(test, definition);
	    };

	    // Extend Twig with a new definition.
	    Twig.exports.extendTag = function(definition) {
	        Twig.logic.extend(definition);
	    };

	    // Provide an environment for extending Twig core.
	    // Calls fn with the internal Twig object.
	    Twig.exports.extend = function(fn) {
	        fn(Twig);
	    };


	    /**
	     * Provide an extension for use with express 2.
	     *
	     * @param {string} markup The template markup.
	     * @param {array} options The express options.
	     *
	     * @return {string} The rendered template.
	     */
	    Twig.exports.compile = function(markup, options) {
	        var id = options.filename,
	            path = options.filename,
	            template;

	        // Try to load the template from the cache
	        template = new Twig.Template({
	            data: markup,
	            path: path,
	            id: id,
	            options: options.settings['twig options']
	        }); // Twig.Templates.load(id) ||

	        return function(context) {
	            return template.render(context);
	        };
	    };

	    /**
	     * Provide an extension for use with express 3.
	     *
	     * @param {string} path The location of the template file on disk.
	     * @param {Object|Function} The options or callback.
	     * @param {Function} fn callback.
	     * 
	     * @throws Twig.Error
	     */
	    Twig.exports.renderFile = function(path, options, fn) {
	        // handle callback in options
	        if (typeof options === 'function') {
	            fn = options;
	            options = {};
	        }

	        options = options || {};

	        var settings = options.settings || {};

	        var params = {
	            path: path,
	            base: settings.views,
	            load: function(template) {
	                // render and return template as a simple string, see https://github.com/twigjs/twig.js/pull/348 for more information
	                fn(null, '' + template.render(options));
	            }
	        };

	        // mixin any options provided to the express app.
	        var view_options = settings['twig options'];

	        if (view_options) {
	            for (var option in view_options) {
	                if (view_options.hasOwnProperty(option)) {
	                    params[option] = view_options[option];
	                }
	            }
	        }

	        Twig.exports.twig(params);
	    };

	    // Express 3 handler
	    Twig.exports.__express = Twig.exports.renderFile;

	    /**
	     * Shoud Twig.js cache templates.
	     * Disable during development to see changes to templates without
	     * reloading, and disable in production to improve performance.
	     *
	     * @param {boolean} cache
	     */
	    Twig.exports.cache = function(cache) {
	        Twig.cache = cache;
	    };

	    //We need to export the path module so we can effectively test it
	    Twig.exports.path = Twig.path;

	    //Export our filters.
	    //Resolves #307
	    Twig.exports.filters = Twig.filters;

	    return Twig;
	};


/***/ }
/******/ ])
});
;/*
 *
 *
 *
 *
 */
stage.register("appKernel",function(){

	var appKernel = function(url, environnement, settings){

		switch (arguments.length){
			case 0 :
				url = null ;
				environnement = "prod" ;
				settings = {} ;
			break;
			case 1 :
				environnement = url ;
				settings = {} ;
			break;
			case 2:
				settings = environnement;
				environnement = url;
				url = null ;
			break
		}
		var kernel = this.$super ;
		kernel.constructor(environnement, settings);
		if ( url ){
			this.loadModule(url,{
				async:false
			});
		}else{
			this.fire("onBoot", this);
		}
			
	}.herite(stage.kernel);

	return appKernel;
});

/*
 *
 *
 *
 *
 *
 */

stage.register("Container", function(){


	



	/*
 	 *
 	 *	CONTAINER CLASS
 	 *
 	 */
	var ISDefined = function(ele){
		if (ele !== null && ele !== undefined )
			return true
		return false;
	}

	var parseParameterString = function(str, value){
		switch( stage.typeOf(str) ){
			case "string" :
				return arguments.callee.call(this,str.split(".") , value);
			break;
			case "array" :
				switch(str.length){
					case 1 :
						var ns = Array.prototype.shift.call(str);
						if ( ! this[ns] ){
							this[ns] = value;
						}else{
							if ( ISDefined(value) ){
								this[ns] = value;
							}else{
								return this[ns];
							}
						}
						return value ;
					break;
					default :
						var ns = Array.prototype.shift.call(str);
						if ( ! this[ns] && ISDefined(value) ){
							this[ns] = {};
						}
						return arguments.callee.call(this[ns], str, value);	
				}
			break;
			default:
				return false;
		}
	};

	var Container = function(){
		this.protoService = function(){};
		this.protoParameters = function(){};
		this.scope = {};
		this.services = new this.protoService();
		this.parameters = new this.protoParameters();
	};
	

	Container.prototype.logger = function(pci, severity, msgid,  msg){
		var syslog = this.get("syslog");
		if (! msgid) msgid = "CONTAINER SERVICES ";
		return syslog.logger(pci, severity, msgid,  msg);
	};

	Container.prototype.set = function(name, object){
		return this.protoService.prototype[name] = object;
	};

	Container.prototype.get = function(name){
		if (name in this.services){
			return this.services[name];
		}
		return null;
		//this.logger("GET : " + name+" don't exist", "WARNING");	
	};

	Container.prototype.has = function(name){
		return this.services[name];
	};

	Container.prototype.addScope = function(name){
		return  this.scope[name] = [];
	}

	Container.prototype.enterScope = function(name){
		var sc = new Scope(name, this)
		var index = this.scope[name].push( sc );
		sc.index = index;
		return sc;
	}

	Container.prototype.leaveScope = function(scope){
    		var sc = this.scope[scope.name].splice(scope.index-1, 1);
    		//delete scope;
		return sc[0].parent;
	};


	Container.prototype.setParameters = function(name, str){
		if (typeof name !== "string"){
			this.logger(new Error("setParameters : container parameter name must be a string"));
			return false;
		}
		if ( ! ISDefined(str) ){
			this.logger(new Error("setParameters : "+name+" container parameter value must be define"));
			return false;
		}
		if ( parseParameterString.call(this.protoParameters.prototype, name, str) === str ){
			return str;
		}else{
			this.logger(new Error("container parameter "+ name+" parse error"));
			return false;
		}
	};

	Container.prototype.getParameters = function(name){
		if (typeof name !== "string"){
			this.logger(new Error("container parameter name must be a string"));
			return false;
		}
		//return parseParameterString.call(this.protoParameters.prototype, name, null);  
		return parseParameterString.call(this.parameters, name, null);  
	};



	/*
 	 *
 	 *	SCOPE CLASS
 	 *
 	 */

	var Scope = function(name, parent){
    		this.name = name;
		this.parent = parent;
    		this.mother = this.$super;
    		this.mother.constructor();
    		this.services = new parent.protoService();
    		this.parameters = new parent.protoParameters();
    		this.scope = parent.scope;
	}.herite(Container);

	Scope.prototype.set = function(name, obj){
    		this.services[name] = obj ;
    		return this.mother.set(name, obj);
	};

	Scope.prototype.setParameters = function(name, str){
		if ( parseParameterString.call(this.parameters, name, str) === str ){
			return this.mother.setParameters(name, str);
		}else{
			this.logger(new Error("container parameter "+ name+" parse error"));
			return false;
		}
	};

	Scope.prototype.leaveScope = function(name){
    		this.mother.leaveScope(this)
	};


	return Container;
});
stage.register("router",function(){
		
		

	var decode = function(str) {
		try {
			return decodeURIComponent(str);
		} catch(err) {
			return str;
		}
	};


	var Route = function(id, path, defaultParams){
		this.id = id ;
		this.path = path;
		this.template = null;	
		this.controller =null;
		this.defaults =  defaultParams;
		this.variables = [];
		this.pattern = this.compile();
	};

	Route.prototype.compile = function(){
		var pattern = this.path.replace(/(\/)?(\.)?\{([^}]+)\}(?:\(([^)]*)\))?(\?)?/g, function(match, slash, dot, key, capture, opt, offset) {
			var incl = (this.path[match.length+offset] || '/') === '/';
			this.variables.push(key);
			return (incl ? '(?:' : '')+(slash || '')+(incl ? '' : '(?:')+(dot || '')+'('+(capture || '[^/]+')+'))'+(opt || '');
		}.bind(this));
		pattern = pattern.replace(/([\/.])/g, '\\$1').replace(/\*/g, '(.+)');
		this.pattern = new RegExp('^'+pattern+'[\\/]?$', 'i');
		return this.pattern ;	
	};

	Route.prototype.match = function(url){
		var res = url.match(this.pattern);
		//console.log(res)
		if (!res) {
			return res;
		}
		var map = [];
		var tab = res.slice(1) ;
		for (var i = 0 ; i<tab.length; i++){
			var k = this.variables[i] || 'wildcard';
			var param = tab[i] && decode(tab[i]);
			//var index = map.push( map[k] ? [].concat(map[k]).concat(param) : param );
			var index = map.push( param )
			map[k] = map[index-1] ;

		}
		/*res.slice(1).forEach(function(param, i) {
			var k = this.variables[i] || 'wildcard';
			param = param && decode(param);
			//var index = map.push( map[k] ? [].concat(map[k]).concat(param) : param );
			var index = map.push( param )
			map[k] = map[index-1] ;
		}.bind(this));*/
		if ( map && map.wildcard) {
			map['*'] = map.wildcard;
		}
		return map;
	};


	var Resolver = function(container){
		this.container = container;
		this.resolve = false;
		this.kernel = this.container.get("kernel");
		this.defaultAction = null;
		this.defaultView = null;
		this.variables = new Array();
		this.router = this.container.get("router")
		this.browser = this.container.get("browser")
		//this.notificationsCenter = this.container.get("notificationsCenter") ;
	
	};

	Resolver.prototype.match = function(route, url){
		var match = route.match(url); 
		if ( match ){
			this.variables = match;
			this.url = url;
			this.route = route;
			this.parsePathernController(route.defaults.controller)
		}		
		return match;
	};


	var regModuleName = /^(.*)Module[\.js]{0,3}$/;
	Resolver.prototype.getModuleName = function(str){
		var ret = regModuleName.exec(str);
		if (ret)
			return  ret[1] ;
		else
			throw "BAD MODULE PATTERN ";
	};

	Resolver.prototype.getController = function(name){
		return this.module.controllers[name+"Controller"];
	};

	Resolver.prototype.getAction = function(name){
		var ele = name+"Action" ;
		if ( ele in this.controller ){
			return this.controller[ele]
		}
		return null;
	};

	Resolver.prototype.getDefaultView = function(controller, action){
		var res = this.module.name+"Module"+":"+controller+":"+action+".html.twig";
		return res ; 
	};


	Resolver.prototype.parsePathernController = function(pattern){
		if (typeof pattern !== "string"){
			throw new Error("Resolver : pattern : "+pattern +" MUST be a string");	
		}
		this.route = this.router.getRouteByPattern(pattern);
		var tab = pattern.split(":")
		try {
			this.module = this.kernel.getModule( this.getModuleName(tab[0]) );
		}catch(e){
			throw new Error("Resolver pattern error module :  " + pattern + " : " +e );
		}
		if ( this.module ){
			this.controller = this.getController(tab[1]);
			if ( this.controller ){
				if (tab[2]){
					this.action = this.getAction(tab[2]);
					if (! this.action ){
						throw new Error("Resolver :In CONTROLLER: "+ tab[1] +" ACTION  :"+tab[2] + " not exist");
					}
				}else{
					this.action = null;	
				}
			}else{
				throw new Error("Resolver :controller not exist :"+tab[1] );
			}
			this.defaultView = this.getDefaultView(tab[1], tab[2] );
			this.resolve = true;
		}else{
			//this.logger("Resolver : not exist :"+tab[0] , "ERROR")
			throw new Error("Resolver : module not exist :"+tab[0] );
		}
	};
	
	Resolver.prototype.callController = function(arg){
		try{
			var ret = this.action.apply(this.controller, arg || [])	
		}catch(e){
			this.controller.logger.call(this.controller, e, "ERROR");	
			throw e;
		}
		return ret;
	};



	/*
	 *	ROUTER
	 */

	var cacheState = function(){
		var cacheState = window.history.state === undefined ? null : window.history.state;	
		return cacheState ;
	}

	var nativeHistory = !!(window.history && window.history.pushState );

	var service = function(kernel, container){
		this.kernel = kernel ;
		this.container = container ;
		this.notificationsCenter = this.container.get("notificationsCenter");
		this.syslog = kernel.syslog ;	
		this.routes = {};
		this.routePattern = {};
		this.location = this.get("location");
		this.browser = this.get("browser");

		/*
 		 * Extend Twig js	
 		 */
		window.Twig.extendFunction("path", function(name, variables, host){
			try {
				if (host){
					return  this.generateUrl.apply(this, arguments);	
				}else{
					var generatedPath = this.generateUrl.apply(this, arguments);
					return generatedPath?"#"+generatedPath:"";
				}
			}catch(e){
				this.logger(e.error)
				throw e.error
			}
		}.bind(this));

		this.notificationsCenter.listen(this,"onUrlChange" , function(url, lastUrl, absUrl ,cache){
			try{
				var res = this.resolve(url);
				if(! res.resolve ){
					this.forward("appModule:app:404");
					return ;
				}
				var last = this.resolveRoute(lastUrl) 
				if (last){
					this.notificationsCenter.fire("onRouteChange",{id:res.route.id, route:res.route, args:res.variables} ,{id:last.route.id, route:last.route, args:last.variables});
				}
			}catch (e){
				this.logger(e, "ERROR");
			}
		});
	};

	service.prototype.createRoute = function(id, path, defaultParams){
		if (id in this.routes ){
			this.logger("CREATE ROUTE : "+ id + "Already exist ", "ERROR");	
		}
		var route  = new Route(id, path, defaultParams);
		this.routes[id] = route;
		this.routePattern[this.routes[id].defaults.controller] = {
			route:this.routes[id],
 		        path:path	
		}
		this.logger("CREATE ROUTE : "+ id, "DEBUG");
		return route ;
	};

	service.prototype.getRoute = function(name){
		if (this.routes[name])
			return this.routes[name];
		return null;
	};



	service.prototype.resolveRoute = function(url){
		var resolver = new Resolver(this.container);
		var res = [];
		for (var routes in this.routes){
			var route = this.routes[routes];
			try {
				res = resolver.match(route, url);
				if (res){
					return resolver ; 
				}
			}catch(e){
				continue ;
			}
		}
		return null;
	};
	
	var regSerch = /(.*)\?.*$/;
	service.prototype.resolve = function(url){
		//console.log("RESOLVE " +url)
		//console.log(regSerch.exec(url) );
		var test = regSerch.exec(url) ;
		if ( test )
			url = test[1] ;
		var resolver = new Resolver(this.container);
		var res = [];
		for (var routes in this.routes){
			var route = this.routes[routes];
			try {
				res = resolver.match(route, url);
				if (res){
					this.notificationsCenter.fire("onBeforeAction", url, resolver );
					var ret = resolver.callController( res)
					this.notificationsCenter.fire("onAfterAction", url, resolver, ret );
					break;
				}
			}catch(e){
				this.logger("RESOLVE URL : "+ url + " " + e,"ERROR")
				this.forward("appModule:app:500", [e]);
			}
		}
		return resolver;
	};

	service.prototype.getRouteByPattern = function(pattern, args){
		//console.log(pattern)
		//console.log(this.routePattern)
		if (pattern in this.routePattern){
			//console.log("FIND")
			var route = this.routePattern[pattern].route ;
			return route;
		}
			//console.log("NOT FIND")
		return null;
	};

	service.prototype.resolvePattern = function(pattern){
		var resolver = new Resolver(this.container);	
		var route = resolver.parsePathernController(pattern);
		return resolver;
	};

	service.prototype.forward = function(pattern, args){
		var resolver = this.resolvePattern(pattern);
		if (resolver.resolve){
			try {
				if (resolver.route){
					this.logger("FORWARD PATTERN : "+ pattern + "  FIND ROUTE ==> REDIRECT ","DEBUG")
					this.redirect(resolver.route.path);
					//this.location.url(resolver.route.path);
					//this.logger("FORWARD PATTERN : "+ pattern + " find ROUTE : "+resolver.route.path +" redirect to URL :" + this.location.absUrl(),"DEBUG")
					//this.browser.url(this.location.absUrl(), true);
				}else{
					this.logger("FORWARD PATTERN : "+ pattern + "  NO ROUTE FIND  ==> CALL CONTROLLER"  , "DEBUG")
					var ret = resolver.callController(args);	
				}
			}catch(e){
				this.logger("FORWARD "+ pattern +" CALL CONTROLER  "+ resolver.controller.name +" : "+e,"ERROR")
				this.forward("appModule:app:500", [e]);
			}
		}else{
			this.logger("Router Can't resolve : "+pattern ,"ERROR");
		}
		return false;	
	};
	
	service.prototype.redirect = function(url){
		this.location.url(url);
		this.logger("REDIRECT URL : "+ url  +" BROWSER  URL :" + this.location.absUrl(),"DEBUG")
		this.browser.url(this.location.absUrl() , true);
	};
		
	service.prototype.generateUrl = function(name, variables, host){
		var route =  this.getRoute(name) ;
		if (! route ){
			this.logger("no route to host  :"+ name, "WARNING")
			//throw {error:"no route to host  "+ name};
			return null ; 
		}
		var path = route.path;
		if ( route.variables.length ){
			if (! variables  ){
				var txt = "";
				for (var i= 0 ; i < route.variables.length ;i++ ){
					txt += "{"+route.variables[i]+"} ";
				}
				this.logger("router generate path route '"+ name + "' must have variable "+ txt, "ERROR")
				return null;
			}
			for (var ele in variables ){
				if (ele === "_keys") continue ;
				var index = route.variables.indexOf(ele);
				if ( index >= 0 ){
					path = path.replace("{"+ele+"}",  variables[ele]);
				}else{
					this.logger("router generate path route '"+ name + "' don't  have variable "+ ele, "WARNING")
					return null;
				}	
			}	
		}
		if (host)
			return host+"#"+path ;
		return path ;
	};


	service.prototype.logger = function(pci, severity, msgid,  msg){
		if (! msgid) msgid = "ROUTER "
		return this.syslog.logger(pci, severity, msgid,  msg);
	};

	service.prototype.listen = function(){
		return this.notificationsCenter.listen.apply(this.notificationsCenter, arguments);
	};

	service.prototype.fire = function(){
		return this.notificationsCenter.fire.apply(this.notificationsCenter, arguments);
	
	};

	
	service.prototype.set = function(name, value){
		return this.container.set(name, value);	
	};

	service.prototype.get = function(name, value){
		return this.container.get(name, value);	
	};

		
	service.prototype.setParameters =function(name, value){
		return this.container.setParameters(name, value);	
	};

	service.prototype.getParameters = function(name){
		return this.container.getParameters
	};

	return service;		
		
});
/*
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 */

stage.register("Controller",function(){


	var Controller = function(container, module){

		this.notificationsCenter = this.get("notificationsCenter");
		this.kernel = this.get("kernel");	
		this.i18n = this.kernel.i18n;
		this.router = this.kernel.router;
	};

	Controller.prototype.redirect = function(url){
		return this.router.redirect.apply(this.router, arguments)
	};

	/*
	 *
	 *
	 */
	Controller.prototype.forward = function(pattern, args){
		return this.router.forward(pattern, args)
	};

	/*
	 *
	 *
	 */
	Controller.prototype.generateUrl = function(name, variables, absolute){
		if (absolute === true){
			var url = this.router.url().split("#");
			absolute = this.router.url[0];
		}
		return this.router.generateUrl.apply(this.router, arguments);
	};

	Controller.prototype.evalInContext = function(js, context){
		var func = function(context) { 
			var $controller = context;
			return function(js){
				"use strict";
				return eval(js);
			}
		}(this);
		try {
			return func.call( context || this , jQuery.trim( js ));
		}catch(e){
			this.logger("DOM PARSER TWIG ERROR " + e, "ERROR");	
		}
	};


	var tabFxEvent = ["stage-click", "stage-dblclick", "stage-focus", "stage-blur", "stage-mouseover", "stage-mouseout", "stage-mouseenter", "stage-mouseleave", "stage-change"];
	Controller.prototype.domParser = function(domElement){
		var controller = this ;
		domElement.find('[' + tabFxEvent.join('],[') + ']').each(function(index, ele){
			
			var attributes = ele.attributes;
			var jElement = $(ele);
			var ctrl = jElement.closest('[stage-ctrl]');
			if(ctrl.length){
				var pattern = $(ctrl).attr("stage-ctrl") ;
				try {
					var scope = controller.router.resolvePattern(pattern).controller;
				}catch (e){
					controller.logger("DOM PARSER ERROR : " + e , "ERROR")
					return ;
				}
			} else {
				var scope = controller;
			}
			for(var i = 0; i < attributes.length; i++){
				var attribute = attributes[i];
				if(tabFxEvent.indexOf(attribute.name) > -1){
					var ff = function(){
						var content = attribute.value;
						jElement.on(attribute.name.replace('stage-', ''), function(){
							scope.evalInContext(content, this);
						});
					}();
				}
			}
		});
		
	};



	/*
	 *
	 *
	 */
	Controller.prototype.render = function(element, partial, type){
		var ele = $(element);
		try {
			switch (type){
				case "append":
					ele.append(partial) ;
				break;
				case "prepend":
					ele.prepend(partial) ;
				break;
				default:
					ele.empty();
					ele.html(partial);

			}
			return this.domParser(ele);
		}catch(e){
			this.logger("DOM PARSER TWIG ERROR : "+e, "ERROR") ;
		}

	};


	Controller.prototype.renderPartial = function(pattern, obj){
		try {
			var template = this.module.getTemplatePattern(pattern);
			return template.render(obj);
		}catch(e){
			this.logger(e, "ERROR")
		}
	};

	Controller.prototype.set = function(name, value){
		return this.container.set(name, value);	
	};

	Controller.prototype.get = function(name, value){
		return this.container.get(name, value);	
	};

		
	Controller.prototype.setParameters =function(name, value){
		return this.container.setParameters(name, value);	
	};

	Controller.prototype.getParameters = function(name){
		return this.container.getParameters(name);	
	};


	Controller.prototype.logger = function(pci, severity, msgid,  msg){
		var syslog = this.get("syslog");
		if (! msgid) msgid = "MODULE: " +this.module.name +" CONTROLLER: "+this.name ;
		return syslog.logger(pci, severity, msgid,  msg);
	};


	Controller.prototype.listen = function(){
		return this.notificationsCenter.listen.apply(this.notificationsCenter, arguments);
	}

	Controller.prototype.fire = function(event){
		return this.notificationsCenter.fire.apply(this.notificationsCenter, arguments);
	};



	return Controller

});



/*
 *
 *
 */

stage.register("Module" , function(){

	var modelModule = function(config){
		this.rootName = "module";
		var documentXml = this.parser(config);		
		//this.name = this.config.name["@short"];
		this.name = documentXml.module['@id'];
	};

	modelModule.prototype.parser = function(ele){
		switch ( stage.typeOf(ele) ){
			case "document" :
				var res  = stage.xml.parseXml(ele) ; 
			break;
			case "object" :	
				res = ele ;
			break;
		}
		if ( !  res[ this.rootName ])
			throw new Error ("BAD MODULE CONFIG ");
		this.config = res[ this.rootName ] ; 
		return res;
	};

	modelModule.prototype.registerScript = function( src){
		this.autoloader.load( src, function(error, transport){
			if (error){
				this.logger(error, "ERROR");
 			       	return ;
			}
			this.logger("LOAD SCRIPT : "+src ,"DEBUG");
		}.bind(this));
	};

	modelModule.prototype.registerStyle = function( src){
		//this.kernel.autoloader.load( src, function(error, transport){
		this.autoloader.load( src, function(error, transport){
			if (error){
				this.logger(error, "ERROR");
 			       	return ;
			}
			this.logger("LOAD STYLE : "+src ,"DEBUG");
		}.bind(this));
	};
	
	modelModule.prototype.cacheFont = function( src){
		$.ajax({
			async: false,
			cache: true,
			url: src,
			beforeSend: function ( xhr ) {
				xhr.overrideMimeType("application/octet-stream");
			},
			success: function(){
				this.logger("LOAD FONT : " + src, "DEBUG");
			}.bind(this),
			error: function(){
				this.logger(src + " : " + message, "ERROR");
			}.bind(this)
		})
	};

	var urlParser = function(container, url, name, template, obj){
  		var index = url.indexOf("views") ;
  		if (index < 0 ){
    			var text = "URL TEMPLATE BAD PATH :" + url ;
    			this.logger(text ,"ERROR")
    			throw new Error(text) ;
  		}
  		var res = url.slice(index+"views".length+1).split("/");
  		res.pop();
  		if (res.length){
    			var obj = container ;
    			for (var i = 0; i<res.length;i++){
      				if ( obj[res[i]] ){
        				if (i !== res.length-1){	
        					obj = obj[res[i]] ;
        				}else{
          					obj[res[i]][name] = template;
        				}
      				}else{
        				if (i !== res.length-1){
        					obj[res[i]] = {};	
        					obj = obj[res[i]] ;
        				}else{
          					obj[res[i]] = {};
          					obj[res[i]][name] = template;
        				}
      				}
    			}
  		}else{
    			container[name] = template ;
  		}
	};

	modelModule.prototype.registerTemplate = function(name, src, type){
		//console.log("NAME :" + name)
		switch(type){
			case "application/twig":
				//var obj = urlParser.call(this, this.templates, src, name);
				this.twig({
					id: this.name+":"+name,
					href: src,
					async: false,
					//debug:true,
					load:function(template){
						urlParser.call(this, this.templates, src, name , template )
						this.logger("LOAD TEMPLATE : "+name +" ==>"+src ,"DEBUG");
						//console.log(this.templates)
						//obj[name] = template;
						//console.log(template.extend)
						//this.templateEngine
					}.bind(this),
					error:function(xrh, status, message){
						this.logger("TEMPLATE :" + src + " : "+ message, "ERROR")
					}.bind(this)
				});
			break;
			case "text/html":
			break;
			case "application/xml":
			case "text/xml":
			break;
			case "template":
				var obj = urlParser.call(this, this.templates, src.url, name, src);
				//obj[name] = src;
				this.logger("LOAD IMPORT TEMPLATE : "+name +" ==>"+src.url ,"DEBUG");
			break;
			default :
				arguments.callee.call(this, name, src, "application/twig" );
			break
		}
	};

	modelModule.prototype.registerView = function(name, src, type){
		switch(type){
			case "text/javascript":
			case "application/javascript":
				this.autoloader.load( src, function(error, transport){
					if (error){
						this.logger(error, "ERROR");
						return ;
					}
					//this.views[name] = new ;
					var Class = stage.views[name];
					this.views[name] = new Class(this.container, this);
					this.logger("LOAD VIEW : "+src ,"DEBUG");
				}.bind(this));
			break;
			default:
		}
	};

	modelModule.prototype.registerController = function(name, src){
		this.autoloader.load( src, function(error, transport){
			if (error){
				this.logger(error, "ERROR")
				throw error;
			}
			this.logger("LOAD CONTROLLER : "+name +" ==>"+src ,"DEBUG");
			var Class = stage.controllers[name].herite(stage.Controller);
			Class.prototype.container = this.container ;
			Class.prototype.name = name ;
			Class.prototype.module = this ;
			this.controllers[name] = new Class(this.container, this);
		}.bind(this))	
	};
	
	modelModule.prototype.initialiseRest = function(name, url, optionsGlobal){
		var rest = this.kernel.restService ;
		var ele = rest.addApi(name, url, optionsGlobal);
		this.kernel.set(name, ele);
	};

	var regI18n = new RegExp("^(.*)\.(.._..)\.(.*)$");
	modelModule.prototype.registerTranslation = function(src, type){
		var service = this.get("i18n");
		if (! service){
			this.logger("SERVICE I18N not loaded abort load Translation : "+src,"WARNING");
			return ;
		}
		$.ajax({
			url:src,
			async:false,
			success:function(data, status, xhr){
				var name = stage.basename(src) ;
				this.logger("LOAD TRANSLATION "+ type +" : "+name +" URL = "+src ,"DEBUG");
				var res = regI18n.exec(name);	
				if ( ! res ){
					this.logger("SERVICE I18N  abort load Translation : "+src+ " Bad File name format","WARNING");
					return;
				}
				var domain = res[1];
				var locale = res[2];
				service.registerI18n(name, locale, domain, data);
			}.bind(this),
			dataType: type || "json",
			error:function(xhr, status, err){
				this.logger(err, "ERROR")
			}.bind(this)	
		})	
	};

	modelModule.prototype.reader = function(){
		
		var root = this.config;
		for (var node in this.config){
			
			switch ( node ){
				case "content" :
				break;
				case "controllers":
					
					var controllers = root[node].controller;
					if(controllers){
						var tab = stage.typeOf(controllers) === "object" ? [controllers] : controllers ;
						for (var i = 0 ; i < tab.length ; i++){
							var name = tab[i]["@name"];
							var src = tab[i]["@src"];
							this.registerController(name, src)
						}
					}
					
				break;
				case "views":
					var views = root[node].view;
					if(views){
						var tab = stage.typeOf(views) === "object" ? [views] : views ;
						for (var i = 0 ; i < tab.length ; i++){
							var name = tab[i]["@name"];
							var src = tab[i]["@src"];
							var type = tab[i]["@type"];
							this.registerView(name, src, type);
						}
					}
					
				break;
				case "modules":
					var modules = root[node].module;
					if(modules){
						var tab = stage.typeOf(modules) === "object" ? [modules] : modules ;
						for (var i = 0 ; i < tab.length ; i++){
							//var name = tab[i]["@name"];
							var url = tab[i]["@href"];
							if ( ! this.isDomReady){
								this.kernel.listen(this,"onBoot",function(url){
									this.kernel.loadModule(url, {
										async:false
									});
								}.bind(this, url))
							}else{
								this.kernel.loadModule(url);
							}
						}
					}
					
				break;
				case "templates":
					var templates = root[node].template;
					if(templates){
						var tab = stage.typeOf(templates) === "object" ? [templates] : templates ;
						for (var i = 0 ; i < tab.length ; i++){
							var name = tab[i]["@name"];
							
							var src = tab[i]["@src"];
							var type = tab[i]["@type"];
							if ( ! name){
								name = this.getTemplateName(src)	
							}
							this.registerTemplate(name, src, type);
						}
					}
						
				break;
				case "styles":
					var styles = root[node].style;
					if(styles){
						var tab = stage.typeOf(styles) === "object" ? [styles] : styles ;
						for (var i = 0 ; i < tab.length ; i++){
							var src = tab[i]["@src"];
							this.registerStyle(src);
						}
					}
					
				break;
				case "scripts":
					var scripts = root[node].script;
					if(scripts){
						var tab = stage.typeOf(scripts) === "object" ? [scripts] : scripts ;
						for (var i = 0 ; i < tab.length ; i++){
							var src = tab[i]["@src"];
							this.registerScript(src);
						}
					}
					
				break;
				case "fonts":
					var fonts = root[node].font;
					if(fonts){
						var tab = stage.typeOf(fonts) === "object" ? [fonts] : fonts ;
						for (var i = 0 ; i < tab.length ; i++){
							var src = tab[i]["@src"];
							this.cacheFont(src);
						}
					}
					
				break;
				case "translations":
					var translations = root[node].translation;
					if(translations){
						var tab = stage.typeOf(translations) === "object" ? [translations] : translations ;
						for (var i = 0 ; i < tab.length ; i++){
							var src = tab[i]["@src"];
							var type = tab[i]["@type"];
							this.registerTranslation(src, type );
						}
					}
					
				break;
				case "icon" :
					this.icon = root[node]["@src"];
				break;
				/*case "name" :
					console.log(root[node])
					this.name = root[node]["@short"];
				break;*/
				case "preference":
				break;
				case "author":
					var author = root[node];
					this.author = author["#text"];
					this.emailAuthor = author["@email"];
					this.authorLink = author["@href"];
				break;
				case "description":
					this.description = root[node];
					break;
				case "api":
					//console.log(root[node]);
					for(var ele in root[node]){
						var mvc = root[node][ele];
						var tab = stage.typeOf(mvc) === "object" ? [mvc] : mvc;
						for(var i = 0; i < tab.length; i++){
							if(ele === "rest"){
								if( this.kernel.restService )
									this.initialiseRest(tab[i]["@name"], tab[i]["@url"]);
								else
									this.logger("Api " + ele + " SERVICE REST NOT FOUND" ,"ERROR")
							} else {
								this.logger("Api " + ele + " not exist for modules" ,"ERROR");
							}
						}
					}
					break;
				break;
				case "routes":
					var routes = root[node].route;
					switch(stage.typeOf( routes)){
						case "array":
							for (var i = 0 ;i<routes.length; i++){
								var id = routes[i]["@id"];
								var path = routes[i]["@path"];
								var defaultParam = {};
								switch(stage.typeOf( routes[i]["default"])){
									case "array":
										for (var j=0 ;j<routes[i]["default"].length;j++){
											defaultParam[routes[i]["default"][j]["@key"]] =  routes[i]["default"][j]["#text"];
											//console.log(defaultParam)
										}
									break;
									case "object":
										if (routes[i]["default"]["@key"])
											defaultParam[routes[i]["default"]["@key"]] = routes[i]["default"]["#text"];
									break;
								}
								this.routes[id] = this.router.createRoute(id, path, defaultParam);	

							}
						break;
						case "object":
							for (var route in routes){
								switch (route){
									case "@id":
										var id = routes[route];
									break;
									case "@path":
										var path = routes[route];
									break;
									case "default":
										var defaultParam = {};
										switch(stage.typeOf( routes[route] )){
											case "array":
												for (var j=0 ;j<routes[route].length;j++){
													defaultParam[routes[route][j]["@key"]] =  routes[route][j]["#text"];
												}
											break;
											case "object":
												defaultParam[routes[route]["@key"]] = routes[route]["#text"]
											break;
										}
									break;
								}
							}
							this.routes[id] = this.router.createRoute(id, path, defaultParam);
						break
					}
				break;
			}
		}
	};

	var Module = function(kernel, config, settings){

		this.kernel = kernel;
		this.container = kernel.container;
		this.syslog = this.get("syslog");
		this.logger("REGISTER MODULE "+this.name, "DEBUG");
		this.autoloader = new stage.autoload(this, {
			transport:"script"
		});
		this.views = {};
		this.controllers = {};
		this.templates = {};
		this.routes = {};

		this.twig = this.get("twig");
		
		this.model = this.$super ;
		this.model.constructor(config);
		this.setParameters("module."+this.name, this.config);
		this.set(this.name, this);
		this.boot(settings);

	}.herite(modelModule);

	Module.prototype.getController = function(name){
		return this.controllers[name];
	};

	Module.prototype.getTemplate = function(name){
		return this.templates[name];
	};

	Module.prototype.getTemplateName = function(url){
		var name = stage.basename(url);
		var index = name.indexOf(".");
		if (index < 0)
			return url;
		return name.slice(0, name.indexOf(".") );
	};

	var regPattern = /(.*)Module:(.*):(.*)$/;
	Module.prototype.getTemplatePattern = function(pattern){
		var res  = regPattern.exec(pattern);
		if ( ! res ){
			var txt = "IN PATTERN :" + pattern +" BAD FORMAT " ;
			this.logger(txt,"ERROR")
			throw new Error(txt);
		}
		var moduleName = res[1];
		var pathName = res[2];
		var templateName = res[3];	
		var module = this.kernel.getModule(moduleName);
		if ( ! module ){
			var txt = "IN PATTERN :" + pattern +" MODULE :"+ moduleName +" not defined" ;
			this.logger(txt,"ERROR")
			throw new Error(txt);
		}
		var obj = module.templates ;
		if (pathName !== ""){
			var tab = pathName.split("/");
			for (var i = 0 ; i<tab.length ; i++){
				if (tab[i]){
					if (tab[i] in obj){
						obj = obj[tab[i]];
					}else{
						var txt = "IN PATTERN :" + pattern +" pathName :"+ pathName +" not defined" ;
						this.logger(txt,"ERROR")
						throw new Error(txt);
					}
				}
			}
		}
		if (templateName !== "" ){
			var name = this.getTemplateName(templateName);
			if (obj[name]){
				return obj[name];
			}else{
				var txt = "IN PATTERN :" + pattern +" MODULE :"+ moduleName +"  template : "+ templateName +" not defined" ;
				this.logger(txt,"ERROR")
				throw new Error(txt);	
			}
		}else{
			if (obj["index"]){
				return obj["index"];
			}else{
				var txt = "IN PATTERN :" + pattern +" MODULE :"+ moduleName +" default template not defined" ;
				this.logger(txt,"ERROR")
				throw new Error(txt);	
			}
		}
	};

	Module.prototype.getView = function(name){
		return this.views[name];
	};

	Module.prototype.boot = function(settings){
		this.logger("BOOT "+ this.name , "DEBUG");
		this.container = this.kernel.container.enterScope(this.name);
		this.notificationsCenter = stage.notificationsCenter.create(settings,this);
		this.set("notificationsCenter", this.notificationsCenter);
		this.router = this.kernel.router ;

		try {
			this.fire("onBoot", this);	
			this.reader();
			this.fire("onReady",this);
		}catch (e){
			this.logger("MODULE : "+ this.name +"  "+e, "ERROR");
			throw e;
		}
	};

	Module.prototype.listen = function(){
		return this.notificationsCenter.listen.apply(this.notificationsCenter, arguments);
	};

	Module.prototype.fire = function(event){
		this.logger(event+" : "+ this.name , "DEBUG", "EVENT MODULE")
		return this.notificationsCenter.fire.apply(this.notificationsCenter, arguments);
	};

	Module.prototype.logger = function(pci, severity, msgid,  msg){
		if (! msgid) msgid = "MODULE  "+this.name;
			return this.syslog.logger(pci, severity, msgid,  msg);	
	};

	/**
	 *	@method get
	 *	@param {String} name of service
         */
	Module.prototype.get = function(name){
		return this.container.get(name);
	};

	/**
	 *	@method set
	 *	@param {String} name of service
	 *	@param {Object} instance of service
         */
	Module.prototype.set = function(name, obj){
		return this.container.set(name, obj);
	};

	Module.prototype.setParameters =function(name, value){
		return this.container.setParameters(name, value);	
	};

	Module.prototype.getParameters = function(name){
		return this.container.getParameters(name);	
	};


	return Module;	
		
})
stage.register("i18n",function(){

	var translate = {};


	var translateDispo = {
		fr_FR:"français",
		en_EN:"english"
	};

	var regNavLang = /(..)-?.*/;

	var service = function(kernel, container){
		this.container = container;	
		this.syslog = this.container.get("syslog");
		this.logger("INITIALIZE I18N SERVICE", "DEBUG");
		this.kernel = kernel ;

		this.container.setParameters("translate", translate);
		this.defaultDomain = this.trans_default_domain();
		var locale = navigator.language || navigator.userLanguage ;
		var res = regNavLang.exec(locale);
		if (res){
			locale = res[1]
			this.defaultLocale  = locale+"_"+locale.toUpperCase();
			translate[this.defaultLocale] = {};
		}else{
			this.defaultLocale = "fr_FR";	
		}

		this.kernel.listen(this, "onBoot",function(){
			this.boot();
		}.bind(this))	
	};

	service.prototype.logger = function(pci, severity, msgid,  msg){
		if (! msgid) msgid = "SERVICE I18N "
		return this.syslog.logger(pci, severity, msgid,  msg);
	};


	

	service.prototype.boot = function(){
		//GET APP locale
		if ( this.container.getParameters("module.app") )
			this.defaultLocale = this.container.getParameters("module.app").locale;

		if  ( ! translate[this.defaultLocale])
			translate[this.defaultLocale] = {};

		this.logger("DEFAULT LOCALE APPLICATION ==> " + this.defaultLocale ,"DEBUG");
		//this.logger("//FIXME LOCALE getLang in controller etc ..." ,"WARNING");
		if (window.Twig){
			window.Twig.extendFunction("getLangs", this.getLangs.bind(this));
			window.Twig.extendFunction("trans_default_domain", this.trans_default_domain.bind(this));
			window.Twig.extendFilter("trans", this.translation.bind(this));
			window.Twig.extendFunction("trans", this.translation.bind(this));
			window.Twig.extendFilter("getLangs", this.getLangs.bind(this));
		}
	};

	service.prototype.getLangs = function(locale, data){
		var obj = [];
		for ( var ele in translateDispo){
			obj.push({
				name:translateDispo[ele],
				value:ele
			})	
		}
		return obj;
	};


	service.prototype.registerI18n = function(name, locale, domain, data){
		if ( locale ){
			if( !translate[locale] )
				translate[locale] = stage.extend(true, {}, translate[this.defaultLocale]);	
		}
		if ( domain ){
			if( !translate[locale][domain] )
				translate[locale][domain] = stage.extend(true, {}, translate[this.defaultLocale][domain]);
			stage.extend(true, translate[locale][domain], data);		
		}else{
			stage.extend(true, translate[locale], data);	
		} 
	};




	service.prototype.trans_default_domain = function(domain){
		if ( ! domain ){
			return this.defaultDomain = "messages" ; 
		}
		return this.defaultDomain = domain ;
	};

	/*
 	 *
 	 *
 	 *
 	 *
 	 */
	service.prototype.translation = function(value, args){
		
		var defaulDomain = ( args && args[1] ) ? args[1] : this.defaultDomain ;
		var str = this.container.getParameters("translate."+this.defaultLocale+"."+defaulDomain+"."+value) || value;
		if (args){
			if (args[0]){
				for (var ele in args[0]){
					str = str.replace(ele, args[0][ele])
				}
			}
		}
		return str;
	};

	return service;


});
stage.register("location",function(){


	var nativeHistory = !!(window.history && window.history.pushState );
	var PATH_MATCH = /^([^\?#]*)(\?([^#]*))?(#(.*))?$/;
	var DEFAULT_PORTS = {'http': 80, 'https': 443};



	var changeUrl = function(event){
		var cache = null ;
		var location = this.kernel.locationService ;
		var url = this.url();

		if ( ( url === this.lastUrl && url === this.location.href ) && this.lastUrl !== location.initialUrl){ 
			//console.log(" changeUrl PASS SAME")
			return;
		}

		if ( ! event ){
			this.kernel.logger(" FORCE URL CHANGE BROWER EVENT NOT FIRE" , "WARNING" );
			//console.log(location.url())
			var newUrl = location.url() ;
			this.kernel.notificationsCenter.fire("onUrlChange", newUrl , this.lastHash, url ,cache)
			this.lastUrlr= url;
			this.lastHash = newUrl ;
			return ;
		}
		//console.log("change URL :" + url +" IINIT "+location.initialUrl)
		//console.log("change LAST URL :" + this.lastUrl)
		var parse = location.parse(url);
		//console.log(location)
		if ( ! parse ){
			this.kernel.notificationsCenter.fire("onUrlChange", "", this.lastHash, url,  cache)
			this.lastUrl = "";
			this.lastHash = "";
			return ;
		}

		var newUrl = location.url() ;
		
		this.kernel.notificationsCenter.fire("onUrlChange", newUrl, this.lastHash , url ,cache)
		this.lastUrl = url;
		this.lastHash = newUrl ;
	};

	var browser = function(kernel, settings){
		this.location = window.location;
		this.history = window.History;
		this.lastUrl = this.url();
		this.kernel = 	kernel ;
		$(window).bind('hashchange', changeUrl.bind(this)); 
		//if (nativeHistory){
		//	$(window).bind('popstate', changeUrl.bind(this))
		//}
	};

	browser.prototype.url = function(options){
		if (nativeHistory && options.html5Mode){
			return function(url, replace, state){
				//TODO
				/*if (this.location !== window.location) this.location = window.location;
				if (this.history !== window.History) this.history = window.History;

				if (url){
					this.kernel.logger(replace ? "REPLACE URL : " + url : "CHANGE URL : " + url,"WARNING")
						this.history[replace ? 'replaceState' : 'pushState'](state, '', url);
				}else{
					return this.location.href.replace(/%27/g,"'");	
				}*/
			}
		}else{
			return function(url, replace, state){
				
				if (url){
				if (this.kernel && this.kernel.get("location") )

					if (this.location !== window.location) this.location = window.location;
					var same = ( url === this.lastUrl && url === this.location.href ? true : false );
					if (this.history !== window.history) this.history = window.history;
					this.kernel.logger(replace ? "REPLACE URL : " + url : "CHANGE URL : " + url,"WARNING");
					if ( same ){
						if  (  url === this.kernel.locationService.initialUrl ){
								//FORCE changeUrl 
								changeUrl.call(this)
						}
						return url ;
					}
					//console.log(url)
					if ( replace ){
						this.location.replace(url);	
						return url ;
					}
					return this.location.href = url;				
				}else{
					return this.location.href.replace(/%27/g,"'");	
				}			
			}
		}
	};


	/*
 	 *	CLASS LOCATION
 	 *
 	 */


	var serverBase = function (url) {
		return url.substring(0, url.indexOf('/', url.indexOf('//') + 2));
	};

	var beginsWith = function(begin, whole) {
  		if (whole.indexOf(begin) === 0) {
    			return whole.substr(begin.length);
  		}
	}

	var Location = function(browser, base, kernel, settings){
		this.settings = settings
		this.kernel = kernel;
		this.browser = browser ;
		this.container = this.kernel.container ;
		this.replace = false ;
		
		this.initialUrl = this.browser.url();
		this.base = base
		this.hashPrefix = "#"+this.settings.hashPrefix ;
		this.proto = this.stripFile(this.base);
		this.parseAbsoluteUrl(this.initialUrl);
		this.parse(this.initialUrl);


		// rewrite hashbang url <> html5 url
		//var abs = this.absUrl();
		//if ( abs != this.initialUrl) {
		//	this.browser.url(abs, true);
		//}
	};
	
	Location.prototype.logger = function(pci, severity, msgid,  msg){
		if (! msgid) msgid = "SERVICE LOCATION "
		return this.kernel.syslog.logger(pci, severity, msgid,  msg);
	};

	Location.prototype.listen = function(){
		return this.kernel.notificationsCenter.listen.apply(this.kernel.notificationsCenter, arguments);
	};

	Location.prototype.fire = function(){
		return this.kernel.notificationsCenter.fire.apply(this.kernel.notificationsCenter, arguments);
	
	};

	Location.prototype.set = function(name, value){
		return this.container.set(name, value);	
	};

	Location.prototype.get = function(name, value){
		return this.container.get(name, value);	
	};

	Location.prototype.absUrl = function(){
		return this._absUrl ;
	};

	Location.prototype.url = function(url){
		if (typeof url === "undefined")
			return this._url;
		var match = PATH_MATCH.exec(url);
		if (match[1]) this.path(decodeURIComponent(match[1]));
		if (match[2] || match[1]) this.search(match[3] || '');
		this.hash(match[5] || '');
	};

	Location.prototype.protocol = function(){
		return this._protocol;	
	};


	Location.prototype.host = function(){
		return this._host;	
	};

	Location.prototype.port = function(){
		return this._port ;	
	};

	Location.prototype.path = function(path){
		if (typeof path === "undefined"){
			return this._path ;
		}
		this._path = path ;
		try {
			this.change();
		}catch(e){
			this.logger(e,"ERROR");
			throw e
		}
		return this._path;
	};

	Location.prototype.search = function(search){
		if (typeof search === "undefined"){
			return this._search ;
		}
		this._search = search ;
		try {
			this.change();
		}catch(e){
			this.logger(e,"ERROR");
			throw e
		}
		return this._search;

		
	};
	
	Location.prototype.hash = function(hash){
		if (typeof hash === "undefined"){
			return this._hash ;
		}
		this._hash = hash ;
		try {
			this.change();
		}catch(e){
			this.logger(e,"ERROR");
			throw e
		}
		return this._hash;
	};	

	Location.prototype.state = function(){
	
	};

	Location.prototype.replace = function(value){
		if (value)
			return  this.replace = value ;	
		return this.replace ;
	};

	Location.prototype.encodePath = function(path) {
  		var segments = path.split('/');
      		var i = segments.length;

  		while (i--) {
    			segments[i] = stage.io.encodeUriSegment(segments[i]);
  		}

  		return segments.join('/');
	};


	Location.prototype.stripFile = function(url){
		return url.substr(0, stripHash(url).lastIndexOf('/') + 1);
	};


	var stripHash = function(url){
		var index = url.indexOf('#');
  		return index == -1 ? url : url.substr(0, index);
	};

	// parsing end URL ex : http://domain.com:port(/path)(?search)(#hash)
	Location.prototype.parseRelativeUrl = function(relativeUrl){
		//console.log("relative :" + relativeUrl)
		var prefixed = (relativeUrl.charAt(0) !== '/');
		if (prefixed) {
			relativeUrl = '/' + relativeUrl;
		}
		var resolve = stage.io.urlToOject(relativeUrl);
		//console.log(resolve)
		this._path = decodeURIComponent(prefixed && resolve.pathname.charAt(0) === '/' ?
			resolve.pathname.substring(1) : resolve.pathname);
		this._search = stage.io.parseKeyValue(resolve.search);
		this._hash = decodeURIComponent(resolve.hash);

		// make sure path starts with '/';
		if (typeof this._path !== "undefined" && this._path.charAt(0) != '/') {
			this._path = '/' + this._path;
		}
		//console.log("PATH:" + this._path)
	};

	// parsing begin URL ex : (http)://(domain.com):(port)
	Location.prototype.parseAbsoluteUrl = function(absoluteUrl){
		var resolve = stage.io.urlToOject(absoluteUrl);
  		this._protocol = resolve.protocol.replace(":", "");
  		this._host = resolve.hostname;
  		this._port = parseInt(resolve.port, 10) || DEFAULT_PORTS[this._protocol] ||null;
	};

	/**
 	 * LocationHashbangUrl represents url
 	 * This object is exposed as $location service when developer doesn't opt into html5 mode.
 	 * It also serves as the base class for html5 mode fallback on legacy browsers.
 	 *
 	 * @constructor
 	 * @param {string} appBase application base URL
 	 * @param {string} hashPrefix hashbang prefix
 	*/
	var LocationHashbangUrl= function(browser, base, kernel, settings) {
		this.mother = this.$super
		this.mother.constructor(browser, base, kernel, settings);
	}.herite(Location);

	LocationHashbangUrl.prototype.parse = function(url){
		//console.log("URL to parse LocationHashbangUrl  :" + url)
		//console.log("base : " + this.base)
		//console.log("beginsWith BASE : "+beginsWith(this.base, url))
		//console.log("beginsWith PROTO  :"+beginsWith(this.proto, url))
		var withoutBaseUrl = beginsWith(this.base, url) || beginsWith(this.proto, url);
		//console.log("withoutBaseUrl : " +withoutBaseUrl)
		var withoutHashUrl = withoutBaseUrl.charAt(0) == '#'
			? beginsWith(this.hashPrefix, withoutBaseUrl)
			: "";

    		if (typeof withoutHashUrl !== "string") {
			this.logger('Invalid url '+url+', missing hash prefix ' +this.hashPrefix , "ERROR");
      			return null; 
    		}
		//console.log("withoutHashUrl : " +withoutHashUrl)
    		this.parseRelativeUrl(withoutHashUrl);
		return this.change();
	};
	
	LocationHashbangUrl.prototype.change = function(){
		var search = stage.io.toKeyValue(this._search);
		//console.log(this._search)
		//var hash = this._hash ? '#' + stage.io.encodeUriSegment(this._hash) : '';

		var hash = this._hash ? '#' + this._hash : '';

		//console.log(this._path)
		this._url = this.encodePath(this._path) + (search ? '?' + search : '') + hash		
		//console.log(this._url)
		//var temp = (this._url ? this.hashPrefix + this._url : '').replace("//","/");
		//this._absUrl = this.base + temp;	
		//console.log( this.hashPrefix)
		//console.log( this._url)
		this._absUrl = this.base + (this._url ? "#" + this._url : '');	
		//console.log("URL :"+ this._url)
		//console.log("HASH :"+ this._hash)
		//console.log("ABSURL :"+ this._absUrl)
		//console.log("PATH :"+ this._path)
		return this;
	};


	/**
 	 * LocationHashbangInHtml5Url represents url
 	 * This object is exposed as location service when html5 history api is enabled but the browser
 	 * does not support it.
 	 *
 	 * @constructor
 	 * @param {string} appBase application base URL
 	 * @param {string} hashPrefix hashbang prefix
 	*/
	var LocationHashbangInHtml5Url = function(browser, base, kernel, settings){
	
		this.mother = this.$super
		this.mother.constructor(browser, base, kernel, settings);
	}.herite(LocationHashbangUrl);


	LocationHashbangInHtml5Url.prototype.parse = function(url){
		return this.change();
	};
	
	LocationHashbangInHtml5Url.prototype.change = function(){
		return this;
	};

	/**
 	 * LocationHtml5Url represents an url
 	 * This object is exposed as location service when HTML5 mode is enabled and supported
 	 *
 	 * @constructor
 	 * @param {string} appBase application base URL
 	 * @param {string} basePrefix url path prefix
 	*/
	var LocationHtml5Url= function(browser, base, kernel, settings) {
		this.mother = this.$super
		this.mother.constructor(browser, base, kernel, settings);
	}.herite(Location);


	LocationHtml5Url.prototype.parse = function(url){
		var pathUrl = beginsWith(this.proto, url);
		if (pathUrl){
			this.parseRelativeUrl(pathUrl);
		}
		if (! this._path)
			this._path = "/"
		return this.change();
	};
	
	LocationHtml5Url.prototype.change = function(){
		var search = stage.io.toKeyValue(this._search);
		var hash = this._hash ? '#' + stage.io.encodeUriSegment(this._hash) : '';
		this._url = this.encodePath(this._path) + (search ? '?' + search : '') + hash;
		this._absUrl = this.proto + this._url.substr(1);
		return this
	};

	/*
 	 *	SERVICE LOCATION
 	 */

	var defaultSettings = {
		html5Mode:true,
		hashPrefix:"/"
	};

	var service = function(kernel, settings){
	
		var options = $.extend(defaultSettings, settings)
			
		browser.prototype.url = browser.prototype.url(options);
		var browserService = new browser(kernel, options);
		kernel.set("browser", browserService);
		var initialUrl = browserService.url();
		var baseHref = options.base || "" ;

		if (options.html5Mode) {
			var mode = nativeHistory ? LocationHtml5Url : LocationHashbangInHtml5Url;
			var base = serverBase(initialUrl) + (baseHref || '/');
		}else{
			var mode = LocationHashbangUrl ;
			var base = stripHash(initialUrl);
		}
		
		return new mode(browserService, base, kernel, options);
	}; 
	
	return service;

});





