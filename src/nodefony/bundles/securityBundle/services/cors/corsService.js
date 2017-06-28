module.exports = nodefony.registerService("cors", function(){


	var headersCorsDefaults = {
		"Access-Control-Allow-Methods":			"GET",
		"Access-Control-Allow-Headers":			"ETag, Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date",
		"Access-Control-Expose-Headers":		"WWW-Authenticate, X-Json, X-Requested-With",
		"Access-Control-Max-Age":			10,
		"Access-Control-Allow-Credentials":		true
	};


	var cors = class cors extends nodefony.Service {

		constructor(container, kernel ){
			super("cors", container );
            this.allowMatch = null;
			this.header = {};
            this.kernel.listen(this, "onReady",  () =>{
                this.settings = this.kernel.getBundle("security").settings.cors ;
				this.readConfig(this.settings )
            });
		}

		readConfig (settings){
			for (var ele in settings){
				switch (ele){
					case "allow-origin":
						if (settings[ele] === "*"){
							this.allowMatch = new RegExp(".*");
						}else{
							if (typeof settings[ele] === "object"){
								var str = "";
								var i = 0;
								for (var name in settings[ele]){
									if (i === 0)
										str = settings[ele][name];
									else
										str += "|"+ settings[ele][name] ;
									i++;
								}
								if (str)
									this.allowMatch = new RegExp(str);
							}
						}
					break;
					case "Access-Control":
						nodefony.extend(this.header, headersCorsDefaults, settings[ele] )
					break;
				}
			}
		}

        match ( request, response){
			var URL = url.parse(request.headers.referer || request.headers.origin || request.url.href )
			var origin =  URL.protocol+"//"+URL.host ;
			if (this.allowMatch){
				var res = this.allowMatch.exec(origin) ;
				if (! res )
					return  401;
			}
			this.header["Access-Control-Allow-Origin"] = origin ;
			response.setHeaders( this.header);
			if ( request.method.toUpperCase() === "OPTIONS" ){
				response.statusCode = 204;
				response.writeHead();
				response.flush();
				return 204
			}
			return 200 ;
		}
	};

	return cors ;
});
