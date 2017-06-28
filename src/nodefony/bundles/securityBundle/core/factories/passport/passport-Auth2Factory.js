try{
	var passport = require('passport');
	var oauth2Strategy = require('passport-oauth2').Strategy;
	var nodefonyPassport = require("passport-nodefony");
}catch(e){
	this.logger(e)
}

nodefony.register.call(nodefony.security.factory, "passport-oauth2",function(){


	var Factory = class Factory {


		constructor(contextSecurity,  settings){
			this.name = this.getKey();
			this.contextSecurity = contextSecurity ;
			this.settings = settings ;

			this.passport = passport ;
			
			this.passport.framework( nodefonyPassport(this) );
			
			this.strategy = this.getStrategy(this.settings) ;

			this.passport.use(this.strategy);

			this.contextSecurity.container.get("kernel").listen(this,"onReady",function(){
				this.orm = this.contextSecurity.container.get("sequelize") ;
				this.User = this.orm.getEntity("user") ;
				this.connection = this.orm.getConnection("nodefony");
			})

			this.scopes = settings.scopes || ['profile'] ; 

		};

		getKey (){
			return "passport-oauth2";
		};

		getPosition (){
			return "http";	
		};


		getStrategy (options){
			return  new oauth2Strategy(options, (accessToken, refreshToken, profile, cb) => {
				var obj = null ;
				if ( profile ){
					this.contextSecurity.logger("PROFILE AUTHORISATION "+ this.name+" : "+profile.displayName ,"DEBUG");
					var obj = {
						username	: profile.displayName,
						name		: profile.name.familyName || "",
						surname		: profile.name.givenName || "",
						email		: profile.emails ? profile.emails[0].value : "" ,
						password	: profile.token,
						provider	: profile.provider,
						lang		: profile._json.language,
						roles		: "USER",	
						gender		: profile.gender || "",
						displayName	: profile.displayName,
						url		: profile._json.url || "",
						image		: profile._json.image.url || ""
					}
				}

				if ( obj ){
					this.User.findOrCreate({
						where: {username: obj.username}, 
						defaults:obj
					}).then(function(user){
						if ( nodefony.typeOf( user)  === "array" ){ 
							cb(null, user[0]);
						}else{
							cb(null, user);	
						}
					}).catch(function(e){
						cb(e, null)	
					})
					return ;	
				}
				cb(new Error("Profile Google error") , null );
			
			});	
		}


		handle ( context, callback){
				
			var route = context.resolver.getRoute() ;
			if ( route.name === "oauth2Area" ) {
				this.passport.authenticate('oauth2', { scope: this.scopes })(context);
				return ;
			}
			if ( route.name === "oauth2CallBackArea" ){ 
				this.passport.authenticate('oauth2', { 
					session: false, 
				})(context, (error, res) => {
					if ( error ){
						return callback(error, null);	
					}
					if ( res ){
						context.user = res ;	
						//this.contextSecurity.logger("AUTHORISATION "+this.getKey()+" SUCCESSFULLY : " + res.username ,"INFO");
					}
					var token = {
						name:"oauth2",
						user:res
					}
					return callback(error, token)
				});
				return ;
			}
			return callback({
				status:401,
		        	message :"PASSPORT oauth2 BAD ROUTE "
			}, null)
		};

	}


	return Factory ;
});



