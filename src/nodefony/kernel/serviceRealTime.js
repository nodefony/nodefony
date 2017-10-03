module.exports = nodefony.register("realtimeService", function() {


  const realtime = class realtime extends nodefony.Service {

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

  };
  return realtime;

});
