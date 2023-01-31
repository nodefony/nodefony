module.exports = {

  myroute: {
    pattern: "/myroute",
    defaults: {
      controller: "test:test:myroute",
      page: 51,
      elements: "defaultValue"
    },
    requirements: {
      method: ["GET"],
      page: /^\d\d$/
    }
  },
  myroute2: {
    pattern: "/myroute/{page}/{elements}",
    defaults: {
      controller: "test:test:myroute",
      page: 13,
      elements: "myRouteDefaultValue"
    },
    requirements: {
      method: ["GET"],
      page: /^\d\d$/
    }
  },
  "myroute-*": {
    pattern: "/wildcard/*",
    defaults: {
      controller: "test:test:wildcard"
    }
  },
  "myroute-*1": {
    pattern: "/wildcard1*",
    defaults: {
      controller: "test:test:wildcard"
    }
  },
  "myroute-*2": {
    pattern: "/wildcard2/{*}",
    defaults: {
      "controller": "test:test:wildcard"
    }
  },
  "myroute-*3": {
    pattern: "/wildcard3/{*}/route2",
    defaults: {
      "controller": "test:test:wildcard"
    }
  },
  "myroute-*4": {
    pattern: "/wildcard4/{*}/route2/{*}/test",
    defaults: {
      "controller": "test:test:wildcard"
    }
  },
  "myroute-requirement-method-get": {
    pattern: "/requirement/method",
    defaults: {
      controller: "test:test:requirementMethod"
    },
    requirements: {
      method: ["GET"]
    }
  },
  "myroute-requirement-method-post": {
    pattern: "/requirement/method",
    defaults: {
      controller: "test:test:requirementMethod"
    },
    requirements: {
      method: ["POST"]
    }
  }
};
