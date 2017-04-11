/*
 *
 *
 *
 *	Response
 *
 *
 *
 */

nodefony.register("Response",function(){

	var Response = class Response {

		constructor (response, container, type){
			this.container = container ;
			if (response instanceof  http.ServerResponse){
				this.response = response;
			}
			this.container.get("notificationsCenter").listen(this,"onView", this.setBody);
			//BODY
			this.body = "";
			this.encoding = this.setEncoding('utf8');

			//cookies
			this.cookies = {};

			// struct headers
			this.headers = {};
			this.statusCode = null ;
			this.statusMessage = null ;

			this.ended = false ;

			// default http code 
			this.setStatusCode(200, null);

			//timeout default
			var settings = this.container.getParameters("bundles.http");
			this.timeout = type === "HTTP" ? settings.http.responseTimeout : settings.https.responseTimeout ;

			//default Content-Type to implicit headers
			this.setHeader("Content-Type", "text/html; charset=utf-8");
		}

		clean (){
			this.response = null  ;	
			delete this.response ;
			this.cookies = null  ;
			delete this.cookies   ;
			this.headers= null  ;
			delete this.headers  ;
			this.body= null  ;
			delete this.body  ;
		}

		setTimeout (ms){
			this.timeout = ms ;
		}

		addCookie (cookie){
			if ( cookie instanceof nodefony.cookies.cookie ){
				this.cookies[cookie.name] = cookie;
			}else{
				throw {
					message:"",
					error:"Response addCookies not valid cookies"
				};
			}	
		}

		setCookies (){
			for (var cook in this.cookies){
				this.setCookie(this.cookies[cook]);	
			}
		}

		setCookie (cookie){
			//this.response.on('header', function(){
				this.logger("ADD COOKIE ==> " + cookie.serialize(), "DEBUG");
				this.setHeader('Set-Cookie', cookie.serialize());
			//}.bind(this))
		}

		logger (pci, severity, msgid,  msg){
			var syslog = this.container.get("syslog");
			if (! msgid) { msgid = "HTTP RESPONSE"; }
			return syslog.logger(pci, severity, msgid,  msg);
		}

		//ADD INPLICIT HEADER
		setHeader (name, value){
			if ( this.response ){
				this.response.setHeader(name, value);
			}
		}
		
		setHeaders (obj){
			nodefony.extend(this.headers, obj);
		}

		setEncoding (encoding){
			return this.encoding = encoding ;
		}

		setStatusCode (status, message){
			this.statusCode = parseInt( status, 10) ;
			if (message){
				this.statusMessage = message ;
				if (this.response){
					this.response.statusMessage = this.statusMessage;		
				}
			}
		}

		getStatus (){
			return {
				code:this.getStatusCode(),
				message:this.getStatusMessage()
			};
		}

		getStatusCode (){
			return this.statusCode;
		}

		getStatusMessage (){
			if ( this.response ){
				return this.statusMessage || this.response.statusMessage || http.STATUS_CODES[this.statusCode] ;
			}else{
				return this.statusMessage  || http.STATUS_CODES[this.statusCode];
			}
		}

		setBody (ele){
			switch (nodefony.typeOf(ele) ) {
				case "string" :
					this.body = ele;
				break;
				case "object" :
				case "array" :
					this.body = JSON.stringify(ele); 
				break;
				default:
					this.body = ele;
			}
			return  ele ;
		}

		writeHead (statusCode, headers){
			if ( ! this.response.headersSent ){
				this.response.statusMessage = this.statusMessage || http.STATUS_CODES[this.statusCode] ;
				try {
					return this.response.writeHead(
						statusCode || this.statusCode,
						headers || this.headers
					);
				}catch(e){
					throw e;
				}
			}else{
				throw new Error("Headers already sent !!");	
			}
		}

		flush (data, encoding){
			if ( ! this.response.headersSent ) {
				this.setHeader('Transfer-Encoding', 'chunked');
				this.headers['Transfer-Encoding'] = 'chunked' ;
				this.writeHead();
			}
			return this.response.write( data , encoding);
		}

		write (){
			if (this.encoding ){
				return this.response.write( this.body + "\n", this.encoding);
			}
			return this.response.write( this.body + "\n");
		}

		end (data, encoding){
			if ( this.response ){
				this.ended = true ;
				var ret = this.response.end(data, encoding);
				return ret ;
			}
			return null ;
		}	

		redirect (url, status, headers ){
			if ( headers ){
				switch ( nodefony.typeOf( headers ) ){
					case "object" :
						this.setHeaders(headers);
					break ;
					case "boolean" :
						this.setHeaders( {
							"Cache-Control":"no-store, no-cache, must-revalidate",
							"Expires":"Thu, 01 Jan 1970 00:00:00 GMT"
						});
					break;
				}
			}
			if (status == "301"){
				this.setStatusCode( status );
			}else{
				this.setStatusCode( 302 );
			}
			this.setHeader("Location", url);		
			return this;
		}
	};
	return Response;
});
