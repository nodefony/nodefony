/*
 *	ROUTING BUNDLE
 *
 *        GENERATED
 *         ROUTING
 */
let route = require("./routing/routes.js");

module.exports = nodefony.extend(route, {
  "test-basic-area": {
    "pattern": "/test/firewall/basic",
    "defaults": {
      "controller": "test:firewall:basic"
    }
  },
  "test-digest-area": {
    "pattern": "/test/firewall/digest",
    "defaults": {
      "controller": "test:firewall:digest"
    }
  },
  "test-local-area": {
    "pattern": "/test/firewall/local",
    "defaults": {
      "controller": "test:firewall:local"
    }
  },
  "test-api-area": {
    "pattern": "/test/firewall/api",
    "defaults": {
      "controller": "test:firewall:api"
    }
  },
  "check-ldap": {
    "pattern": "/test/firewall/ldap",
    "defaults": {
      "controller": "test:firewall:ldap"
    }
  },
  "check-jwt": {
    "pattern": "/test/firewall/jwt",
    "defaults": {
      "controller": "app:login:jwt"
    }
  },
  "test-cors-settings": {
    "pattern": "/test/unit/cors/http/{area}",
    "defaults": {
      "controller": "test:cors:http"
    }
  },
  "test-cors-http": {
    "pattern": "/test/firewall/local/cors/http/{area}",
    "defaults": {
      "controller": "test:cors:http"
    }
  },
  "test-cors-session-http": {
    "pattern": "/test/firewall/cors/session/{protocol}",
    "defaults": {
      "controller": "test:cors:protocolSession"
    }
  },
  "rest-401": {
    "pattern": "/test/unit/rest/401",
    "defaults": {
      "controller": "test:rest:401"
    }
  },
  "rest-403": {
    "pattern": "/test/unit/rest/403",
    "defaults": {
      "controller": "test:rest:403"
    }
  },
  "twig-render": {
    "pattern": "/test/unit/twig/render",
    "defaults": {
      "controller": "test:twig:render"
    },
    "requirements": {
      "method": [
        "GET",
        "POST"
      ]
    }
  },
  "twig-extend": {
    "pattern": "/test/unit/twig/extend",
    "defaults": {
      "controller": "test:twig:extend"
    },
    "requirements": {
      "method": [
        "GET",
        "POST"
      ]
    }
  },
  "twig-websocket": {
    "pattern": "/test/unit/twig/websocket",
    "defaults": {
      "controller": "test:twig:websocket"
    },
    "requirements": {
      "method": [
        "GET",
        "POST",
        "WEBSOCKET"
      ]
    }
  },
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