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

const red = clc.red.bold;
const cyan = clc.cyan.bold;
const blue = clc.blueBright.bold;
const green = clc.green;
const yellow = clc.yellow.bold;

class Service {

  constructor(name, container, notificationsCenter, options = null) {

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
        this.options = {};
      } else {
        //optimize
        this.options = nodefony.extend(true, {}, defaultOptions);
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
      this.syslog = new nodefony.syslog(this.settingsSyslog);
      this.set("syslog", this.syslog);
    } else {
      this.settingsSyslog = this.syslog.settings;
    }
    if (notificationsCenter instanceof nodefony.notificationsCenter.notification) {
      this.notificationsCenter = notificationsCenter;
      if (options) {
        this.notificationsCenter.settingsToListen(options, this);
        if (options.nbListeners) {
          this.notificationsCenter.setMaxListeners(options.nbListeners);
        }
      }
    } else {
      if (notificationsCenter) {
        throw new Error("Service nodefony notificationsCenter not valid must be instance of nodefony.notificationsCenter.notification");
      }
      if (notificationsCenter !== false) {
        this.notificationsCenter = nodefony.notificationsCenter.create(this.options, this, this.options.events);
        this.notificationsCenter.on('error', (err) => {
          this.logger(err, "ERROR", "Error events");
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
  }

  static logSeverity(severity) {
    switch (severity) {
      case "DEBUG":
        return cyan(severity);
      case "INFO":
        return blue(severity);
      case "NOTICE":
        return red(severity);
      case "WARNING":
        return yellow(severity);
      case "ERROR":
      case "CRITIC":
      case "ALERT":
      case "EMERGENCY":
        return red(severity);
      default:
        return cyan(severity);
    }
  }

  initSyslog(environment = "production", debug = false, options = null) {
    let defaultOptions = {
      severity: {
        operator: "<=",
        data: "7"
      }
    };
    return this.syslog.listenWithConditions(this, options || defaultOptions,
      (pdu) => {
        let message = pdu.payload;
        let date = new Date(pdu.timeStamp);
        console.log(`${date.toDateString()} ${date.toLocaleTimeString()} ${nodefony.Service.logSeverity(pdu.severityName)} ${cyan(pdu.msgid)} : ${message}`);
      });
  }

  getName() {
    return this.name;
  }

  clean() {
    this.settingsSyslog = null;
    delete this.settingsSyslog;
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

  log(pci, severity, msgid, msg) {
    try {
      if (!msgid) {
        msgid = "SERVICE " + this.name + " ";
      }
      return this.syslog.logger(pci, severity, msgid, msg);
    } catch (e) {
      console.log(pci);
    }
  }

  logger(...args) {
    return this.log(...args);
  }
  eventNames(...args){
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
  addListener(...args){
    this.notificationsCenter.addListener(...args);
  }
  listen(...args) {
    return this.notificationsCenter.listen(...args);
  }
  on(...args) {
    return this.notificationsCenter.on(...args);
  }
  off(...args) {
    return this.notificationsCenter.off(...args);
  }

  listenSyslog(options) {
    let defaultOption = {
      severity: {
        operator: "<=",
        data: "7"
      }
    };
    this.syslog.listenWithConditions(this, options || defaultOption, (pdu) => {
      let date = new Date(pdu.timeStamp);
      console.log(date.toDateString() + " " + date.toLocaleTimeString() + " " + Service.logSeverity(pdu.severityName) + " " + green(pdu.msgid) + " " + " : " + pdu.payload);
    });
  }

  once(...args) {
    return this.notificationsCenter.once(...args);
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
    return this.notificationsCenter.prependListener(...args)
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
   *  @method listenerCount
   */
  listeners(...args) {
    return this.notificationsCenter.listeners(...args);
  }

  rawListeners(...args){
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

nodefony.Service = Service;
module.exports = Service;
