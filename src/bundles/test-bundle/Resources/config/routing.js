/*
 *	ROUTING BUNDLE
 *
 *        GENERATED
 *         ROUTING
 */
const route = require("./routing/routes.js");
const cors = require("./routing/cors.js");
const firewall = require("./routing/firewall.js");
const twig = require("./routing/twig.js");
const rest = require("./routing/rest.js");
const sessions = require("./routing/sessions.js");

module.exports = nodefony.extend(sessions, rest, twig, firewall, cors, route, {

  "test-merge": {
    "pattern": "/test/merge",
    "defaults": {
      "controller": "app:app:index"
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
  },
  "redis": {
    "pattern": "/test/redis",
    "defaults": {
      "controller": "test-bundle:redis:index"
    }
  }
});
