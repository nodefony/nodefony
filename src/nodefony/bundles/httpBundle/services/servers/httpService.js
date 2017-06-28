/*
 * New node file
 */

//var http = require('http');
//var nodedomain = require('domain');

module.exports = nodefony.registerService("http", function(){

	var Http = class Http extends nodefony.Service {

		constructor (httpKernel , security, options ){

			super( "http", httpKernel.container, httpKernel.notificationsCenter , options  );

			this.httpKernel = httpKernel ;
			this.port = this.httpKernel.kernel.httpPort ;
			this.domain = this.httpKernel.kernel.settings.system.domain ;
			this.firewall =  security ;
			this.ready = false ;
			this.type = "HTTP";
			this.address = null ;
			this.family = null ;

			this.listen(this, "onBoot",function(){
				this.bundle = this.kernel.getBundles("http") ;
				this.bundle.listen(this, "onServersReady", function(type){
					if ( type === this.type){
						dns.lookup(this.domain, (err, addresses, family) => {
							if ( err ){
								throw err ;
							}
							this.address = addresses ;
							this.family = family ;
						});
					}
				});
			});
		}

		logger (pci, severity, msgid,  msg){
			if (! msgid) { msgid = "SERVICE HTTP ";}
			return this.syslog.logger(pci, severity, msgid,  msg);
		}

		createZone (request, response){

			require("zone").enable();
			zone.create( () => {
				this.fire("onServerRequest", request, response, this.type, zone);
			})
			.then(() => {
				// Runs when succesful
				this.logger("ZONE SUCCES","INFO");
			})
			.catch( (err) => {
				this.logger(err);
			});
		}

		createServer (){
			this.settings = this.getParameters("bundles.http").http || null ;

			try {
				this.server = http.createServer();
				this.bundle.fire("onCreateServer", this.type, this);
			}catch(e){
				this.logger(e, "CRITIC");
				throw e ;
			}

			this.server.on("request", ( request, response ) => {
				this.httpKernel.onHttpRequest(request, response, this.type);
			} );

			if (this.settings.timeout){
				this.server.timeout = this.settings.timeout;
			}

			if (this.settings.maxHeadersCount ){
				this.server.maxHeadersCount = this.settings.maxHeadersCount;
			}


			// LISTEN ON PORT
			this.server.listen(this.port, this.domain, () => {
				this.logger(this.type+"  Server is listening on DOMAIN : http://"+this.domain+":"+this.port , "INFO");
				this.ready = true ;
				this.bundle.fire("onServersReady", this.type, this);
			});

			this.server.on("error",(error) => {
				var httpError = "server HTTP Error : "+error.errno;
				switch (error.errno){
					case "ENOTFOUND":
						this.logger( new Error(httpError+" CHECK DOMAIN IN /etc/hosts unable to connect to : "+this.domain), "CRITIC");
					break;
					case "EADDRINUSE":
						//this.logger( new Error(httpError+" port HTTP in use check other servers : "), "CRITIC") ;
						this.logger( new Error("Domain : " +this.domain+" Port : "+this.port +" ==> " + error) ,"CRITIC");
						setTimeout(() => {
      							this.server.close();
    						}, 1000);
					break;
					default :
						this.logger( new Error(httpError) ,"CRITIC", "SERVICE HTTPS");
				}
			});

			this.listen(this, "onTerminate",() => {
				if (this.server){
					this.server.close(() => {
						this.logger(" SHUTDOWN HTTP Server is listening on DOMAIN : "+this.domain+"    PORT : "+this.port , "INFO");
					});
				}
			});

			this.server.on("clientError",(e, socket) =>{
				this.fire("onClientError", e, socket);
			});

			return this.server;
		}
	};
	return Http;
});
