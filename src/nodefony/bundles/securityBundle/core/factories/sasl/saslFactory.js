module.exports = nodefony.registerFactory("sasl", () => {

  const parseSASLAuth = function (request) {
    let str = request.headers.authorization || (request.query ? (request.query.authorization || request.query.Authorization) : null);
    if (str) {
      try {
        var tab = str.split(" ");
        if (tab[0] !== "SASL") {
          throw {
            message: "Stack Protocole SASL bad format",
            status: 401
          };
        }
        if (tab[0] === "SASL") {
          var tab2 = tab[1].split(",");
          var decode = new Buffer(tab2[1], 'base64').toString('ascii');
          request.headers.authorization = decode;
          return {
            mechanism: tab2[0].split("=")[1] ? tab2[0].split("=")[1].replace(/"/g, "") : null,
            decode: decode
          };
        }
      } catch (e) {
        throw {
          message: e,
          status: 401
        };
      }
    } else {
      throw {
        message: " Parse SASL security challenge authorization not found",
        status: 401
      };
    }
  };

  const Factory = class saslFactory extends nodefony.Factory {

    constructor(security, settings) {
      super("sasl", security, settings);
      this.defaultToken = "Digest";
      this.token = this.getAllMechanisms();
    }

    getPosition() {
      return "Form";
    }

    handle(context, callback) {
      return new Promise((resolve, reject) => {
        let request = context.request;
        let response = context.response;
        let res = null;
        try {
          res = parseSASLAuth(request);
        } catch (e) {
          this.logger(e.message, "WARNING");
          request.headers.authorization = null;
          res = {
            mechanism: this.defaultToken
          };
        }
        let typeMech = null;
        try {
          typeMech = this.getMechanisms(res.mechanism);
        } catch (e) {
          typeMech = this.getMechanisms(this.defaultToken);
          let token = new typeMech(request, response, this.settings);
          response.setHeader("WWW-Authenticate", this.generateResponse(token));
          if (callback) {
            callback(e, null);
          }
          return reject(e);
        }
        let token = null;
        try {
          token = new typeMech(request, response, this.settings);
          this.logger("TRY AUTHORISATION " + this.name + " " + token.name, "DEBUG");
          if (!token.authorization) {
            //response.setHeader("WWW-Authenticate", this.generateResponse(token));
            throw {
              status: 401,
              message: "Unauthorized"
            };
          }
          token.checkResponse(this.security.provider.getUserPassword.bind(this.security.provider), (error, result) => {
            if (error) {
              response.setHeader("WWW-Authenticate", this.generateResponse(token));
              if (callback) {
                callback(error, null);
              }
              return reject(error);
            }
            if (result === true) {
              this.security.provider.loadUserByUsername(token.username, (error, result) => {
                if (error) {
                  response.setHeader("WWW-Authenticate", this.generateResponse(token));
                  callback(error, null);
                  return error;
                }
                context.user = result;
                if (callback) {
                  callback(null, token);
                }
                return resolve(token);
              });
            }
            return resolve(result);
          });
        } catch (e) {
          this.logger(e, "ERROR");
          response.setHeader("WWW-Authenticate", this.generateResponse(token));
          if (callback) {
            callback(e, null);
          }
          return reject(e);
        }
      });
    }

    generateResponse(token) {
      //console.log(request)
      let res = "SASL ";
      let line = {
        "mechanisms": token.name
      };
      line.challenge = token.generateResponse();
      for (let ele in line) {
        res += ele + "=" + line[ele] + ",";
      }
      return res.substring(0, res.length - 1);
    }

    getAllMechanisms() {
      let mech = '"';
      this.nbMechanism = 0;
      for (let me in nodefony.security.tokens) {
        mech += me + " ";
        this.nbMechanism++;
      }
      var str = mech.substring(0, mech.length - 1);
      str += '"';
      return str;
    }

    getMechanisms(mech) {
      if (mech in nodefony.security.tokens) {
        return nodefony.security.tokens[mech];
      } else {
        throw new Error("SASL mechanism token  : " + mech + " is not implemented");
      }
    }

    generatePasswd(realm, user, passwd) {
      var func = new nodefony.security.tokens.Digest();
      return func(realm, user, passwd);
    }
  };

  return Factory;

});