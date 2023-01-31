module.exports = {
  "twig-render": {
    pattern: "/test/unit/twig/render",
    defaults: {
      controller: "test:twig:render"
    },
    requirements: {
      method: ["GET", "POST"]
    }
  },
  "twig-extend": {
    pattern: "/test/unit/twig/extend",
    defaults: {
      controller: "test:twig:extend"
    },
    requirements: {
      method: ["GET", "POST"]
    }
  },
  "twig-websocket": {
    pattern: "/test/unit/twig/websocket",
    defaults: {
      controller: "test:twig:websocket"
    },
    requirements: {
      method: ["GET", "POST", "WEBSOCKET"]
    }
  }
};
