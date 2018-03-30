module.exports = nodefony.register("Service", function () {

  const settingsSyslog = {
    //rateLimit:100,
    //burstLimit:10,
    moduleName: "SERVICE ",
    defaultSeverity: "INFO"
  };

  const defaultOptions = {
    nbListeners: 20
  };

  const red = clc.red.bold;
  const cyan = clc.cyan.bold;
  const blue = clc.blueBright.bold;
  const green = clc.green;
  const yellow = clc.yellow.bold;

  class Service {

    constructor(name, container, notificationsCenter, options) {

      if (name) {
        this.name = name;
      }
      if (options) {
        this.options = nodefony.extend(true, {}, defaultOptions, options);
      } else {
        //optimize
        this.options = nodefony.extend(true, {}, defaultOptions);
      }
      if (container instanceof nodefony.Container) {
        this.container = container;
      } else {
        if (container) {
          throw new Error("Service nodefony container not valid must be instance of nodefony.Container");
        }
        this.container = new nodefony.Container();
        this.container.set("container", this.container);
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
        }
      } else {
        if (notificationsCenter) {
          throw new Error("Service nodefony notificationsCenter not valid must be instance of nodefony.notificationsCenter.notification");
        }
        this.notificationsCenter = nodefony.notificationsCenter.create(this.options, this, this.options.nbListeners);
        if (!this.kernel) {
          this.set("notificationsCenter", this.notificationsCenter);
        } else {
          if (this.kernel.container !== this.container) {
            this.set("notificationsCenter", this.notificationsCenter);
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

    logger(pci, severity, msgid, msg) {
      try {
        if (!msgid) {
          msgid = "SERVICE " + this.name + " ";
        }
        return this.syslog.logger(pci, severity, msgid, msg);
      } catch (e) {
        console.log(pci);
      }
    }

    /**
     *  @method fire
     *  @param {String} event name
     *  @param {Arguments} ... arguments to inject
     */
    fire() {
      //this.logger(ev, "DEBUG", "EVENT KERNEL")
      if (this.notificationsCenter) {
        return this.notificationsCenter.fire.apply(this.notificationsCenter, arguments);
      }
    }

    /**
     *  @method listen
     *  @param {Oject} context
     *  @param {String} eventName
     *  @param {Function} listener
     */
    listen() {
      return this.notificationsCenter.listen.apply(this.notificationsCenter, arguments);
    }
    on() {
      return this.notificationsCenter.on.apply(this.notificationsCenter, arguments);
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

    /**
    *  @method once
    *  @param {String} eventName
    *  @param {Function} listener

    */
    once() {
      //this.logger(ev, "DEBUG", "EVENT KERNEL")
      return this.notificationsCenter.once.apply(this.notificationsCenter, arguments);
    }

    /**
     *  @method setMaxListeners
     *  @param nb
     */
    setMaxListeners() {
      return this.notificationsCenter.setMaxListeners.apply(this.notificationsCenter, arguments);
    }

    /**
     *  @method removeListener
     *  @param {Oject} eventName
     *  @param {String} listener
     */
    removeListener() {
      return this.notificationsCenter.unListen.apply(this.notificationsCenter, arguments);
    }

    /**
     *  @method removeAllListeners
     */
    removeAllListeners() {
      return this.notificationsCenter.removeAllListeners.apply(this.notificationsCenter, arguments);
    }

    /**
     *  @method prependOnceListener
     */
    prependOnceListener() {
      return this.notificationsCenter.prependOnceListener.apply(this.notificationsCenter, arguments);
    }

    /**
     *  @method prependListener
     */
    prependListener() {
      return this.notificationsCenter.prependListener.apply(this.notificationsCenter, arguments);
    }

    /**
     *  @method getMaxListeners
     */
    getMaxListeners() {
      return this.notificationsCenter.getMaxListeners.apply(this.notificationsCenter, arguments);
    }

    /**
     *  @method listenerCount
     */
    listenerCount() {
      return this.notificationsCenter.listenerCount.apply(this.notificationsCenter, arguments);
    }

    /**
     *  @method listenerCount
     */
    listeners() {
      return this.notificationsCenter.listeners.apply(this.notificationsCenter, arguments);
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

    getParameters() {
      return this.container.getParameters.apply(this.container, arguments);
    }

    setParameters() {
      return this.container.setParameters.apply(this.container, arguments);
    }

    has() {
      return this.container.has.apply(this.container, arguments);
    }
  }
  return Service;
});