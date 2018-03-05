module.exports = nodefony.register("Error", function () {

  class httpError extends Error {

    constructor(message, code, container) {
      super(message);
      this.context = null;
      this.code = code || null;
      this.bundle = "Not Defined";
      this.controller = "Not Defined";
      this.url = "Not Defined";
      if (container) {
        this.context = container.get('context');
      }
      if (message) {
        this.parseMessage(message, code);
      }

    }

    parseMessage(message) {
      if (!this.code) {
        if (this.context && this.context.response) {
          this.code = this.context.response.getStatusCode();
          if (this.code === 1000 || this.code === 200) {
            this.code = 500;
          }
        }
      }
      switch (nodefony.typeOf(message)) {
      case "object":
        if (message.status) {
          this.code = message.status;
        }
        if (message.code) {
          this.code = message.code;
        }
        try {
          this.message = JSON.stringify(message);
        } catch (e) {
          this.message = e;
        }
        break;
      case "string":
        this.message = message;
        break;
      case "Error":
        this.message = message.message;
        if (message.code) {
          this.code = message.code;
        }
        break;
      }
    }
  }

  return httpError;
});