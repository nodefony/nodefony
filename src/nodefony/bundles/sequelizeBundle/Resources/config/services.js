module.exports = {
  sequelize: {
    class: nodefony.services.sequelize,
    arguments: ["@container", "@kernel", "@autoLoader"]
  }
};
