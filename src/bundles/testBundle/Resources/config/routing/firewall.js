// ROUTING FIREWALL

module.exports = {

  "test-basic-area": {
    pattern: "/test/firewall/basic",
    defaults: {
      controller: "testBundle:firewall:basic"
    }
  },
  "test-digest-area": {
    pattern: "/test/firewall/digest",
    defaults: {
      controller: "testBundle:firewall:digest"
    }
  },
  "test-local-area": {
    pattern: "/test/firewall/local",
    defaults: {
      controller: "testBundle:firewall:local"
    }
  },
  "test-api-area": {
    pattern: "/test/firewall/api",
    defaults: {
      controller: "testBundle:firewall:api"
    }
  },
  "check-ldap": {
    pattern: "/ldap",
    defaults: {
      controller: "testBundle:firewall:ldap"
    }
  }
};