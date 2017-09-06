/*
 *
 *
 *
 *	Request
 *
 *
 *
 */
const QS = require('qs');

module.exports = nodefony.register("Request",function(){

	let settingsXml = {};
	let parserRequestBody = function(){
		//var contentType = this.contentType ? this.contentType : "application/x-www-form-urlencoded";
		switch ( this.request.method ){
			case "POST":
			case "PUT":
			case "DELETE":
				switch(this.contentType){
					case "application/json":
					case "text/json":
						this.queryPost = JSON.parse(this.body.toString(this.charset));
					break;
					case "application/xml":
					case "text/xml":
						var Parser = new xmlParser( settingsXml );
						Parser.parseString(this.body.toString(this.charset) , (err, result) => {
							if ( err ){
								throw err ;
							}
							this.queryPost = result ;
						});
					break;
					case "multipart/form-data":
						let service = this.context.get("upload");
						let res = new nodefony.io.MultipartParser(this);
						this.queryPost = res.post ;
						var queryFile = res.file ;
						if (Object.keys(queryFile).length ) {
							for(let file in queryFile){
								this.queryFile[file] = service.createUploadFile(this, queryFile[file]);
							}
						}
						this.logger("FORM  multipart/form-data   BUFFER SIZE : "+ this.body.length, "DEBUG");
						//nodefony.extend( this.query, this.queryFile);
					break;
					case "application/x-www-form-urlencoded":
						this.queryPost = QS.parse(this.body.toString(this.charset));
					break;
					default:
						//console.log(bodyParser(request,null,function(){console.log(arguments)}))
						this.queryPost = this.body.toString(this.charset);
						this.logger("Request content-type : " + this.contentType + " unknown. You must use a parser in controller to read :  "+this.contentType  +" data : " + this.queryPost, "WARNING");
						//this.queryPost = qs.parse(this.body);
				}
			break;
		}
	};

	const Request  = class Request {

		constructor (request, context){
			this.context = context ;
			this.request = request;
			this.headers = 	request.headers ;
			this.host = this.getHost() ;
			this.hostname = this.getHostName(this.host) ;
			this.sUrl = this.getFullUrl( request );
			this.url = this.getUrl(this.sUrl) ;
			if ( this.url.search ){
				this.url.query = QS.parse( this.url.search.replace(/^\?/,"") ) ;
			}else{
				this.url.query = {} ;
			}
			this.queryPost = {};
			this.queryFile = {};
			this.queryGet = this.url.query;
			this.query = this.url.query;
			this.method = this.getMethod() ;
			this.rawContentType = {} ;
			this.contentType = this.getContentType(this.request);
			this.charset = this.getCharset(this.request);
			this.domain = this.getDomain();
			this.remoteAddress = this.getRemoteAddress();
			this.data = [];
			this.dataSize = 0;
			this.request.on('data',  (data) => {
				this.data.push(data);
				this.dataSize+= data.length;
			});

			this.request.on('end',  () => {
				try {
					if ( ! this.request ){
						return ;
					}
					this.body = Buffer.concat(this.data || [] );
					parserRequestBody.call(this, this.request );
					switch (typeof this.queryPost){
						case "object" :
							if (this.queryPost instanceof Buffer){
								this.query = this.queryPost ;
							}else{
								 this.query = nodefony.extend( {},  this.query, this.queryPost);
							}
						break;
						default:
							this.query = nodefony.extend({},  this.query, this.queryPost);
					}
				}catch(e){
					console.trace(e);
					if (e.status){
						throw e ;
					}
					throw new Error ("Request "+this.url.href +" Content-type : " + this.contentType + " data Request :   "+ this.body.length+"   " + e );
				}
			});
		}

		getHost (){
			return this.request.headers.host ;
		}

		getHostName (host){
			if ( this.url && this.url.hostname ){
				return this.url.hostname ;
			}
			if ( host ){
				return host.split(":")[0] ;
			}
			return  this.getHost().split(":")[0] ;
		}

		getUserAgent (){
			return this.request.headers['user-agent'];
		}

		getMethod (){
			return this.request.method ;
		}

		clean (){
			this.data = null ;
			delete this.data ;
			this.body = null ;
			delete  this.body ;
			this.queryPost = null ;
			delete	this.queryPost ;
			this.queryFile = null;
			delete	this.queryFile;
			this.queryGet = null ;
			delete	this.queryGet;
			this.query = null ;
			delete  this.query ;
			this.request = null ;
			delete  this.request ;
			//this.container = null ;
			//delete this.container ;
			//super.clean();
		}

		/*acceptLanguage (request){
			var data = request.headers["accept-language"];
			if ( ! data ) return null ;
			var tab  = data.split(";");
			if ( ! tab.length ) return null;
			var res = {};
			for (var i = 0 ; i<tab.length ; i++){
				if ( tab[i] ){
					var ele = tab[i].split(",");
					console.log(ele);
				}
			}
		}*/

		logger (pci, severity, msgid,  msg){
			if (! msgid) { msgid = this.context.type + " REQUEST ";}
			return this.context.logger(pci, severity, msgid,  msg);
		}

		getContentType ( request ){
			if ( request.headers["content-type"] ){
				let tab = request.headers["content-type"].split(";") ;
				if (tab.length > 1){
					for (let i = 1 ; i<tab.length ;i++){
						if (typeof tab[i] === "string"){
							let ele = tab[i].split("=");
							let key = ele[0].replace(" ","");
							this.rawContentType[key]= ele[1];
						}else{
							continue ;
						}
					}
				}
				this.extentionContentType = request.headers["content-type"] ;
				return  tab[0];
			}
			return null;
		}

		getCharset ( request ){
			let charset = null ;
			if ( request.headers["content-type"] ){
				charset = request.headers["content-type"].split(";")[1];
				if (charset){
					charset = charset.replace(" ","").split("=")[1];
				}else{
					charset = "utf8" ;
				}
			}
			return  charset || "utf8" ;
		}

		getDomain (){
			return this.getHostName() ;
			//return this.host.split(":")[0];
		}

		getRemoteAddress (){
			// proxy mode
			if ( this.headers && this.headers['x-forwarded-for'] ){
				return this.headers['x-forwarded-for'] ;
			}
			if ( this.request.connection && this.request.connection.remoteAddress ){
				return this.request.connection.remoteAddress ;
			}
			if ( this.request.socket && this.request.socket.remoteAddress ){
				return this.request.socket.remoteAddress ;
			}
			if (this.request.connection &&  this.request.connection.socket && this.request.connection.socket.remoteAddress ){
				return  this.request.connection.socket.remoteAddress ;
			}
			return null ;
		}

		setUrl (Url){
			this.url = this.getUrl(Url);
		}

		getUrl (sUrl, query){
			return url.parse( sUrl, query);
		}

		getFullUrl (request){
			// proxy mode
			if ( this.headers && this.headers['x-forwarded-for'] ){
				return this.headers['x-forwarded-proto'] + "://" + this.host +  request.url ;
			}
			if ( request.connection.encrypted ){
				return 'https://' + this.host + request.url;
			}else{
				return 'http://' + this.host + request.url;
			}
		}

		isAjax (){
			if ( this.headers['x-requested-with'] ){
				return ( 'xmlhttprequest' === this.headers['x-requested-with'].toLowerCase() );
			}
			return false;
		}
	};

	return Request;
});
