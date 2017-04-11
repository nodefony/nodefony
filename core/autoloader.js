const fs = require("fs");
const vm = require("vm");
const path = require("path");

module.exports = function(){

	var self = this;
	// copy require not present see load runInThisContext
	self.require = require;
	self.module = module ;
	self.exports = exports ;
	self.__dirname = __dirname ;

	/**
	 *  Nodefony autoloader
	 *
	 * @class autoload
	 * @constructor
	 * @module NODEFONY
	 *
	 */
	var cache = {};
	var regJs = /.*\.js$/;

	var autoload = class autoload {

		constructor() {
			this.dirname = path.resolve(  __dirname, "../" );
			this.load( path.resolve( this.dirname, "core", "core.js") );
			this.load( path.resolve( this.dirname, "core", "notificationsCenter.js") );
			this.load( path.resolve( this.dirname, "core", "../syslog/syslog.js") );
			this.load( path.resolve( this.dirname, "core", "service.js") );
			this.load( path.resolve( this.dirname, "core", "fileClass.js") );
			this.load( path.resolve( this.dirname, "core", "finder.js") );
			this.load( path.resolve( this.dirname, "core", "reader.js") );
			this.load( path.resolve( this.dirname, "core", "log.js") );
			this.load( path.resolve( this.dirname, "core", "protocol.js") );
			this.load( path.resolve( this.dirname, "core", "watcher.js") );
			this.load( path.resolve( this.dirname, "core", "cliWorker.js") );
			this.loadDirectory( path.resolve( this.dirname, "kernel"), /^tests$/ );
			this.syslog = null;
			this.setEnv();
		}

		setEnv (environment){
			this.environment = environment;
			switch( this.environment ){
				case "prod":
				case "PROD":
					this.environment = "prod";
					this.dataCache = true;	
				break;
				case "dev":
				case "DEV":
					this.environment = "dev";
					this.dataCache = false;	
				break;
				default:
					this.environment = "prod";
					this.dataCache = true;	
			}
		}

		/**
 	 	* @method load
	 	*
	 	* @param {String} file Path to file
	 	*
 	 	*/
		load (file, force ){
			if (file in cache &&  force !== true){
				this.logger( file, "WARNING","AUTOLOADER ALREADY LOADED ADD FORCE TO RELOAD ");
				return cache[file].runInThisContext({
					filename:file,
					displayErrors:true
				});
			}
			if(fs.existsSync(file)){
				try {
					var txt = null ; 
					if ( vm.Script ){
						txt = fs.readFileSync(file, {encoding: 'utf8'});
						cache[file] =  new vm.Script(txt, {
							filename:file,
							displayErrors:true,
							timeout:10000,
							produceCachedData:false
						});
					}else{
						txt = fs.readFileSync(file, {encoding: 'utf8'});
						cache[file] = vm.createScript(txt, file, true);
					}
					if ( force ){
						if (this.syslog) {this.logger(file, "WARNING","AUTOLOADER RELOAD FORCE");}
					}else{
						//if (this.syslog){ this.logger(file, "DEBUG","AUTOLOADER LOAD");}	
					}
					return cache[file].runInThisContext({
						filename:file,
					        timeout:10000,
						displayErrors:true
					});
				}catch(e){
					console.trace(e);
					throw e;
				}	
			}else{
				throw new Error("AUTOLOADER file :"+file+" not exist !!!!");
			}
		}

		deleteCache (){
			for ( var ele in cache ){
				delete cache[ele] ;
			}
		}

		close(){
			this.deleteCache();	
		}

		/*run (file, force){
			if (file in cache &&  force !== true){
				cache[file] = script.runInThisContext({
					filename:file,
					displayErrors:true
				});
			}else{
				return this.load( file, force );
			}
		}*/

		/**
 	 	* @method logger
	 	*
	 	* @param {void} payload payload for log. protocole controle information
 	 	* @param {Number || String} severity severity syslog like.
 	 	* @param {String} msgid informations for message. example(Name of function for debug)
 	 	* @param {String} msg  message to add in log. example (I18N)
 	 	*/
		logger (pci, severity, msgid,  msg){
			if (this.syslog){
				if (! msgid){ msgid = "AUTOLOADER  ";}
				return this.syslog.logger(pci, severity , msgid,  msg);
			}
		}

		/**
 	 	* @method loadDirectory
	 	*
	 	* @param {String} path Path to directory to autoload
	 	*
 	 	*/
		loadDirectory (path, exclude){
			var finder = null ;
			var settings = {
				path:path,
				onFinish:(error, res) => {
					if (error){ throw error;}
					res.forEach( this.autoloadEach.bind(this));
				}
			};
			if ( exclude ){
				settings.exclude = exclude ;	
			}
			if ( nodefony.finder ){
				try {
					finder = new nodefony.finder(settings);
				}catch(e){
					this.logger(e);
					if ( finder ){
						return finder.result ;
					}
					throw e ;
				}
				return finder.result ;
			}
			throw new Error("AUTOLOADER finder not found  Load nodefony finder ");
		}

		autoloadEach (ele){
			if ( regJs.exec(ele.path) ){
				this.load.call(self, ele.path);
				//this.logger("AUTOLOAD : "+ele.name, "DEBUG");
			}
		}

		addPrefix (prefix){
			//TODO check if prefix exist
			this.prefixes.push(prefix);
		}

		setKernel (kernel){
			self.kernel = kernel;
			kernel.listen(this, "onReady", () => {
				if (kernel.environment === "prod"){
					this.close();
				}
			});
		}

	};

	var auto = new autoload();
	self.logger =  auto.logger.bind(auto);
	return auto ;
}();
