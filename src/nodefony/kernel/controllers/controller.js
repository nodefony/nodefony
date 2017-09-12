
module.exports = nodefony.register("controller", function(){

	const Controller = class Controller extends nodefony.Service {
		constructor (container, context) {
			super(null , container, container.get("notificationsCenter") ) ;
			this.name= "CONTROLER "+this.name ;
			this.context = context;
			this.response = this.context.response ;
			this.request = this.context.request ;
			this.query = this.request.query ;
			this.queryFile = this.request.queryFile;
			this.queryGet = this.request.queryGet;
			this.queryPost = this.request.queryPost;
			this.sessionService = this.get("sessions");
			this.serviceTemplating = this.get('templating') ;
			this.httpKernel = this.get("httpKernel") ;
			this.router = this.get("router");
		}

		getRequest (){
			return this.request;
		}

		getResponse (content){
			if ( content){
				this.response.setBody( content );
			}
			return this.response;
		}

		getContext (){
			return this.context ;
		}

		getMethod (){
			return this.context.getMethod() ;
		}

		startSession (sessionContext){
			return  this.sessionService.start(this.context, sessionContext || "default") ;
		}

		getSession (){
			return this.context.session || null ;
		}

		getFlashBag (key){
			let session = this.getSession() ;
			if (session){
				return session.getFlashBag(key) ;
			}else{
				this.logger("getFlashBag session not started !", "ERROR");
				return null ;
			}
		}

		setFlashBag (key, value){
			let session = this.getSession() ;
			if (session){
				return session.setFlashBag(key, value) ;
			}else{
				return null ;
			}
		}

		setContextJson(){
			this.context.isJson = true ;
		}

		getORM (){
			let defaultOrm = this.kernel.settings.orm ;
			return this.get(defaultOrm);
		}

		renderResponse (data, status , headers ){
			let res = this.getResponse(data);
			if (! res ){
				this.logger("WARNING ASYNC !!  RESPONSE ALREADY SENT BY EXPCEPTION FRAMEWORK","WARNING");
				return ;
			}
			//this.fire("onView", data, this.context );
			if (headers && typeof headers === "object" ){ res.setHeaders(headers);}
			if (status){ res.setStatusCode(status);}
			this.fire("onResponse", res , this.context);
			return res ;
		}

		renderJson ( obj , status , headers){
			return new Promise ( (resolve, reject) =>{
				try {
					resolve( this.renderJsonSync(obj , status , headers) )
				}catch(e){
					reject(e);
				}
			});
		}

		renderJsonAsync (obj , status , headers){
			return this.renderJson(obj , status , headers).then( (result) => {
				this.fire("onResponse", this.response,  this.context );
				return result ;
			}).catch((e)=>{
				if (this.response.response.headersSent || this.context.timeoutExpired ){
					return ;
				}
				this.context.promise = null ;
				this.fire("onError", this.context.container, e);
			});
		}

		renderJsonSync ( obj , status , headers){
			let data = null ;
			try {
				data = JSON.stringify( obj ) ;
			}catch(e){
				this.logger(e,"ERROR");
				throw e	;
			}
			let response = this.getResponse(data);
			if (! response ){
				this.logger("WARNING ASYNC !!  RESPONSE ALREADY SENT BY EXPCEPTION FRAMEWORK","WARNING");
				return ;
			}
			//this.fire("onView", data, this.context );
			response.setHeaders(nodefony.extend( {}, {
				'Content-Type': "text/json ; charset="+ this.response.encoding
			}, headers ))
			if (status){ response.setStatusCode(status);}
			return response ;
		}

		render (view, param){
			if ( ! this.response ){
				this.logger("WARNING ASYNC !!  RESPONSE ALREADY SENT BY EXPCEPTION FRAMEWORK","ERROR");
				return ;
			}
			try {
				return this.renderViewAsync(view, param);

			}catch(e){
				this.fire("onError", this.context.container, e);
			}
		}

		renderSync (view, param){
			let response = this.getResponse() ;
			if (! response ){
				this.logger("WARNING ASYNC !!  RESPONSE ALREADY SENT BY EXPCEPTION FRAMEWORK","WARNING");
				return ;
			}
			try {
				this.renderView(view, param);

			}catch(e){
				this.fire("onError", this.context.container, e);
				return ;
			}
			return response ;
		}

		renderAsync (view, param){
			return this.render(view, param).then( (result) => {
				this.fire("onResponse", this.response,  this.context );
				return result ;
			}).catch((e)=>{
				if (this.response.response.headersSent || this.context.timeoutExpired ){
					return ;
				}
				this.context.promise = null ;
				this.fire("onError", this.context.container, e);
			});
		}

		renderViewAsync (view, param){
			try {
				let extendParam = this.context.extendTwig(param, this.context );
				return new Promise ( (resolve, reject) =>{
					let templ = null ;
					let res = null ;
					try {
						templ = this.httpKernel.getTemplate(view);
					}catch(e){
						return reject( e );
					}
					try {
						res = templ.render(extendParam) ;
						try {
							this.fire("onView", res, this.context, templ.path , param);
							return resolve( res );
						}catch(e){
							return reject( e );
						}
					}catch(e){
						return reject( e ) ;
					}
				});
			}catch(e){
				throw e ;
			}
		}

		renderView (view, param ){
			let res = null;
			let templ = null ;
			let extendParam = this.context.extendTwig(param, this.context);
			try {
				templ = this.httpKernel.getTemplate(view);
			}catch(e){
				throw e ;
			}
			try {
				res = templ.render(extendParam) ;
				try {
					this.fire("onView", res, this.context, null , param);
				}catch(e){
					throw e ;
				}
			}catch(e){
				throw e ;
			}
			return res ;
		}

		renderRawView (path, param ){
			let res = null;
			let extendParam = this.context.extendTwig(param, this.context);
			try{
				this.serviceTemplating.renderFile(path, extendParam, (error, result) => {
					if (error || result === undefined){
						if ( ! error ){
							error = new Error("ERROR PARSING TEMPLATE :" + path.path);
						}
						throw error ;
					}else{
						try {
							this.fire("onView", result, this.context, path , param);
							res = result;
						}catch(e){
							throw e ;
						}
					}
				});
			}catch(e){
				throw e ;
			}
			return res;
		}

		renderFileDownload (file, options, headers){
			//console.log("renderFileDownload :" + file.path)
			let File = null ;
			if (file instanceof nodefony.fileClass ){
				File = file;
			}else{
				if ( typeof file  === "string"){
					File  = new nodefony.fileClass(file);
				}else{
					throw new Error("File argument bad type for renderFileDownload :" + typeof file);
				}
			}
			if (File.type !== "File"){
				throw new Error("renderMediaStream bad type for  :" +  file);
			}
			let length = File.stats.size ;
			let head = nodefony.extend({
				'Content-Disposition': 'attachment; filename="'+File.name+'"',
				'Content-Length':length,
				"Expires": "0",
				'Content-Description': 'File Transfer',
				'Content-Type': File.mimeType
			}, headers || {});
			let response = this.getResponse();
			let fileStream = null ;

			try {
				fileStream = fs.createReadStream(File.path, options );
			}catch(e){
				this.logger(e, "ERROR");
				throw e ;
			}
			fileStream.on("open",() => {
				try {
					response.response.writeHead(200, head);
					fileStream.pipe(response.response, {
						// auto end response
						end:false
					});
				}catch(e){
					this.logger(e, "ERROR");
					throw e ;
				}
			});
			fileStream.on("end",() => {
				if (fileStream) {
					try {
						fileStream.unpipe(response.response);
						if (fileStream.fd) {
							//console.log("CLOSE")
							fs.close(fileStream.fd);
						}
					}catch(e){
						this.logger(e, "ERROR");
						throw e ;
					}
				}
				response.end();
			});
			fileStream.on("close", () => {
				response.end();
			});
			response.response.on('close', () => {
				if (fileStream.fd){
					fileStream.unpipe(response.response);
					fs.close(fileStream.fd);
				}
				response.end();
			});
			fileStream.on("error", (error) =>{
				this.logger(error, "ERROR");
				response.end();
				throw error ;
			});
		}

		renderMediaStream (file , options, headers){
			//console.log("renderMediaStream :" + file.path)
			let File = null ;
			if (file instanceof nodefony.fileClass ){
				File = file;
			}else{
				if ( typeof file  === "string"){
					File  = new nodefony.fileClass(file);
				}else{
					throw new Error("File argument bad type for renderMediaStream :" + typeof file);
				}
			}
			if (File.type !== "File"){
				throw new Error("renderMediaStreambad type for  :" +  file);
			}
			if ( ! options ) {options = {};}
			let request = this.getRequest();
			let requestHeaders = request.headers ;
			let range = requestHeaders.range;
			let length = File.stats.size ;
			let code = null ;
			let head = null ;
			let value = null ;
			if ( range ) {
				//console.log("HEADER = " + range);
				let parts = range.replace(/bytes=/, "").split("-");
				//console.log(parts)
				let partialstart = parts[0];
				let partialend = parts[1];
				let start = parseInt(partialstart, 10);
				let end = partialend ? parseInt(partialend, 10) : length - 1;
				let chunksize = (end - start) + 1;
				//console.log("start :" + start) ;
				//console.log("end :" + end) ;
				value = nodefony.extend(options , {
					start:start,
					end:end
				});
				//console.log('RANGE: ' + start + ' - ' + end + ' = ' + chunksize);
				head = nodefony.extend({
					'Content-Range': 'bytes ' + start + '-' + end + '/' + length,
					'Accept-Ranges': 'bytes',
					'Content-Length': chunksize,
					'Content-Type': File.mimeType
				}, headers);

				code = 206 ;
			}else{
				head = nodefony.extend({
					'Content-Type': File.mimeType,
					'Content-Length':length,
					'Content-Disposition' : ' inline; filename="'+File.name+'"'
				},headers);
				code = 200 ;
			}
			// streamFile
			let response = this.getResponse();
			let fileStream = null ;
			try {
				fileStream = fs.createReadStream(File.path, value ? nodefony.extend( options, value) : options);
			}catch(e){
				this.logger(e, "ERROR");
				throw e ;
			}
			//console.log(head);
			fileStream.on("open", () =>{
				try {
					response.response.writeHead(code, head);
					fileStream.pipe(response.response, {
						// auto end response
						end:false
					});
				}catch(e){
					this.logger(e, "ERROR");
					throw e ;
				}
			});
			fileStream.on("end", () => {
				if (fileStream) {
					try {
						fileStream.unpipe(response.response);
						if (fileStream.fd) {
							fs.close(fileStream.fd);
						}
					}catch(e){
						this.logger(e, "ERROR");
						throw e ;
					}
				}
				response.end();
			});
			fileStream.on("close", () => {
				response.end();
			});

			response.response.on('close', () => {
				//console.log("close response")
				if (fileStream.fd){
					fileStream.unpipe(response.response);
					fs.close(fileStream.fd);
				}
				response.end();
			});
			fileStream.on("error", (error) =>{
				this.logger(error,"ERROR");
				response.end();
			});
		}

		createNotFoundException (message){
			this.response.setStatusCode(404) ;
			this.fire("onError", this.container, message );

		}

		createUnauthorizedException (message){
			this.response.setStatusCode(401) ;
			this.fire("onError", this.container, message );

		}

		createException (message){
			this.response.setStatusCode(500) ;
			this.fire("onError", this.container, message );
		}

		redirect (url ,status, headers){
			if (! url ){
				throw new Error("Redirect error no url !!!");
			}
			this.context.isRedirect = true ;
			try {
				this.context.redirect(url, status, headers);
			}catch(e){
				throw e ;
			}
		}

		redirectHttps (status){
			return this.context.redirectHttps( status || 301 ) ;
		}

		forward (name, param){
			let resolver = this.router.resolveName(this.context, name);
			return resolver.callController(param );
		}

		getUser (){
			return this.context.getUser();
		}

		isAjax (){
			return this.getRequest().isAjax();
		}

		hideDebugBar (){
			this.context.showDebugBar = false;
		}

		getRoute (){
			return this.context.resolver.getRoute();
		}

		generateUrl (name, variables, absolute){
			let host = null ;
			if (absolute){
				host = this.context.request.url.protocol+"//"+this.context.request.url.host;
				absolute = host;
			}
			try {
				return this.router.generatePath.call(this.router, name, variables, absolute);
			}catch(e){
				throw e ;
			}
		}

		htmlMdParser (content, options){
			let markdown  = require('markdown-it')(nodefony.extend({
				html: true
			},options));
			try {
				return markdown.render(content);
			}catch (e){
				throw e ;
			}
		}
	};
	return Controller;
});
