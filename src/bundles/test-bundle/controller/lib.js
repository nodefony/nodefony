const lib2 = require('./lib2.js');
module.exports = function () {

  const ele = class ele {

    constructor(name) {
      this.name = name;
    }

    toJson() {
      return {
        lib1: this.name,
        lib2: lib2.toJson()
      };
    }
  };

  return new ele("lib51");
}();