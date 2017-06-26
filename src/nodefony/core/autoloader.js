const fs = require("fs");
const vm = require("vm");
const path = require("path");

module.exports = function(){

	// copy require not present see load runInThisContext
	const context = vm.createContext(this)
	context.require = require;
	context.module = module ;
	context.exports = exports ;
	context.__dirname = __dirname ;
	context.__filename = __filename ;

	context.nodefony = require("./core");
  context.path = require("path");
	context.fs = require("fs")
	context.yaml = require("js-yaml");
	context.util = require('util');
	context.cluster = require('cluster');
	context.url = require("url");
	context.xmlParser = require('xml2js').Parser;
	context.dns = require('dns');
	context.async = require('async');
	context.https = require('https');
	context.http = require('http');
	context.nodedomain = require('domain');
	context.WebSocketServer = require('websocket');
	context.Promise = require('promise');
	context.clc = require('cli-color');
	context.shell = require("shelljs");



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
			this.timeout = 20000 ;
			this.displayError = true ;
			this.lineOffset = 10 ;
			this.columnOffset = 10 ;
			this.dirname = path.resolve(  __dirname, ".." );
			//this.load( path.resolve( this.dirname, "core", "core.js") );
			this.load( path.resolve( this.dirname, "core", "container.js") );
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
			try {
				this.load( path.resolve( this.dirname, "..", "..","..", "..", "app", "appKernel.js") )
			}catch(e){
				this.load( path.resolve( this.dirname,  "app", "appKernel.js") );
			}
			this.syslog = null;
			this.setEnv();
		}

		setEnv (environment){
			this.environment = environment;
			switch( this.environment ){
				case "production":
				case "prod":
				case "PROD":
					this.environment = "prod";
					this.dataCache = true;
				break;
				case "development":
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

		require (file){
			return require(file);
		}

		/**
 	 	* @method load
	 	*
	 	* @param {String} file Path to file
	 	*
 	 	*/
		load (file, force, cd){
			if (file in cache &&  force !== true){
				this.logger( file, "WARNING","AUTOLOADER ALREADY LOADED ADD FORCE TO RELOAD ");
				context.__dirname = path.dirname(file);
				context.__filename = file;
				return cache[file].runInContext(context, {
					filename:file,
					timeout:this.timeout,
					displayErrors:this.displayError
				});
			}
			if(fs.existsSync(file)){
				try {
					var txt = null ;
					if ( vm.Script ){
						txt = fs.readFileSync(file, {encoding: 'utf8'});
						cache[file] =  new vm.Script(txt, {
							filename:file,
							displayErrors:this.displayError,
							timeout:this.timeout,
							produceCachedData:this.dataCache
						});
					}else{
						txt = fs.readFileSync(file, {encoding: 'utf8'});
						cache[file] = vm.createScript(txt, file, true);
					}
					if ( force ){
						if (this.syslog) {this.logger(file, "WARNING","AUTOLOADER RELOAD FORCE");}
					}
					if ( cd ){
						shell.cd(path.dirname(file))
					}
					context.__dirname = path.dirname(file);
					context.__filename = file;
					context.require.main.id = file ;
					context.require.main.filename = file;
					var res = cache[file].runInContext(context, {
							filename:file,
							lineOffset:this.lineOffset,
							columnOffset:this.columnOffset,
					    timeout:this.timeout,
							displayErrors:this.displayError,
							breakOnSigint:true
					});
					if ( cd){
						shell.cd(this.dirname)
				  }
					return res ;
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
			console.log(pci);
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
			if ( context.nodefony.finder ){
				try {
					finder = new context.nodefony.finder(settings);
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
				this.load.call(context, ele.path);
				//this.logger("AUTOLOAD : "+ele.name, "DEBUG");
			}
		}

		setKernel (kernel){
			context.kernel = kernel;
			kernel.listen(this, "onReady", () => {
				if (kernel.environment === "prod"){
					this.close();
				}
			});
		}
	};

	var autoloader = new autoload();
	context.nodefony.autoloader = autoloader;
	context.logger =  autoloader.logger.bind(autoloader);

	return nodefony ;
}();
