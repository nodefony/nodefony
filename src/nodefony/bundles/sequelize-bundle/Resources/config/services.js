module.exports = {
  sequelize: {
    class: nodefony.services.sequelize,
    arguments: ["@container", "@kernel", "@autoLoader"],
    calls: [{
      method: "boot",
      arguments: []
    }]
  },
  umzug: {
    environment: ["development", "CONSOLE"],
    class: nodefony.services.umzug,
    arguments: ["@container", "@sequelize"]
  }
};
