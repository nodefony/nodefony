/*
 *
 *    SERVICE SESSION
 *
 *
 */
module.exports = class sessions extends nodefony.Service {

  constructor(httpKernel) {
    super("SESSIONS", httpKernel.container, httpKernel.notificationsCenter);
    this.httpKernel = httpKernel;
    //this.firewall = security;
    this.kernel = httpKernel.kernel;
    this.sessionStrategy = "none";
    this.listen(this, "onBoot", () => {
      this.settings = this.container.getParameters("bundles.http").session;
      this.defaultSessionName = this.settings.name;
      this.sessionAutoStart = this.setAutoStart(this.settings.start);
      this.initializeStorage();
    });
    this.listen(this, "onTerminate", () => {
      if (this.storage) {
        this.storage.close();
      }
    });
  }

  setAutoStart(setting) {
    switch (setting) {
    case true:
    case "":
    case undefined:
      return "default";
    case false:
    case null:
      return null;
    default:
      if (typeof setting === "string") {
        return setting;
      }

      throw new Error("Session start settings config error : " + setting);
    }
  }

  initializeStorage() {
    let storage = nodefony.session.storage[this.settings.handler];
    if (storage) {
      this.storage = new storage(this);
      this.listen(this, "onReady", function () {
        this.storage.open("default");
      });
    } else {
      this.storage = null;
      this.logger("SESSION HANDLER STORAGE NOT FOUND :" + this.settings.handler, "ERROR");
    }
    return this.storage;
  }

  start(context, sessionContext) {
    if (context.session) {
      if (context.session.status === "active") {
        this.logger("SESSION ALLREADY STARTED ==> " + context.session.name + " : " + context.session.id, "WARNING");
        return new Promise((resolve /*, reject*/ ) => {
          return resolve(context.session);
        });
      }
    }
    sessionContext = this.setAutoStart(sessionContext);
    if (this.probaGarbage()) {
      this.storage.gc(this.settings.gc_maxlifetime, sessionContext);
    }
    let inst = this.createSession(this.defaultSessionName, this.settings);
    return inst.start(context, sessionContext).then((session) => {
      if (!session) {
        throw new Error("SESSION START session storage ERROR");
      }
      context.session = session;
      session.setMetaBag("url", url.parse(context.url));
      if (context.method !== "WEBSOCKET") {
        context.listen(session, "onSend", function () {
          this.setMetaBag("lastUsed", new Date());
          if (!this.saved) {
            this.save(context.user ? context.user.id : null, sessionContext);
          }
        });
      }
      return session;
    }).catch((err) => {
      throw err;
    });
  }

  createSession(name, settings) {
    try {
      return new nodefony.Session(name, settings, this.storage, this);
    } catch (e) {
      throw e;
    }
  }

  addContextSession(context) {
    if (this.storage) {
      this.listen(this, "onReady", function () {
        this.storage.open(context);
      });
    }
  }

  setSessionStrategy(strategy) {
    this.sessionStrategy = strategy;
  }

  probaGarbage() {
    let proba = parseInt(this.settings.gc_probability, 10);
    let divisor = parseInt(this.settings.gc_divisor, 10);
    if (proba > 0) {
      let rand = Math.random();
      let random = parseInt(divisor * (rand === 1 ? Math.random() : rand), 10);
      if (random < proba) {
        return true;
      }
    }
    return false;
  }
};
