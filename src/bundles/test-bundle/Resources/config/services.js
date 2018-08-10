module.exports = {
  myservice: {
    class: nodefony.services.myservice,
    arguments: ["@container", "@router", "@httpKernel", kernel.domain],
    calls: [{
      method: "boot",
      arguments: [kernel.domain, "myargs", "@httpsServer"]
    }, {
      method: "boot2",
      arguments: [
        [1, 2, 3, 4], null, "@httpServer"
      ]
    }]
  }
};