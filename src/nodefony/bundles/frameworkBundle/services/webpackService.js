/*
 *
 *
 *
 *
 *
 */
const webpack = require("webpack");
const webpackMerge = require('webpack-merge'); // used to merge webpack configs
const ExtractTextPluginCss = require('extract-text-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');

module.exports = nodefony.registerService("webpack", function(){

	var babelRule  = function(basename){
		return {
      		test: new RegExp("\.es6$"),
			exclude: new RegExp("node_modules"),
			use: [
				{
					loader: 'babel-loader',
					options: {
						presets: ['es2015']
					}
				}
			]
		};
	};

	var cssRule  = function(basename, production){
		return {
			test: new RegExp("\.css$"),
			use: ExtractTextPluginCss.extract({
				use: 'css-loader'
			})
		};
	};

	var sassRule  = function(basename){
		return {
        test: new RegExp(".scss$"),
        use: [
            {
                loader: 'style-loader'
            }, {
                loader: 'css-loader'
            }, {
                loader: 'sass-loader'
            }
        ]
    };
	};

	var lessRule  = function(basename){
		return {
			test: new RegExp("\.less$"),
			use: ExtractTextPluginCss.extract({
				use: [
					//'style-loader',
					//'css-loader' ,
					"raw-loader",
					{
						loader:	'less-loader',
						options: {
							//strictMath: true,
							//noIeCompat: true
						}
				}]
			})
		};
	};

	/*
 	 * File loader for supporting fonts, for example, in CSS files.
         */
	var fontsRule = function(basename){
		return {
			test: new RegExp("\.(eot|woff2?|svg|ttf)([\?]?.*)$"),
			use: 'file-loader?name=[name].[ext]&publicPath=/'+basename+'&outputPath=/assets/fonts/',
		};
        };

	/*
         * File loader for supporting images, for example, in CSS files.
         */
	var imagesRule = function(basename){
		return {
			test: new RegExp("\.(jpg|png|gif)$"),
  		use: 'file-loader?name=[name].[ext]&publicPath=/'+basename+'&outputPath=/assets/images/'
		};
        };

	var defaultConfig = function(name, Path){
		if ( Path ){
			var basename = path.basename(Path);
		}else{
			var basename ="assets";
		}
		var public = Path ? path.resolve( Path, "Resources", "public") : null;
		var devtool = this.production ? false : 'source-map' ;
		var rules = [babelRule(basename), cssRule(basename, this.production), fontsRule(basename), imagesRule(basename), sassRule(basename),  lessRule(basename)] ;
		var plugins = [];
		plugins.push( new ExtractTextPluginCss( {
			filename:"./assets/css/"+ name +".css",
		}));
		if ( this.production  && this.kernel.type !== "CONSOLE" ){
			plugins.push( this.getUglifyJsPlugin() );
			plugins.push( this.getOptimizeCssPlugin() );
		}
		return {
			// Configuration Object
			context:	public ,
			target:		"web",
			watch:		true,
			devtool:	devtool,
			output:		{
				path:	public
			},
			externals:	{},
			resolve:	{},
			module: {
				rules: rules
			},
			plugins: plugins
		};
	};

	//https://webpack.js.org/api/node/
	const webpackService = class webpackService extends nodefony.Service {

		constructor(container){
			super ("WEBPACK", container);
			this.production = ( this.kernel.environment === "prod" ) ?  true :  false ;
			this.defaultConfig = defaultConfig.call(this, "nodefony");
			this.pathCache = path.resolve(this.kernel.rootDir, "tmp", "webpack") ;
			this.host = this.kernel.hostHttps ;
			this.webpack = webpack ;
			this.version = this.getWebpackVersion()

			if ( this.production ){
				try {
					if ( ! fs.existsSync( this.pathCache ) ){
						fs.mkdirSync( this.pathCache );
					}
				}catch(e){
					this.logger(e.message, "WARNING");
				}
				if ( ! this.production ){
					this.kernel.listen(this, "onTerminate", () =>{
						var res = fs.readdirSync(this.pathCache);
						if ( res && res.length ){
							for ( var i = 0 ; i < res.length ; i++ ){
								fs.rmdirSync( path.resolve (this.pathCache ,res[i] ) );
							}
						}
					});
				}
			}
			this.sockjs =  this.get("sockjs") ;
		}

		getWebpackVersion (){
			return process.env["WEBPACK_VERSION"];
		}

		loggerStat (err, stats, bundle , watcher){
			if (err){
				throw err
			}
			const info = stats.toJson();
			var error = stats.hasErrors();
			if ( error ) {
				this.logger(info.errors ,"ERROR")
			}else{
				if (bundle){
					if ( watcher ){
						this.logger( "WATCHING BUNDLE : " + bundle,"INFO");
					}else{
						this.logger( "COMPILE BUNDLE : " + bundle,"INFO");
					}
				}
				if ( watcher ){
					this.logger( stats.toString({
  						// Add console colors
  						colors: true
					}), "INFO");
				}
				if (stats.hasWarnings()) {
					this.logger(info.warnings ,"WARNING")
				}
			}
		}

		loadConfigFile (file, bundle){
			try {
				if ( ! ( file instanceof nodefony.fileClass ) ){
					file = new nodefony.fileClass(file);
				}
			}catch(e){
				throw e ;
			}
			let Path = bundle.path ;
			let type = bundle.settings.type;
			let publicPath = bundle.publicPath;
			let config = null ;
			let basename = bundle.bundleName;
			let watch = null ;
			let compiler = null ;
			try {
				switch (type){
					case "angular" :
						publicPath = path.resolve("/", bundle.bundleName, "dist" );
						shell.cd(Path);
						config = require( file.path );
						config.output.path = path.resolve("Resources", "public", "dist") ;
						if ( publicPath ){
							config.output.publicPath = publicPath+"/" ;
						}else{
							config.output.publicPath =  "/"+path.basename(file.dirName)+"/dist/" ;
						}
						if ( ! this.production ){
							config.entry.main.unshift("webpack-dev-server/client?https://"+this.host+"/");
						}
					break;
					case "react" :
						publicPath = path.resolve("/", bundle.bundleName, "dist" );
						shell.cd(Path);
						config = require(file.path );
						config.output.path = path.resolve("Resources", "public", "dist") ;
						if ( publicPath ){
							config.output.publicPath = publicPath+"/" ;
						}else{
							config.output.publicPath =  "/"+path.basename(file.dirName)+"/dist/" ;
						}
					break;
					default :
						config = require( file.path );
				}

				compiler =  webpack( config );
				if ( this.kernel.type === "CONSOLE" ){
					return compiler ;
				}
			}catch(e){
				shell.cd(this.kernel.rootDir);
				throw e ;
			}
			// WATCH
			if ( config.watch === undefined ){
				watch = bundle.settings.watch ;
				config.watch = watch || false;
			}else{
				watch = config.watch ;
			}
			if ( this.production ){
				watch = false ;
			}else{
				if ( watch && this.sockjs && compiler ){
					this.sockjs.addCompiler(  compiler, basename);
				}
			}
			try {
				var idfile = basename+"_"+file.name ;
				if ( watch ){
					var watching = compiler.watch({
						/* watchOptions */
					}, (err, stats) => {
						if (! err ){
							this.logger( "RUN WEBPACK COMPILER : "+ basename +" COMPILE ENTRY POINT : \n" +this.displayConfigTable(config) );
						}
						this.loggerStat(err, stats, basename, true);
					});
					this.kernel.listen(this ,"onTerminate", ( ) => {
						watching.close(() => {
							this.logger("Watching Ended  " + config.context +" : "+util.inspect(config.entry) , "INFO");
						});
					});
				}else{
					if ( (this.kernel.environment === "dev" ) && (basename in this.kernel.bundlesCore) && ( ! this.kernel.isCore ) ){
						return compiler ;
					}
					//this.logger( "RUN WEBPACK COMPILER : "+ basename +" COMPILE ENTRY POINT : \n" +this.displayConfigTable(config) );
					this.runCompiler(compiler, idfile);
				}
			}catch(e){
				shell.cd(this.kernel.rootDir);
				throw e ;
			}
			shell.cd(this.kernel.rootDir);
			return compiler ;
		}

		loadConfig( config , Path ){

			var basename = path.basename(Path);
			var name = config.output ? config.output.library : "index" ;

			var myConf = webpackMerge( defaultConfig.call(this, name, Path), config ) ;

			if ( this.production ){
				myConf.watch = false ;
			}else{
				if ( nodefony.typeOf(myConf.entry) === "array"  ){
					myConf.entry.unshift("webpack-dev-server/client?https://"+this.host+"/");
				}
			}

			try {
				var compiler =  webpack( myConf );
				if ( this.kernel.type === "CONSOLE" ){
					return  compiler;
				}
			}catch(e){
				throw e ;
			}

			var sokjsCompiler = null ;
			if ( ! this.production && this.sockjs && compiler ) {
				sokjsCompiler = this.sockjs.addCompiler( compiler, basename );
			}

			if ( ! ( basename  in this.kernel.bundlesCore ) ){
				this.logger( "WEBPACK BUNDLE : " +  basename +" WATCHING : "+ myConf.watch );
			}

			if ( myConf.watch ){
				var watching = compiler.watch({
					/* watchOptions */
				}, (err, stats) => {
					if (! err ){
						this.logger( "WEBPACK BUNDLE : "+ basename +" WATCHING ENTRY POINT : \n" + util.inspect(myConf.entry) , "DEBUG" );
					}
					this.loggerStat(err, stats, basename, true);
				});
				this.kernel.listen(this ,"onTerminate", ( ) => {
					watching.close(() => {
						this.logger("Watching Ended  " + myConf.context +" : "+util.inspect(myConf.entry) , "INFO");
					});
				});
			}else{
				if ( (this.kernel.environment === "dev" ) && (basename in this.kernel.bundlesCore) && ( ! this.kernel.isCore ) ){
					return compiler ;
				}
				//this.logger( "WEBPACK BUNDLE : "+ basename +" COMPILE ENTRY POINT : \n" + util.inspect(myConf.entry)  );
				this.runCompiler(compiler, basename);
			}
			return compiler ;
		}

		runCompiler (compiler, bundle){
			try {
				if ( this.production && ( process.argv[2] && process.argv[2] !== "webpack:dump" ) ){
					var pathCache = path.resolve( this.pathCache, bundle );
					if ( fs.existsSync( pathCache ) ){
						return ;
					}
					try {
						fs.mkdirSync( pathCache );
					}catch(e){

					}
				}
				return compiler.run( (err, stats) => {
					this.logger( "RUN WEBPACK COMPILER : "+ bundle +" COMPILE ENTRY POINT : \n" +this.displayConfigTable(compiler.options) );
					this.loggerStat(err, stats,  bundle);
				});
			}catch(e){
				throw e ;
			}
		}

		displayConfigTable (config){
			let options = {
				head:[
					"ENTRY NAME [name]",
					"ENTRY",
					"OUTPUT FILE NAME",
					"OUTPUT LIBRARY NANE",
					"OUTPUT TARGET",
					"PUBLIC PATH",
					"WATCHER"
				]
			} ;
			let table = this.kernel.cli.displayTable(null, options);
			let data = [];
			try {
				for ( let ele in config.entry ){
					table.push([
						ele,
						config.entry[ele].toString(),
						config.output.filename ,
						config.output.library ,
						config.output.libraryTarget,
						config.output.path,
						config.watch
					]);
				}
				return table.toString() ;
			}catch(e){
				this.logger(e, "ERROR")
			}
		}

		getUglifyJsPlugin( config ){
			try {
				return new webpack.optimize.UglifyJsPlugin( nodefony.extend(true, {}, {
					minimize: this.production
				}, config) );
			}catch(e){
				throw e;
			}
		}

		getOptimizeCssPlugin( config ){
			try {
				return new OptimizeCssAssetsPlugin( nodefony.extend(true, {}, {
					cssProcessorOptions: { discardComments: {removeAll: true } },
					canPrint: true
    				}, config) );
			}catch(e){
				throw e;
			}
		}
		getProgressPlugin (handler){
			//function handler(percentage, msg) {/* ... */}
			return new webpack.ProgressPlugin(handler)

		}
	}

	return  webpackService ;
});
