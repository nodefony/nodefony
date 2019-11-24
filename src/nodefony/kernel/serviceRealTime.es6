module.exports = nodefony.register("realtimeService", function () {

  class Realtime extends nodefony.Service {

    constructor(name, container, notificationsCenter, options) {
      super(name, container, notificationsCenter, options);
      this.realTime = this.get("realTime");
    }

    createServer() {

    }

    startServer() {

    }

    stopServer() {

    }

  }
  return Realtime;
});