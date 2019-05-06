module.exports = nodefony.registerController("devices", function(){





	const devicesController = class devicesController extends nodefony.controller {

			constructor (container, context){
				super(container, context);
				this.telnet = this.get("telnet");
				this.sessionsTelnet = this.kernel.getBundle("jfo").settings.sessions_telnet ;
			}

			raspiAction (id) {
				let data  = {
					devices:null,
					type:null
				} ;
				return this.getORM().getEntity("devices").findAll({
					where: {
    					id: id
  					},
  					include: {
      					model: this.getORM().getEntity("deviceType")		
    				}
  				})
  				.then((result) =>{
  					
  					data.devices = result[0] ;
					return result ;
				})
				.then( (result) => {
					return this.render('jfoBundle:raspi:raspi.html.twig', {
						device:data.devices,
						json:JSON.stringify(data.devices)
					});
				} );
			}


			parseMonitoring(data, connection){
				//console.log(connection.prompt )
				let tab = data.toString().split("\n\r");
				//console.log(data.toString());
				let res = [] ;
				let port = null ;
				let last = false ;
				for ( let i = 0 ; i < tab.length ;i++ ){
					switch( true ){
						case new RegExp("^TCP Port").test(tab[i]) :
							if ( port !== null ){
								if ( last ) {
									res.push(port);
									port = {} ;
									last = false ;
								}else{
									this.logger("BAD PARSE","WARNING");
								}
							}else{
								port = {} ;
							}
							let myPort = new RegExp("^TCP Port (.*)$").exec(tab[i]);
							if ( myPort ){
								port.port = myPort[1].replace(/\s/,""); ;
							}
						break;
						case new RegExp("^  timeout").test(tab[i]) :
							let timeout = tab[i].split(":");
							if ( port && timeout[1] ){ 
								port.timeout = timeout[1].replace(/\s/,"");
							}
						break;
						case new RegExp("^  enable state").test(tab[i]) :
							let enable =  tab[i].split(":");
							if ( port && enable[1] ){ 
								port.enable = enable[1].replace(/\s/,"");
							}
						break;
						case new RegExp("^  device").test(tab[i]) :
							let device = tab[i].split(":");
							if ( port && device[1] ){ 
								port.device = device[1].replace(/\s/,"");
							}
						break;
						case new RegExp("^  device controls").test(tab[i]) :
							let controls = tab[i].split(":");
							if ( port && controls[1] ){
								port.controls = controls[1].replace(/\s/,"");
							}
						break;
						case new RegExp("^  tcp to device state").test(tab[i]) :
							let device_state = tab[i].split(":");
							if ( port && device_state[1] ){
								port.device_state = device_state[1].replace(/\s/,"");
							}
						break;
						case new RegExp("^  device to tcp state").test(tab[i]) :
							let deviceTotcp = tab[i].split(":");
							if ( port && deviceTotcp[1] ){
								port.deviceTotcp = deviceTotcp[1].replace(/\s/,"");
							}
						break;
						case new RegExp("^  bytes read from TCP").test(tab[i]) :
							let byteReadFromTcp = tab[i].split(":");
							if ( port && byteReadFromTcp[1] ){
								port.byteReadFromTcp = byteReadFromTcp[1].replace(/\s/,"");
							}
						break;
						case new RegExp("^  bytes written to TCP").test(tab[i]) :
							let byteWriteToTcp = tab[i].split(":");
							if ( port && byteWriteToTcp[1] ){
								port.byteWriteToTcp = byteWriteToTcp[1].replace(/\s/,"");
							}
						break;
						case new RegExp("^  bytes read from device").test(tab[i]) :
							let byteReadFromDevice = tab[i].split(":");
							if ( port && byteReadFromDevice[1] ){
								port.byteReadFromDevice = byteReadFromDevice[1].replace(/\s/,"");
							}
						break;
						case new RegExp("^  bytes written to device").test(tab[i]) :
							let byteWriteToDevice = tab[i].split(":");
							if ( port && byteWriteToDevice[1] ){
								port.byteWriteToDevice = byteWriteToDevice[1].replace(/\s/,"");
							}
							last = true ;
						break;
						case new RegExp("^  connected to").test(tab[i]) :
							let connectedTo = tab[i].split(":");
							if ( port && connectedTo[1] ){
								port.connectedTo = connectedTo[1].replace(/\s/,"");
							}
						break;
					}
				}
				return res ;
			}


			monitoringAction(id, message){
				switch ( this.getMethod() ){
					case "WEBSOCKET" :

						if ( message ){
							let data = null ;
							try {
								data = JSON.parse(message.utf8Data);
							}catch(e){
								this.logger(e,"ERROR")
								//throw e;
							}
							if (data.connection)	{

								let conn = this.telnet.getConnection(data.connection);
								if (conn){
									if ( data.cmd ){
										let str = data.cmd ;
										setTimeout( () => conn.stream.write(str+"\n"), 100 ) ;
									}
								}else{
									this.logger(message.utf8Data.toString() , "WARNING","DROP MESSAGE");
								}
							}
						}else{
							return this.getORM().getEntity("devices").findAll({where: {
				    				id: id
				  				}}).then((result) =>{
				  					let sessionTelnet = null ;
				  					try {
				  						sessionTelnet = JSON.parse(result[0].telnet);
				  					}catch(e){
				  						throw e ;
				  					}
				  					
									this.telnet.myConnect(sessionTelnet.monitoring).then( (connect) => {
									
										this.renderJsonAsync({
											prompt:connect.prompt,
											connection:connect.id
										}) ;

										this.context.listen(this, 'onClose', () =>{
											connect.close();
										});
										
										// stream shell
										return connect.createStream(  (error, stream)  =>{
											
											if( error ){
												throw error ;
											}
											// handshake
											this.renderJsonAsync({
												prompt:connect.prompt,
												connection:connect.id
											}) ;
											stream.on("data" , (data) =>{
												//console.log(data.toString());
												let result = this.parseMonitoring(data, connect);
												//console.log(result.length);
												if ( result.length ){
													this.renderJsonAsync({
														prompt:connect.prompt,
														connection:connect.id,
														data:result
													}) ;
												}	
											});
											
											setInterval( () => {
												if ( stream && stream.writable){
													stream.write("showport");
													stream.write("0d00","hex");
												}
											}, 3000);
										});

									}).catch( (e) =>{
										throw e ;
									});
								});
							}
					break;
					default:
						throw new Error("Method "+this.getMethod() +" not allowed for this route");
				}
			}

			streamAction(id, message){
				switch ( this.getMethod() ){
					case "WEBSOCKET" :
						
						if ( message ){
							let data = null ;
							try {
								data = JSON.parse(message.utf8Data);
							}catch(e){
								this.logger(e,"ERROR")
								//throw e;
							}
							if (data.connection)	{

								let conn = this.telnet.getConnection(data.connection);
								if (conn){
									if ( data.cmd ){
										let str = data.cmd ;
										if (conn.stream && conn.stream.writable ){
											setTimeout( () => conn.stream.write(str+"\n"), 100 ) ;
										}
									}
								}else{
									this.logger(message.utf8Data.toString() , "WARNING","DROP MESSAGE");
								}
							}
						}else{

							return this.getORM().getEntity("devices").findAll({where: {
			    				id: id
			  				}}).then((result) =>{
			  					let sessionTelnet = null ;
			  					try {
			  						sessionTelnet = JSON.parse(result[0].telnet);
			  					}catch(e){
			  						throw e ;
			  					}
			  					//console.log(sessionTelnet)
								this.telnet.myConnect(sessionTelnet.default).then( (connect) => {
								
									this.renderJsonAsync({
										prompt:connect.prompt,
										connection:connect.id
									}) ;

									this.context.listen(this, 'onClose', () =>{
										connect.close();
									});
									
									// stream shell
									return connect.createStream(  (error, stream)  =>{
										
										if( error ){
											throw error ;
										}
										// handshake
										this.renderJsonAsync({
											prompt:connect.prompt,
											connection:connect.id
										}) ;
										stream.on("data" , (data) =>{
											
											this.renderJsonAsync({
												prompt:connect.prompt,
												connection:connect.id,
												data:data.toString()
											}) ;
											
										});
										/*let i = 0 ;
										setInterval( () => {
											if (stream && stream.writable){
												if (i % 2){
													stream.write("uptime\n");
												}else{
													stream.write("netstat -laputen\n");
												}
												i++;
											}
										}, 10000);*/
									});

								}).catch( (e) =>{
									throw e ;
								});
							});
						}
					break;
					default:
						throw new Error("Method "+this.getMethod() +" not allowed for this route");
				}
			}
	}

	return devicesController ;
});

