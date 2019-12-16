/*
 *	Encoder Bcrypt
 */
let bcrypt = null;
try {
  bcrypt = require("bcrypt");
} catch (e) {
  console.warn(e);
}

class bcryptEncoder extends nodefony.Encoder {

  constructor(options) {
    super("bcrypt", options);
    this.saltRounds = this.settings.saltRounds || 10;
  }

  async encodePassword(raw, salt) {
    return await bcrypt.hash(raw, salt || this.saltRounds);
  }

  async isPasswordValid(raw, encoded) {
    return await bcrypt.compare(raw, encoded);
  }

}

nodefony.encoders.bcrypt = bcryptEncoder;
module.exports = bcryptEncoder;