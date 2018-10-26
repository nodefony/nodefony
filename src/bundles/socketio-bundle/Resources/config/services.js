module.exports = {
  socketio: {
    class: nodefony.services.socketio,
    arguments: ["@container", "@httpsServer"]
  }
};