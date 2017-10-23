module.exports = {
  session: {
    pattern: "/test/unit/session/{type}",
    defaults: {
      controller: "testBundle:session:session",
      type: "callback"
    },
    requirements: {
      method: ["GET", "POST", "WEBSOCKET"]
    }
  }
};
