const spawn = require('child_process').spawn;
const spawnSync = require('child_process').spawnSync;
const simpleGit = require('simple-git');
const npm = require("npm");

module.exports = nodefony.register("cliKernel", function(){

	var createFile = function (Path, skeleton, parse, params, callback){
		if ( skeleton ){
			buildSkeleton.call(this, skeleton, parse, params,(error, result) => {
				if (error){
					this.logger(error, "ERROR");
				}else{
					try {
						fs.writeFileSync(Path, result,{
							mode:"777"
						});
						callback( new nodefony.fileClass(Path) );
					}catch(e){
						throw e	;
					}
				}
			});
		}else{
			var data = "/* generate by nodefony */";
			try {
				fs.writeFileSync(Path, data,{
					mode:"777"
				});
				callback( new nodefony.fileClass(Path) );
			}catch(e){
				throw e	;
			}
		}
	};

	var buildSkeleton = function(skeleton, parse, obj, callback){
		var skelete = null ;
		try {
			skelete = new nodefony.fileClass(skeleton);
			if (skelete.type === "File"){
				if (parse !== false){
					obj.settings = this.twigOptions ;
					this.twig.renderFile(skelete.path, obj, callback);
				}else{
					callback(null, fs.readFileSync(skelete.path,{
						encoding:'utf8'
					}));
				}
			}else{
				throw new Error( " skeleton must be file !!! : "+ skelete.path);
			}
		}catch(e){
			this.logger(e, "ERROR");
		}
		return skelete;
	};

	var createAssetDirectory = function (Path, callback){
		this.logger("INSTALL ASSETS LINK IN WEB PUBLIC DIRECTORY  : "+ Path);
		try {
			if ( fs.existsSync(Path) ){
				return callback( fs.statSync(Path) );
			}
			throw new Error( Path +" don' exist") ;
		}catch(e){
			this.logger("Create directory : "+ Path);
			fs.mkdir(Path, (e) => {
    				if(!e || (e && e.code === 'EEXIST')){
        				callback( fs.statSync(Path) );
    				} else {
        				this.logger(e,"ERROR");
    				}
			});
		}
	};

	var parseAssetsBundles = function (table, Name){
		var bundles = this.kernel.getBundles();
		var result = null ;
		let name =null;
		let srcpath =null;
		for ( let bundle in bundles ){
			if (Name && Name !== bundle){
				continue;
			}
			try {
				result = bundles[bundle].getPublicDirectory();
			}catch(e){
				continue ;
			}
			if ( result.length() ){
				name = bundles[bundle].bundleName ;
				srcpath = path.resolve ( bundles[bundle].path, "Resources", "public");
				this.createSymlink(srcpath, this.publicDirectory+name, (Srcpath, dstpath) => {
					var size = "not Defined";
					var sizeAssets = "not Defined";
					try {
						size = nodefony.niceBytes( this.getSizeDirectory(Srcpath, /^docs$|^tests|^node_modules|^assets$/ ) ) ;
						sizeAssets = nodefony.niceBytes( this.getSizeDirectory(path.resolve (Srcpath, "assets") ) ) ;
					}catch(e){
						//this.logger(e, "ERROR");
					}
					table.push([
						bundle,
						dstpath.replace(this.kernel.rootDir,"."),
						Srcpath.replace(this.kernel.rootDir,"."),
						size,
						sizeAssets
					]);
				});
			}
		}
		try {
			this.logger("INSTALL LINK IN /web TOTAL SIZE : " + nodefony.niceBytes( this.getSizeDirectory( this.publicDirectory ,/^docs$|^tests|^node_modules|^assets$/ )) );
		}catch(e){
			this.logger(e, "WARNING");
		}
	};

	const regHidden = /^\./;
	const isHiddenFile = function(name){
		return regHidden.test(name);
	};
	/*
	 *
	 *	CLI KERNEL
	 *
	 */
	var cliKernel = class cliKernel extends nodefony.cli {

		constructor (name, container, notificationsCenter, options){
			super( name, container, notificationsCenter, options);
			this.publicDirectory = this.kernel.rootDir+"/web/";
			this.twig = twig ;
			this.twigOptions = {
				views :this.kernel.rootDir,
				'twig options':{
					async: false,
					cache: false
				}
			};
			this.commands = {};
		}

		loadCommand (){
			switch ( this.commander.args[0] ){
				case "npm:install":
					return true
				break;
				case "npm:list":
					this.listPackage(this.kernel.rootDir);
					return true ;
				break;
			}
			this.stop = false;
			for ( let bundle in this.kernel.bundles ){
				this.kernel.bundles[bundle].registerCommand( this.commands );
			}
			this.bundles = {};
			for ( let bundle in this.commands ){
				if ( ! this.bundles[bundle] ){
					var name = this.clc.cyan(bundle)+" \n" ;
					this.bundles[bundle] = {
						name : name,
						task: []
					};
				}
				var commands = this.commands[bundle];
				for (var cmd in commands ){
					var command = commands[cmd].prototype.commands;
					for (var task in command){
						this.bundles[bundle].task.push( command[task] );
					}
				}
			}
			this.commander.on('--help', () => {
				console.log( this.generateHelp.call(this, this.bundles, "") );
				this.terminate();
			});
			return this.stop;
		}

		matchCommand (){
			this.cliParse =  this.commander.args ;
			let ret = null;
			let err = null ;
			if (this.cliParse.length){
				var ele = this.cliParse[0].split(":");
				if (ele.length){
					var cmd = ele[0];
					for (var bundle in this.commands  ){
						if (cmd in this.commands[bundle]){
							let worker = this.commands[bundle][cmd];
							if (worker){
								try {
									ret = new worker(this.container, this.cliParse , {
										processName : cmd,
										asciify     : true,
										clear       : true,
										signals     : false,
										autoLogger  : false,
										promiseRejection:false
									} );
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
					err =  "COMMAND : "+ this.cliParse[0] +" not exist" ;
				}else{
					err = "BAD FORMAT ARGV : "+ this.cliParse[0] ;
				}
			}
			this.showHelp();
			if( err) {
				this.logger( err ,"ERROR");
			}
			return ;
		}

		showHelp (){
			return super.showHelp();
		}
		logger(pci, severity, msgid,  msg){
			try {
				if (! msgid) { msgid = "SERVICE CLI KERNEL"; }
				return this.syslog.logger(pci, severity, msgid,  msg);
			}catch(e){
				console.log(pci);
			}
		}

		getSimpleGit(gitPath){
	        if ( gitPath ){
	            return simpleGit( gitPath );
	        }
	        return simpleGit ;
	    }

	    setGitPath (gitPath){
	        this.git = this.getSimpleGit( gitPath );
	        return this.git ;
	    }

		listenSyslog (syslog, debug){
			if ( ! syslog ){
				syslog = this.syslog;
			}
			// CRITIC ERROR
			syslog.listenWithConditions(this, {
				severity:{
					data:"CRITIC,ERROR"
				}
			},(pdu) => {
				return this.normalizeLog( pdu );
			});
			// INFO DEBUG
			var data ;
			if ( debug ){
				data = "INFO,DEBUG,WARNING" ;
			}else{
				data = "INFO" ;
			}
			syslog.listenWithConditions(this, {
				severity:{
					data:data
				}
			},(pdu) => {
				return this.normalizeLog( pdu );
			});
		}

		// ASSETS LINK
		assetInstall (name){
			var table = this.displayTable(null, {
				head:[
					"BUNDLES",
					"DESTINATION PATH",
					"SOURCE PATH",
					"SIZE",
					"ASSETS COMPILE"
				]
			})
			createAssetDirectory.call(this, this.publicDirectory, () => {
				parseAssetsBundles.call(this, table, name);
				console.log(table.toString());
			});
		}

		build (obj, parent, force){
			var child = null;
			switch ( nodefony.typeOf(obj) ){
				case "array" :
					for (var i = 0 ; i < obj.length ; i++){
						this.build(obj[i], parent, force);
					}
				break;
				case "object" :
					for (var ele in obj ){
						var value = obj[ele];
						switch (ele){
							case "name" :
								var name = value;
							break;
							case "type" :
								switch(value){
									case "directory":
										child = this.createDirectory(parent.path+"/"+name, "777", (ele) => {
											if ( force ){
												this.logger("Force Create Directory :" + ele.name  );
											}else{
												this.logger("Create Directory :" + ele.name );
											}
										} , force );
									break;
									case "file":
										createFile.call(this, parent.path+"/"+name, obj.skeleton, obj.parse, obj.params, (ele) =>{
											this.logger("Create File      :" + ele.name);
										});
									break;
									case "symlink":
										if ( force ){
											shell.ln('-sf', parent.path+"/"+obj.params.source , parent.path+"/"+obj.params.dest);
										}else{
											shell.ln('-s', parent.path+"/"+obj.params.source , parent.path+"/"+obj.params.dest);
										}
										this.logger("Create symbolic link :" + obj.name);
										/*fs.symlink ( parent.path+"/"+obj.params.source, parent.path+"/"+obj.params.dest , obj.params.type || "file", (ele) => {
											this.logger("Create symbolic link :" + ele.name);
										} );*/
									break;
								}
							break;
							case "childs" :
								try {
									this.build(value, child);
								}catch(e){
									this.logger(e, "ERROR");
								}
							break;
						}
					}
				break;
				default:
					this.logger("generate build error arguments : "+ ele, "ERROR" );
			}
			return child ;
		}

	    getSizeDirectory (dir, exclude){
	  		try {
	  			if ( exclude ){
	  				var basename = path.basename(dir);
	  				if ( basename.match(exclude) ){
	  					return 0 ;
	  				}
	  			}
	  			var stat = fs.lstatSync(dir);
	  		}catch(e){
	  			this.logger(e, "WARNING");
	  			return 0 ;
	  		}
	  		var files = null ;
	  		switch (true){
	  			case stat.isFile() :
	  				throw  new Error ( dir+" is not a directory");
	  			break;
	  			case stat.isDirectory() :
	  				files = fs.readdirSync(dir);
	  			break;
	  			case stat.isSymbolicLink() :
	  				files = fs.realpathSync(dir);
	  			break;
	  			default:
	  				throw  new Error ( dir+" is not a directory");
	  		}

	  		var i, totalSizeBytes= 0;
	  		var dirSize = null ;
	  		for (i=0; i<files.length; i++) {
	  			var Path = dir+"/"+files[i] ;
	  			try {
	  				stat = fs.lstatSync(Path);
	  			}catch(e){
	  				return 	totalSizeBytes ;
	  			}
	  			switch (true){
	  				case stat.isFile() :
	  					if (!  isHiddenFile(files[i] ) ){
	  						totalSizeBytes += stat.size;
	  					}
	  				break;
	  				case stat.isDirectory() :
	  					dirSize = this.getSizeDirectory(Path, exclude);
	  					totalSizeBytes += dirSize;
	  				break;
	  				case stat.isSymbolicLink() :
	  					//console.log("isSymbolicLink")
	  					dirSize = this.getSizeDirectory(fs.realpathSync(Path), exclude);
	  					totalSizeBytes += dirSize;
	  				break;
	  			}
	  		}
	  		return totalSizeBytes ;
	  	}

	    createSymlink (srcpath, dstpath, callback){
	  		var res= null ;
	  		try {
	  			res = fs.statSync(srcpath);
	  			try{
	  				// LINK
	  				res = fs.lstatSync(dstpath);
	  				if ( res ){ fs.unlinkSync(dstpath) ;}
	  			}catch(e){
	  				//console.log("PASS CATCH")
	  				//console.log(e ,"ERROR")
	  			}
	  			//console.log(srcpath+" : "+ dstpath);
	  			res = fs.symlink(srcpath, dstpath, (e) => {
	  					if(!e || (e && e.code === 'EEXIST')){
	  					callback(srcpath, dstpath);
	  					} else {
	    					this.logger(e,"ERROR");
	  					}
	  			});
	  			callback(srcpath, dstpath);
	  		}catch(e){
	  			this.logger("FILE :"+srcpath +" not exist: "+e,"ERROR");
	  		}
	  	}

	    createDirectory (Path, mode, callback, force){
	  		try {
	  			fs.mkdirSync(Path, mode);
	  			var file = new nodefony.fileClass(Path);
	  			callback( file );
	  			return file ;
	  		}catch(e){
	  			switch ( e.code ){
	  				case "EEXIST" :
	  					if ( force ){
	  						var file = new nodefony.fileClass(Path);
	  						callback( file );
	  						return file ;
	  					}
	  				break;
	  			}
	  			throw e ;
	  		}
	  	}

		existsSync(Path, mode){
			if ( ! Path ){
				throw new Error ("existsSync no path found");
			}
			if ( ! mode ){
				mode = fs.constants.R_OK | fs.constants.W_OK ;
			}
			return fs.accessSync(Path, mode);
		}

		exists(Path, mode, callback){
			if ( ! Path ){
				throw new Error ("exists no path found");
			}
			if ( ! mode ){
				mode = fs.constants.R_OK | fs.constants.W_OK ;
			}
			return fs.access(Path, mode, callback);
		}

	    spawn (command , args, options, close){
	  		let cmd = null ;
	  		try {
				this.logger("Run Spawn : " + command + " "+ args.join(" ") );
	  			cmd = spawn(command , args, options);

	  			cmd.stdout.on('data', (data) => {
						let str = data.toString() ;
						if ( str ){
	  					this.logger(str);
						}
	  			});
	  			cmd.stderr.on('data', (data) => {
						let str = data.toString() ;
						if ( str ){
	  					this.logger(str, "ERROR");
						}
	  			});
	  			cmd.on('close', (code) => {
	  				this.logger(`child process exited with code ${code}`);
	  				if ( close ){
	  					close( code);
	  				}
	  			});
	  			cmd.on('error', (err) => {
	  				this.logger(err, "ERROR");
	  				this.terminate(1);
	  			})
	  		}catch(e){
	  			this.logger(e, "ERROR");
	  			throw e;
	  		}
	  		return cmd ;
	  	}

	  	spawnSync (command , args, options){
			let cmd = null ;
	  		try {
	  			cmd = spawnSync(command, args, options);
	  			if ( cmd.output[2].toString() ){
	  				this.logger( cmd.output[2].toString() ,"ERROR");
	  			}else{
	  				if ( cmd.output[1].toString() ){
	  					this.logger( cmd.output[1].toString() );
	  				}
	  			}
	  		}catch(e){
	  			this.logger(e, "ERROR");
	  			throw e;
	  		}
	  		return cmd ;
	  	}

		listPackage(conf){
			let tab = [] ;
			let mypromise = this.npmList(conf, tab) ;
			for (let bundle in  this.kernel.bundles){
				if ( bundle+"Bundle" in  this.kernel.bundlesCore ){
					continue ;
				}
				mypromise.then( this.npmList(this.kernel.bundles[bundle].path, tab) );
			}
			return mypromise.then((ele)=>{
				var headers = [
					"NAME",
					"VERSION",
					"DESCRIPTION",
					"BUNDLES"
				];
				this.displayTable(ele, {
					head: headers,
					colWidths :[30,10,100,20]
				});
				this.terminate(0);
			}).catch((error) =>{
				this.logger(error,"ERROR");
				this.terminate(1);
				return ;
			});
		}

		npmList (Path, ele){
			return new Promise ((resolve, reject) =>{
				  	shell.cd(Path);
					let conf = null ;
					let config = null ;
					try {
						config = path.resolve( Path , "package.json");
						conf  = require(config);
					}catch(e){
						this.logger("NPM NODEFONY PACKAGES package.json not find in : "+ Path ,"INFO");
						return resolve(ele) ;
					}
					this.logger( "NPM NODEFONY PACKAGES :" + config , "INFO");
					npm.load(conf, (error, event) => {
						if (error){
							return reject(error)
						}
						event.config.localPrefix = Path;
						event.config.globalPrefix = this.rootDir ;
						event.localPrefix = Path ;
						event.globalPrefix = this.rootDir ;
						npm.commands.ls([], true, (error, data) => {
							if (error){
								return reject(error);
							}
							try {
								for (var pack in data.dependencies){
									if ( data.dependencies[pack].name ){
										ele.push([
											data.dependencies[pack].name,
											data.dependencies[pack].version,
											data.dependencies[pack].description || "",
											path.basename( data.dependencies[pack]._where ) || ""
										]);
									}
								}
							}catch(e){
								return reject(e);
							}
							return resolve(ele);
						});
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
					event.config.globalPrefix = this.kernel.rootDir ;
					event.localPrefix = file.dirName ;
					event.globalPrefix = this.kernel.rootDir ;
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
					shell.cd(this.kernel.rootDir);
					throw e ;
				}
			}
			shell.cd(this.kernel.rootDir);
		}

		generateHelp (obj, str){
			this.blankLine();
			str += "\n  Command : " + "\n\n";
			str += this.clc.cyan("nodefony")+" \n";
			str += this.clc.green("\tdev")+"							 	 Run Nodefony Development Server  \n";
			str += this.clc.green("\tprod")+"							 	 Run Nodefony Preprod Server \n";
			str += this.clc.green("\tpm2")+"							 	 Run Nodefony Production Server ( PM2 mode ) \n";
			str += this.clc.green("\tapp")+"							 	 Get Nodefony App name  \n";
			str += this.clc.green("\tnpm:install")+"							 Install all NPM framework packages\n";
			str += this.clc.green("\tnpm:list")+"							 List all NPM installed packages \n";
			for (var ele in obj){
				if (obj[ele].name ){
					str +=  obj[ele].name;
				}
				for (var cmd in obj[ele].task ){
					str +=  this.clc.green("\t"+ obj[ele].task[cmd][0]);
					var length =  obj[ele].task[cmd][0].length;
					var size = 65 - length ;
					for (var i = 0 ; i< size ; i++) { str +=" "; }
					str += obj[ele].task[cmd][1]+"\n";
				}
			}
			return str;
		}

		terminate (code){
			if ( this.kernel ) {
				return this.kernel.terminate(code);
			}
			process.exit(code);
		}
	};
	return cliKernel ;
});
