module.exports = nodefony.register("Error", function () {

  class nodefonyError extends Error {

    constructor(message) {
      super(message);
    }

    toString() {
      return `${clc.red("MESSAGE :")} ${this.message}
      ${clc.green("STACK :")} ${this.stack}`;
    }

    parseMessage(message) {
      switch (nodefony.typeOf(message)) {
      case "Error":
        this.message = message.message;
        this.stack = message.stack;
        break;
      case "object":
        try {
          this.message = JSON.stringify(message);
        } catch (e) {
          this.error = e;
        }
        break;
      }
    }

    logger() {
      return console.log(this.toString());
    }

  }
  return nodefonyError;
});