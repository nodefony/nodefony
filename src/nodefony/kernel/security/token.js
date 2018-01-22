module.exports = nodefony.register('Token', () => {

  const Token = class Token {

    constructor(name, request, response, settings) {
      this.name = name;
      this.settings = settings;
      this.request = request;
      this.response = response;
      this.host = request.headers.host;
      this.auth = false;
    }

  };

  return Token;
});