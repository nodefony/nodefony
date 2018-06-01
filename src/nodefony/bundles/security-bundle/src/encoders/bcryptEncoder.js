/*
 *	Encoder Bcrypt
 */
const bcrypt = require("bcrypt");

module.exports = nodefony.registerEncoder("bcrypt", () => {

  class bcryptEncoder extends nodefony.Encoder {

    constructor(options) {
      super("bcrypt", options);
      this.saltRounds = this.settings.saltRounds || 10;
    }

    encodePassword(raw, salt) {
      return bcrypt.hashSync(raw, salt || this.saltRounds);
    }

    isPasswordValid(raw, encoded) {
      return bcrypt.compareSync(raw, encoded);
    }

  }

  return bcryptEncoder;
});