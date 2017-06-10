const Sockjs = require('sockjs');


nodefony.registerService("sockjs", function(){
	

	var sockCompiler = class sockServer extends nodefony.Service {

		constructor ( service , name, compiler ){
			super( name, service.container ,service.notificationsCenter   );

			this.service = service ;
			
			this.clientStats = {
				errorDetails: false
			}
			this.stats = null ;
			if ( compiler ){
				this.compiler = compiler ;

				//this.listen( this, "onCreateSockServer", () => {
					this.compiler.plugin("compile", () => {
						this.sockWrite( "invalid");
					});
					this.compiler.plugin("invalid", () => {
						this.sockWrite( "invalid");
					});
					this.compiler.plugin("done", (stats) => {
						this.sendStats( stats.toJson(this.clientStats));
						this.stats = stats;
						this.sockWrite( "content-changed");
					});
				//});
					
			}
		}
		
		sendStats (stats, force, connection) {
			if(!force &&
					stats &&
					(!stats.errors || stats.errors.length === 0) &&
					stats.assets &&
					stats.assets.every((asset) => !asset.emitted)
			  )
				return this.sockWrite( "still-ok", null,connection );
			this.sockWrite( "hash", stats.hash, connection);
			if(stats.errors && stats.errors.length > 0){
				this.sockWrite( "errors", stats.errors, connection);
			}else{
 			       	if(stats.warnings && stats.warnings.length > 0){
					this.sockWrite( "warnings", stats.warnings, connection);
				}else{
					this.sockWrite( "ok", null,connection);
				}
			}
		}

		sockWrite(type, data, connection){
			return this.service.sockWrite(type, data, connection);
		}
	}


	var sockjsService = class sockjsService extends nodefony.Service {

		constructor (httpKernel ){

			super( "sockjs", httpKernel.container, httpKernel.notificationsCenter );

			this.compilers = {} ;
			this.sockets =	[];
			this.setPrefix("/sockjs-node");

			if ( this.kernel.environment === "dev" ){
				this.bundle.listen(this, 'onCreateServer', (type, service) => {
					//this[type] = service ;
					switch ( type ){
						case "HTTP":
						case "HTTPS":
							this.createServer(service, type.toLowerCase());
							//this.fire("onCreateSockServer", server , service);
						break;
					}
				});
			}
		}

		setPrefix (prefix){
			this.prefix = prefix ;
			this.regPrefix = new RegExp('^' + this.prefix  + '([/].+|[/]?)$');
		}

		addCompiler ( compiler, basename){
			this.compilers[basename] = new sockCompiler(this, "SOCKJS_" + basename ,compiler  );
			this.logger( "Add sock-js compiler  : " + "SOCKJS_" + basename );		
		}

		createServer (service ,protocol){

			try { 
				this.logger(" Create sockjs server :   "+ service.type);	
				this[protocol] = Sockjs.createServer({ 
					sockjs_url: protocol+'://cdn.jsdelivr.net/sockjs/1.0.1/sockjs.min.js' ,
					//websocket:false,
					prefix: this.prefix,
					log: (severity, line)  => {
						this.logger( line, severity.toUpperCase() )
					}
				});
				this[protocol].on('connection', (conn) => {
					if(!conn) return;

					this.sockets.push(conn);

					conn.on("close", () => {
						this.logger(" CLOSE " + this.name , "DEBUG");
						const connIndex = this.sockets.indexOf(conn);
						if(connIndex >= 0) {
							this.sockets.splice(connIndex, 1);
						}
					});

					for( var compiler  in this.compilers ){
						if ( this.compilers[compiler].stats){
							this.compilers[compiler].sendStats(this.compilers[compiler].stats, true, conn);
						}	
					}
					
				});

				this[protocol].installHandlers(service.server);
				return this[protocol] ;
			}catch(e){
				this.logger(e, "ERROR");
				throw e;
			}
		}

		sockWrite ( type, data, connection) {
			try {
				if ( connection ){
					this.logger(type, "DEBUG");
					return connection.write(JSON.stringify({
						type: type,
						data: data
					}));	
				}
				this.sockets.forEach((sock) => {
					this.logger(type, "DEBUG");
					sock.write(JSON.stringify({
						type: type,
						data: data
					}));
				});
			}catch(e){
				this.logger(e, "ERROR");
				throw e ;
			}
		}
	}

	return sockjsService ;
});
