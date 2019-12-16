module.exports = {
  router: {
    class: nodefony.services.router,
    arguments: ["@container", "@httpKernel"]
  },
  translation: {
    class: nodefony.services.translation,
    arguments: ["@container"],
    calls: [{
      method: "boot",
      arguments: []
    }]
  },
  webpack: {
    class: nodefony.services.webpack,
    arguments: ["@container", "@kernel"]
  },
  cron: {
    class: nodefony.services.cron,
    arguments: ["@container"]
  }
};
