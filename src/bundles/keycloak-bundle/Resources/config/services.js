module.exports = {
  keycloack: {
    class: nodefony.services.Keycloak,
    arguments: ["@container"],
    calls: [{
      method: "boot",
      arguments: []
    }]
  }
};
