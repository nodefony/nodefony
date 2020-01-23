/*
 *	PASSPORT JSON WEB TOKEN  FACTORY JWT
 */
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const jwt = require('jsonwebtoken');

const fromCookieExtractor = function fromCookieExtractor(nameCookie) {
  const name = nameCookie || "jwt";
  return function (req) {
    var token = null;
    if (req && req.cookies && req.cookies[name]) {
      token = req.cookies.jwt.value;
    }
    return token;
  };
};

module.exports = nodefony.registerFactory("passport-jwt", () => {

  class jwtFactory extends nodefony.passeportFactory {

    constructor(security, settings) {
      super("jwt", security, settings);
      this.algorithm = this.settings.algorithms || "RS256";
      this.jwt = jwt;
      this.orm = this.kernel.getORM();
      this.jwtConfig = this.kernel.getBundle("security").settings["passport-jwt"];
      this.entity = null;
      this.orm.on("onOrmReady", () => {
        this.entity = this.orm.getEntity("jwt");
      });
    }

    logout(context) {
      return new Promise(async (resolve, reject) => {
        if (!context) {
          return reject(new nodefony.Error("logout no context"));
        }
        const query = context.request.query;
        if (query.refreshToken) {
          let res = await this.entity.deleteRefreshToken(query.refreshToken);
          if (res) {
            return resolve(super.logout(context));
          }
          return super.logout(context)
            .then(() => {
              return reject(new nodefony.Error("refreshToken not found"));
            });

        }
        return reject(new nodefony.Error("No refreshToken parameter"));
      });

    }

    getStrategy(options = {}) {
      return new Promise((resolve, reject) => {
        try {
          let opt = nodefony.extend(true, {}, options);
          opt.jwtFromRequest = this.getExtractor(options);
          opt.secretOrKey = this.getSecretOrKeyConfig(options.secretOrKey);
          let strategy = new JwtStrategy(opt, (jwt_payload, done) => {
            this.logger("TRY AUTHORISATION " + this.name, "DEBUG");
            let mytoken = new nodefony.security.tokens.jwt(jwt_payload);
            mytoken.unserialize(mytoken);
            this.authenticateToken(mytoken)
              .then((token) => {
                done(null, token);
                return token;
              }).catch((error) => {
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

    createToken(context = null /*, providerName = null*/ ) {
      if (context.metaSecurity) {
        if (context.metaSecurity.token) {
          let token = new nodefony.security.tokens.jwt(context.metaSecurity.token.jwtToken);
          token.unserialize(context.metaSecurity.token);
          return token;
        }
      }
      return new nodefony.security.tokens.jwt();
    }

    generateJwtToken(data = null, settings = {}) {
      let defaultSettings = {
        expiresIn: 900,
        algorithm: this.getAlgorithmKey()
      };
      let opt = nodefony.extend({}, defaultSettings, settings);
      return this.jwt.sign({
        data: data
      }, this.getPrivateKey(), opt);
    }

    async generateJwtRefreshToken(name, token, settings = {}) {
      let defaultSettings = {
        expiresIn: "1d",
        algorithm: this.getAlgorithmKey()
      };
      let opt = nodefony.extend({}, defaultSettings, settings);
      const refreshToken = this.generateJwtToken({
        username: name
      }, opt);
      await this.entity.setRefreshToken(name, token, refreshToken);
      return refreshToken;
    }

    verifyRefreshToken(refreshtoken) {
      return new Promise(async (resolve, reject) => {
        try {
          const mytoken = await this.entity.getRefreshToken(refreshtoken);
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
    async updateJwtRefreshToken(name, token, refreshToken) {
      return await this.entity.updateRefreshToken(name, token, refreshToken);
    }

    async truncateJwtToken(username = null) {
      return await this.entity.truncate(username);
    }

    decodeJwtToken(token) {
      return this.jwt.decode(token);
    }

    getCertificats(settings = {}) {
      let cert = nodefony.extend(true, {}, this.settings.certificats, settings);
      let opt = {
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

    getPrivateKey() {
      return this.privateKey;
    }

    setPrivateKey(key) {
      return this.privateKey = key;
    }

    getAlgorithmKey() {
      return this.algorithm;
    }

    getExtractor(option) {
      return this.getExtractorConfig(option.jwtFromRequest);
    }

    getExtractorConfig(options, params) {
      let type = nodefony.typeOf(options);
      switch (type) {
      case "string":
        switch (options) {
        case "fromCookie":
          return fromCookieExtractor.apply(this, params);
        default:
          if (ExtractJwt[options]) {
            return ExtractJwt[options].apply(this, params);
          } else {
            throw new Error(`Factory passport-jwt jwtFromRequest JWT Extractor not found  : ${options} `);
          }
        }
        break;
      case "object":
        if (options.extractor) {
          return this.getExtractorConfig(options.extractor, options.params);
        } else {
          throw new Error(`Factory passport-jwt bad config Extractor jwtFromRequest : ${options} `);
        }
        break;
      case null:
      case undefined:
        return ExtractJwt.fromAuthHeaderAsBearerToken();
      default:
        throw new Error(`Factory passport-jwt bad config Extractor jwtFromRequest : ${options} `);
      }
    }

    getSecretOrKeyConfig(options) {
      let type = nodefony.typeOf(options);
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