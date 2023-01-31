module.exports = {
  mongoose: {
    class: nodefony.services.mongoose,
    arguments: ["@container", "@kernel", "@autoLoader"],
    calls: [{
      method: "boot"
    }]
  }
};
