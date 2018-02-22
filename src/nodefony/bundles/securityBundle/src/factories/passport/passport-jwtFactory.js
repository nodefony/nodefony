/*
 *	PASSPORT JSON WEB TOKEN  FACTORY JWT
 */
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

const cookiesExtractor = function (req) {
  var token = null;
  if (req && req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt.value;
  }
  return token;
};


module.exports = nodefony.registerFactory("passport-jwt", () => {

  const Factory = class Factory extends nodefony.passeportFactory {

    constructor(security, settings) {
      super("jwt", security, settings);
    }

    getExtractor(option) {
      switch (option.jwtFromRequest) {
      case "cookies":
        option.jwtFromRequest = cookiesExtractor;
        break;
      default:
        if (option.jwtFromRequest) {
          if (ExtractJwt[option.jwtFromRequest]) {
            option.jwtFromRequest = ExtractJwt[option.jwtFromRequest]();
          } else {
            throw new Error("JWT Extractor not found : " + option.jwtFromRequest);
          }
        } else {
          option.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
        }
      }
    }

    getStrategy(options) {
      this.getExtractor(options);
      return new JwtStrategy(options, (jwt_payload, done) => {
        this.logger("TRY AUTHORISATION " + this.name, "DEBUG");
        let mytoken = this.createToken(jwt_payload);
        this.authenticateToken(mytoken, this.provider).then((token) => {
          done(null, token);
          return token;
        }).catch((error) => {
          done(error, null);
          throw error;
        });
      });
    }

    createToken(payload) {
      return new nodefony.security.tokens.jwt(payload);
    }

  };
  return Factory;
});