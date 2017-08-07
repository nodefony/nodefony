/*
 *
 *
 *
 *
 *
 */

module.exports = nodefony.register("Route", function(){

	const decode = function(str) {
		try {
			return decodeURIComponent(str);
		} catch(err) {
			return str;
		}
	};

	/*
 	 *	CLASS ROUTE
 	 *
 	 */
	const regRoute = /(\/)?(\.)?\{([^}]+)\}(?:\(([^)]*)\))?(\?)?/g ;

	const Route = class Route {
		constructor (name, obj){
			this.name = name ;
			this.path  = null;
			this.host= null;
			this.defaults= {};
			this.requirements= {};
			//TODO
			this.options= {};

			//TODO http | websocket
			this.schemes= null;
			//TODO with obj
			if ( obj ){
				this.setName(obj.id);
				this.setPattern(obj.pattern);
				this.compile();
			}
			this.variables = [];
			this.pattern = null;
			this.bypassFirewall = false ;
			this.defaultLang = null ;
			this.hash = null ;
		}

		generateId(){
			//console.log(  "GENERATE : " + JSON.stringify(this) );
			this.hash = crypto.createHash("md5").update(JSON.stringify(this)).digest("hex") ;
			return this.hash ;
		}

		setName (name){
			this.name = name ;
		}

		setPattern (pattern){
			this.path = pattern;
		}

		setHostname (hostname){
			this.host = hostname;
		}

		addDefault (key , value){
			this.defaults[key] = value;
		}

		addRequirement (key , value){
			this.requirements[key] = value;
		}

		getRequirement (key){
			return this.requirements[key] ;
		}

		hasRequirements (){
			return Object.keys( this.requirements ).length;
		}

		addOptions (key , value){
			this.options[key] = value;
		}

		/*setPath (){}
		setRequirements (){}
		setOptions (){}
		setMethods (){}
		setHost (){}
		setSchemes (){}*/

		checkDefaultParameters ( variable ){
			for( let def in this.defaults ){
				switch ( def ){
					case "controller" :
						continue ;
					default :
						if ( def === variable ){
							return true ;
						}
				}
			}
			return false ;
		}

		hydrateDefaultParameters ( res ){
			if ( this.variables.length ){
				for( let i = 0  ; i< this.variables.length ; i++ ){
					if (  this.defaults[ this.variables[i] ] ){
						if (res[i+1] === "" ){
							res[i+1] = this.defaults[ this.variables[i] ];
						}
					}
				}
			}else{
				for( let def in this.defaults ){
					switch ( def ){
						case "controller" :
							continue ;
						default :
							res.push( this.defaults[def] );
					}
				}
			}
		}

		compile (){
			let pattern = this.path.replace( regRoute, (match, slash, dot, key, capture, opt, offset)  => {
				let incl = (this.path[match.length+offset] || '/') === '/';
				this.variables.push(key);
				if( this.checkDefaultParameters(key) ){
					return (incl ? '(?:' : '')+(slash ? slash+"?" : '')+(incl ? '' : '(?:')+(dot || '')+'('+(capture || '[^/]*')+'))'+(opt || '');
				}else{
					return (incl ? '(?:' : '')+(slash || '')+(incl ? '' : '(?:')+(dot || '')+'('+(capture || '[^/]+')+'))'+(opt || '');
				}
			});
			if ( pattern[pattern.length - 1] === "*" ){
				pattern = pattern.replace(/([\/.])/g, '\\$1').replace(/\*/g, '(.*)\/?');
			}else{
				pattern = pattern.replace(/([\/.])/g, '\\$1');
			}
			this.pattern = new RegExp('^'+pattern+'[\\/]?$', 'i');
			return this.pattern ;
		}

		match (context){
			let myUrl = context.request.url.pathname ;
			let res = myUrl.match(this.pattern);
			if (!res) {
				return res;
			}
			try {
				this.hydrateDefaultParameters( res );
			}catch(e){
				throw  e  ;
			}
			//check requierments
			try {
				this.matchRequirements(context) ;
			}catch(e){
				throw  e  ;
			}
			//check Hostname
			try {
				this.matchHostname(context) ;
			}catch(e){
				throw  e  ;
			}
			let map = [];
			try {
				res.slice(1).forEach( (param, i)  => {
					let k = this.variables[i] || 'wildcard';
					param = param && decode(param);
					let req = this.getRequirement(k);
					let result = null ;
					if ( req ){
						if ( req instanceof RegExp){
							result = req.test(param) ;
						}else{
							result = new RegExp(req).test(param);
						}
						if( ! result ){
							map = false ;
							throw {BreakException:"Requirement Exception variable : " + k +" ==> " +param +" doesn't match with " + req};
						}
					}
					let index = map.push( param );
					map[k] = map[index-1] ;
				});
			}catch(e){
				if (e.BreakException ){
					throw e.BreakException ;
				}
				throw e ;
			}
			if ( map && map.wildcard) {
				map['*'] = map.wildcard;
			}
			return map;
		}

		setFirewallConfigRoute (obj){
			if ( ! obj ){
				return ;
			}
			if (obj.bypass){
				this.bypassFirewall = true ;
			}
		}

		matchHostname (context){
			if ( this.host !== null ){
				if ( this.host === context.domain){
					return true;
				}
				throw {
					type		: "domain",
					message		: "Domain "+ context.domain +" Unauthorized",
					status		: 401
				};
			}
			return true ;
		}

		matchRequirements (context){
			if ( this.hasRequirements() ){
				for(let i  in this.requirements ){
					switch (i){
						case "method":
						switch ( typeof this.requirements[i] ){
							case "string" :
							let req = this.requirements[i].replace(/\s/g,"").toUpperCase();
							if (req.split(",").lastIndexOf(context.method) < 0){
								throw {
									type: "method",
									message:	"Method "+ context.method +" Unauthorized",
									status:		401
								};
							}
							break ;
							case "object" :
							if (  this.requirements[i].indexOf(context.method) < 0 ){
								if ( this.requirements[i].indexOf( context.method.toLowerCase() ) < 0  ){
									throw {
										type: "method",
										message:	"Method "+ context.method +" Unauthorized",
										status:		401
									};
								}
							}
							break;
							default:
							throw new Error ("Bad config route method : " + this.requirements[i] );
						}
						break;
						case "domain":
						if (context.domain !== this.requirements[i]){
							throw {
								type		: "domain",
								message		: "Domain "+ context.domain +" Unauthorized",
								status		: 401
							};
						}
						break;
					}
				}
			}
			return true;
		}
	};
	return Route;
});
