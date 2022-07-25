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
    this.once("onBoot", async () => {
      this.settings = this.container.getParameters("bundles.http").session;
      this.proba = parseInt(this.settings.gc_probability, 10);
      this.divisor = parseInt(this.settings.gc_divisor, 10);
      this.defaultSessionName = this.settings.name;
      this.sessionAutoStart = this.setAutoStart(this.settings.start);
      this.initializeStorage();
    });
    this.once("onTerminate", () => {
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
      this.on("onReady", () => {
        this.storage.open("default");
      });
    } else {
      this.storage = null;
      this.log("SESSION HANDLER STORAGE NOT FOUND :" + this.settings.handler, "ERROR");
    }
    return this.storage;
  }

  start(context, sessionContext) {
    if (context.sessionStarting) {
      this.log("SESSION ALLREADY STARTED ", "DEBUG");
      return new Promise((resolve) => {
        context.once("onSessionStart", (session) => {
          return resolve(session);
        });
      });
    }
    return new Promise((resolve, reject) => {
      if (context.session) {
        if (context.session.status === "active") {
          this.log("SESSION ALLREADY STARTED ==> " + context.session.name + " : " + context.session.id, "DEBUG");
          return resolve(context.session);
        }
      }
      context.sessionStarting = true;
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
            context.sessionStarting = false;
            session.setMetaBag("url", url.parse(context.url));
            context.fire("onSessionStart", session);
            return resolve(session);
          })
          .catch((err) => {
            return reject(err);
          });
      } catch (e) {
        this.log(e, "ERROR");
        return reject(e);
      }
    });
  }

  saveSession(context) {
    if (context.session) {
      if (!context.session.saved) {
        return context.session.save(context.user ? context.user : null, context.session.contextSession);
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
      this.once("onReady", () => {
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
