const xml = require("xml2js");

const parser = function (type, settings) {
  let Parser = null;
  switch (type) {
  case "xml":
    Parser = new xml.Parser(settings);
    return function (value, callback) {
      return Parser.parseString(value, callback);
    };
  case "json":
    Parser = JSON.parse;
    const context = this;
    if (context.root) {
      return function (value, callback) {
        try {
          return callback(null, Parser(value)[context.root]);
        } catch (e) {
          return callback(e, null);
        }
      };
    }
    return function (value, callback) {
      try {
        return callback(null, Parser(value));
      } catch (e) {
        return callback(e, null);
      }
    };
  }
};

const builder = function (method, type) {
  let Builder = null;
  switch (type) {
  case "xml":
    Builder = new xml.Builder({
      rootName: this.root
    });
    return function (obj) {
      return Builder.buildObject(obj);
    };
  case "json":
    Builder = JSON.stringify;
    const context = this;
    if (context.root) {
      return function (obj) {
        const base = {};
        base[context.root] = nodefony.extend({}, context[method]);
        nodefony.extend(true, base[context.root], obj);
        return Builder(base);
      };
    }
    return function (obj) {
      const base = nodefony.extend({}, context[method]);
      nodefony.extend(true, base, obj);
      return Builder(base);
    };

    break;
  }
  return null;
};

const defaultSettingsProtocol = {
  extention: "json",
  xml: {}
};

class Protocol {
  constructor (rootName, settings) {
    this.settings = nodefony.extend(true, {}, defaultSettingsProtocol, settings);
    this.root = rootName;
    this.extention = this.settings.extention;
    this.request = {};
    this.response = {};
    this.parser = parser.call(this, this.extention, this.settings.xml);
    this.builderResponse = builder.call(this, "response", this.extention, this.settings.xml);
    this.builderRequest = builder.call(this, "request", this.extention, this.settings.xml);
  }
}

nodefony.io.protocol = {
  reader: Protocol
};
module.exports = nodefony.io.protocol;
