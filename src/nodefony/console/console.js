
const Getopt = require('node-getopt');
const npm = require("npm");

module.exports = nodefony.register("console", function(){

	var generateHelp = function(obj, str){
		str += this.cli.clc.cyan("nodefony")+" \n";
		str += this.cli.clc.green("\tnpm:list")+"							 List all installed packages \n";
		str += this.cli.clc.green("\tnpm:install")+"							 Install all framework packages\n";
		for (var ele in obj){
			if (obj[ele].name ){
				str +=  obj[ele].name;
			}
			for (var cmd in obj[ele].task ){
				str +=  this.cli.clc.green("\t"+ obj[ele].task[cmd][0]);
				var length =  obj[ele].task[cmd][0].length;
				var size = 65 - length ;
				for (var i = 0 ; i< size ; i++) { str +=" "; }
				str += obj[ele].task[cmd][1]+"\n";
			}
		}
		return str;
	};

	var settingsSysLog = {
		//rateLimit:100,
		//burstLimit:10,
		moduleName:"CONSOLE",
		defaultSeverity:"INFO"
	};

	const Console = class Console extends nodefony.appKernel {

		constructor (environment, debug, settings){
			// App Kernel
			super("CONSOLE", environment, debug, nodefony.extend( settings , {
				onBoot:function(){
					if ( process.argv[2] && process.argv[2] === "npm:list" ){
						this.listPackage(this.rootDir+"/package.json");
					}
				},
				syslog:settingsSysLog
			}));
			this.commands = {};
			this.getOptsTab = [];
			if ( process.argv[2] && process.argv[2] === "npm:install" ||  process.argv[2] && process.argv[2] === "npm:list" ){
				return ;
			}
			// MANAGE CLI OPTIONS
			this.listen(this, "onPostRegister",function(){
				try {
					var ret = this.loadCommand();
					if (ret){
						this.terminate(1);
					}
				}catch(e){
					this.logger(e, "ERROR");
					this.terminate(1);
					return ;
				}
				process.nextTick( ()=> {
					try {
						this.matchCommand();
					}catch(e){
						this.logger(e,  "ERROR");
						this.terminate(1);
					}
				});
			});
		}

		initializeLog ( settings ) {
			this.cli.listenSyslog(this.syslog, this.debug);
		}

		/**
	 	*	@method logger
         	*/
		logger (pci, severity, msgid,  msg){
			if (! msgid) { msgid = "CONSOLE " ;}
			return this.syslog.logger(pci, severity, msgid,  msg);
		}

		/**
	 	*	register Bundle
	 	*	@method registerBundles
	 	*	@param {String} path
	 	*	@param {Function} callbackFinish
    */
		registerBundles (path, callbackFinish, nextick){
			var func = ( Path ) => {
				try{
					new nodefony.finder( {
						path:Path,
						recurse:false,
						onFile:(file) => {
							if (file.matchName(this.regBundle)){
								try {
									if ( process.argv[2] && process.argv[2] === "npm:install" ){
										var name = this.getBundleName(file.name);
										switch( name ){
											case "http":
											case "framework":
											case "assetic":
											case "security":
											case "sequelize":
											case "realTime":
											case "monitoring":
											case "documentation":
											case "unitTest":
											break;
											default:
												this.installPackage(name, file);
										}
									}else{
										this.loadBundle( file);
									}
								}catch(e){
									console.trace(e);
									this.logger(e, "ERROR");
								}
							}
						},
						onFinish:callbackFinish || this.initializeBundles.bind(this)
					});
				}catch(e){
					this.logger(e, "ERROR")
					this.logger("GLOBAL CONFIG REGISTER : ","INFO");
					this.logger(this.configBundle,"INFO");
					var gene = this.readGeneratedConfig();
					if ( gene ){
						this.logger("GENERATED CONFIG REGISTER file ./config/GeneratedConfig.yml : ","INFO");
						this.logger( gene  , "INFO" );
					}
				}
			};

			if ( nextick === undefined ){
				process.nextTick( () =>{
					func.call(this, path );
				});
			}else{
				func.call(this, path );
			}
		}

		listPackage (conf){
			conf = require(conf);
			npm.load(conf, (error) => {
				if (error){
					this.logger(error,"ERROR");
					this.terminate(1);
					return ;
				}
				npm.commands.ls([], true, (error, data) =>{
					var ele = [];
					for (var pack in data.dependencies){
						//this.kernel.logger(data.dependencies[pack].name + " : " + data.dependencies[pack].version + " description : " + data.dependencies[pack].description , "INFO");
						ele.push([
							data.dependencies[pack].name,
							data.dependencies[pack].version,
							data.dependencies[pack].description
						]);
					}
					this.logger( "NPM NODEFONY PACKAGES", "INFO")
					var headers = [
						"NAME",
						"VERSION",
						"DESCRIPTION"
					];
					this.cli.displayTable(ele, {
						head: headers,
						colWidths :[30,10,100]
					});
					this.terminate(0);
				});
			});
		}

		installPackage (name, file, prod){
			try {
				var conf = new nodefony.fileClass(file.dirName+"/package.json");
				var config = require(conf.path);
				npm.load( config ,(error, event) => {
					if (error){
						this.logger(error, "ERROR");
						this.terminate(1);
					}
					shell.cd(file.dirName)
					event.config.localPrefix = file.dirName;
					event.config.globalPrefix = this.rootDir ;
					event.localPrefix = file.dirName ;
					event.globalPrefix = this.rootDir ;
					//npm.config.set('localPrefix', file.dirName);
					//npm.config.set('globalPrefix', this.rootDir);
					var tab = [] ;
					this.logger("NPM :"+npm.version+  " Installing Dependencies for bundle : " + file.shortName  );
					for (let dep in config.dependencies ){
							let mypackage = dep+"@"+config.dependencies[dep] ;
							try {
								require.resolve(dep);
							}catch(e){
								this.logger( "\t Dependency : " + mypackage  );
								tab.push( mypackage );
							}
					}
					if ( ! prod ){
						for (let dep in config.devDependencies ){
								let mypackage = dep+"@"+config.devDependencies[dep] ;
								try {
									require.resolve(dep);
								}catch(e){
									this.logger( "\t Dependency dev : " + mypackage  );
									tab.push( mypackage );
								};
						}
					}
					if (tab.length ){
						event.commands.install(tab, (err, data) =>{
							if ( err ){
								this.logger("NPM :"+npm.version+  " Installing Dependencies for bundle : " + file.shortName  , "ERROR");
								this.logger(err, "ERROR");
							}
						});
					}
				});
			}catch(e){
				if (e.code !== "ENOENT"){
					this.logger("Install Package BUNDLE : "+ name +":"+e,"ERROR");
					shell.cd(this.rootDir);
					throw e ;
				}
			}
			shell.cd(this.rootDir);
		}

		loadCommand (){
			this.stop = false;
			for ( let bundle in this.bundles ){
				this.bundles[bundle].registerCommand( this.commands );
			}
			this.getopts =  this.getopt(this.getOptsTab);
			this.helpString = this.getopts.getHelp();
			this.helpString += "\nCommands : [arguments]\n";
			var bundles = {};
			for ( let bundle in this.commands ){
				if ( ! bundles[bundle] ){
					var name = this.cli.clc.cyan(bundle)+" \n" ;
					bundles[bundle] = {
						name : name,
						task: []
					};
				}
				var commands = this.commands[bundle];
				for (var cmd in commands ){
					var command = commands[cmd].prototype.commands;
					for (var task in command){
						bundles[bundle].task.push( command[task] );
					}
				}
			}
			this.getopts.setHelp( generateHelp.call(this, bundles, this.helpString) );
			return this.stop;
		}

		matchCommand (){
			this.cliParse = this.getopts.parseSystem();
			var ret = null;
			if (this.cliParse.argv.length){
				var ele = this.cliParse.argv[0].split(":");
				if (ele.length){
					var cmd = ele[0];
					for (var bundle in this.commands  ){
						if (cmd in this.commands[bundle]){
							var worker = this.commands[bundle][cmd];
							if (worker){
								try {
									ret = new worker(this.container, this.cliParse.argv , this.cliParse.options );
								}catch(e){
									throw e ;
								}
							}else{
								this.showHelp();
								throw new Error("Worker : ")+ cmd +" not exist" ;
							}
							return ret;
						}
					}
					this.showHelp();
					throw new Error("COMMAND : ")+ this.cliParse.argv +" not exist" ;
				}else{
					this.showHelp();
					throw new Error("BAD FORMAT ARGV : ") + this.cliParse.argv ;
				}
			}
			return this.showHelp();
		}

		showHelp (){
			return this.getopts.showHelp();
		}

		/*
 	 	*
 	 	*
 	 	*
 	 	*   Getopt arguments options
	 	*	'=':   has argument
	 	*	'[=]': has argument but optional
	 	*	'+':   multiple option supported
 	 	*
 	 	*
 	 	*
 	 	*/
		getopt (tab){
			tab.push(['h' , 'help']);
			tab.push(['v' , 'version', 'show version']);
			var res = new Getopt(tab).bindHelp();
			res.errorFunc = (error) => {
				this.logger(error);
				res.showHelp();
				this.stop = true;
				this.terminate(1);
			};
			return res;
		}
	};
	return  Console;
});
