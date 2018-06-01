module.exports = {
  serverStatics: {
    class: nodefony.services.serverStatics,
    arguments: ["@container"]
  },
  httpKernel: {
    class: nodefony.services.httpKernel,
    arguments: ["@container", "@serverStatics"]
  },
  httpServer: {
    class: nodefony.services.httpServer,
    arguments: ["@httpKernel"]
  },
  httpsServer: {
    class: nodefony.services.httpsServer,
    arguments: ["@httpKernel"]
  },
  websocketServer: {
    class: nodefony.services.websocketServer,
    arguments: ["@httpKernel"]
  },
  websocketServerSecure: {
    class: nodefony.services.websocketServerSecure,
    arguments: ["@httpKernel"]
  },
  sessions: {
    class: nodefony.services.sessions,
    arguments: ["@httpKernel"]
  },
  upload: {
    class: nodefony.services.upload,
    arguments: ["@httpKernel"]
  },
  sockjs: {
    class: nodefony.services.sockjs,
    arguments: ["@httpKernel", "@httpServer", "@httpsServer"]
  },
};