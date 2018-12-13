/*
 *	ROUTING BUNDLE
 *
 *        GENERATED
 *         ROUTING
 */
let route = require("./routing/routes.js");
let cors = require("./routing/cors.js");
let firewall = require("./routing/firewall.js");
let twig = require("./routing/twig.js");
let rest = require("./routing/rest.js");
let sessions = require("./routing/sessions.js");

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