module.exports = {
  monitoring: {
    class: nodefony.services.monitoring,
    arguments: ["@realTime", "@container", "@kernel"]
  },
  serverLoad: {
    class: nodefony.services.serverLoad,
    arguments: ["@container", "@kernel"]
  }
};
