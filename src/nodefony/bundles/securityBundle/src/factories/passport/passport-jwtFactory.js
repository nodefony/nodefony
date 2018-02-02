/*
 *	PASSPORT LOCAL  FACTORY
 */
const jwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;


module.exports = nodefony.registerFactory("passport-jwt", () => {

  const Factory = class passportJwtFactory extends nodefony.passeportFactory {

    constructor(security, settings) {
      super("jwt", security, settings);
    }

    getStrategy(options) {
      options.jwtFromRequest = ExtractJwt.fromBodyField();
      return new jwtStrategy(options, (jwt_payload, done) => {
        this.logger("TRY AUTHORISATION " + this.name + " : " + jwt_payload.sub, "DEBUG");
        // get passwd
        return this.security.provider.getUserPassword(jwt_payload.sub, (error, passwd) => {
          if (error) {
            return done(error, false, {
              message: 'Incorrect username.'
            });
          }
          if (passwd !== jwt_payload.sub) {
            return done(null, false, {
              message: 'Incorrect password.'
            });
          }
          this.security.provider.loadUserByUsername(jwt_payload.sub, (error, result) => {
            if (error) {
              return done(error, null);
            }
            return done(null, result);
          });
        });
      });
    }

    getPosition() {
      return "http";
    }

  };
  return Factory;
});