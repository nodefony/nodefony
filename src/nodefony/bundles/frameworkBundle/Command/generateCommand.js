/*
 *
 *
 *
 */

module.exports = nodefony.registerCommand("generate",function(){

	/*
 	 *	Bundle generator
 	 *
 	 */
	var regBundle = /^(.*)[Bb]undle$/;
	var regController = /^(.*)Controller$/;

	var angularBundle = function(Path , name, type, location, force){
		var realName = null ;
		var res = regBundle.exec(name);
		if ( res ){
			realName = res[1] ;
		}else{
			throw new Error("Bad bundle name");
		}
		var param = {
			bundleName: name,
			name: realName,
			module:this.config.App.projectName,
			projectName:this.config.App.projectName,
			authorName:this.config.App.authorName,
			authorEmail:this.config.App.authorMail,
			projectYear:this.config.App.projectYear,
			projectYearNow:	new Date().getFullYear()
		};

		return this.build( {
			name:name,
			type:"directory",
			childs:[
				Command,
				controller.call(this, name, "controller", "defaultController", null, location, path.resolve(this.kernel.autoLoader.dirname, "bundles", "frameworkBundle", "Command", "skeletons", "angular", "controllerClass.skeleton") ),
				manager,
				tests.call(this, param),
				Resources.call(this, name, type, location, "angular"),
				documentation.call(this, param, location),
				core,
				entity,
		       	{
					name:name+".js",
					type:"file",
					skeleton:path.resolve( this.kernel.autoLoader.dirname, "bundles", "frameworkBundle", "Command", "skeletons", "bundleClass.skeleton"),
					params:param
		       	},{
					name:"readme.md",
					type:"file"
		       	}]
		}, Path , force);
	};

	var reactBundle = function(Path , name, type, location, force){
		var realName = null ;
		var res = regBundle.exec(name);
		if ( res ){
			realName = res[1] ;
		}else{
			throw new Error("Bad bundle name");
		}
		var param = {
			bundleName: name,
			name: realName,
			module:this.config.App.projectName,
			projectName:this.config.App.projectName,
			authorName:this.config.App.authorName,
			authorEmail:this.config.App.authorMail,
			projectYear:this.config.App.projectYear,
			projectYearNow:	new Date().getFullYear()
		};

		return this.build( {
			name:name,
			type:"directory",
			childs:[
				Command,
				controller.call(this, name, "controller", "defaultController", null, location, path.resolve(this.kernel.autoLoader.dirname, "bundles", "frameworkBundle", "Command", "skeletons", "react","controllerClass.skeleton") ),
				manager,
				tests.call(this, param),
				Resources.call(this, name, type, location, "react"),
				documentation.call(this, param, location),
				core,
				entity,
		       	{
					name:name+".js",
					type:"file",
					skeleton:path.resolve( this.kernel.autoLoader.dirname, "bundles", "frameworkBundle", "Command", "skeletons", "bundleClass.skeleton"),
					params:param
		       	},{
					name:"readme.md",
					type:"file"
		       	}]
		}, Path , force);

	}

	var nodefonyBundle = function(Path , name, type, location, force){

		var realName = null ;
		var res = regBundle.exec(name);
		if ( res ){
			realName = res[1] ;
		}else{
			throw new Error("Bad bundle name");
		}
		var param = {
			bundleName: name,
			name: realName,
			module:this.config.App.projectName,
			projectName:this.config.App.projectName,
			authorName:this.config.App.authorName,
			authorEmail:this.config.App.authorMail,
			projectYear:this.config.App.projectYear,
			projectYearNow:	new Date().getFullYear()
		};

		return this.build( {
				name:name,
				type:"directory",
				childs:[
					Command,
					controller.call(this, name, "controller" , "defaultController", null, location),
					manager,
					tests.call(this, param),
					Resources.call(this, name, type, location, ""),
					documentation.call(this, param, location),
					core,
					entity,
					{
						name:name+".js",
						type:"file",
						skeleton:path.resolve( this.kernel.autoLoader.dirname, "bundles","frameworkBundle","Command","skeletons","bundleClass.skeleton"),
						params:param
					},{
						name:"readme.md",
						type:"symlink",
						params: {
							source:"doc/1.0/readme.md",
							dest:"readme.md"
						}
					},{
						name:"package.json",
						type:"file",
						skeleton:path.resolve( this.kernel.autoLoader.dirname, "bundles","frameworkBundle","Command","skeletons","package.skeleton"),
						params:param
					}
				]
			}, Path , force);
	};

	var documentation = function(param, location){
		return {
			name:"doc",
			type:"directory",
			childs:[
				{
					name:"1.0",
					type:"directory",
					childs:[{
						name:"readme.md",
						type:"file",
						skeleton:path.resolve( this.kernel.autoLoader.dirname,"bundles/frameworkBundle/Command/skeletons/readme.skeleton" ),
						params:nodefony.extend(param, {
							path:location
						})
					}]
				},
				{
					name:"Default",
					type:"symlink",
					params:{
						source:"1.0",
						dest:"Default"
					}
				}
			]
		};
	};

	var webpack = function(obj, type, bundleType){
		switch( bundleType ){
			case "angular" :
			case "react" :
				return {} ;
			default:
				return {
					name:"webpack",
					type:"directory",
					childs:[{
						name:"webpack.common.js",
						type:"file",
						skeleton:path.resolve( this.kernel.autoLoader.dirname,"bundles/frameworkBundle/Command/skeletons/webpack/webpack.common.skeleton" ),
						params:obj
					},{
						name:"webpack.dev.config.js",
						type:"file",
						skeleton:path.resolve( this.kernel.autoLoader.dirname,"bundles/frameworkBundle/Command/skeletons/webpack/webpack.dev.skeleton" ),
						params:obj
					},{
						name:"webpack.prod.config.js",
						type:"file",
						skeleton:path.resolve( this.kernel.autoLoader.dirname,"bundles/frameworkBundle/Command/skeletons/webpack/webpack.prod.skeleton" ),
						params:obj
					}]
				}
		}
	};

	var Resources = function(name, type, location, bundleType){
		var Name = regBundle.exec(name)[1];
		var param = {
			name:Name,
			title:Name,
			bundleName: name,
			local:this.config.App.locale,
			projectName:this.config.App.projectName,
			authorName:this.config.App.name,
			authorEmail:this.config.App.email,
			projectYear:this.config.App.projectYear,
			projectYearNow:	new Date().getFullYear(),
			domain:this.configKernel.system.domain,
			location:location
		};

		return {
			name:"Resources",
			type:"directory",
			childs:[{
				name:"config",
				type:"directory",
				childs:[{
						name:"config."+type,
						type:"file",
						skeleton:path.resolve( this.kernel.autoLoader.dirname, "bundles/frameworkBundle/Command/skeletons/"+bundleType+"/config."+type+".skeleton" ),
						params:param


					},
					routing.call(this, param, type, bundleType),
					webpack.call(this, param, type, bundleType),
					security.call(this, param, type, bundleType)
				]
			},
			public.call(this, param),
			translations,
			views.call(this, "views", "index.html.twig", param)
			]
		};
	};

	var Command = {
		name:"Command",
		type:"directory",
		childs:[{
			name:".gitignore",
			type:"file"
		}]
	};



	var viewString = function(param){

		return "{% extends '/app/Resources/views/base.html.twig' %}\n\
\n\
{% block title %}Welcome {{kernel.name}}! {% endblock %}\n\
\n\
{% block stylesheets %}\n\
\n\
	{{ parent() }}\n\
\n\
	<!-- WEBPACK BUNDLE -->\n\
	<link rel='stylesheet' href='"+param.CDN_stylesheet+"/"+ param.bundleName +"/assets/css/"+param.name+".css' />\n\
\n\
{% endblock %}\n\
\n\
{% block body %}\n\
	<div class='container'>\n\
		<div class='row'>\n\
			<img class='displayed' src='"+param.CDN_image+"/frameworkBundle/images/nodefony-logo-white.png'>\n\
		</div>\n\
	</div>\n\
	<div class='container'>\n\
		<div class='row displayed'>\n\
			{{readme}}\n\
		</div>\n\
	</div>\n\
{% endblock %}\n\
\n\
{% block javascripts %}\n\
\n\
	{{ parent() }}\n\
\n\
	<!-- WEBPACK BUNDLE -->\n\
	<script src='"+param.CDN_javascript+"/"+param.bundleName+"/assets/js/"+param.name+".js'></script>\n\
\n\
{% endblock %}";
	};

	var views = function(directory, name, params){
		var obj = {
			name:directory,
			type:"directory"
		};
		params["CDN_stylesheet"] = '{{CDN("stylesheet")}}';
		params["CDN_javascript"] = '{{CDN("javascript")}}';
		params["CDN_image"] = '{{CDN("image")}}';

		params["myview"] = viewString(params);
		var file = [{
			name:name,
			type:"file",
			parse:true,
			skeleton:path.resolve( this.kernel.autoLoader.dirname, "bundles/frameworkBundle/Command/skeletons/bundleView.skeleton" ),
			params:	params || {}
		}];
		obj.childs = file;
		return obj;
	};

	var routing = function(obj, type, bundleType){
		return  {
			name:"routing."+type,
			type:"file",
			skeleton:path.resolve( this.kernel.autoLoader.dirname, "bundles/frameworkBundle/Command/skeletons/"+bundleType+"/routing."+type+".skeleton" ),
			params:obj
		};
	};
	routing.addConfigRoute = function(file, route, nameController, bundleName){
		var routingFile = new nodefony.fileClass(file);
		this.buildSkeleton(path.resolve( this.kernel.autoLoader.dirname, "bundles/frameworkBundle/Command/skeletons/route.yml.skeleton"), true , {controller:nameController,name:route.name,bundleName:bundleName} , function(error, data){
			if (error ){
				throw error ;
			}
			try {
				fs.writeFileSync(routingFile.path, routingFile.content() + data ,{
					mode:"777"
				});
			}catch(e){
				throw e;
			}
		});
	};

	var security  = function(obj, type, bundleType){
		return  {
			name:"security."+type,
			type:"file",
			skeleton:path.resolve( this.kernel.autoLoader.dirname, "bundles/frameworkBundle/Command/skeletons/"+bundleType+"/security."+type+".skeleton" ),
			params:obj
		};
	};

	var service = function(obj, type){
		var file = [{
			name:"service."+type,
			type:"file",
			skeleton:path.resolve( this.kernel.autoLoader.dirname, "bundles/frameworkBundle/Command/skeletons/service."+type+".skeleton" ),
			params:obj
		}];
		return file;
	};

	service.addConfigService = function(){

	};

	var manager = {
		name:"services",
		type:"directory",
		childs:[{
			name:".gitignore",
			type:"file"
		}]
	};

	var tests = function(param){

		return {
			name:"tests",
			type:"directory",
			childs:[{
				name:param.bundleName+"Test.js",
				type:"file",
				skeleton:path.resolve( this.kernel.autoLoader.dirname, "bundles/frameworkBundle/Command/skeletons/testFile.skeleton"),
				params:param
			}]
		};
	};

	var core = {
		name:"core",
		type:"directory",
		childs:[{
			name:".gitignore",
			type:"file"
		}]
	};
	var translations = {
		name:"translations",
		type:"directory",
		childs:[{
			name:".gitignore",
			type:"file"
		}]
	};
	var entity = {
		name:"Entity",
		type:"directory",
		childs:[{
			name:".gitignore",
			type:"file"
		}]
	};

	var public = function(param){
		return {
			name:"public",
			type:"directory",
			childs:[{
				name:"js",
				type:"directory",
				childs:[{
					name:param.name+".js",
					type:"file",
					skeleton:path.resolve( this.kernel.autoLoader.dirname, "bundles/frameworkBundle/Command/skeletons/webpackEntryPoint.skeleton"),
					params:param
				}]
			},{
				name:"css",
				type:"directory",
				childs:[{
					name:param.name+".css",
					type:"file",
					skeleton:path.resolve( this.kernel.autoLoader.dirname, "bundles/frameworkBundle/Command/skeletons/webpackCss.skeleton"),
					params:param
				}]
			},{
				name:"images",
				type:"directory",
				childs:[{
					name:".gitignore",
					type:"file"
				}]
			},{
				name:"assets",
				type:"directory",
				childs:[{
					name:"js",
					type:"directory",
					childs:[{
						name:".gitignore",
						type:"file"
					}]
				},{
					name:"css",
					type:"directory",
					childs:[{
						name:".gitignore",
						type:"file"
					}]
				},{
					name:"fonts",
					type:"directory",
					childs:[{
						name:".gitignore",
						type:"file"
					}]
				},{
					name:"images",
					type:"directory",
					childs:[{
						name:".gitignore",
						type:"file"
					}]
				}]
			}]
		};
	};

	/*
	 *	commands generator
	 *
	 *
	 */
	//TODO
	var commands = function(bundlePath, name){
		bundlePath.matchName(regBundle);
		if ( bundlePath.match ){
			var bundleName = bundlePath.match[0] ;
		}else{
			throw new Error("Bad bundle name");
		}
		name = name.replace("Command","");

		var file  = {
			name:name+"Command.js",
			type:"file",
			skeleton:path.resolve( this.kernel.autoLoader.dirname, "bundles/frameworkBundle/Command/skeletons/commandClass.skeleton"),
			params:{
				name:name
			}
		};
		this.build(file, new nodefony.fileClass(bundlePath.path+"/Command") );
	};

	/*
	 *	controller generator
	 *
	 */

	var controller = function(bundleName, directory, controllerName, viewDir, location, skeleton){
		var res = regController.exec(controllerName);
		var realName = null ;
		if ( res ){
			realName = res[1] ;
		}else{
			throw new Error("Bad controller name");
		}

		var obj = {
			name:directory,
			type:"directory"
		};
		var nameBundle = null ;
		try {
			var nameBundle = regBundle.exec(bundleName)[1];
		}catch(e){
			throw e ;
		}

		if ( ! skeleton ){
			skeleton = path.resolve( this.kernel.autoLoader.dirname, "bundles/frameworkBundle/Command/skeletons/controllerClass.skeleton" );
		}
		var file  = [{
			name:controllerName+".js",
			type:"file",
			skeleton:skeleton,
			params:{
				bundleName: bundleName,
				smallName:nameBundle,
				controllerName:controllerName,
				name:realName,
				directory:viewDir||"",
				module:viewDir || this.config.App.projectName,
				authorName:this.config.App.name,
				authorEmail:this.config.App.email,
				projectName:this.config.App.projectName,
				projectYear:this.config.App.projectYear,
				projectYearNow:	new Date().getFullYear(),
				location:location
			}
		}];
		obj.childs = file;

		return obj;
	};

	var controllers = function(bundlePath, controllerName, type ){
		var res = regController.exec(controllerName);
		var realName = null ;
		var directory = null ;
		var bundleName = null ;
		if ( res ){
			realName = res[1] ;
		}else{
			throw new Error("Bad controller name");
		}

		bundlePath.matchName(regBundle);
		if ( bundlePath.match ){
			bundleName = bundlePath.match[0] ;
		}else{
			throw new Error("Bad bundle name");
		}
		res = regController.exec(controllerName);
		if ( res ){
			directory = res[1] ;
		}else{
			throw new Error("Bad Controller name");
		}
		var bundleDirectoryController = new nodefony.fileClass(bundlePath.path+"/controller");
		var bundleDirectoryview = new nodefony.fileClass(bundlePath.path+"/Resources/views");
		//var bundleDirectoryConfig = new nodefony.fileClass(bundlePath.path+"/Resources/config");
		var name = regBundle.exec(bundleName)[1];
		try {
			this.build(controller.call(this, bundlePath.name, directory, controllerName, directory), bundleDirectoryController );
			this.build(views.call(this, directory, "index.html.twig",{name:name,bundleName:bundleName}) ,bundleDirectoryview );
			var route = new nodefony.Route(realName) ;
			route.addDefault("controller", bundleName+":"+realName+":index");
			//console.log(route)
			routing.addConfigRoute.call(this, bundlePath.path+"/Resources/config/routing."+type, route, controllerName, bundleName);
		}catch(e){
			this.logger(e, "ERROR");
		}
	};


	/*
 	 *
 	 */
	var generate = class generate extends nodefony.cliKernel {

		constructor(container, command, options){

			super( "generate", container, container.get("notificationsCenter"), options );

			this.config = this.container.getParameters("bundles.App");
			this.configKernel = this.container.getParameters("kernel");
			var arg = command[0].split(":");
			switch ( arg[1] ){
				case "bundle" :
					if ( command[1] ){
						try {
							if (  ! arg[2] ){
								this.generateBundle(command[1], command[2]);
								this.installBundle(command[1], command[2]);
								this.terminate(0);
								return ;
							}else{
								switch ( arg[2] ){
									case "angular" :
										this.generateAngularBundle(command[1], command[2]);
									break ;
									case "react" :
										this.generateReactBundle(command[1], command[2]);
									break;
								}
							}
						}catch(e){
							this.logger(e, "ERROR");
							this.terminate(1);
							return ;
						}
					}else{
						this.showHelp();
						this.terminate(1);
						return ;
					}
				break;
				case "controller" :
					switch (command.length){
						case 1:
							this.showHelp();
						break;
						case 2:
							this.showHelp();
						break;
						case 3:
							try {
								this.generateController( command[1], command[2]);
							}catch(e){
								this.terminate(1);
								return ;
							}
						break;
					}
				break;
				case "command" :
					try{
						this.generateCommand(command[1], command[2]);
					}catch(e){
						this.terminate(1);
						return ;
					}
				break;
				case "service" :
					try {
						this.generateService();
					}catch(e){
						this.terminate(1);
						return ;
					}
				break;
				default:
					this.showHelp();
					this.terminate(0);
			}
			//this.terminate(0);
		}

		installBundle (bundleName, Path){
			try {
				var name = bundleName.match(regBundle)[1];
				var json = this.kernel.readGeneratedConfig();
				var bundleFile =  Path+"/"+bundleName+"/"+bundleName+".js" ;
				var bundlePath = Path+"/"+bundleName ;
				if (json){
					if ( json.system && json.system.bundles ){
						json.system.bundles[ name ]= bundlePath ;
					}else{
						if ( json.system ){
							json.system.bundles = {};
						}else{
							json.system ={
								bundles:{}
							};
						}
						json.system.bundles[ name ] = bundlePath ;
					}
				}else{
					var json = {
						system:{
							bundles:{}
						}
					} ;
					json.system.bundles[ name ] = bundlePath ;
				}
				fs.writeFileSync( this.kernel.generateConfigPath, yaml.safeDump(json),{encoding:'utf8'} )
				var file = new nodefony.fileClass( bundleFile );
				this.kernel.loadBundle(file);
				this.assetInstall(name);
			}catch(e){
				throw e ;
			}
		}

		generateBundle (name, Path){
			this.logger("GENERATE bundle : " + name +" LOCATION : " + path.resolve(Path) );
			try {
				var file = new nodefony.fileClass(path.resolve(Path));
				return nodefonyBundle.call(this, file, name, "yml", path.resolve(Path));
			}catch (e){
				this.logger(e, "ERROR");
				throw e ;
			}
		}

		generateReactBundle (name, Path ){
			this.logger("GENERATE React Bundle : " + name +" LOCATION : " +  path.resolve(Path));
			var react = process.cwd()+'/node_modules/.bin/create-react-app' ;
			var realPath = path.resolve( this.kernel.rootDir ,  path.resolve(Path)  );
			//var cwd = path.resolve( Path) ;
			var cwd = path.resolve( "/", "tmp") ;
			process.env.NODE_ENV = "development";
			var realName = null ;
			var res = regBundle.exec(name);
			if ( res ){
				realName = res[1] ;
			}else{
				throw new Error("Bad bundle name");
			}
			var args = null ;
			try {
				args = [name] ;
				this.logger ("install react cli  create-react-app "+ args.join(" ") );
				var create = this.spawn(react, args, {
					cwd:cwd
				}, ( code ) => {
					if ( code === 1 ){
						throw new Error ("install react cli create-react-app  new error : " +code);
					}
					args = ['run', 'eject'];
					this.logger (" React eject : npm " + args.join(" ") );
					var eject = this.spawn("npm", args, {
						cwd: path.resolve( cwd, name)
					}, ( code ) => {
						shell.mv( path.resolve( cwd, name), realPath+"/");
						try {
							var file = new nodefony.fileClass(Path);
							reactBundle.call(this, file, name, "yml", path.resolve(Path), true);
							this.logger( "ln -s " +  path.resolve( realPath, name, "public")  + " " + path.resolve( realPath, name, "Resources", "public", "dist"));
							//shell.mv( path.resolve( realPath, name, "public"), path.resolve( realPath, name, "Resources", "public", "dist") );
							shell.cp('-Rf', path.resolve( realPath, name, "public") , path.resolve( realPath, name, "Resources", "public", "dist"));
							this.installBundle(name, Path);
							this.terminate(code);
						}catch(e){
							throw e;
						}
					});
					process.stdin.pipe(eject.stdin) ;
				});
				process.stdin.pipe(create.stdin) ;

			}catch(e){
				this.logger(e, "ERROR");
				this.terminate(1);
			}
		}

		generateAngularBundle (name, Path){
			this.logger("GENERATE Angular Bundle : " + name +" LOCATION : " +  path.resolve(Path));
			var ng = process.cwd()+'/node_modules/.bin/ng' ;
			var realPath = path.resolve( this.kernel.rootDir ,  path.resolve(Path)  );
			var cwd = path.resolve( "/", "tmp") ;
			process.env.NODE_ENV = "development";
			var realName = null ;
			var res = regBundle.exec(name);
			if ( res ){
				realName = res[1] ;
			}else{
				throw new Error("Bad bundle name");
			}
			var args = null ;
			try {
					//args = ['new', '-v', '-sg','--routing', name] ;
					args = ['new', '-v', '-sg', name] ;
					this.logger ("install angular cli : ng "+ args.join(" ") );
					this.spawn(ng, args, {
						cwd:cwd,
					}, ( code ) => {
						if ( code === 1 ){
							throw new Error ("install angular cli  ng new error : " +code);
						}
						args = ['generate', 'module', '--spec', '--routing', '-m', 'app', realName ];
						this.logger (" Generate Angular module : ng " + args.join(" ") );
						this.spawn(ng, args, {
							cwd: path.resolve( cwd, name)
						}, ( code ) => {
							if ( code === 1 ){
								throw new Error ("ng generate module error code : " +code);
							}
							args = ["eject", "--environment", "dev", "-dev"] ;
							this.logger (" eject  webpack config angular : ng " + args.join(" "));
							this.spawn(ng, args, {
								cwd: path.resolve( cwd, name)
							} ,(code) => {
								if ( code === 1 ){
									throw new Error ("ng eject error : " +code);
								}
								shell.mv( cwd+"/"+name, realPath+"/");
								this.logger (" npm install ");
								this.spawn("npm", ["install"], {
									cwd:path.resolve( realPath, name)
								} , (code) => {
									if ( code === 1 ){
										throw new Error ("nmp install error : " +code);
									}
									try {
										var file = new nodefony.fileClass(Path);
										angularBundle.call(this, file, name, "yml", path.resolve(Path), true);
										this.installBundle(name, Path);
										this.terminate(code);
									}catch(e){
										throw e;
									}
								});
							});
						});
					});
			}catch(e){
				this.logger(e, "ERROR");
				this.terminate(1);
			}
		}

		generateController ( name, Path){
			this.logger("GENERATE controller : " + name +" BUNDLE LOCATION : " + Path);
			try {
				var file = new nodefony.fileClass(Path);
				return controllers.call(this, file, name, "yml");
			}catch (e){
				this.logger(e, "ERROR");
				throw e ;
			}
		}

		generateCommand (name, Path){
			this.logger("GENERATE Command : " + name +" LOCATION : " + Path+"Command");
			try {
				var file = new nodefony.fileClass( Path);
				return commands.call(this, file, name);
			}catch (e){
				this.logger(e, "ERROR");
				throw e ;
			}
		}

		generateService (){

		}
	};

	return {
		name:"generate",
		commands:{
			bundle:["generate:bundle nameBundle path" ,"Generate a nodefony Bundle  Example : ./console generate:bundle myBundle ./src/bundles"],
			bundleAngular:["generate:bundle:angular nameBundle path" ,"Generate a Angular Bundle  Example : ./console generate:bundle:angular myBundle ./src/bundles"],
			bundleReact:["generate:bundle:react nameBundle path" ,"Generate a React Bundle Example : ./console generate:bundle:react myBundle ./src/bundles"],
			controller:["generate:controller  nameController bundlePath" ,"Generate a controller Example : ./console generate:controller myController ./src/bundles/myBundle"],
			command:["generate:command nameCommand path" ,"Generate a command js file in bundle path"],
			//service:["generate:service nameService path" ,"Generate a service js file in bundle path"]
		},
		worker:generate
	};
});
