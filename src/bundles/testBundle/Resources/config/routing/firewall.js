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
  }
};