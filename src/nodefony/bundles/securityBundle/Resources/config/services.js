module.exports = {
  cors: {
    class: nodefony.services.cors,
    arguments: ["@container", "@httpKernel"]
  },
  security: {
    class: nodefony.services.security,
    arguments: ["@container", "@kernel", "@cors"]
  },
  authorization: {
    class: nodefony.services.Authorization,
    arguments: ["@container", "@security"]
  }
  //oauth2: {
  //  class: nodefony.services.oauth2,
  //  arguments: ["@container", "@kernel"]
  //}
};