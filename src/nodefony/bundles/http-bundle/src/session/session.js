/*
 *
 *    CLASS SESSION
 */
 let crypto;
 try {
   crypto = require('node:crypto');
 } catch (err) {
   crypto = require('crypto');
   //console.log('crypto support is disabled!', err);
 }
 const {createHash, createCipheriv, createDecipheriv, randomBytes} = crypto


nodefony.register("Session", function () {

  const checkSecureReferer = function (context) {
    let host = null;
    switch (this.context.type) {
    case "HTTP":
    case "HTTPS":
    case "HTTP2":
      host = context.getHost();
      break;
    case "WEBSOCKET":
    case "WEBSOCKET SECURE":
      host = this.context.request.httpRequest.headers.host;
      break;
    }
    let meta = this.getMetaBag("host");
    if (host === meta) {
      return host;
    } else {
      this.manager.log("SESSION START WARNING REFERRER NOT SAME, HOST : " + host + " ,META STORAGE :" + meta, "WARNING");
      throw {
        meta: meta,
        host: host
      };
    }
  };

  const setMetasSession = function () {
    //let time = new Date();
    let ua = null;
    this.setMetaBag("lifetime", this.settings.cookie.maxAge);
    this.setMetaBag("context", this.contextSession || null);
    this.setMetaBag("request", this.context.type);
    //this.setMetaBag("created", time);
    try {
      this.setMetaBag("remoteAddress", this.context.getRemoteAddress());
      this.setMetaBag("host", this.context.getHost());
      ua = this.context.getUserAgent();
    } catch (e) {}
    if (ua) {
      this.setMetaBag("user_agent", ua);
    } else {
      this.setMetaBag("user_agent", "Not Defined");
    }
  };

  const Session = class Session extends nodefony.Container {

    constructor(name, settings, storage, manager) {
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
      this.key = this.settings.encrypt.password
      this.iv = this.settings.encrypt.iv
      this.created = null;
      this.updated = null;
      this.username = null
    }

    get(name) {
      if (!name) {
        return this.protoService.prototype;
      }
      return super.get(name);
    }

    encrypt(text) {
      const cipher = createCipheriv('aes-256-ctr', this.key, this.iv)
      let encrypted = cipher.update(text, 'utf8', 'hex')
      encrypted += cipher.final('hex')
      return encrypted
    }

    decrypt(text) {
      const decipher = createDecipheriv('aes-256-ctr', this.key, this.iv)
      let decrypted = decipher.update(text, 'hex', 'utf8')
      decrypted += decipher.final('utf8')
      return decrypted
    }

    create(lifetime, id) {
      this.id = id || this.setId();
      setMetasSession.call(this);
      this.manager.log("NEW SESSION CREATE : " + this.id, "DEBUG");
      try {
        this.cookieSession = this.setCookieSession(lifetime);
      } catch (e) {
        throw new Error(`Request Finish can't create cookieSession`);
        //this.log(`,"WARNING")
      }
      this.status = "active";
      return this;
    }

    start(context, contextSession) {
      this.context = context;
      if (!contextSession) {
        contextSession = this.contextSession;
      }
      if (this.settings.use_only_cookies) {
        this.applyTranId = 0;
      } else {
        this.applyTranId = this.settings.use_trans_sid;
      }
      try {
        let ret = this.checkStatus();
        switch (ret) {
        case false:
          return new Promise((resolve /*, reject*/ ) => {
            return resolve(this);
          });
        case "restart":
          return this.start(context, contextSession);
        default:
          return this.getSession(contextSession);
        }
      } catch (e) {
        return new Promise((resolve, reject) => {
          this.log(e, "ERROR");
          return reject(e);
        });
      }
    }

    checkStatus() {
      switch (this.status) {
      case "active":
        this.manager.log("SESSION ALLREADY STARTED ==> " + this.name + " : " + this.id, "WARNING");
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
    }

    getSession(contextSession) {
      if (this.settings.use_cookies) {
        if (this.context.cookieSession) {
          this.id = this.getId(this.context.cookieSession.value);
          this.cookieSession = this.context.cookieSession;
        }
        this.applyTranId = 0;
      }
      if ((!this.settings.use_only_cookies) && (!this.id)) {
        if (this.name in this.context.request.query) {
          this.id = this.getId(this.context.request.query[this.name]);
        }
      }
      if (this.id) {
        return this.checkChangeContext(contextSession);
      } else {
        return new Promise((resolve, reject) => {
          this.clear();
          try {
            return resolve(this.create(this.lifetime, null));
          } catch (e) {
            return reject(e);
          }
        });
      }
    }

    async checkChangeContext(contextSession) {
      // change context session
      if (contextSession && this.contextSession !== contextSession) {
        this.manager.log(`SESSION CONTEXT CHANGE : ${this.contextSession} ==> ${contextSession}`);
        switch (this.strategy) {
        case "migrate":
          return this.storage.start(this.id, this.contextSession)
            .then(async (result) => {
              this.deSerialize(result);
              if (!this.isValidSession(result, this.context)) {
                this.manager.log("INVALID SESSION ==> " + this.name + " : " + this.id, "WARNING");
                await this.destroy();
                this.contextSession = contextSession;
                return this.create(this.lifetime, null);
              }
              await this.remove();
              this.manager.log(`STRATEGY MIGRATE SESSION  ==> ${this.name} : ${this.id}`, "DEBUG");
              this.migrated = true;
              this.contextSession = contextSession;
              return this.create(this.lifetime, null);
            }).catch((error) => {
              throw error;
            });
        case "invalidate":
          this.manager.log("STRATEGY INVALIDATE SESSION ==> " + this.name + " : " + this.id, "DEBUG");
          await this.destroy();
          this.contextSession = contextSession;
          return new Promise((resolve, reject) => {
            try {
              return resolve(this.create(this.lifetime, null));
            } catch (e) {
              return reject(e);
            }
          });
        case "none":
          this.strategyNone = true;
          break;
        }
        if (!this.strategyNone) {
          return new Promise((resolve /*, reject*/ ) => {
            return resolve(this);
          });
        }
      }
      return this.storage.start(this.id, this.contextSession)
        .then(async (result) => {
          if (result && Object.keys(result).length) {
            this.deSerialize(result);
            if (!this.isValidSession(result, this.context)) {
              this.manager.log("SESSION ==> " + this.name + " : " + this.id + "  session invalid ", "ERROR");
              await this.invalidate();
            }
          } else {
            if (this.settings.use_strict_mode) {
              if (!this.strategyNone) {
                this.manager.log("SESSION ==> " + this.name + " : " + this.id + " use_strict_mode ", "ERROR");
                await this.invalidate();
              }
            }
          }
          this.status = "active";
          return this;
        }).catch(async (error) => {
          if (error) {
            this.manager.log("SESSION ==> " + this.name + " : " + this.id + " " + error, "ERROR");
            if (!this.strategyNone) {
              await this.invalidate();
            }
            throw error;
          }
        });
    }

    isValidSession(data, context) {
      if (this.settings.referer_check) {
        try {
          checkSecureReferer.call(this, context);
        } catch (e) {
          this.manager.log("SESSION REFERER ERROR SESSION  ==> " + this.name + " : " + this.id, "WARNING");
          return false;
        }
      }
      //console.log( this.updated , new Date(this.updated) )
      const lastUsed = new Date(this.updated).getTime();
      //let lastUsed = new Date(this.getMetaBag("lastUsed")).getTime();
      let now = new Date().getTime();
      if (this.lifetime === 0) {
        /*if ( lastUsed && lastUsed + ( this.settings.gc_maxlifetime * 1000 ) < now ){
                this.manager.log("SESSION INVALIDE gc_maxlifetime    ==> " + this.name + " : "+ this.id, "WARNING");
                return false ;
            }*/
        return true;
      }
      if (lastUsed && lastUsed + (this.lifetime * 1000) < now) {
        this.manager.log("SESSION INVALIDE lifetime   ==> " + this.name + " : " + this.id, "WARNING");
        return false;
      }
      return true;
    }

    attributes() {
      return this.protoService.prototype;
    }
    getAttributes() {
      return this.attributes();
    }

    metaBag() {
      return this.protoParameters.prototype;
    }
    getMetas() {
      return this.metaBag();
    }

    setMetaBag(key, value) {
      return this.setParameters(key, value);
    }

    getMetaBag(key) {
      return this.getParameters(key);
    }

    getFlashBag(key) {
      //this.log("GET FlashBag : " + key ,"WARNING")
      let res = this.flashBag[key];
      if (res) {
        this.log("Delete FlashBag : " + key, "DEBUG");
        delete this.flashBag[key];
        return res;
      }
      return null;
    }

    setFlashBag(key, value) {
      if (!key) {
        throw new Error("FlashBag key must be define : " + key);
      }
      if (!value) {
        this.log("ADD FlashBag  : " + key + " value not defined ", "WARNING");
      } else {
        this.log("ADD FlashBag : " + key, "DEBUG");
      }
      return this.flashBag[key] = value;
    }

    flashBags() {
      return this.flashBag;
    }

    clearFlashBags() {
      delete this.flashBag;
      this.flashBag = {};
    }

    clearFlashBag(key) {
      if (!key) {
        throw new Error("clearFlashBag key must be define : " + key);
      }
      if (this.flashBag[key]) {
        delete this.flashBag[key];
      }
    }

    deleteCookieSession() {
      let settings = nodefony.extend({}, this.settings.cookie);
      let cookie = new nodefony.cookies.cookie(this.name, "", settings);
      this.context.response.setCookie(cookie);
      this.cookieSession = null;
      this.context.cookieSession = null;
      return cookie;
    }

    setCookieSession(leftTime) {
      let settings = null;
      if (leftTime) {
        settings = nodefony.extend({}, this.settings.cookie);
        settings.maxAge = leftTime;
      } else {
        settings = this.settings.cookie;
      }
      let cookie = new nodefony.cookies.cookie(this.name, this.id, settings);
      this.context.response.addCookie(cookie);
      return cookie;
    }

    serialize(user) {
      let obj = {
        Attributes: this.protoService.prototype,
        metaBag: this.protoParameters.prototype,
        flashBag: this.flashBag,
        username: user
      };
      return obj;
    }

    deSerialize(obj) {
      //var obj = JSON.parse(data);
      for (let attr in obj.Attributes) {
        this.set(attr, obj.Attributes[attr]);
      }
      for (let meta in obj.metaBag) {
        //console.log(meta + " : " + obj.metaBag[meta])
        this.setMetaBag(meta, obj.metaBag[meta]);
      }
      for (let flash in obj.flashBag) {
        this.setFlashBag(flash, obj.flashBag[flash]);
      }
      this.created = obj.created;
      this.updated = obj.updated;
      this.username = obj.user || obj.username
    }

    remove(cookieDelete) {
      try {
        return this.storage.destroy(this.id, this.contextSession)
          .then(() => {
            if (cookieDelete) {
              this.deleteCookieSession();
              this.saved = true;
            }
          }).catch((e) => {
            this.manager.log(e, "ERROR");
            throw e;
          });
      } catch (e) {
        this.manager.log(e, "ERROR");
        throw e;
      }
    }

    delete(cookieDelete = false) {
      return this.destroy(cookieDelete);
    }

    destroy(cookieDelete) {
      this.clear();
      return this.remove(cookieDelete);
    }

    clear() {
      delete this.protoService;
      this.protoService = function () {};
      delete this.protoParameters;
      this.protoParameters = function () {};
      delete this.services;
      this.services = new this.protoService();
      delete this.parameters;
      this.parameters = new this.protoParameters();
      this.clearFlashBags();
    }

    async invalidate(lifetime, id) {
      this.manager.log("INVALIDATE SESSION ==>" + this.name + " : " + this.id, "DEBUG");
      if (!lifetime) {
        lifetime = this.lifetime;
      }
      await this.destroy();
      try {
        return this.create(lifetime, id);
      } catch (e) {
        this.log(e, "WARNING")
        return this;
      }
    }

    async migrate(destroy, lifetime, id) {
      this.manager.log("MIGRATE SESSION ==>" + this.name + " : " + this.id, "DEBUG");
      if (!lifetime) {
        lifetime = this.lifetime;
      }
      if (destroy) {
        await this.remove(destroy);
      }
      try {
        return this.create(lifetime, id);
      } catch (e) {
        this.log(e, "WARNING")
        return this;
      }
    }

    setId() {
      let ip = "";
      try {
        ip = this.context.getRemoteAddress();
      } catch (e) {}
      let date = new Date().getTime();
      let concat = ip + date + this.randomValueHex(16) + Math.random() * 10;
      let hash = null;
      switch (this.settings.hash_function) {
      case "md5":
        hash = createHash('md5');
        break;
      case "sha1":
        hash = createHash('sha1');
        break;
      default:
        hash = createHash('md5');
      }
      let res = hash.update(concat).digest("hex");

      return this.encrypt(res + ":" + this.contextSession);
    }

    getId(value) {
      let res = this.decrypt(value);
      this.contextSession = res.split(':')[1];
      return value;
    }

    save(user, sessionContext) {
      return this.storage.write(this.id, this.serialize(user), sessionContext)
        .then((session) => {
          this.created = session.createdAt
          this.updated = session.updatedAt
          if (!this.context) {
            throw new Error("SAVE SESSION ERROR context already deleted ");
          } else {
            this.saved = true;
            if (this.context) {
              this.context.fire("onSaveSession", this);
            }
            return this;
          }
        }).catch((error) => {
          //console.trace(error);
          //this.log(error, "ERROR");
          this.saved = false;
          throw error;
        });
    }

    getName() {
      return this.name;
    }

    setName(name) {
      this.name = name || this.settings.name;
    }

    randomValueHex(len) {
      return randomBytes(Math.ceil(len / 2))
        .toString('hex') // convert to hexadecimal format
        .slice(0, len); // return required number of characters
    }

  };

  return Session;
});
