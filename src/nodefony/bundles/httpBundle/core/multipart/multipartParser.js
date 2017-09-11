/*
 *
 *
 *
 *
 */

nodefony.register.call(nodefony.io, "MultipartParser", function(){

	// PHP LIKE
	//var reg = /(.*)[\[][\]]$/;
	const regHeaders = / |"/g;

	const multiPartParser = class multiPartParser {

		constructor (request){
			this.post = {};
			this.file = {} ;
			this.error = null ;
			this.parse(request);
		}

		parse (request){

			if ( !  request.rawContentType.boundary ){
				throw new Error('multiPartParser  : Bad content-type header, no multipart boundary');
			}
			let boundary = '\r\n--' + request.rawContentType.boundary.replace('"',"");
			//console.log(boundary)
			let isRaw = typeof(request.body) !== 'string';
			let s = null;
			if ( isRaw ) {
				s = request.body.toString('binary') ;
			} else {
				s = request.body;
			}
			s = '\r\n' + s;
			let parts = s.split(new RegExp(boundary));
			//var partsByName = {post: {}, file: {}};
			// loop boundaries
			for (let i = 1; i < parts.length - 1; i++) {
				let obj = this.parseBoundary( parts[i], isRaw ) ;
				let name = obj.headers.filename ;
				if( obj.headers.filename ){
					this.file[name] = obj ;
	        	} else {
					this.post[obj.headers.name] = obj.data;
	        	}
			}
		}

		parseBoundary (boundary){
			let subparts = boundary.split('\r\n\r\n');
			let obj = {
				headers:{},
				data:null
			};
			//HEADERS
			let header = subparts[0];
			let headers = header.split('\r\n');
			//console.log(headers)
			for ( let i = 0 ; i<headers.length ;i++ ){
				if (headers[i]){
					let res = headers[i].split(";");
					for (let j=0 ; j<res.length ; j++ ){
						let ret = res[j].split(/:|=/);
						obj.headers[ret[0].replace(regHeaders,"")] = ret[1].replace(regHeaders,"");
					}
				}
			}
			//DATA
			obj.data = subparts[1] ;
			return obj ;
		}

	 	rawStringToBuffer ( str ) {
			let idx, len = str.length, arr = new Array( len );
			for ( idx = 0 ; idx < len ; ++idx ) {
				arr[ idx ] = str.charCodeAt(idx) & 0xFF;
			}
			return new Uint8Array( arr ).buffer;
		}

	};
	return multiPartParser ;
});
