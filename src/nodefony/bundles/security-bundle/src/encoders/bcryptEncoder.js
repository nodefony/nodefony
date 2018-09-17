/*
 *	Encoder Bcrypt
 */
let bcrypt = null;
try {
  bcrypt = require("bcrypt");
} catch (e) {
  console.warn(e);
}
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