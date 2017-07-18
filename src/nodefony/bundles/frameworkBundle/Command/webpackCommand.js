/*
 *
 *
 *
 */
module.exports = nodefony.registerCommand("webpack",function(){


	var webpack = class webpack extends nodefony.cliKernel {

		constructor(container, command, options){

			super( "webpack", container, container.get("notificationsCenter"), options );

			this.config = this.container.getParameters("bundles.App");
			this.configKernel = this.container.getParameters("kernel");
			let cmd = command[0].split(":");
			switch ( cmd[1] ){
				case "dump" :
					try {
						this.webpackCompile();
					}catch(e){
						this.terminate(1);
						return ;
					}
				break;
				default:
					this.showHelp();
					this.terminate(0);
			}
		}

		webpackCompile (){
			this.listen( this, "onReady" , () => {
				for ( var bundle in this.kernel.bundles ){
					if ( this.kernel.bundles[bundle].webpackCompiler ||  this.kernel.bundles[bundle].webpackCompilerFile ){
						this.kernel.bundles[bundle].compileWebpack();
					}
				}
			});
		}
	};

	return {

		name:"webpack",
		commands:{
			dump:["webpack:dump" ,"Compile webpack for all bundles "]
		},
		cli:webpack
	};
});
