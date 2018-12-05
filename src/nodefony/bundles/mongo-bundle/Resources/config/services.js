module.exports = {
  mongo: {
    class: nodefony.services.Mongo,
    arguments: ["@container"],
    calls: [{
      method: "boot",
      arguments: []
    }]
  }
};