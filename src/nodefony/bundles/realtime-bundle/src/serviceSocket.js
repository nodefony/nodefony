module.exports = class ServiceSocket extends nodefony.Service {
  constructor (options) {
    const service = options.container.get(options.name);
    if (!service) {
      throw new Error(`service : ${options.name} not found`);
    }
    super("ServiceSocket", options.container, service.notificationsCenter, options.options);
    this.service = service;
    this.idConnection = null;
    this.id = nodefony.generateId();
  }

  setConnection (id) {
    this.idConnection = id;
  }

  toJson () {
    return {
      id: this.id,
      type: "service",
      name: this.service.name
    };
  }

  async connect () {
    try {
      return await this.service.connect();
    } catch (e) {
      throw e;
    }
  }

  async send (message) {
    try {
      return await this.service.onMessage(message);
    } catch (e) {
      throw e;
    }
  }

  async destroy () {
    try {
      return await this.service.destroy();
    } catch (e) {
      throw e;
    }
  }

  async close () {
    try {
      return await this.service.close();
    } catch (e) {
      throw e;
    }
  }
};
