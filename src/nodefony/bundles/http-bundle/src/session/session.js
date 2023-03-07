/*
 *
 *    CLASS SESSION
 */
// eslint-disable-next-line init-declarations
let crypto;
try {
  crypto = require("node:crypto");
} catch (err) {
  crypto = require("crypto");
  // console.log('crypto support is disabled!', err);
}
const {
  createHash,
  createCipheriv,
  createDecipheriv,
  randomBytes
} = crypto;


// eslint-disable-next-line max-lines-per-function
nodefony.register("Session", () => {
  const checkSecureReferer = function checkSecureReferer (context) {
    let host = null;
    switch (this.context.type) {
    case "HTTP":
    case "HTTPS":
    case "HTTP2":
      host = context.getHost();
      break;
    case "WEBSOCKET":
    case "WEBSOCKET SECURE":
      // eslint-disable-next-line prefer-destructuring
      host = this.context.request.httpRequest.headers.host;
      break;
    default:
    }
    const meta = this.getMetaBag("host");
    if (host === meta) {
      return host;
    }
    this.manager.log(`SESSION START WARNING REFERRER NOT SAME, HOST : ${host} ,META STORAGE :${meta}`, "WARNING");
    // eslint-disable-next-line no-throw-literal
    throw {
      meta,
      host
    };
  };

  const setMetasSession = function setMetasSession (cookieSetting = {}) {
    // let time = new Date();
    let ua = null;
    this.setMetaBag("lifetime", cookieSetting.maxAge || this.settings.cookie.maxAge);
    this.setMetaBag("context", this.contextSession || null);
    this.setMetaBag("request", this.context.type);
    // this.setMetaBag("created", time);
    try {
      this.setMetaBag("remoteAddress", this.context.getRemoteAddress());
      this.setMetaBag("host", this.context.getHost());
      ua = this.context.getUserAgent();
    } catch (e) {
      this.log(e, "DEBUG");
    }
    if (ua) {
      this.setMetaBag("user_agent", ua);
    } else {
      this.setMetaBag("user_agent", "Not Defined");
    }
  };

  const Session = class Session extends nodefony.Container {
    constructor (name, settings, storage, manager) {
      super();
      if (!storage) {
        this.status = "disabled";
      } else {
        this.status = "none"; // active | disabled
      }
      this.manager = manager;
      this.strategy = this.manager.sessionStrategy;
      this.strategyNone = false;
      this.log = manager.log.bind(manager);
      this.setName(name);
      this.id = null;
      this.settings = settings;
      this.storage = storage;
      this.context = null;
      this.contextSession = "default";
      this.lifetime = this.settings.cookie.maxAge;
      this.saved = false;
      this.flashBag = {};
      this.key = this.settings.encrypt.password;
      this.iv = this.settings.encrypt.iv;
      this.created = null;
      this.updated = null;
      this.username = null;
    }

    get (name) {
      if (!name) {
        return this.protoService.prototype;
      }
      return super.get(name);
    }

    encrypt (text) {
      const cipher = createCipheriv("aes-256-ctr", this.key, this.iv);
      let encrypted = cipher.update(text, "utf8", "hex");
      encrypted += cipher.final("hex");
      return encrypted;
    }

    decrypt (text) {
      const decipher = createDecipheriv("aes-256-ctr", this.key, this.iv);
      let decrypted = decipher.update(text, "hex", "utf8");
      decrypted += decipher.final("utf8");
      return decrypted;
    }

    create (lifetime, id, settingsCookie = {}) {
      this.id = id || this.setId();
      const defaultSetting = nodefony.extend({}, this.settings.cookie);
      settingsCookie = nodefony.extend(defaultSetting, settingsCookie);
      this.manager.log(`NEW SESSION CREATE : ${this.id}`, "DEBUG");
      try {
        this.cookieSession = this.setCookieSession(lifetime, settingsCookie);
        setMetasSession.call(this, settingsCookie);
        this.status = "active";
        return this;
      } catch (e) {
        this.log(e, "ERROR");
        throw new Error("Request can't create cookieSession");
        // this.log(`,"WARNING")
      }
    }

    start (context, contextSession) {
      this.context = context;
      if (!contextSession) {
        // eslint-disable-next-line prefer-destructuring
        contextSession = this.contextSession;
      }
      if (this.settings.use_only_cookies) {
        this.applyTranId = 0;
      } else {
        this.applyTranId = this.settings.use_trans_sid;
      }
      try {
        const ret = this.checkStatus();
        switch (ret) {
        case false:
          return new Promise((resolve /* , reject*/) => resolve(this));
        case "restart":
          return this.start(context, contextSession)
            .catch((e) => {
              throw e;
            });
        default:
          return this.getSession(contextSession)
            .catch((e) => {
              throw e;
            });
        }
      } catch (e) {
        this.log(e, "ERROR");
        throw e;
      }
    }

    checkStatus () {
      switch (this.status) {
      case "active":
        this.manager.log(`SESSION ALLREADY STARTED ==> ${this.name} : ${this.id}`, "WARNING");
        return false;
      case "disabled":
        try {
          this.storage = this.manager.initializeStorage();
          if (this.storage) {
            this.status = "none";
            return "restart";
          }
        } catch (e) {
          this.manager.log("SESSION STORAGE HANDLER NOT FOUND ", "ERROR");
          throw new Error("SESSION STORAGE HANDLER NOT FOUND ");
        }
        break;
      default:
        return true;
      }
      return true;
    }

    async getSession (contextSession) {
      if (this.settings.use_cookies) {
        if (this.context.cookieSession) {
          this.id = this.getId(this.context.cookieSession.value);
          this.cookieSession = this.context.cookieSession;
        }
        this.applyTranId = 0;
      }
      if (!this.settings.use_only_cookies && !this.id) {
        if (this.name in this.context.request.query) {
          this.id = this.getId(this.context.request.query[this.name]);
        }
      }
      if (this.id) {
        return this.checkChangeContext(contextSession)
          .catch((e) => {
            throw e;
          });
      }
      try {
        this.clear();
        return this.create(this.lifetime, null);
      } catch (e) {
        throw e;
      }
    }

    async checkChangeContext (contextSession) {
      // change context session
      if (contextSession && this.contextSession !== contextSession) {
        this.manager.log(`SESSION CONTEXT CHANGE : ${this.contextSession} ==> ${contextSession}`);
        switch (this.strategy) {
        case "migrate":
          return this.storage.start(this.id, this.contextSession)
            .then(async (result) => {
              this.deSerialize(result);
              if (!this.isValidSession(result, this.context)) {
                this.manager.log(`INVALID SESSION ==> ${this.name} : ${this.id}`, "WARNING");
                await this.destroy();
                this.contextSession = contextSession;
                return this.create(this.lifetime, null);
              }
              await this.removeSession();
              this.manager.log(`STRATEGY MIGRATE SESSION  ==> ${this.name} : ${this.id}`, "DEBUG");
              this.migrated = true;
              this.contextSession = contextSession;
              return this.create(this.lifetime, null);
            })
            .catch((error) => {
              throw error;
            });
        case "invalidate":
          this.manager.log(`STRATEGY INVALIDATE SESSION ==> ${this.name} : ${this.id}`, "DEBUG");
          await this.destroy();
          this.contextSession = contextSession;
          return new Promise((resolve, reject) => {
            try {
              resolve(this.create(this.lifetime, null));
            } catch (e) {
              reject(e);
            }
          });
        case "none":
          this.strategyNone = true;
          break;
        default:
        }
        if (!this.strategyNone) {
          return new Promise((resolve /* , reject*/) => resolve(this));
        }
      }
      return this.storage.start(this.id, this.contextSession)
        .then(async (result) => {
          try {
            if (result && Object.keys(result).length) {
              this.deSerialize(result);
              if (!this.isValidSession(result, this.context)) {
                this.manager.log(`SESSION ==> ${this.name} : ${this.id}  session invalid `, "ERROR");
                await this.invalidate();
              }
            } else if (this.settings.use_strict_mode) {
              if (!this.strategyNone) {
                this.manager.log(`SESSION ==> ${this.name} : ${this.id} use_strict_mode `, "ERROR");
                await this.invalidate();
              }
            }
            this.status = "active";
            return this;
          } catch (e) {
            throw e;
          }
        })
        .catch(async (error) => {
          if (error) {
            try {
              this.manager.log(`SESSION ==> ${this.name} : ${this.id} ${error}`, "ERROR");
              if (!this.strategyNone) {
                await this.invalidate()
                  .catch((e) => {
                    throw e;
                  });
              }
              throw error;
            } catch (e) {
              throw error;
            }
          }
        });
    }

    isValidSession (data, context) {
      if (this.settings.referer_check) {
        try {
          checkSecureReferer.call(this, context);
        } catch (e) {
          this.manager.log(`SESSION REFERER ERROR SESSION  ==> ${this.name} : ${this.id}`, "WARNING");
          return false;
        }
      }
      // console.log( this.updated , new Date(this.updated) )
      const lastUsed = new Date(this.updated).getTime();
      // let lastUsed = new Date(this.getMetaBag("lastUsed")).getTime();
      const now = new Date().getTime();
      if (this.lifetime === 0) {
        // if ( lastUsed && lastUsed + ( this.settings.gc_maxlifetime * 1000 ) < now ){
        //     this.manager.log("SESSION INVALIDE gc_maxlifetime    ==> " + this.name + " : "+ this.id, "WARNING");
        //     return false ;
        // }
        return true;
      }
      // eslint-disable-next-line no-mixed-operators
      if (lastUsed && lastUsed + this.lifetime * 1000 < now) {
        this.manager.log(`SESSION INVALIDE lifetime   ==> ${this.name} : ${this.id}`, "WARNING");
        return false;
      }
      return true;
    }

    attributes () {
      return this.protoService.prototype;
    }

    getAttributes () {
      return this.attributes();
    }

    metaBag () {
      return this.protoParameters.prototype;
    }

    getMetas () {
      return this.metaBag();
    }

    setMetaBag (key, value) {
      return this.setParameters(key, value);
    }

    getMetaBag (key) {
      return this.getParameters(key);
    }

    getFlashBag (key) {
      // this.log("GET FlashBag : " + key ,"WARNING")
      const res = this.flashBag[key];
      if (res) {
        this.log(`Delete FlashBag : ${key}`, "DEBUG");
        delete this.flashBag[key];
        return res;
      }
      return null;
    }

    setFlashBag (key, value) {
      if (!key) {
        throw new Error(`FlashBag key must be define : ${key}`);
      }
      if (!value) {
        this.log(`ADD FlashBag  : ${key} value not defined `, "WARNING");
      } else {
        this.log(`ADD FlashBag : ${key}`, "DEBUG");
      }
      this.flashBag[key] = value;
      return value;
    }

    flashBags () {
      return this.flashBag;
    }

    clearFlashBags () {
      delete this.flashBag;
      this.flashBag = {};
    }

    clearFlashBag (key) {
      if (!key) {
        throw new Error(`clearFlashBag key must be define : ${key}`);
      }
      if (this.flashBag[key]) {
        delete this.flashBag[key];
      }
    }

    deleteCookieSession (cookie = null) {
      if (this.context && this.context.response) {
        if (cookie) {
          cookie.expires = new Date(null);
        } else if (this.cookieSession) {
          this.cookieSession.expires = new Date(null);
          cookie = this.cookieSession;
        } else {
          // eslint-disable-next-line new-cap
          cookie = new nodefony.cookies.cookie(this.name, "", {
            expires: new Date(null)
            // path: "/"
          });
        }
        this.context.response.setCookie(cookie);
        this.cookieSession = null;
        this.context.cookieSession = null;
        return cookie;
      }
      return this.cookieSession;
    }

    setCookieSession (leftTime, settings = {}) {
      if (this.context && this.context.response) {
        // let settings = null;
        const defaultsettings = nodefony.extend({}, this.settings.cookie);
        settings = nodefony.extend(defaultsettings, settings);
        if (leftTime) {
          settings.maxAge = leftTime;
        }
        // eslint-disable-next-line new-cap
        const cookie = new nodefony.cookies.cookie(this.name, this.id, settings);
        // this.context.response.setCookie(cookie);
        this.context.response.addCookie(cookie);
        this.cookieSession = cookie;
        this.context.cookieSession = cookie;
        return cookie;
      }
      return null;
    }

    serialize (user) {
      const obj = {
        Attributes: this.protoService.prototype,
        metaBag: this.protoParameters.prototype,
        flashBag: this.flashBag,
        username: user
      };
      return obj;
    }

    deSerialize (obj) {
      // var obj = JSON.parse(data);
      for (const attr in obj.Attributes) {
        this.set(attr, obj.Attributes[attr]);
      }
      for (const meta in obj.metaBag) {
        // console.log(meta + " : " + obj.metaBag[meta])
        this.setMetaBag(meta, obj.metaBag[meta]);
      }
      for (const flash in obj.flashBag) {
        this.setFlashBag(flash, obj.flashBag[flash]);
      }
      this.created = obj.created;
      this.updated = obj.updated;
      this.username = obj.user || obj.username;
    }

    removeSession (cookieDelete = null) {
      if (this.saved === true) {
        return this.storage.destroy(this.id, this.contextSession)
          .then(() => {
            if (cookieDelete) {
              this.deleteCookieSession(cookieDelete);
            }
            this.saved = true;
            return true;
          })
          .catch((e) => {
            this.manager.log(e, "ERROR");
            throw e;
          });
      }
      if (cookieDelete) {
        this.deleteCookieSession(cookieDelete);
      }
      return Promise.resolve(true);
    }

    delete (cookieDelete) {
      return this.destroy(cookieDelete);
    }

    destroy (cookieDelete) {
      this.clear();
      return this.removeSession(cookieDelete);
    }

    clear () {
      delete this.protoService;
      // eslint-disable-next-line no-empty-function
      this.protoService = function protoService () {};
      delete this.protoParameters;
      // eslint-disable-next-line no-empty-function
      this.protoParameters = function protoParameters () {};
      delete this.services;
      // eslint-disable-next-line new-cap
      this.services = new this.protoService();
      delete this.parameters;
      // eslint-disable-next-line new-cap
      this.parameters = new this.protoParameters();
      this.clearFlashBags();
    }

    async invalidate (lifetime = this.lifetime, id = null, settingsCookie = null) {
      this.manager.log(`INVALIDATE SESSION ==>${this.name} : ${this.id}`, "DEBUG");
      this.saved = true;
      return await this.destroy(this.cookieSession)
        .then(() => {
          this.saved = false;
          return this.create(lifetime, id, settingsCookie);
        })
        .catch((e) => {
          throw e;
        });
    }

    async migrate (destroy, lifetime = this.lifetime, id = null, settingsCookie = null) {
      this.manager.log(`MIGRATE SESSION ==>${this.name} : ${this.id}`, "DEBUG");
      try {
        if (destroy) {
          this.saved = true;
          await this.removeSession(this.cookieSession)
            .then((ret) => {
              this.saved = false;
              return ret;
            })
            .catch((e) => {
              throw e;
            });
        }
        return this.create(lifetime, id, settingsCookie);
      } catch (e) {
        this.log(e, "WARNING");
        return this;
      }
    }

    setId () {
      let ip = "";
      try {
        ip = this.context.getRemoteAddress();
      } catch (e) {
        this.log(e, "DEBUG");
      }
      const date = new Date().getTime();
      // eslint-disable-next-line no-mixed-operators
      const concat = ip + date + this.randomValueHex(16) + Math.random() * 10;
      let hash = null;
      switch (this.settings.hash_function) {
      case "md5":
        hash = createHash("md5");
        break;
      case "sha1":
        hash = createHash("sha1");
        break;
      default:
        hash = createHash("md5");
      }
      const res = hash.update(concat).digest("hex");

      return this.encrypt(`${res}:${this.contextSession}`);
    }

    getId (value) {
      const res = this.decrypt(value);
      // eslint-disable-next-line prefer-destructuring
      this.contextSession = res.split(":")[1];
      return value;
    }

    save (user, sessionContext) {
      return this.storage.write(this.id, this.serialize(user), sessionContext)
        .then((session) => {
          this.created = session.createdAt;
          this.updated = session.updatedAt;
          if (!this.context) {
            throw new Error("SAVE SESSION ERROR context already deleted ");
          } else {
            this.saved = true;
            if (this.context) {
              this.context.fire("onSaveSession", this);
            }
            return this;
          }
        })
        .catch((error) => {
          // console.trace(error);
          // this.log(error, "ERROR");
          this.saved = false;
          throw error;
        });
    }

    getName () {
      return this.name;
    }

    setName (name) {
      this.name = name || this.settings.name;
    }

    randomValueHex (len) {
      return randomBytes(Math.ceil(len / 2))
        .toString("hex") // convert to hexadecimal format
        .slice(0, len); // return required number of characters
    }
  };

  return Session;
});
