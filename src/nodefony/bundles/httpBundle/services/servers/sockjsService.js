var Sockjs = require('sockjs');


nodefony.registerService("sockjs", function(){
	
	var sockjs = class sockjs extends nodefony.Service {

		constructor (httpKernel ){

			super( "sockjs", httpKernel.container, httpKernel.notificationsCenter   );

			if ( this.kernel.environment === "dev" ){
				this.bundle.listen(this, 'onServersReady', (type, service) => {
					this[type] = service ;
					//this.createServer(type, service)	
				});
			}
		}

		createServer (sockUrl , compiler){
			this.logger(" Create sockjs server  :" + type);	

			var sockjsServer = Sockjs.createServer({ 
				sockjs_url: 'http://cdn.jsdelivr.net/sockjs/1.0.1/sockjs.min.js' ,
				log: (severity, line)  => {
					this.logger( line, severity.toUpperCase() )
				}
			});
			sockjsServer.on('connection', (conn) => {
    				conn.on('data', function(message) {
        				conn.write(message);
    				});
    				conn.on('close', () =>{
					this.logger(" CLOSE")
				});
			});

			if ( this.HTTP ){
				sockjsServer.installHandlers(this.HTTP.server, {prefix:'/sockjs-node'});
			
			}

			if ( this.HTTPS ){
				sockjsServer.installHandlers(this.HTTPS.server, {prefix:'/sockjs-node'});
			
			}

			return sockjsServer ;
			
		}

		sockWrite (sockets, type, data) {
			sockets.forEach((sock) => {
				sock.write(JSON.stringify({
					type: type,
					data: data
				}));
			}
		)
}
		


	}

	return sockjs ;
});
