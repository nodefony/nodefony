const settingsSyslog = {
  //rateLimit:100,
  //burstLimit:10,
  moduleName: "SERVICE ",
  defaultSeverity: "INFO"
};

const defaultOptions = {
  events: {
    nbListeners: 20
  }
};

class Service {

  constructor(name, container, notificationsCenter, options = {}) {
    if (name) {
      this.name = name;
    }
    if (options) {
      if (notificationsCenter === false) {
        this.options = nodefony.extend(true, {}, options);
      } else {
        this.options = nodefony.extend(true, {}, defaultOptions, options);
      }
    } else {
      if (notificationsCenter === false) {
        this.options = options;
      } else {
        this.options = nodefony.extend(true, {}, defaultOptions, options);
      }
    }
    if (container instanceof nodefony.Container) {
      this.container = container;
    } else {
      if (container) {
        if (nodefony.isContainer(container)) {
          this.container = container;
        } else {
          throw new Error("Service nodefony container not valid must be instance of nodefony.Container");
        }
      } else {
        this.container = new nodefony.Container();
        this.container.set("container", this.container);
      }
    }
    let kernel = this.container.get("kernel");
    if (kernel) {
      this.kernel = kernel;
    }
    this.syslog = this.container.get("syslog");
    if (!this.syslog) {
      this.settingsSyslog = nodefony.extend({}, settingsSyslog, {
        moduleName: this.name
      }, this.options.syslog || {});
      this.syslog = new nodefony.Syslog(this.settingsSyslog);
      this.set("syslog", this.syslog);
    } else {
      this.settingsSyslog = this.syslog.settings;
    }
    if (notificationsCenter instanceof nodefony.Events) {
      this.notificationsCenter = notificationsCenter;
      if (options) {
        this.notificationsCenter.settingsToListen(options, this);
        if (options.nbListeners) {
          this.notificationsCenter.setMaxListeners(options.nbListeners);
        }
      }
    } else {
      if (notificationsCenter) {
        throw new Error("Service nodefony notificationsCenter not valid must be instance of nodefony.Events");
      }
      if (notificationsCenter !== false) {
        this.notificationsCenter = new nodefony.Events(this.options, this, this.options.events);
        this.notificationsCenter.on('error', (err) => {
          this.log(err, "ERROR", "Error events");
        });
        if (!this.kernel) {
          this.set("notificationsCenter", this.notificationsCenter);
        } else {
          if (this.kernel.container !== this.container) {
            this.set("notificationsCenter", this.notificationsCenter);
          }
        }
      }
    }
    delete this.options.events;
  }

  initSyslog(environment = "production", debug = undefined, options = null) {
    return this.syslog.init(environment, debug, options);
  }

  getName() {
    return this.name;
  }

  clean(syslog = false) {
    this.settingsSyslog = null;
    delete this.settingsSyslog;
    if (syslog) {
      this.syslog.reset();
    }
    this.syslog = null;
    delete this.syslog;
    this.removeAllListeners();
    this.notificationsCenter = null;
    delete this.notificationsCenter;
    this.container = null;
    delete this.container;
    this.kernel = null;
    delete this.kernel;
  }

  log(pci, severity, msgid = null, msg = null) {
    try {
      if (!msgid) {
        msgid = this.name;
      }
      if(this.syslog){
        return this.syslog.log(pci, severity, msgid, msg);
      }
    } catch (e) {
      console.log(severity, msgid, msg, " : ", pci);
      console.warn(e);
    }
  }

  logger(one, ...args) {
    return console.debug(nodefony.Syslog.wrapper(this.log(one, "DEBUG")).text, one, ...args);
  }

  trace(one, ...args) {
    return console.trace(nodefony.Syslog.wrapper(this.log(one, "DEBUG")).text, one, ...args);
  }

  spinlog(message){
    //process.stdout.write("\u001b[0G");
    //process.stdout.write(message);
    //process.stdout.write("\u001b[90m\u001b[0m");
    return this.log(message, "SPINNER");
  }

  eventNames(...args) {
    return this.notificationsCenter.eventNames(...args);
  }
  fire(...args) {
    return this.notificationsCenter.emit(...args);
  }
  fireAsync(...args) {
    return this.notificationsCenter.emitAsync(...args);
  }
  emit(...args) {
    return this.notificationsCenter.emit(...args);
  }
  emitAsync(...args) {
    return this.notificationsCenter.emitAsync(...args);
  }
  addListener(...args) {
    this.notificationsCenter.addListener(...args);
  }
  listen(...args) {
    return this.notificationsCenter.listen(...args);
  }
  on(...args) {
    return this.notificationsCenter.on(...args);
  }

  once(...args) {
    return this.notificationsCenter.once(...args);
  }

  off(...args) {
    return this.notificationsCenter.off(...args);
  }

  settingsToListen(...args) {
    return this.notificationsCenter.settingsToListen(...args);
  }

  /**
   *  @method setMaxListeners
   *  @param nb
   */
  setMaxListeners(...args) {
    return this.notificationsCenter.setMaxListeners(...args);
  }

  removeListener(...args) {
    return this.notificationsCenter.unListen(...args);
  }

  /**
   *  @method removeAllListeners
   */
  removeAllListeners(...args) {
    return this.notificationsCenter.removeAllListeners(...args);
  }

  /**
   *  @method prependOnceListener
   */
  prependOnceListener(...args) {
    return this.notificationsCenter.prependOnceListener(...args);
  }

  /**
   *  @method prependListener
   */
  prependListener(...args) {
    return this.notificationsCenter.prependListener(...args);
  }

  /**
   *  @method getMaxListeners
   */
  getMaxListeners(...args) {
    return this.notificationsCenter.getMaxListeners(...args);
  }

  /**
   *  @method listenerCount
   */
  listenerCount(...args) {
    return this.notificationsCenter.listenerCount(...args);
  }

  /**
   *  @method listeners
   */
  listeners(...args) {
    return this.notificationsCenter.listeners(...args);
  }

  rawListeners(...args) {
    return this.notificationsCenter.rawListeners(...args);
  }

  /**
   *  @method get
   *  @param {String} name of service
   */
  get(name) {
    if (this.container) {
      return this.container.get(name);
    }
    return null;
  }

  /**
   *  @method set
   *  @param {String} name of service
   *  @param {Object} instance of service
   */
  set(name, obj) {
    if (this.container) {
      return this.container.set(name, obj);
    }
    return null;
  }

  remove(name) {
    if (this.container) {
      let ele = this.get(name);
      if (ele) {
        if (ele instanceof nodefony.Service) {
          ele.clean();
        }
        this.container.remove(name);
      }
    }
    return false;
  }

  getParameters(...args) {
    return this.container.getParameters(...args);
  }

  setParameters(...args) {
    return this.container.setParameters(...args);
  }

  has(...args) {
    return this.container.has(...args);
  }
}

module.exports = Service;
