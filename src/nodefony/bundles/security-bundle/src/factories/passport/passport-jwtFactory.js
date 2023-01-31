/*
 *	PASSPORT JSON WEB TOKEN  FACTORY JWT
 */
const JwtStrategy = require("passport-jwt").Strategy;
const {ExtractJwt} = require("passport-jwt");
const jwt = require("jsonwebtoken");

const fromCookieExtractor = function fromCookieExtractor (nameCookie) {
  const name = nameCookie || "jwt";
  return function (req) {
    let token = null;
    if (req && req.cookies && req.cookies[name]) {
      token = req.cookies.jwt.value;
    }
    return token;
  };
};

module.exports = nodefony.registerFactory("passport-jwt", () => {
  class jwtFactory extends nodefony.passeportFactory {
    constructor (security, settings) {
      super("jwt", security, settings);
      this.algorithm = this.settings.algorithms || "RS256";
      this.jwt = jwt;
      this.orm = this.kernel.getORM();
      this.jwtConfig = this.kernel.getBundle("security").settings["passport-jwt"];
    }

    logout (context) {
      return new Promise(async (resolve, reject) => {
        if (!context) {
          return reject(new nodefony.Error("logout no context"));
        }
        const {query} = context.request;
        this.log("logout jwt token", "DEBUG");
        this.log(query, "DEBUG");
        if (query.refreshToken) {
          const entity = this.orm.getEntity("jwt");
          const res = await entity.deleteRefreshToken(query.refreshToken);
          this.log(`delete jwt refrestoken : ${res}`, "DEBUG");
          if (res) {
            return resolve(super.logout(context));
          }
          return super.logout(context)
            .then(() => reject(new nodefony.Error("refreshToken not found")));
        }
        return reject(new nodefony.Error("No refreshToken parameter"));
      });
    }

    getStrategy (options = {}) {
      return new Promise((resolve, reject) => {
        try {
          const opt = nodefony.extend(true, {}, options);
          opt.jwtFromRequest = this.getExtractor(options);
          opt.secretOrKey = this.getSecretOrKeyConfig(options.secretOrKey);
          const strategy = new JwtStrategy(opt, (jwt_payload, done) => {
            this.log(`TRY AUTHORISATION ${this.name}`, "DEBUG");
            const mytoken = new nodefony.security.tokens.jwt(jwt_payload);
            mytoken.unserialize(mytoken);
            this.authenticateToken(mytoken)
              .then((token) => {
                done(null, token);
                return token;
              })
              .catch((error) => {
                done(error, null);
                throw error;
              });
          });
          return resolve(strategy);
        } catch (e) {
          return reject(e);
        }
      });
    }

    createToken (context = null /* , providerName = null*/) {
      if (context.metaSecurity) {
        if (context.metaSecurity.token) {
          const token = new nodefony.security.tokens.jwt(context.metaSecurity.token.jwtToken);
          token.unserialize(context.metaSecurity.token);
          return token;
        }
      }
      return new nodefony.security.tokens.jwt();
    }

    generateJwtToken (data = null, settings = {}) {
      const defaultSettings = {
        expiresIn: 900,
        algorithm: this.getAlgorithmKey()
      };
      const opt = nodefony.extend({}, defaultSettings, settings);
      return this.jwt.sign({
        data
      }, this.getPrivateKey(), opt);
    }

    async generateJwtRefreshToken (name, token, settings = {}) {
      const defaultSettings = {
        expiresIn: "1d",
        algorithm: this.getAlgorithmKey()
      };
      const opt = nodefony.extend({}, defaultSettings, settings);
      const refreshToken = this.generateJwtToken({
        username: name
      }, opt);
      const entity = this.orm.getEntity("jwt");
      await entity.setRefreshToken(name, token, refreshToken);
      return refreshToken;
    }

    verifyRefreshToken (refreshtoken) {
      return new Promise(async (resolve, reject) => {
        try {
          const entity = this.orm.getEntity("jwt");
          const mytoken = await entity.getRefreshToken(refreshtoken);
          if (!mytoken) {
            return reject(new Error("Refresh Token not found"));
          }
          if (!mytoken.active) {
            return reject(new Error("Refresh Token disabled"));
          }
          this.jwt.verify(refreshtoken, this.publicKey, (err, decoded) => {
            if (err) {
              return reject(err);
            }
            return resolve(decoded);
          });
        } catch (e) {
          throw e;
        }
      });
    }

    async updateJwtRefreshToken (name, token, refreshToken) {
      const entity = this.orm.getEntity("jwt");
      return await entity.updateRefreshToken(name, token, refreshToken);
    }

    async truncateJwtToken (username = null) {
      const entity = this.orm.getEntity("jwt");
      return await entity.truncate(username);
    }

    decodeJwtToken (token) {
      return this.jwt.decode(token);
    }

    getCertificats (settings = {}) {
      const cert = nodefony.extend(true, {}, this.settings.certificats, settings);
      const opt = {
        privatePath: this.kernel.checkPath(cert.private),
        publicPath: this.kernel.checkPath(cert.public),
        private: null,
        public: null
      };
      try {
        this.privateKey = fs.readFileSync(opt.privatePath);
        opt.private = this.privateKey;
        this.publicKey = fs.readFileSync(opt.publicPath);
        opt.public = this.publicKey;
      } catch (e) {
        throw e;
      }
      return opt;
    }

    getPrivateKey () {
      return this.privateKey;
    }

    setPrivateKey (key) {
      return this.privateKey = key;
    }

    getAlgorithmKey () {
      return this.algorithm;
    }

    getExtractor (option) {
      return this.getExtractorConfig(option.jwtFromRequest);
    }

    getExtractorConfig (options, params) {
      const type = nodefony.typeOf(options);
      switch (type) {
      case "string":
        switch (options) {
        case "fromCookie":
          return fromCookieExtractor.apply(this, params);
        default:
          if (ExtractJwt[options]) {
            return ExtractJwt[options].apply(this, params);
          }
          throw new Error(`Factory passport-jwt jwtFromRequest JWT Extractor not found  : ${options} `);
        }
        break;
      case "object":
        if (options.extractor) {
          return this.getExtractorConfig(options.extractor, options.params);
        }
        throw new Error(`Factory passport-jwt bad config Extractor jwtFromRequest : ${options} `);

        break;
      case null:
      case undefined:
        return ExtractJwt.fromAuthHeaderAsBearerToken();
      default:
        throw new Error(`Factory passport-jwt bad config Extractor jwtFromRequest : ${options} `);
      }
    }

    getSecretOrKeyConfig (options) {
      const type = nodefony.typeOf(options);
      switch (type) {
      case "string":
        this.publicKey = options;
        break;
      default:
        this.getCertificats();
        break;
      }
      return this.publicKey;
    }
  }
  return jwtFactory;
});
