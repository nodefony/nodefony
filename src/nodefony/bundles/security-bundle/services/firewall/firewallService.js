let passport = null;
let nodefonyPassport = null;
try {
  // eslint-disable-next-line no-unused-vars
  passport = require("passport");
  // nodefonyPassport = require("@nodefony/passport-wrapper");
  nodefonyPassport = require(path.resolve(__dirname, "..", "..", "src", "passport", "passportFramework.js"));
} catch (e) {
  this.log(e);
}

const pluginReader = (function pluginReader () {
  const replaceKey = function replaceKey (key) {
    const tab = ["firewall", "user", "encoder"];
    return tab.indexOf(key) >= 0 ? `${key}s` : key;
  };

  const arrayToObject = function arrayToObject (tab) {
    let obj = {};
    for (let i = 0; i < tab.length; i++) {
      for (const key in tab[i]) {
        if (tab[i].name && key !== "name") {
          if (!obj[tab[i].name]) {
            obj[tab[i].name] = {};
            delete obj.name;
          }
          obj[tab[i].name][key] = tab[i][key] instanceof Array ? arrayToObject(tab[i][key]) : tab[i][key];
        } else if (key === "rule") {
          obj = tab[i][key];
        } else {
          const value = tab[i][key] instanceof Array ? arrayToObject(tab[i][key]) : tab[i][key];
          if (value && value.class && value.algorithm) {
            value[value.class] = value.algorithm;
            delete value.class;
            delete value.algorithm;
          }
          obj[replaceKey(key)] = value;
        }
      }
    }
    return obj instanceof Object && Object.keys(obj).length === 0 ? null : obj;
  };

  const importXmlConfig = function importXmlConfig (xml, prefix, callback, parser) {
    if (parser) {
      xml = this.render(xml, parser.data, parser.options);
    }
    let config = {};
    this.xmlParser.parseString(xml, (err, node) => {
      for (const key in node) {
        switch (key) {
        case "config":
          config = arrayToObject(node[key]);
          break;
        default:
        }
      }
    });

    if (callback) {
      callback.call(this, this.xmlToJson({
        security: config
      }));
    } else {
      return config;
    }
    return config;
  };

  const getObjectSecurityXML = function getObjectSecurityXML (file, callback, parser) {
    importXmlConfig.call(this, file, "", callback, parser);
  };

  const getObjectSecurityJSON = function getObjectSecurityJSON (file, callback, parser) {
    if (parser) {
      file = this.render(file, parser.data, parser.options);
    }
    if (callback) {
      callback(JSON.parse(file));
    }
  };

  const getObjectSecurityYml = function getObjectSecurityYml (file, callback, parser) {
    if (parser) {
      file = this.render(file, parser.data, parser.options);
    }
    if (callback) {
      callback(yaml.load(file));
    }
  };

  return {
    xml: getObjectSecurityXML,
    json: getObjectSecurityJSON,
    yml: getObjectSecurityYml,
    annotation: null
  };
}());


/*
 *
 *  CLASS FIREWALL
 *
 *
 */

const optionStrategy = {
  migrate: true,
  invalidate: true,
  none: true
};

