module.exports = {
  //  provides all functions for each API endpoint
  Query: {
    getServices (obj, field, context, info) {
      const serviceParam = context.container.getParameters("services");
      const {
        name
      } = field;
      const bundle = context.kernel.getBundle(name);
      const tab = [];
      const services = {};
      // console.log(nodefony.services, Object.keys(nodefony.services).length)
      // console.log(serviceParam, Object.keys(serviceParam).length)
      for (const service in serviceParam) {
        const ele = serviceParam[service];
        services[service] = {};
        if (ele) {
          services[service].name = service;
          services[service].run = "INJECTOR";
          services[service].scope = ele.scope === "container" ? "Default container" : ele.scope;
          services[service].calls = ele.calls;
          services[service].injections = ele.injections; // inject;
          services[service].properties = ele.properties;
          services[service].orderInjections = Boolean(ele.orderArguments);
        } else {
          services[service].run = "KERNEL";
          services[service].scope = "KERNEL container";
        }
        const serv = context.get(service);
        if (serv.bundle) {
          services[service].bundle = serv.bundle.name;
        }
        tab.push(services[service]);
      }
      for (const service in nodefony.services) {
        if (!(service in services)) {
          // console.log(service)
        } else {

        }
      }
      return JSON.stringify(tab);
    },

    getServicesbyBundle (obj, field, context, info) {
      const {
        name
      } = field;
      const services = JSON.parse(this.getServices(obj, field, context, info));
      const tab = services.filter((service) => {
        if (service.bundle === name) {
          return service;
        }
        return null;
      });
      return JSON.stringify(tab);
    }
  }

};
