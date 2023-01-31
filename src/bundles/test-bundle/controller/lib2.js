module.exports = (function () {
  const ele = class ele {
    constructor (name) {
      this.name = name;
    }

    toJson () {
      return {
        name: this.name
      };
    }
  };

  return new ele("lib5152");
}());
