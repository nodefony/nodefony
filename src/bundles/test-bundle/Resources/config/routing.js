// ROUTING
const firewall = require("./routing/firewall.js");
const sessions = require("./routing/sessions.js");
const cors = require("./routing/cors.js");
const rest = require("./routing/rest.js");
const twig = require("./routing/twig.js");
const routes = require("./routing/routes.js");

module.exports = nodefony.extend(firewall, sessions, cors, rest, twig, routes, {
  // merge
  "test-merge": {
    pattern: "/test/merge",
    defaults: {
      controller: "app:app:index"
    }
  },
  "boats": {
    "pattern": "/test/boats",
    "defaults": {
      "controller": "test-bundle:boats:index"
    }
  },
  "vue": {
    "pattern": "/test/vue*",
    "defaults": {
      "controller": "test-bundle:vue:index"
    }
  }
});