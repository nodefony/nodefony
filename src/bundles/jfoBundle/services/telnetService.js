const telnetClient = require('telnet-client');
const shortid = require("shortid");
module.exports = nodefony.registerService("telnet", function(){


	const connectionTelnet = class connectionTelnet extends nodefony.Service{

		constructor(kernel){
			super("Telnet Connection" , kernel.container);
			this.id = this.generateID();
			this.connection = this.createConnection() ;
			this.prompt = null ;
			this.stream =null;
		}


		createConnection(){
			try {
				return  new telnetClient();
			}catch(e){
				throw e ;
			}
		}

		generateID(){
			return shortid.generate();
		}

		connect(opt){
			if ( this.connection){

				return new Promise( (resolve, reject) => {

					this.connection.on("timeout" , (error) =>{
						this.logger("TIMEOUT connection : " + JSON.stringify(opt), "WARNING");
						this.destroy();
						return reject("timout")
					});

					this.connection.on("error" , (error) =>{
						this.logger(error, "ERROR");
						this.destroy();
						return reject(error);
					});

					this.connection.on("writedone" , () =>{
						//this.logger(error, "DEGUG");
						//this.logger("writedone", "INFO");
					});

					this.connection.on("failedlogin" , (error) =>{
						this.logger(error, "ERROR");
						this.destroy();
						return reject(error);
					});

					this.connection.on("close" , () =>{
						this.logger("close", "INFO");
					});

					this.connection.on("connect" , () =>{
						this.logger("connect : " + opt.host +" "+opt.port, "INFO");
					});

					this.connection.on("ready" , (prompt) =>{
						this.logger(" Telnet Ready : " + prompt + " " , "INFO");
						//console.log(connection);
						this.prompt = prompt ;
						return resolve( this) ;
					});
					return this.connection.connect(opt)
					.catch( (error) =>{
						this.logger(error, "ERROR");
						
						this.destroy();
					    return reject(error);
					});
				})
			}
			throw new Error("TELNET connection not create !!");
		}

		createStream(callback){
			return this.connection.shell( (error, stream) =>{
				if ( error ){
					return callback(error, null, null);
				}
				this.stream = stream ; 
				return callback(error, stream);
			})
		}

		sendStream(id, value){
			if ( this.streams[id] ){
				setTimeout( () => this.streams[id].write(value), 100 ) ;	
			}
		}

		exec(cmd){
			return this.connection.exec(cmd)
			  .then((res) => {
			    return res ;
			  }).catch((error) =>{
			  	this.logger(error, "ERROR", "exec "+cmd);
			  });
		}

		close(){
			if ( this.connection ){
				this.logger("close  connection id :" +this.id, "INFO");
				return this.connection.end();
			}
			throw new Error("TELNET close connection no connection found  !!")
		}

		destroy(){
			this.logger("destroy  connection id :" +this.id, "INFO");
			if ( this.connection ){
				return this.connection.destroy();
			}
			throw new Error("TELNET destroy connection no connection found  !!")
		}
		

	}


	const telnet = class telnet extends nodefony.Service {

		constructor(container, kernel){
			super("TELNET", container, container.get("notificationsCenter") );
			
			this.connections ={};
			this.streams ={};

		}


		myConnect(opt){

			let conn = new connectionTelnet(this.kernel);
			this.connections[conn.id] = conn;
			
			if ( opt ){ 
				return conn.connect(opt).then((connect) =>{
					connect.connection.on("close" , () =>{
						delete this.connections[conn.id] ;
					});
					connect.connection.on("timeout" , () =>{
						delete this.connections[conn.id] ;
					});
					connect.connection.on("error" , () =>{
						delete this.connections[conn.id] ;
					});
					return connect ;
				}); 
			}else{
				return conn ;
			}
		}

		getConnection(id){
			if ( this.connections[id] ){
				return this.connections[id];
			}
			return null ;
		}


		connect(opt){

			return new Promise( (resolve, reject) =>{

				let connectionId = shortid.generate();
				let connection = new telnetClient();
				
				connection.on("timeout" , (error) =>{
					this.logger("TIMEOUT connection : " + JSON.stringify(opt), "WARNING");
					connection.end()
					connection.destroy();
					return reject("timout")
				});

				connection.on("error" , (error) =>{
					this.logger(error, "ERROR");
					connection.end()
					connection.destroy();
					return reject(error);
				});

				connection.on("writedone" , () =>{
					this.logger("writedone", "INFO");
				});

				connection.on("failedlogin" , (error) =>{
					this.logger("failedlogin", "ERROR");
					connection.end()
					connection.destroy();
					return reject(error);
				});

				connection.on("close" , (error) =>{
					this.logger("close", "INFO");
				});

				connection.on("connect" , () =>{
					this.logger("connect : " + opt.host +" "+opt.port, "INFO");
					this.connections[connectionId] = connection ;
				});

				connection.on("ready" , (prompt) =>{
					this.logger(" Telnet Ready : " + prompt + " " , "INFO");
					//console.log(connection);
					resolve( {prompt:prompt,connection:connection } ) ;
				});

				return connection.connect(opt)
				.catch( (error) =>{
					this.logger(error, "ERROR");
					connection.end()
					connection.destroy();
				    return reject(error);
				});
				
			});
		}

		exec(cmd, connection){
			return connection.exec(cmd)
			  .then((res) => {
			    return res ;
			    this.logger(res);
			  }).catch((error) =>{
			  	this.logger(error, "ERROR", "exec "+cmd);
			  });
		}

		realtime(){

		}

	};


	return telnet ;
});