module.exports = {
  elastic: {
    class: nodefony.services.Elastic,
    arguments: ["@container"],
    calls: [{
      method: "boot",
      arguments: []
    }]
  }
};