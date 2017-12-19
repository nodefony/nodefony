module.exports = {

  /*mongo: {
    class: nodefony.services.mongo,
    arguments: ["@container"]
  },*/
  mongoose: {
    class: nodefony.services.mongoose,
    arguments: ["@container", "@kernel", "@autoLoader"],
    calls: [{
      method: "boot"
    }]
  }
};