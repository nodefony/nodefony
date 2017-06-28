

const oauth2orize = require("oauth2orize");
var utils = require("util");
//var crypto = require("crypto");

module.exports = nodefony.registerService("oauth2", function(){

	/**
	 * Return a unique identifier with the given `len`.
	 *
	 * @param {Number} length
	 * @return {String}
	 * @api private
	 */
	var getUid = function getUid (length) {
	  let uid = '';
	  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	  const charsLength = chars.length;

	  for (let i = 0; i < length; ++i) {
	    uid += chars[getRandomInt(0, charsLength - 1)];
	  }
	  return uid;
	};

	/**
	 * Return a random int, used by `utils.getUid()`.
	 *
	 * @param {Number} min
	 * @param {Number} max
	 * @return {Number}
	 * @api private
	 */
	var getRandomInt = function getRandomInt(min, max) {
	  return Math.floor(Math.random() * (max - min + 1)) + min;
	}


	var oauth2 = class oauth2 extends nodefony.Service {

		constructor(container, kernel ){
			super("oauth2", container );
			try {
				this.server = oauth2orize.createServer();
			}catch(e){
				throw e
			}
		}

		serializeClient(){

		}

		deserializeClient(){

		}

		createCode(){
			return  oauth2orize.grant.code( (client, redirectURI, user, ares, done) => {
					console.log(client);
				}) ;
				this.logger("CODE" , "DEBUG")
		}

		grant(code){
				this.logger("GRANT" , "DEBUG")
				return this.server.grant(code) ;

		}



		exchange (api){
			this.logger("EXANGE")
			return this.server.exchange(api)

		}

		/**
		 *
		 */
		clientCredentials(callback){
				this.logger("exchange clientCredentials " ,"DEBUG");
				return oauth2orize.exchange.clientCredentials ( callback ) ;
		}

		authorizationCode(callback){
			this.logger("exchange authorizationCode " ,"DEBUG");
			return oauth2orize.exchange.authorizationCode ( callback ) ;
		}


		password (callback){
			this.logger("exchange password " ,"DEBUG");
			return oauth2orize.exchange.password ( callback ) ;

		}

		refreshToken(callback){
			this.logger("exchange refreshToken " ,"DEBUG");
			return oauth2orize.exchange.refreshToken ( callback ) ;
		}


	};



	return oauth2 ;
});
