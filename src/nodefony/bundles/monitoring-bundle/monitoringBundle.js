module.exports = class monitoringBundle extends nodefony.Bundle {
  constructor(name, kernel, container) {
    super(name, kernel, container);

    this.infoKernel = {};
    this.kernel.once("onPreBoot", async (kernel) => {
      this.infoKernel.events = {};
      this.eventPreboot()
    });
  }

  async eventPreboot() {
    this.log("Monitoring Event onPreBoot","DEBUG")
    for (let event in kernel.notificationsCenter._events) {
      switch (event) {
      case "onPreBoot":
        this.infoKernel.events[event] = {
          fire: kernel.preboot,
          nb: 1,
          listeners: kernel.notificationsCenter._events[event].length
        };
        break;
      default:
        this.infoKernel.events[event] = {
          fire: false,
          nb: 0,
          listeners: kernel.notificationsCenter._events[event].length
        };
        kernel.on(event, () => {
          this.infoKernel.events[event].fire = true;
          this.infoKernel.events[event].nb = ++this.infoKernel.events[event].nb;
        });
      }
    }
  }

};