module.exports = class security extends nodefony.Service {
  constructor (container, kernel, cors) {
    super("FIREWALL", container, kernel.notificationsCenter);
    // this.passport = passport.framework(nodefonyPassport(this));
    // this.passport = passport ;
    this.nodefonyPassport = nodefonyPassport;
    this.corsManager = cors;
    // eslint-disable-next-line func-names
    this.reader = (function (context) {
      const func = context.get("reader").loadPlugin("security", pluginReader);
      // eslint-disable-next-line func-names
      return function (result) {
        try {
          return func(result, context.nodeReader.bind(context));
        } catch (e) {
          throw e;
        }
      };
    }(this));
    this.securedAreas = {};
    // eslint-disable-next-line new-cap
    this.providerManager = new nodefony.providerManager(this);
    this.set("providerManager", this.providerManager);
    this.sessionStrategy = "invalidate";
    // listen KERNEL EVENTS
    this.once("onBoot", () => {
      this.sessionService = this.get("sessions");
      this.authorizationService = this.get("authorization");
      this.orm = this.get(this.kernel.settings.orm);
      this.settings = this.kernel.getBundle("security").settings.headers;
    });

    /* this.once("onBoot", () => {
      this.settings = this.kernel.getBundle("security").settings.headers;
    });*/

    this.bundleHttp = this.kernel.getBundles("http");
    this.bundleHttp.on("onServersReady", (type) => {
      switch (type) {
      case "HTTPS":
        this.httpsReady = this.get("httpsServer").ready;
        break;
      case "HTTP":
        this.httpReady = this.get("httpServer").ready;
        break;
      case "HTTP2":
        this.httpsReady = this.get("http2Server").ready;
        break;
      default:
      }
    });
  }

  newPassport () {
    delete require.cache[require.resolve("passport")];
    return require("passport");
  }

  handleSecurity (context, connection) {
    if (context.resolver && context.resolver.bypassFirewall) {
      return new Promise((resolve, reject) => {
        try {
          context.resolver.log(`bypassFirewall ${context.url}`, "DEBUG");
          resolve(context.handle());
        } catch (e) {
          reject(e);
        }
      });
    }
    this.fire("onSecurity", context);
    switch (context.type) {
    case "HTTPS":
    case "HTTP":
    case "HTTP2":
      context.response.setHeaders(this.settings[context.scheme]);
      // eslint-disable-next-line no-promise-executor-return
      return new Promise((resolve, reject) => this.handle(context)
        .then((ctx) => {
          switch (true) {
          case ctx instanceof nodefony.Response:
          case ctx instanceof nodefony.wsResponse:
          case ctx instanceof nodefony.Context:
            try {
              return resolve(context.handle());
            } catch (e) {
              if (context.session) {
                // context.session.invalidate();
              }
              return reject(e);
            }
          default:
            return resolve(ctx);
          }
        })
        .catch(async (error) => {
          if (context.translation) {
            context.locale = context.translation.handle();
          }
          // context.fire("onError", context.container, error);
          if (context.session) {
            if (context.response) {
              await context.session.invalidate();
            }
          }
          return reject(error);
        }));
    case "WEBSOCKET SECURE":
    case "WEBSOCKET":
      return this.handle(context, connection)
        .then((ctx) => {
          if (ctx) {
            return ctx.handle();
          }
          return context;
        })
        .catch((error) => {
          // context.fire("onError", context.container, error);
          throw error;
        });
    default:
      return null;
    }
  }

  isSecure (context) {
    if (context.resolver && context.resolver.bypassFirewall) {
      return false;
    }
    context.accessControl = this.authorizationService.isControlledAccess(context);
    context.isControlledAccess = Boolean(context.accessControl.length);
    if (context.isControlledAccess) {
      this.log(`Front Controler isControlledAccess : ${context.isControlledAccess}`, "DEBUG");
    }
    for (const area in this.securedAreas) {
      if (this.securedAreas[area].match(context)) {
        // eslint-disable-next-line no-warning-comments
        // FIXME PRIORITY
        context.security = this.securedAreas[area];
        const state = context.security.stateLess ? "STATELESS" : "STATEFULL";
        const msgid = `\x1b[36mSECURE AREA ${state}\x1b[0m`;
        context.security.log(`ENTER SECURE AREA : ${context.security.name}`, "DEBUG", msgid);
        return true;
      }
    }
    return false;
  }

  redirectHttps (context) {
    // no cache
    context.redirectHttps(301);
    return context;
  }

  redirectHttp (context) {
    // no cache
    context.redirectHttp(301);
    return context;
  }

  getFactory (name, area) {
    let factory = null;
    if (area) {
      if (area in this.securedAreas) {
        if (this.securedAreas[area].nbFactories) {
          factory = this.securedAreas[area].getFactory(name);
        }
        if (factory) {
          return factory;
        }
      }
      return factory;
    }
    for (const myarea in this.securedAreas) {
      if (this.securedAreas[myarea].nbFactories) {
        factory = this.securedAreas[myarea].getFactory(name);
      }
      if (factory) {
        return factory;
      }
    }
    return factory;
  }

  getSessionToken (context, session) {
    if (session) {
      context.metaSecurity = session.getMetaBag("security");
      if (context.metaSecurity) {
        if (context.security && context.metaSecurity.token) {
          if (context.security.name !== context.metaSecurity.firewall) {
            // eslint-disable-next-line max-depth
            if (context.metaSecurity.token.factory === "anonymous") {
              return null;
            }
          }
        }
        let token = null;
        let factory = null;
        if (context.metaSecurity.token && context.metaSecurity.token.factory) {
          factory = this.getFactory(context.metaSecurity.token.factory, context.metaSecurity.firewall);
        }
        if (factory) {
          token = factory.createToken(context);
          token.unserialize(context.metaSecurity.token);
          if (!token.isAuthenticated()) {
            this.deleteSessionToken(context, session);
            return null;
          }
          context.user = token.user;
          context.token = token;
          return token;
        }
        this.deleteSessionToken(context, session);
        return null;
      }
    }
    return null;
  }

  deleteSessionToken (context, session) {
    if (session) {
      session.setMetaBag("security", "");
      context.token = null;
      context.user = null;
    }
  }

  handleCrossDomain (context) {
    let next = null;
    context.crossDomain = context.isCrossDomain();
    if (context.crossDomain) {
      if (context.security /* && this.kernel.domainCheck*/) {
        next = context.security.handleCrossDomain(context);
        switch (next) {
        case 204:
          return 204;
        case 401: {
          const error = new Error(`CROSS DOMAIN Unauthorized REQUEST REFERER : ${context.originUrl.href}`);
          error.code = next;
          throw error;
        }
        case 200:
          this.log(`\x1b[34m CROSS DOMAIN  \x1b[0mREQUEST REFERER : ${context.originUrl.href}`, "DEBUG");
          return 200;
        default:
        }
      } else if (this.kernel.domainCheck) {
        const error = new Error(`CROSS DOMAIN Unauthorized REQUEST REFERER : ${context.originUrl.href}`);
        error.code = 401;
        throw error;
      } else {
        return 200;
      }
    }
    return 200;
  }

  startSession (context, state = "statefull") {
    if (!context.sessionAutoStart) {
      if (context.security) {
        context.sessionAutoStart = context.security.sessionContext;
      }
    }
    return this.sessionService.start(context, context.sessionAutoStart)
      .then((session) => {
        if (state === "stateless") {
          return this.handleStateLess(context)
            .catch(async (error) => {
              await session.invalidate()
                .then(() => {
                  throw error;
                })
                .catch((/* e*/) => {
                  throw error;
                });
            });
        }
        if (state === "statefull") {
          const token = this.getSessionToken(context, session);
          if (token) {
            return context;
          }
          if (context.security) {
            return this.handleStateLess(context)
              .catch(async (error) => {
                await session.invalidate()
                  .then(() => {
                    throw error;
                  })
                  .catch((/* e*/) => {
                    throw error;
                  });
              });
          }
          return context;
        }
        throw new Error("Bad arguments ");
      })
      .catch((e) => {
        throw e;
      });
  }

  handle (context) {
    return new Promise((resolve, reject) => {
      try {
        if (context.type === "HTTP" && this.httpsReady) {
          if (context.security && context.security.redirect_Https) {
            resolve(this.redirectHttps(context));
            return;
          }
        }
        if (context.security && context.security.stateLess) {
          if (context.sessionAutoStart /* || context.hasSession()*/) {
            this.startSession(context, "stateless")
              .then((ctx) => resolve(ctx))
              .catch((error) => {
                if (!error.code) {
                  error.code = 401;
                }
                reject(error);
              });
            return;
          }
          this.handleStateLess(context)
            .then((ctx) => resolve(ctx))
            .catch((error) => {
              if (!error.code) {
                error.code = 401;
              }
              reject(error);
            });
          return;
        }
        this.handleStateFull(context)
          .then((ctx) => resolve(ctx))
          .catch((error) => {
            if (!error.code) {
              error.code = 401;
            }
            reject(error);
          });
      } catch (error) {
        reject(error);
      }
    });
  }

  handleStateLess (context) {
    return context.security.handle(context)
      .then((ctx) => {
        if (ctx.isControlledAccess && !ctx.checkLogin) {
          return this.authorizationService.handle(ctx);
        }
        return ctx;
      })
      .catch((e) => {
        throw e;
      });
  }

  handleStateFull (context) {
    return this.startSession(context)
      .then((ctx) => {
        if (ctx.isControlledAccess && !ctx.checkLogin) {
          return this.authorizationService.handle(ctx);
        }
        return ctx;
      })
      .catch((e) => {
        throw e;
      });
  }

  logout (context) {
    context.request.request.headers.authorization = "";
    context.response.setHeader("authorization", "");
    if (context.token && context.token.factory) {
      let factory = null;
      if (context.security) {
        factory = context.security.getFactory(context.token.factory);
        if (factory) {
          this.log(`Logout factory : ${factory.name} token : ${context.token.name} `, "DEBUG");
          return factory.logout(context)
            .catch((e) => {
              throw e;
            });
        }
      }
      factory = this.getFactory(context.token.factory);
      if (factory) {
        this.log(`Logout factory : ${factory.name}`, "DEBUG");
        return factory.logout(context)
          .catch((e) => {
            throw e;
          });
      }
    }
    if (context.security) {
      return context.security.logout(context)
        .catch((e) => {
          throw e;
        });
    }
    if (context.session) {
      return context.session.destroy(true)
        .then(() => context)
        .catch((e) => {
          throw e;
        });
    }
    return new Promise((resolve) => {
      resolve(context);
    });
  }

  setSessionStrategy (strategy) {
    if (strategy in optionStrategy) {
      this.log(`Set Session Strategy  : ${strategy}`, "DEBUG");
      this.sessionStrategy = strategy;
      return strategy;
    }
    throw new Error("sessionStrategy strategy not found");
  }

  // eslint-disable-next-line max-lines-per-function, complexity
  nodeReader (obj) {
    obj = obj.security;
    for (const ele in obj) {
      switch (ele) {
      case "firewalls":
        for (const firewall in obj[ele]) {
          const param = obj[ele][firewall];
          const area = this.addSecuredArea(firewall);
          if (!area) {
            // eslint-disable-next-line no-continue
            continue;
          }
          for (const config in param) {
            // eslint-disable-next-line max-depth
            switch (config) {
            case "pattern":
              area.setPattern(param[config]);
              break;
            case "crossDomain":
              area.setCors(param[config]);
              break;
            case "form_login":
              // eslint-disable-next-line max-depth
              if (param[config].login_path) {
                area.setFormLogin(param[config].login_path);
              }
              // eslint-disable-next-line max-depth
              if (param[config].check_path) {
                area.setCheckLogin(param[config].check_path);
              }
              // eslint-disable-next-line max-depth
              if (param[config].default_target_path) {
                area.setDefaultTarget(param[config].default_target_path);
              }
              // eslint-disable-next-line max-depth
              if (param[config].always_use_default_target_path) {
                area.setAlwaysUseDefaultTarget(param[config].always_use_default_target_path);
              }
              break;
            case "remember_me":
              // eslint-disable-next-line no-warning-comments
              // TODO
              break;
            case "logout":
              // eslint-disable-next-line no-warning-comments
              // TODO
              break;
            case "stateless":
              area.setStateLess(param[config]);
              break;
            case "redirectHttps":
              area.setRedirectHttps(param[config]);
              break;
            case "provider":
              area.setProviderName(param[config]);
              break;
            case "context":
              // eslint-disable-next-line max-depth
              if (param[config]) {
                this.once("onBoot", () => {
                  area.setContextSession(param[config]);
                  this.sessionService.addContextSession(param[config]);
                });
              }
              break;
            default:
              this.once("onBoot", () => {
                if (config in nodefony.security.factories) {
                  area.setFactory(config, param[config]);
                } else {
                  // area.factoryName = config;
                  this.log(`FACTORY : ${config} not found in nodefony namespace`, "ERROR");
                }
              });
            }
          }
        }
        break;
      case "session_fixation_strategy":
        this.once("onBoot", () => {
          this.setSessionStrategy(obj[ele]);
          this.sessionService.setSessionStrategy(this.sessionStrategy);
        });
        break;
      case "access_control":
        this.once("onBoot", () => {
          this.authorizationService.setAccessControl(obj[ele]);
        });
        break;
      case "encoders":
        this.once("onBoot", () => {
          this.orm.prependListener("onOrmReady", () => {
            for (const entity in obj[ele]) {
              try {
                if (entity in this.orm.entities) {
                  const myEntity = this.orm.entities[entity];
                  if (obj[ele][entity].algorithm) {
                    const algo = obj[ele][entity].algorithm;
                    // eslint-disable-next-line max-depth
                    if (algo in nodefony.encoders) {
                      delete obj[ele][entity].algorithm;
                      myEntity.setEncoder(new nodefony.encoders[algo](obj[ele][entity]));
                      // eslint-disable-next-line no-continue
                      continue;
                    }
                    throw new Error(`Encoder algorithm ${algo} not registered ! `);
                  }
                  throw new Error(`In configuration Entity ${entity} Encoder algorithm not defined ! `);
                }
              } catch (e) {
                throw e;
              }
            }
          });
        });
        break;
      case "providers":
        for (const name in obj[ele]) {
          this.log(`DECLARE FIREWALL PROVIDER NAME ${name}`, "DEBUG");
          try {
            this.providerManager.addConfiguration(name, obj[ele][name]);
          } catch (e) {
            this.log(e, "ERROR");
          }
        }
        break;
      default:
      }
    }
  }

  addSecuredArea (name) {
    if (!this.securedAreas[name]) {
      this.securedAreas[name] = new nodefony.SecuredArea(name, this);
      this.log(`ADD security context : ${name}`, "DEBUG");
      return this.securedAreas[name];
    }
    this.log(`securedAreas :${name} already exist `, "WARNING");
    return null;
  }

  getSecuredArea (name) {
    if (name in this.securedAreas) {
      return this.securedAreas[name];
    }
    return null;
  }

  log (pci, severity, msgid, msg) {
    if (!msgid) {
      // eslint-disable-next-line no-param-reassign
      msgid = "\x1b[36mFIREWALL\x1b[0m";
    }
    return super.log(pci, severity, msgid, msg);
  }
};
