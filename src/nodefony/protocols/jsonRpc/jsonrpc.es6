module.exports = nodefony.register.call(nodefony.io.protocol, "json-rpc", () => {
  class Jsonrpc extends nodefony.io.protocol.reader {
    constructor (/* rootName, settings*/) {
      super(null, {
        extention: "json"
      });
      this.request = {
        jsonrpc: "2.0",
        method: null,
        params: null,
        id: null
      };
      this.response = {
        jsonrpc: "2.0",
        result: null,
        error: null,
        id: null
      };
    }

    methodError (error, id) {
      const ele = nodefony.extend({}, this.response, {
        error,
        id
      });
      return this.builderResponse(ele);
    }

    methodSuccees (result, id) {
      const ele = nodefony.extend({}, this.response, {
        result,
        id
      });
      return this.builderResponse(ele);
    }

    onMessage (message) {
      switch (nodefony.typeOf(message)) {
      case "string":
        var ret = null;
        this.parser(message, (err, mess) => {
          if (err) {
            throw err;
          }
          ret = this.onMessage(mess);
        });
        return ret;
      case "object":
        return message;
      default:
        throw new Error("JSONRPC message bad format ");
      }
    }
  }
  return Jsonrpc;
});
