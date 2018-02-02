module.exports = nodefony.register('Provider', () => {

  const Provider = class Provider extends nodefony.Service {

    constructor(name, security) {
      super(name, security.container);
      this.security = security;

    }

    authenticate(token) {
      if (token && this.supports(token)) {
        return token;
      }
      throw new Error("The token is not supported by this authentication provider " + this.name);
    }

    supports( /*token*/ ) {
      return true;
    }

  };

  return Provider;
});