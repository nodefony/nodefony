/*
 *	Token JWT
 */
const jwt = require('jsonwebtoken');

nodefony.register.call(nodefony.security.tokens, "Jwt", function () {

  const settingsJWT = {

  };



  const Jwt = class Jwt extends nodefony.Token {
    constructor(request, response, options) {
      super("jwt", request, response, nodefony.extend({}, settingsJWT, options));
    }

    generateToken() {

    }

    checkToken(getUserPassword, callback) {

    }

    generatePasswd(realm, username, passwd) {

    }
  };
  return Jwt;
});