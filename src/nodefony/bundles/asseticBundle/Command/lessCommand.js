/*
 *
 *
 *
 *
 *
 */

module.exports = nodefony.registerCommand("less",function(){


	var Less = class Less extends nodefony.cliKernel {

		constructor(container, command, options){

			super( "less", container , null, options);

			this.engine = require("less");
			var arg = command[0].split(":");

			switch ( arg[1] ){
				case "render" :
				break;
				default:
					this.logger(new Error(command[0] + " command error"),"ERROR");
					this.showHelp();
			}
		}
	};

	return {
		name:"less",
		commands:{
			//render:["less:render" ,"Less CSS compilateur "],
			//compile:["less:compile" ,"Less CSS compilateur "],
		},
		worker:Less
	};

});
