// ROUTING FIREWALL

module.exports = {

  "test-basic-area": {
    pattern: "/test/firewall/basic",
    defaults: {
      controller: "test:firewall:basic"
    }
  },
  "test-digest-area": {
    pattern: "/test/firewall/digest",
    defaults: {
      controller: "test:firewall:digest"
    }
  },
  "test-local-area": {
    pattern: "/test/firewall/local",
    defaults: {
      controller: "test:firewall:local"
    }
  },
  "test-api-area": {
    pattern: "/test/firewall/api",
    defaults: {
      controller: "test:firewall:api"
    }
  },
  "check-ldap": {
    pattern: "/test/firewall/ldap",
    defaults: {
      controller: "test:firewall:ldap"
    }
  },
  "check-jwt": {
    pattern: "/test/firewall/jwt",
    defaults: {
      controller: "app:login:jwt"
    }
  }
};