module.exports = {
  mail: {
    class: nodefony.services.mail,
    arguments: ["@container"],
    calls: [{
      method: "initialize",
      arguments: [kernel.domain]
    }]
  }
};