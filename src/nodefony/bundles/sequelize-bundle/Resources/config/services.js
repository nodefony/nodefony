module.exports = {
  sequelize: {
    class: nodefony.services.sequelize,
    arguments: ["@container", "@kernel", "@autoLoader"]
  },
  umzug: {
    class: nodefony.services.umzug,
    arguments: ["@container", "@sequelize"]
  }
};
