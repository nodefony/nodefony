module.exports = {
  redis: {
    class: nodefony.services.Redis,
    arguments: ["@container"],
    calls: [{
      method: "boot",
      arguments: []
    }]
  }
};
