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

		createServer (type, service){
			this.logger(" Create sockjs server  :" + type);	

			var echo = Sockjs.createServer({ 
				sockjs_url: 'http://cdn.jsdelivr.net/sockjs/1.0.1/sockjs.min.js' ,
				log: (severity, line)  => {
					this.logger( line, severity.toUpperCase() )
				}
			});
			echo.on('connection', (conn) => {
    				conn.on('data', function(message) {
        				conn.write(message);
    				});
    				conn.on('close', () =>{
					this.logger(" CLOSE")
				});
			});
			switch (type){
				case 'WEBSOCKET' :
				case 'WEBSOCKET_SECURE' :
					console.log(service.websocketServer)
					echo.installHandlers(service.websocketServer, {prefix:'/sockjs-node'});
				break;
				default:
					echo.installHandlers(service.server, {prefix:'/sockjs-node'});
					

			}
			
		}


	}

	return sockjs ;
});
