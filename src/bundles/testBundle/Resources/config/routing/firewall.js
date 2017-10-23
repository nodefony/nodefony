// ROUTING FIREWALL

module.exports = {

  "test-sasl-area": {
    pattern: "/test/firewall/sasl",
    defaults: {
      controller: "testBundle:firewall:sasl"
    }
  },
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
      controller: "testBundle:cors:http"
    }
  }
};
