
var net = require('net');
var dgram = require('dgram');
var xml = require('xml2js');
var shortId = require('shortid');

nodefony.registerService("realTime", function(){

	/*
	 *
	 *	CLASS CONNECTION
	 *
	 */
	var Connections = class Connections {

		constructor(){
			this.connections = {};
		}

		generateId (){
			return shortId.generate();
		}

		getClientId (client){
			return client.idClient ;
		}

		getConnectionId (client){
			return client.idConnection ;
		}

		setConnection (connection, obj){
			var id  = this.generateId() ;
			connection.id = id ;
			this.connections[id] =  {
				id:id,
				remote:obj,
				context:connection,
				mustClose:false,
				clients:{}
			} ;
			return id;
		}

		getConnection (client){
			var id  = this.getConnectionId(client);
			return 	this.connections[id];
		}

		removeConnection (id){
			if (this.connections[id]) {
				delete this.connections[id]
				return true ;
			}
			return false ;
		}

		setClient (idConnection, client){
			if (this.connections[idConnection] ){
				var idClient  = this.generateId() ;
				client.idClient = idClient ;
				client.idConnection = idConnection ;
				this.connections[idConnection]["clients"][idClient] = client;
				return idClient;
			}else{
				throw idConnection ;
			}
		}

		getClient (clientId){
			for (var connection in this.connections){
				for (var client in this.connections[connection].clients ){
					if ( client === clientId ){
						return this.connections[connection].clients[client];
					}
				}	
			}
			return null;
		}

		removeClient (client){
			var idConnection = this.getConnectionId(client);
			var idClient = this.getClientId(client)
			if (idConnection && idClient){
				if ( this.connections[idConnection] ){
					delete this.connections[idConnection]["clients"][idClient]	;
					return idClient;
				}
			}
			return false ;
		}

		removeAllClientConnection (){
			for (var ele in this.connections ){
			
			}
		}
	};

	/**
	 *	The class is a **`realTime` SERVICE** .
	 *	@module NODEFONY 
	 *	@main NODEFONY
	 *	@class realTime
	 *	@constructor
	 *	
	 */
	var settingsSyslog = {
		moduleName:"REALTIME",
		defaultSeverity:"INFO"
	};
 
	var cleanConnection = function(cliendID, disconnect, context){
		try {
			if ( this.connections.connections[cliendID] ){
				var connectionID = this.connections.connections[cliendID].id ; 
				if ( ! connectionID){
					return ;
				}
			}else{
				return ;
			}
			if ( disconnect ){
				this.connections.connections[connectionID].disconnect = disconnect ;
				this.connections.connections[connectionID].context = context ;
			}
			var pass = false ;
			for (var cli in this.connections.connections[connectionID].clients){
				pass = true;
				if ( this.connections.connections[connectionID].clients[cli].end )
					this.connections.connections[connectionID].clients[cli].end();
				if ( this.connections.connections[connectionID].clients[cli].close )
					this.connections.connections[connectionID].clients[cli].close();
			}
			if ( pass ){
				this.connections.connections[connectionID].mustClose = true ;
			}else{
				this.connections.removeConnection(connectionID);	
				this.logger("REMOVE ID connection : "+connectionID, "INFO");	
			}
		}catch(e){
			this.logger(e,"ERROR")
		}	
	};

	
	var realTime = class realTime extends nodefony.syslog {

		constructor( container, kernel ){
			super(settingsSyslog);
			this.kernel = kernel;
			this.container = container ;
			this.version = "1.0";
			this.connections = new Connections();
			this.services = {};
			this.initSyslog();
			this.protocol = new nodefony.io.protocol.bayeux();
			this.listen(this, "onError", this.onError );
			//this.listen(this, "onMessage", this.onMessage );
			this.kernel.listen(this, "onReady", () => {
				this.settings = this.container.getParameters("bundles.realTime");
				for (var services in this.settings.services){
					this.registerService(services, this.settings.services[services])
				}
			});

		}

		registerService (name, definition){
			this.services[name] = definition;
			return 	this.services[name];
		}

		initSyslog (){
			this.listenWithConditions(this,{
				severity:{
					data:"CRITIC,ERROR,DEBUG,INFO"
				}		
			},function(pdu){
				this.kernel.logger(pdu);
			});
		};

		logger (pci, severity, msgid,  msg){
			if (! msgid) msgid = "SERVICE REALTIME";
			return super.logger(pci, severity, msgid,  msg)
		}

		getServices (){
			return this.services ;
		}
		
		onHandshake (message, connectionId, ipClient){
			var advice = this.settings.system.reconnect.handshake ;
			var response = this.protocol.handshakeResponse(message, advice,{address:ipClient}) ;
			response.clientId = connectionId;
			response.successful = true ;
			return this.protocol.send(response) ;
		}

		onSubscribe (message, data, context){ 
			var name = message.subscription.split("/")[2] ;
			var serv = this.services[name] ;
			if (!serv ){
				message.error = this.protocol.errorResponse(404, message.subscription, "Unknown Channel" ) ;
				return this.send( context , this.protocol.send( message ));
			}
			switch (serv.type){
				case "TCP" :
				case "tcp" :
					try {
						var client = new net.Socket({
							allowHalfOpen : true,
							//highWaterMark:16384*2
							highWaterMark:1024*64,
							//readable: true,
							//writable: true
						});

						/*client.on("readable",function(){
							console.log( client);
							var chunk;
							console.log("-------------")
							console.log(client._readableState.buffer)
							console.log(client.bytesRead);
							while (null !== (chunk = client.read())) {
								console.log(chunk.toString());
								this.send( context , this.protocol.publishMessage( message.subscription, chunk.toString(), message.clientId ) );
							}
							//client.read(0)
							console.log("-------------")
						}.bind(this));*/


						//console.log(client)	
						client.connect(serv.port, serv.domain , () => {
							try {
								if (data){
									client.write(data);
								}
								var id = this.connections.setClient(message.clientId, client);
								message.successful = true ;
								//message.data = id;
								message.clientId = id ;
								//console.log(client)
								this.logger("SUBCRIBE SERVICE TCP : " + name +" ID = "+id, "INFO");	
							}catch(e){
								if (id){
									this.connections.removeClient(client);	
								}
								message.successful = false ;
								this.logger("SUBCRIBE SERVICE TCP: " + name +" ID = "+id + " "+e,"ERROR");	
							}
							this.send(context, this.protocol.send( message ) );
						})	

						client.on("data", (buffer) => {
							//console.log(buffer)
							//this.logger(buffer.length, "INFO")
							//console.log("--------")
							//console.log(buffer.length)
							//console.log(buffer.toString())
							// ENCAPSULATION buffer in bayeux data
							//console.log(buffer.toString())
							this.send( context , this.protocol.publishMessage( message.subscription, buffer.toString(), message.clientId ) );
							//client.push("");
						});


						/*client.on("timeout",function(buffer){
							console.log("PASS event timeout")
						});*/


						client.on("end", () => {
							message.channel =  "/meta/unsubscribe" ;
							//message.data = error ;
							message.subscription = "/service/"+name;
							message.successful = true ;
							this.onUnSubscribe(message, null, context);
							this.send(context, this.protocol.send( message )  );
						});

						client.on("error", (error) => {
							//FIXME other error socket
							switch (error.code){
								case "ECONNREFUSED" :
									//this.send( context ,this.protocol.errorResponse(403, message.clientId+","+message.channel,error.errno ) );
									var res = this.protocol.subscribeResponse(message);
									res.error = this.protocol.errorResponse(403, message.clientId+","+message.channel,error.errno ) ;
									res.successful = false ;
									this.send(context, this.protocol.send( res ));
								break;
								case "ETIMEDOUT" :
									var res = this.protocol.subscribeResponse(message);
									res.error = this.protocol.errorResponse(408, message.clientId+","+message.channel,error.errno ) ;
									res.successful = false ;
									this.send(context, this.protocol.send( res ));
								break;
							}
							//console.log(error);
							this.logger("ERROR SERVER DOMAIN : "+serv.domain+" SERVER PORT : "+serv.port+" SERVICE : " + name + " " + error, "ERROR");
						});

						client.on("close", (error) => {
							//console.log("close client");
							if (error){
								this.logger("CANNOT CONNECT SERVICE : " + name , "ERROR");
								client.destroy();
								client = null ;
								throw error ;
							}else{
								var connection = this.connections.getConnection(client);
								if (connection && connection.mustClose){
									var size = Object.keys(connection.clients).length ;
								}
								var id = this.connections.removeClient(client);
								this.logger("UNSUBCRIBE SERVICE : " + name +" ID = "+id, "INFO");
								if (connection && connection.mustClose){
									//console.log("SIZE clients struck :" + size)
									if ( size === 1 ){
										if (connection.disconnect){
											//console.log(connection.disconnect)
											this.send( connection.context, connection.disconnect );
										}
										this.connections.removeConnection(connection.id);	
										this.logger("REMOVE ID connection : "+connection.id, "INFO");	
									}
								}
							}
							client.destroy();
							client = null ;
						});

					}catch(e){
						//FIXME
						//this.send( context ,this.protocol.errorResponse(403, message.clientId+","+message.channel,error.errno ) );
					}
				break;
				case "socket" :
				break;
				case "UDP" :
				case "udp" :
					var client = dgram.createSocket({
						type:'udp4',
						reuseAddr:true
					});

					client.write = function(message, callback){
						this.send(message, 0, message.length ,serv.port, serv.domain, callback ) ;	
					}.bind(client);

					client.bind({
						//port:8000,
						address:this.kernel.domain,
						exclusive:true
					})

					client.on("listening",  () => {
						var address = client.address();
							
						var id = this.connections.setClient(message.clientId, client);
						message.successful = true ;
						//message.data = id;
						message.clientId = id ;
						//console.log(client)
						this.logger("SUBCRIBE SERVICE "+ name+" UDP LISTEN ON : " + address.address + ":" + address.port +" ID = "+id, "INFO");

						if (data){
							client.write(data, function(error){
								if (error){
								
								}
								console.log("SEND")
							});
						}
						this.send(context, this.protocol.send( message ) );

					});
					
									
					// Listen for messages from client
					client.on('message',  (buffer, rinfo) => {
						console.log("MESSAGE UDP")
						this.send( context , this.protocol.publishMessage( message.subscription, buffer.toString(), message.clientId ) );
					});

					client.on("close", (error) => { 
						console.log("CLOSE UDP") 
						//console.log("close client");
						if (error){
							this.logger("CANNOT CONNECT SERVICE : " + name , "ERROR");
							//client.destroy();
							client = null ;
							throw error ;
						}else{
							var connection = this.connections.getConnection(client);
							if (connection && connection.mustClose){
								var size = Object.keys(connection.clients).length ;
							}
							var id = this.connections.removeClient(client);
							this.logger("UNSUBCRIBE SERVICE : " + name +" ID = "+id, "INFO");
							if (connection && connection.mustClose){
								//console.log("SIZE clients struck :" + size)
								if ( size === 1 ){
									if (connection.disconnect){
										//console.log(connection.disconnect)
										this.send( connection.context, connection.disconnect );
									}
									this.connections.removeConnection(connection.id);	
									this.logger("REMOVE ID connection : "+connection.id, "INFO");	
								}
							}
						}
						//client.destroy();
						client = null ;
					}); 

					client.on("error",  (error) => { 
						//FIXME other error socket
						switch (error.code){
							case "ECONNREFUSED" :
								//this.send( context ,this.protocol.errorResponse(403, message.clientId+","+message.channel,error.errno ) );
								var res = this.protocol.subscribeResponse(message);
								res.error = this.protocol.errorResponse(403, message.clientId+","+message.channel,error.errno ) ;
								res.successful = false ;
								this.send(context, this.protocol.send( res ));
							break;
							case "ETIMEDOUT" :
								var res = this.protocol.subscribeResponse(message);
								res.error = this.protocol.errorResponse(408, message.clientId+","+message.channel,error.errno ) ;
								res.successful = false ;
								this.send(context, this.protocol.send( res ));
							break;
						}
						//console.log(error);
						this.logger("ERROR SERVER DOMAIN : "+serv.domain+" SERVER PORT : "+serv.port+" SERVICE : " + name + " " + error, "ERROR");
					})

				break ;
				case "spawn" :
					var spawn = require('child_process').spawn ;
				break;
				default:
					message.error = this.protocol.errorResponse(500, message.clientId+","+message.channel,"bad connection Type "+serv.type );
					return this.send( context ,this.protocol.send(message) );
			}
			return client;
		}

		onUnSubscribe (message, data, context, error){
			try{
				var name = message.subscription.split("/")[2] ;
				var serv = this.services[name] ;
				switch (serv.type){
					case "tcp" :
						var client = this.connections.getClient(message.clientId);
						if ( client ){
							client.end(data);
							//this.send(context, this.protocol.send( message )  );
						}
					break;
					default:
				}
			}catch(e){
				this.logger("UNSUBCRIBE  : "+ e , "ERROR");	
			}
		}

		onConnect (message, ipClient){
			var advice = this.settings.system.reconnect.connect ;
			var response = this.protocol.connectResponse(message, advice, {address:ipClient});
			response.data = this.getServices();
			return  this.protocol.send(response) ;	
		}

		onDisconnect (message, context){
			var response = this.protocol.disconnectResponse(message);
			cleanConnection.call(this, message.clientId, this.protocol.send(response) , context );
			//return this.protocol.send(response);
			//return this.send( context, this.protocol.send(response) );	
		}

		onPublish (message){
			var client = this.connections.getClient(message.clientId);
			if (client){
				if (message.data){
					try {
						client.write(message.data);
						return this.protocol.publishResponse(message.subscription, message.id );
					}catch (e){					
						return this.protocol.publishResponse(message.subscription, message.id, false );
					}
				}else{
					var error = this.protocol.errorResponse(500, message.subscription+","+message.id, "no message " );	
					return this.protocol.publishResponse(message.subscription, message.id, error );
				}
			}else{
				var error = this.protocol.errorResponse(404, message.subscription+","+message.id, "Unknown Channel" );
				return this.protocol.publishResponse(message.subscription, message.id, error );
			}	
		}

		onError ( error, connection){
			return this.send(connection, this.protocol.close( error) );
		}

		handleConnection (message, context){
			switch(context.type){
				case "WEBSOCKET":
				case "WEBSOCKET SECURE":
					return this.onMessage(message, context);
				break;
				case "HTTP":
				case "HTTPS":
					return this.onMessage(message, context);
			}
		}	
		
		onMessage (message, context ){
			switch (nodefony.typeOf(message) ) {
				case "string" :
 			       	var ret = null ;	
			        	try {
						this.protocol.parser(message, (err, mess) => {
							if (err){
								message.error = this.protocol.errorResponse(500, message.clientId+","+message.channel,"bad Request  "+ message) ;
								ret = this.send( context , this.protocol.send(message) );

								//throw err ;
								return ret;
							}
							ret = this.onMessage(mess, context) ;	
						});
					}catch(e){
						message.error = this.protocol.errorResponse(500, message.clientId+","+message.channel,"bad Request  "+ message) ;
						return this.send( context , this.protocol.send(message) );
					}
					return ret ;
				break;
				case "object" :
					try {
						switch(message.channel){
							case "/meta/handshake":
								//var remoteAddress = context.request.remoteAddress
								//var remoteAddress = context.request.domain
								var obj = {
									remoteAddress : context.remoteAddress || context.request.remoteAddress,
									host:url.parse(context.request.headers.host)	
								};
								//console.log(remoteAddress + " : " + context.request.domain)
								var connectionId = this.connections.setConnection(context, obj) ; 
								var res = this.onHandshake(message, connectionId, JSON.stringify(obj) ) ;
								
								this.logger("CONNECT ID connection  : "+ connectionId  , "INFO")
								return this.send( context, res )
							break;
							case "/meta/connect":
								var obj = {
									remoteAddress : context.remoteAddress,
									host:url.parse(context.request.origin)	
								};
								var connectionId = this.connections.setConnection(context, obj) ;
								cleanConnection.call(this, message.clientId);
							 	message.clientId = connectionId ;
								//var remoteAddress = context.request.remoteAddress ;
								//var remoteAddress = context.request.domain ;
								//console.log(context.request)
								context.notificationsCenter.listen(this,"onClose", (code, info) => {
									cleanConnection.call(this, message.clientId)
								});
								return this.send( context, this.onConnect(message, JSON.stringify(obj)) );
							break;
							case "/meta/disconnect":
								return this.onDisconnect(message, context);
								//return this.send( context, this.onDisconnect(message, context) );
							break;
							case "/meta/subscribe":
								return this.onSubscribe(this.protocol.subscribeResponse(message ), message.data, context );
							break;
							case "/meta/unsubscribe":
								return this.onUnSubscribe( this.protocol.unsubscribeResponse(message) ,message.data, context ); 
							break;
							default:
								// /some/channel
								return this.send( context , this.onPublish(message));
						}
					}catch(e){
						message.error = this.protocol.errorResponse(500, message.clientId+","+message.channel,"bad Request  "+ message) ;
						return this.send( context , this.protocol.send(message));	
					}
				break;
				case "array" :
					var tab = [];
					for (var i = 0 ; i< message.length ; i++){
						tab.push( this.onMessage(message[i]) , context );
					}
					return tab ;
				break;
				default :
					throw new Error ("BAYEUX message bad format ");
			}
		}

		send ( connection, message){
			//console.log("SEND :   "+ message)
			try {
				switch (connection.type){
					case "HTTP":
					case "HTTPS":
						connection.response.body = message ;
						connection.response.setHeader("Content-Type", "application/json");
						//return connection.response ;
					break;
					case "WEBSOCKET":
					case "WEBSOCKET SECURE":
						connection.send(message);
					break;
				}
				return connection.response ;
			}catch(e){
				this.logger(e,"ERROR")
			}
		}
	};

	return realTime;

});

