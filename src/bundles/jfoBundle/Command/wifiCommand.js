	module.exports = nodefony.registerCommand("wifi",function(){


		const wifi = class router extends nodefony.cliKernel {

			constructor(container, command, options ){

				super( "WIFI", container, container.get("notificationsCenter"), options );

				this.wifi = this.container.get("router");
				let cmd = command[0].split(":");
				let args = command[1] ;
				this.serviceWifi  = this.get("wifi");
				switch ( cmd[1] ){
					case "test" :
						switch ( cmd[2] ){
							case "box":
									
		            				this.serviceWifi.ipLink()
		        					.then((result) =>{
		        						console.log(result);
		        						this.logger(JSON.stringify(result) );
		        					});

							break;
							default:
								this.showHelp();
						}
					break;
					default:
						this.showHelp();
				}
			}

			logger(pci, severity, msgid,  msg){
	      			try {
	        			if (! msgid) { msgid = "JFO " + this.name + " "; }
	        			return super.logger(pci, severity, msgid,  msg);
	      			}catch(e){
	        			console.log(pci);
	      			}
	    		}

			wifiSimpleTest (text){
				return new Promise ( (resolve, reject) => {
					this.logger(text, "WARNING");
					let args = ['-l'] ;
					this.spawn("ls" ,args, {},(code) =>{
						if (code === 1){
							reject(code)
						}
						resolve();
					})
				}).catch((e) =>{
					return reject(e);
				})
			}

			displayTable (titre, ele, firstMatch){
				var head = [
					"NB",
					"ROUTE",
					"PATH",
					//"VARIABLES",
					//"HOST",
					"BUNDLE",
					"CONTROLLER",
					"ACTION"
					//"OPTIONS"
					//"SCHEMES",
					//"PATTERN",
				];
				if ( firstMatch ){
					head.push("FIRST MATCH")
				}
				var table = super.displayTable(null ,{
					head:head
				})
				for (var i=0 ; i < ele.length ;i++){
					var detail =  ele[i].defaults.controller.split(":");
					var tab = [
						i+1,
						ele[i].name,
						ele[i].path,
						//ele[i].variables,
						//ele[i].host|| "",
						detail[0],
						detail[1],
						detail[2]
						//util.inspect( ele[i].options)
						//ele[i].schemes|| "",
						//ele[i].pattern,
					];
					if ( firstMatch ){
						tab.push( ele[i].firstMatch)
					}
					table.push(tab);
				}
				console.log(table.toString());
				return table;
			}
			
		};

		return {
			name:"wifi",
			commands:{
				routes:["wifi:test:box" ,"simple Test WIFI"]
			},
			cli:wifi
		};
	});

