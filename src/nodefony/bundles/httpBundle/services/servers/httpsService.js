module.exports = nodefony.registerService("https", function(){

	const Https = class Https extends nodefony.Service {

		constructor (httpKernel , security, options){

			super( "https", httpKernel.container, httpKernel.notificationsCenter , options  );

			this.httpKernel = httpKernel;
			this.port = this.httpKernel.kernel.httpsPort ;
			this.domain = this.httpKernel.kernel.settings.system.domain ;
			this.firewall =  security ;
			this.ready = false ;
			//this.settings = this.kernel.settings.system.servers || null ;

			this.key = null ;
			this.cert = null ;
			this.ca = null ;
			this.address = null ;
			this.family = null ;

			this.type = "HTTPS";
			this.listen(this, "onBoot",function(){
				this.bundle = this.kernel.getBundles("http") ;
				this.bundle.listen(this, "onServersReady", function(type){
					if ( type === this.type){
						dns.lookup(this.domain,(err, addresses, family) => {
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
			if (! msgid) {msgid = "SERVICE HTTPS ";}
			return this.syslog.logger(pci, severity, msgid,  msg);
		}

		getCertificats (){
			this.settings = this.getParameters("bundles.http").https || null ;
			this.settings.certificats = nodefony.extend(true, {}, this.settings.certificats, this.kernel.settings.system.servers.certificats ) ;
			var bundleOptions = this.getParameters("bundles.http").https.certificats || null ;
			let opt = nodefony.extend( true, {
				keyPath: this.kernel.checkPath(this.settings.certificats.key),
				certPath: this.kernel.checkPath(this.settings.certificats.cert),
				caPath: this.kernel.checkPath(this.settings.certificats.ca),
				key: null,
				cert: null,
				ca: null
			}, bundleOptions) ;
			try {
				this.key = fs.readFileSync(opt.keyPath) ;
				opt.key = this.key ;
				this.cert = fs.readFileSync(opt.certPath) ;
				opt.cert = this.cert ;
				if ( opt.caPath ){
					this.ca = fs.readFileSync(opt.caPath) ;
					opt.ca = this.ca;
				}
			}catch(e){
				throw e ;
			}
			return opt ;
		}

		createServer (){
			//this.settings = this.getParameters("bundles.http").https || null ;
			//this.settings.certificats = nodefony.extend(true, {}, this.settings.certificats, this.kernel.settings.system.servers.certificats ) ;
			try {
				this.options = this.getCertificats();
				for (let ele in this.options )	{
					switch ( ele ){
						case "keyPath" :
							this.logger( " READ CERTIFICATE KEY : "+this.options[ele], "DEBUG");
						break;
						case "certPath" :
							this.logger( " READ CERTIFICATE CERT : "+this.options[ele], "DEBUG");
						break;
						case "caPath" :
							if ( this.options[ele] ){
								this.logger( " READ CERTIFICATE CA : "+this.options[ele], "DEBUG");
							}else{
								this.logger( " NO CERTIFICATE CA : "+this.options[ele], "WARNING");
							}
						break;
					}
				}
			}catch(e){
				this.logger(e);
				throw e ;
			}

			try {
				this.server = https.createServer(this.options);
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
				this.logger(this.type+"  Server is listening on DOMAIN : https://"+this.domain+":"+this.port , "INFO");
				this.ready = true ;
				this.bundle.fire("onServersReady", this.type, this);
			});

			this.server.on("error",(error) => {
				let httpError = "server HTTPS Error : "+error.errno;
				switch (error.errno){
					case "ENOTFOUND":
						this.logger( new Error(httpError+" CHECK DOMAIN IN /etc/hosts unable to connect to : "+this.domain), "CRITIC");
					break;
					case "EADDRINUSE":
						//this.logger( new Error(httpError+" port HTTPS in use check other servers : "), "CRITIC");
						this.logger( new Error("Domain : " +this.domain+" Port : "+this.port +" ==> " + error) ,"CRITIC");
						setTimeout(() => {
      							this.server.close();
    						}, 1000);
					break;
					default :
						this.logger( new Error(httpError), "CRITIC" );
				}
			});

			this.server.on("clientError",(e, socket) => {
				this.fire("onClientError", e, socket);
			});

			this.listen(this, "onTerminate", () => {
				if (this.server){
					this.server.close( () => {
						this.logger(" SHUTDOWN HTTPS  Server is listening on DOMAIN : "+this.domain+"    PORT : "+this.port , "INFO");
					});
				}
			});

			return this.server;
		}
	};
	return Https;
});
