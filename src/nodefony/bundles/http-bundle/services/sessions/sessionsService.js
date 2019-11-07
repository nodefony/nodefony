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
    this.sessionStrategy = "none";
    this.listen(this, "onBoot", () => {
      this.settings = this.container.getParameters("bundles.http").session;
      this.proba = parseInt(this.settings.gc_probability, 10);
      this.divisor = parseInt(this.settings.gc_divisor, 10);
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
    let storage = null;
    switch (this.settings.handler) {
    case "orm":
    case "ORM":
      storage = nodefony.session.storage[this.kernel.getOrm()];
      break;
    default:
      storage = nodefony.session.storage[this.settings.handler];
    }
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
    return new Promise((resolve, reject) => {
      if (context.session) {
        if (context.session.status === "active") {
          this.logger("SESSION ALLREADY STARTED ==> " + context.session.name + " : " + context.session.id, "WARNING");
          return resolve(context.session);
        }
      }
      try {
        sessionContext = this.setAutoStart(sessionContext);
        if (this.probaGarbage()) {
          this.storage.gc(this.settings.gc_maxlifetime, sessionContext);
        }
        let inst = this.createSession(this.defaultSessionName, this.settings);
        return inst.start(context, sessionContext)
          .then((session) => {
            if (!session) {
              throw new Error("SESSION START session storage ERROR");
            }
            context.session = session;
            session.setMetaBag("url", url.parse(context.url));
            context.fire("onSessionStart", session);
            return resolve(session);
          })
          .catch((err) => {
            return reject(err);
          });
      } catch (e) {
        return reject(e);
      }
    });
  }

  saveSession(context) {
    if (context.session) {
      if (!context.session.saved) {
        context.session.setMetaBag("lastUsed", new Date());
        return context.session.save(context.user ? context.user.username : null, context.session.contextSession);
      }
    }
    return new Promise((resolve) => {
      resolve(null);
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
    if (this.proba > 0) {
      let rand = Math.random();
      let random = parseInt(this.divisor * (rand === 1 ? Math.random() : rand), 10);
      if (random < this.proba) {
        return true;
      }
    }
    return false;
  }
};
