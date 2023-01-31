class Encoder {
  constructor (name, options = {}) {
    this.name = name;
    this.settings = options;
  }

  async encodePassword (/* raw, salt*/) {
    throw new Error("Encoder class must overload encodePassword method");
  }

  async isPasswordValid (/* encoded, raw, salt*/) {
    throw new Error("Encoder class must overload isPasswordValid method");
  }
}

nodefony.Encoder = Encoder;
module.exports = Encoder;
