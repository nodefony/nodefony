module.exports = {
  "twig-render": {
    pattern: "/test/unit/twig/render",
    defaults: {
      controller: "testBundle:twig:render"
    },
    requirements: {
      method: ["GET", "POST"]
    }
  },
  "twig-extend": {
    pattern: "/test/unit/twig/extend",
    defaults: {
      controller: "testBundle:twig:extend"
    },
    requirements: {
      method: ["GET", "POST"]
    }
  },
  "twig-websocket": {
    pattern: "/test/unit/twig/websocket",
    defaults: {
      controller: "testBundle:twig:websocket"
    },
    requirements: {
      method: ["GET", "POST", "WEBSOCKET"]
    }
  }
};
