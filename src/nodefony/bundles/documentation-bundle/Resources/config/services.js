module.exports = {
  webCrawler: {
    class: nodefony.services.webCrawler,
    arguments: ["@container", "@kernel"]
  },
  git: {
    class: nodefony.services.git,
    arguments: ["@container"]
  }
};