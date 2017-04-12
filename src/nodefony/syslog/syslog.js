/*
 *
 *
 *
 */
nodefony.register("syslog", function(){


   	/*
    	 * default settings
    	 * <pre>
    	 *   moduleName:      "nodefony"
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
   	sysLogSeverity.EMERGENCY = 0;
   	sysLogSeverity.ALERT = 1;
   	sysLogSeverity.CRITIC = 2;
   	sysLogSeverity.ERROR = 3;
   	sysLogSeverity.WARNING = 4;
   	sysLogSeverity.NOTICE = 5;
   	sysLogSeverity.INFO = 6;
   	sysLogSeverity.DEBUG = 7;

   	/**
    	 *  Protocol Data Unit
     	 * @class  PDU
    	 * @constructor
    	 * @module library
    	 * @return {PDU}
    	 */
	var guid = 0;
	nodefony.PDU = class PDU {
		constructor(pci, severity, moduleName, msgid, msg, date ) {
			/* timeStamp @type Date*/
               		this.timeStamp = new Date(date).getTime() || new Date().getTime();
           		/* uid */
               		this.uid =  ++guid;
           		/* severity */
               		this.severity = translateSeverity(severity);
           		/* severityName */
               		this.severityName = sysLogSeverity[this.severity];
            		/* typePayload */
               		this.typePayload = nodefony.typeOf(pci);
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

		/**
    	 	* Get Date in string format
    	 	* @method getDate
    	 	* @return {String} a date in string format .
    	 	*/
   		getDate(){
       			return new Date(this.timeStamp).toTimeString();
   		}

   		/**
    	 	* get a string representating the PDU protocole
    	 	* @method toString
    	 	* @return {String}  .
    	 	*/
   		toString (){
       			return  "TimeStamp:"+this.getDate() +
           			"  Log:" +this.payload +
           			"  ModuleName:" +this.moduleName +
           			"  SeverityName:"+this.severityName+
           			"  MessageID:"+this.msgid +
           			"  UID:"+this.uid +
                   		"  Message:"+this.msg;
   		}

		parseJson (str){
			var json = null ;
			try {
				json = JSON.parse(str);
				for (var ele in json){
					if (ele in this){
						this[ele] = json[ele];
					}
				}
			}catch(e){
				throw e ;
			}
			return json ;
		}
	};

   	var operators = {
       		"<": function(ele1, ele2){ return ele1 < ele2; },
       		">": function(ele1, ele2){ return ele1 > ele2; },
       		"<=":function(ele1, ele2){ return ele1 <= ele2; },
       		">=":function(ele1, ele2){ return ele1 >= ele2; },
       		"==":function(ele1, ele2){ return ele1 === ele2; },
       		"!=":function(ele1, ele2){ return ele1 !== ele2; },
		"RegExp":function(ele1, ele2){return  ( ele2.test(ele1) );}
   	};

   	var conditionsObj = {
       		severity:function(pdu, condition){
           		if (condition.operator !== "=="){
               			//console.log(pdu.severity);
               			//console.log(condition.data)
               			return  operators[condition.operator](pdu.severity, condition.data);
           		}else{
               			for (var sev in condition.data){
                   			if ( sev === pdu.severityName){
                       				return true;
					}
               			}
           		}
           		return false ;
       		},
       		msgid:function(pdu, condition){
			if (condition.operator !== "=="){
				return operators[condition.operator](pdu.msgid, condition.data);
			}else{
           			for (var sev in condition.data){
               				if ( sev === pdu.msgid){
                   				return true;
					}
           			}
			}
           		return false ;
       		},
       		date:function(pdu, condition){
           		return  operators[condition.operator](pdu.timeStamp, condition.data);
       		}
   	};

   	var logicCondition ={
       		"&&" : function(myConditions, pdu){
           		var res= null ;
           		for (var ele in myConditions){
               			res = conditionsObj[ele](pdu, myConditions[ele] );
               			//console.log("condition :" +ele +"  "+res)
               			if ( ! res ){
                   			break;
               			}
           		}
           		return res ;
       		},
       		"||" : function(myConditions, pdu){
           		var res= null ;
           		for (var ele in myConditions){
               			res = conditionsObj[ele](pdu, myConditions[ele] );
               				if ( res ){
                   				break;
               				}
           		}
           		return res ;
       		}
   	};

   	var checkFormatSeverity = function(ele){
       		var res = false;
       		switch ( nodefony.typeOf(ele) ){
           		case "string":
               			res = ele.split(/,| /);
           			break;
           		case "number" :
               			res = ele;
           			break;
			default:
				throw new Error("checkFormatSeverity bad format "+nodefony.typeOf(ele)+" : " + ele);
       		}
       		return res;
   	};

   	var checkFormatDate = function(ele){
       		var res = false;
       		switch ( nodefony.typeOf(ele) ){
           		case "date":
               			res = ele.getTime();
           			break;
           		case "string":
               			res = new Date(ele);
           			break;
			default:
				throw new Error("checkFormatDate bad format "+nodefony.typeOf(ele)+" : " + ele);
       		}
       		return res;
   	};

	var checkFormatMsgId = function(ele){
		var res = false;
       		switch ( nodefony.typeOf(ele) ){
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
				throw new Error("checkFormatMsgId bad format "+nodefony.typeOf(ele)+" : " + ele);
       		}
       		return res;
	};

   	var severityToString = function(severity){
       		var myint = parseInt(severity,10) ;
		var ele = null ; 
       		if (! isNaN(myint)){
           		ele = sysLogSeverity[myint];
       		}else{
           		ele = severity;
       		}
       		if (ele in sysLogSeverity){
           		return ele;
		}
        	return false;
   	};


   	var sanitizeConditions = function(settingsCondition){
       		var res = true;
       		if (nodefony.typeOf(settingsCondition) !== "object" ){
           		return false;
		}
       		for (var ele in settingsCondition){
           		if (! ( ele in conditionsObj ) ){
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
                               					return false;
                           				}
                       				}else{
                           				condi.operator = "==";
                           				res = checkFormatSeverity(condi.data);
                           				if (res !== false){
                               					condi.data = {};
                               					if (nodefony.typeOf(res) === "array"){
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
                               					return false;
                           				}
                       				}
                   				break;
                   			case "msgid":
						if ( ! condi.operator){
							condi.operator = "==";	
						}
						res = checkFormatMsgId(condi.data);
                       				if (res !== false){
                           				if (nodefony.typeOf(res) === "array"){
								condi.data = {};
                               					for (let i = 0 ; i < res.length; i++ ){
                                   					condi.data[res[i]] = "||";
                               					}
                           				}else{
								condi.data = res ;	
							}
                       				}else{
                           				return false ;
                       				}
                   				break;
                   			case "date":
                       				res =checkFormatDate(condi.data);
                       				if (res){
                           				condi.data = res;
                       				}else{
                           				return false;
						}
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
		var myseverity = null ;
       		if (severity in sysLogSeverity){
           		if (typeof severity === 'number'){
               			myseverity = sysLogSeverity[sysLogSeverity[severity]];
           		}else{
               			myseverity = sysLogSeverity[severity];
			}
       		}else{
			if ( ! severity ){
				return null;
			}else{
				throw new Error ("not nodefony syslog severity :"+severity);
			}
       		}
       		return myseverity;
   	};

   	var createPDU = function(payload, severity, moduleName, msgid, msg){
		var myseverity = null ;
       		if ( ! severity ){
               		myseverity = sysLogSeverity[this.settings.defaultSeverity];
           	}else{
           		myseverity = severity;
           	}
       		return new nodefony.PDU(payload, myseverity,
                           	moduleName,
                           	msgid,
                           	msg);
   	};

   	/**
    	 * A class for product log in nodefony.
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
    	 *    var logIntance = new nodefony.syslog(settings);
    	 *
    	 *    logIntance.listenWithConditions(context,{
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
    	 *        logIntance.logger(error, "ERROR", "myFunction", ERROR_DEFINE[error] );
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
	var syslog = class syslog extends nodefony.notificationsCenter.notification {

		constructor( settings ) {

			super( settings );
       			/**
             	 	* extended settings
        	 	* @property settings
             	 	* @type Object
             	 	* @see defaultSettings
             	 	*/
           		this.settings = nodefony.extend({},defaultSettings, settings);
       			/**
             	 	* ring buffer structure container instances of PDU
        	 	* @property ringStack
             	 	* @type Array
             	 	*/
           		this.ringStack = [];
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
		}

   		pushStack (pdu){
       			if (this.ringStack.length === this.settings.maxStack){
               			this.ringStack.shift();
           		}
       			var index = this.ringStack.push(pdu);
       			this.valid++;
       			return index;
   		}

   		/**
     	 	* logger message
    	 	* @method logger
     	 	* @param {void} payload payload for log. protocole controle information
     	 	* @param {Number || String} severity severity syslog like.
     	 	* @param {String} msgid informations for message. example(Name of function for debug)
     	 	* @param {String} msg  message to add in log. example (I18N)
     	 	*/
   		logger (payload, severity, msgid, msg){
			var pdu = null ;
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
                   				if (payload instanceof  nodefony.PDU ){
                       					pdu = payload ;
                   				}else{
                       					pdu = createPDU.call(this, payload, severity, this.settings.moduleName, msgid, msg);
                   				}
               				}catch(e){
						console.trace(e);
                   				this.invalid++;
                   				return "INVALID";
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
               				if (payload instanceof  nodefony.PDU ){
                   				pdu = payload;
               				}else{
                   				pdu = createPDU.call(this, payload, severity, this.settings.moduleName, msgid, msg);
               				}
           			}catch(e){
					console.trace(e);
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
   		clearLogStack (){
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
   		getLogStack (start, end, contition){
			var stack = null ;
			if (contition){
				stack = this.getLogs(contition) ; 
			}else{
				stack = this.ringStack ;
			}
           		if ( arguments.length  === 0){
               			return stack[stack.length-1];
			}
           		if ( ! end){
               			return stack.slice(start);
			}
           		if (start === end){
               			return stack[stack.length - start-1];
			}
			return stack.slice(start, end );
   		}

   		/**
     	 	* get logs with conditions
    	 	* @method getLogs
      	 	* @param {Object} conditions .
     	 	* @return {array} new array with matches conditions
     	 	*/
   		getLogs (conditions, stack){
			var myStack = stack || this.ringStack ;
			var myFuncCondition = null ;
       			if ( conditions.checkConditions && conditions.checkConditions in logicCondition ){
           			myFuncCondition = logicCondition[conditions.checkConditions];
           			delete conditions.checkConditions;
       			}else{
           			myFuncCondition = logicCondition[this.settings.checkConditions];
       			}
       			var tab = [];
			var Conditions = null ;
			try {
				Conditions = sanitizeConditions(conditions);
			}catch(e){
				throw new Error("registreNotification conditions format error: "+ e);
			}
       			if (Conditions){
           			for (var i = 0 ; i<myStack.length; i++){
               				var res = myFuncCondition(Conditions,myStack[i]);
               					if (res){
                   					tab.push(myStack[i]);
						}
           			}
       			}
       			return tab;
   		}

   		/**
     	 	* take the stack and build a JSON string
    	 	* @method logToJson
     	 	* @return {String} string in JSON format
     	 	*/
   		logToJson (conditions){
			var stack = null ;
       			if (conditions){
           			stack = this.getLogs( conditions );
       			}else{
           			stack = this.ringStack;
           			return JSON.stringify(stack);
			}
   		}

   		/**
    	 	* load the stack as JSON string
   	 	* @method loadStack
   	 	* @param {Object} json or string stack serialize
	 	* @param {boolean} fire conditions events  .
	 	* @param {function} callback before fire conditions events
    	 	* @return {String}
    	 	*/
   		loadStack (stack, doEvent, beforeConditions){
			var st = null ;
       			if (! stack ){
           			throw new Error("syslog loadStack : not stack in arguments ");
			}
               		switch( nodefony.typeOf(stack) ){
                   		case "string" :
                       			try {
						//console.log(stack);
                           			st = JSON.parse(stack);
                           			return this.loadStack(st, doEvent);
                       			}catch(e){
                           			throw e;
                       			}
                       			break;
                   		case "array" :
                   		case "object" :
                       			try {
                           			for(var i= 0 ; i<stack.length ; i++){
                               				var pdu = new nodefony.PDU(stack[i].payload, stack[i].severity, stack[i].moduleName || this.settings.moduleName , stack[i].msgid, stack[i].msg, stack[i].timeStamp);
                                   			this.pushStack( pdu);

                                   			if (doEvent) {
								if (beforeConditions && typeof beforeConditions  === "function"){
									beforeConditions.call(this, pdu, stack[i]);
								}
                                       				this.fire("onLog", pdu);
                                   			}
                           			}
                       			}catch(e){
                           			throw e;
                       			}
                       			break;
                   		default :
                       			throw new Error("syslog loadStack : bad stack in arguments type");
               		}
               		return st || stack;
   		}
   		
   		/**
     	 	*
     	 	*    @method  listenWithConditions
     	 	*
     	 	*/
   		listenWithConditions (context, conditions, callback  ){
			var myFuncCondition = null ;
			var Conditions = null ;
       			if ( conditions.checkConditions && conditions.checkConditions in logicCondition ){
           			myFuncCondition = logicCondition[conditions.checkConditions];
           			delete conditions.checkConditions;
       			}else{
           			myFuncCondition = logicCondition[this.settings.checkConditions];
       			}
			try {
				Conditions = sanitizeConditions(conditions);
			}catch(e){
				throw new Error("registreNotification conditions format error: "+ e);	
			}
       			if (Conditions){
				var func = (pdu) => {
               				var res = myFuncCondition(Conditions, pdu);
               				if (res){
                   				callback.call( context || this, pdu);
               				}
           			};
           			super.listen(this, "onLog", func);
				return func ;
       			}
   		}

		error (data){
			return this.logger(data,"ERROR");
		}

		warning (data){
			return this.logger(data,"WARNING");	
		}

		info (data){
			return this.logger(data,"INFO");
		}

		debug (data){
			return this.logger(data,"DEBUG");
		}

		trace (data){
			return this.logger(data,"NOTICE");
		}
	};
	return syslog;
});

