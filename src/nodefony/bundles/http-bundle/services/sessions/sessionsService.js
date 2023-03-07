/* eslint-disable no-undefined */
/*
 *
 *    SERVICE SESSION
 *
 *
 */
module.exports = class sessions extends nodefony.Service {
  constructor (httpKernel) {
    super("SESSIONS", httpKernel.container, httpKernel.notificationsCenter);
    this.httpKernel = httpKernel;
    this.sessionStrategy = "none";
    this.once("onBoot", () => {
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

  setAutoStart (setting) {
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
      throw new Error(`Session start settings config error : ${setting}`);
    }
  }

  initializeStorage () {
    let storage = null;
    switch (this.settings.handler) {
    case "orm":
    case "ORM":
      storage = nodefony.session.storage[this.kernel.getOrm()];
      break;
    default:
      storage = nodefony.session.storage[this.settings.handler];
    }
    try {
      if (storage) {
        // eslint-disable-next-line new-cap
        this.storage = new storage(this);
        this.on("onReady", () => {
          this.storage.open("default");
        });
      } else {
        this.storage = null;
        this.log(`SESSION HANDLER STORAGE NOT FOUND :${this.settings.handler}`, "ERROR");
      }
      return this.storage;
    } catch (e) {
      throw e;
    }
  }

  start (context, sessionContext) {
    return new Promise((resolve, reject) => {
      if (context.sessionStarting) {
        if (context.session) {
          resolve(context.session);
          return;
        }
        context.once("onSessionStart", (session, error) => {
          if (session) {
            return resolve(session);
          }
          return reject(error || new Error("Bad Session"));
        });
        return;
      }
      if (context.session) {
        if (context.session.status === "active") {
          this.log(`SESSION ALLREADY STARTED ==> ${context.session.name} : ${context.session.id}`, "DEBUG");
          resolve(context.session);
          return;
        }
      }
      let inst = null;
      try {
        context.sessionStarting = true;
        sessionContext = this.setAutoStart(sessionContext);
        if (this.probaGarbage()) {
          this.storage.gc(this.settings.gc_maxlifetime, sessionContext);
        }
        inst = this.createSession(this.defaultSessionName, this.settings);
      } catch (e) {
        context.fire("onSessionStart", null, e);
        reject(e);
        throw e;
      }
      inst.start(context, sessionContext)
        .then((session) => {
          try {
            context.session = session;
            if (context.method !== "WEBSOCKET" && context.request && context.request.request) {
              context.request.request.session = session;
            }
            context.sessionStarting = false;
            session.setMetaBag("url", url.parse(context.url));
            if (context.cleaned) {
              return reject(new Error("context already cleaned"));
            }
            context.fire("onSessionStart", session, null);
            return resolve(session);
          } catch (e) {
            if (context.cleaned) {
              return reject(e);
            }
            context.fire("onSessionStart", null, e);
            return reject(e);
          }
        })
        .catch((err) => {
          console.log(err);
          if (context.cleaned) {
            return reject(err);
          }
          context.fire("onSessionStart", null, err);
          return reject(err);
        });
    });
  }

  saveSession (context) {
    if (context.session) {
      if (!context.session.saved) {
        return context.session.save(context.user ? context.user : null, context.session.contextSession);
      }
    }
    return new Promise((resolve) => {
      resolve(null);
    });
  }

  createSession (name, settings) {
    try {
      return new nodefony.Session(name, settings, this.storage, this);
    } catch (e) {
      throw e;
    }
  }

  addContextSession (context) {
    if (this.storage) {
      this.once("onReady", () => {
        this.storage.open(context);
      });
    }
  }

  setSessionStrategy (strategy) {
    this.sessionStrategy = strategy;
  }

  probaGarbage () {
    if (this.proba > 0) {
      const rand = Math.random();
      const random = parseInt(this.divisor * (rand === 1 ? Math.random() : rand), 10);
      if (random < this.proba) {
        return true;
      }
    }
    return false;
  }
};
