module.exports = nodefony.register("Encoder", () => {
  class Encoder {
    constructor(name, options = {}) {
      this.name = name;
      this.settings = options;
    }
    encodePassword( /*raw, salt*/ ) {
      throw new Error(`Encoder class must overload encodePassword method`);
    }
    isPasswordValid( /*encoded, raw, salt*/ ) {
      throw new Error(`Encoder class must overload isPasswordValid method`);
    }
  }
  return Encoder;
});