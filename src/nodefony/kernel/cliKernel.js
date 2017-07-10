const spawn = require('child_process').spawn;
const spawnSync = require('child_process').spawnSync;
const simpleGit = require('simple-git');

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
		}

		showHelp (){
			return this.kernel.showHelp() ;
		}

		terminate (code){
			if ( this.kernel ) {
				return this.kernel.terminate(code);
			}
			process.exit(code);
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

	    spawn (command , args, options, close){
	  		var cmd = null ;
	  		try {
	  			cmd = spawn(command , args, options);

	  			cmd.stdout.on('data', (data) => {
	  				this.logger(data.toString());
	  			});
	  			cmd.stderr.on('data', (data) => {
	  				this.logger(data.toString(), "ERROR");
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
	  		try {
	  			var cmd = spawnSync(command, args, options);
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
	};
	return cliKernel ;
});
