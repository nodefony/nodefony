let passport = null;
let nodefonyPassport = null;
try {
  passport = require('passport');
  //nodefonyPassport = require("@nodefony/passport-wrapper");
  nodefonyPassport = require(path.resolve(__dirname, "..", "..", "src", "passport", "passportFramework.js"));
} catch (e) {
  this.log(e);
}

const pluginReader = function() {

  let replaceKey = function(key) {
    let tab = ['firewall', 'user', 'encoder'];
    return (tab.indexOf(key) >= 0 ? key + 's' : key);
  };

  let arrayToObject = function(tab) {
    let obj = {};
    for (let i = 0; i < tab.length; i++) {
      for (let key in tab[i]) {
        if (tab[i].name && key !== 'name') {
          if (!obj[tab[i].name]) {
            obj[tab[i].name] = {};
            delete obj.name;
          }
          obj[tab[i].name][key] = (tab[i][key] instanceof Array ? arrayToObject(tab[i][key]) : tab[i][key]);
        } else if (key === 'rule') {
          obj = tab[i][key];
        } else {
          let value = (tab[i][key] instanceof Array ? arrayToObject(tab[i][key]) : tab[i][key]);
          if (value && value.class && value.algorithm) {
            value[value.class] = value.algorithm;
            delete value.class;
            delete value.algorithm;
          }
          obj[replaceKey(key)] = value;
        }
      }

    }
    return (obj instanceof Object && Object.keys(obj).length === 0 ? null : obj);
  };

  let importXmlConfig = function(xml, prefix, callback, parser) {
    if (parser) {
      xml = this.render(xml, parser.data, parser.options);
    }
    let config = {};
    this.xmlParser.parseString(xml, function(err, node) {
      for (let key in node) {
        switch (key) {
          case 'config':
            config = arrayToObject(node[key]);
            break;
        }
      }
    });

    if (callback) {
      callback.call(this, this.xmlToJson.call(this, {
        security: config
      }));
    } else {
      return config;
    }
  };

  let getObjectSecurityXML = function(file, callback, parser) {
    importXmlConfig.call(this, file, '', callback, parser);
  };

  let getObjectSecurityJSON = function(file, callback, parser) {
    if (parser) {
      file = this.render(file, parser.data, parser.options);
    }
    if (callback) {
      callback(JSON.parse(file));
    }
  };

  let getObjectSecurityYml = function(file, callback, parser) {
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
}();


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

  constructor(container, kernel, cors) {
    super("FIREWALL", container, kernel.notificationsCenter);
    //this.passport = passport.framework(nodefonyPassport(this));
    //this.passport = passport ;
    this.nodefonyPassport = nodefonyPassport;
    this.corsManager = cors;
    this.reader = function(context) {
      let func = context.get("reader").loadPlugin("security", pluginReader);
      return function(result) {
        try {
          return func(result, context.nodeReader.bind(context));
        } catch (e) {
          throw e;
        }
      };
    }(this);
    this.securedAreas = {};
    this.providerManager = new nodefony.providerManager(this);
    this.set("providerManager", this.providerManager);
    this.sessionStrategy = "invalidate";
    // listen KERNEL EVENTS
    this.once("onBoot", async () => {
      this.sessionService = this.get("sessions");
      this.authorizationService = this.get("authorization");
      this.orm = this.get(this.kernel.settings.orm);
      this.settings = this.kernel.getBundle("security").settings.headers;
    });
    /*this.once("onBoot", () => {
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
      }
    });
  }

  newPassport() {
    delete require.cache[require.resolve("passport")];
    return require("passport");
  }

  handleSecurity(context, connection) {
    if (context.resolver && context.resolver.bypassFirewall) {
      return new Promise((resolve, reject) => {
        try {
          context.resolver.log(`bypassFirewall ${context.url}`, "DEBUG");
          return resolve(context.handle());
        } catch (e) {
          return reject(e);
        }
      });
    }
    this.fire("onSecurity", context);
    switch (context.type) {
      case "HTTPS":
      case "HTTP":
      case "HTTP2":
        context.response.setHeaders(this.settings[context.scheme]);
        return new Promise((resolve, reject) => {
          return this.handle(context)
            .then((ctx) => {
              switch (true) {
                case ctx instanceof nodefony.Response:
                case ctx instanceof nodefony.wsResponse:
                case ctx instanceof nodefony.Context:
                  try {
                    return resolve(context.handle());
                  } catch (e) {
                    if (context.session) {
                      //context.session.invalidate();
                    }
                    return reject(e);
                  }
                  break;
                default:
                  return resolve(ctx);
              }
            })
            .catch(async (error) => {
              if (context.translation) {
                context.locale = context.translation.handle();
              }
              //context.fire("onError", context.container, error);
              if (context.session) {
                await context.session.invalidate();
              }
              return reject(error);
            });
        });
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
            //context.fire("onError", context.container, error);
            throw error;
          });
    }
  }

  isSecure(context) {
    if (context.resolver && context.resolver.bypassFirewall) {
      return false;
    }
    context.accessControl = this.authorizationService.isControlledAccess(context);
    context.isControlledAccess = (!!context.accessControl.length);
    if (context.isControlledAccess) {
      this.log(`Front Controler isControlledAccess : ${context.isControlledAccess}`, "DEBUG");
    }
    for (let area in this.securedAreas) {
      if (this.securedAreas[area].match(context)) {
        //FIXME PRIORITY
        context.security = this.securedAreas[area];
        let state = context.security.stateLess ? "STATELESS" : "STATEFULL";
        let msgid = `\x1b[36mSECURE AREA ${state}\x1b[0m`;
        context.security.log(`ENTER SECURE AREA : ${context.security.name}`, "DEBUG", msgid);
        return true;
      }
    }
    return false;
  }

  redirectHttps(context) {
    // no cache
    context.redirectHttps(301);
    return context;
  }

  redirectHttp(context) {
    // no cache
    context.redirectHttp(301);
    return context;
  }

  getFactory(name, area) {
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
    for (let area in this.securedAreas) {
      if (this.securedAreas[area].nbFactories) {
        factory = this.securedAreas[area].getFactory(name);
      }
      if (factory) {
        return factory;
      }
    }
    return factory;
  }

  getSessionToken(context, session) {
    if (session) {
      context.metaSecurity = session.getMetaBag("security");
      if (context.metaSecurity) {
        if (context.security && context.metaSecurity.token) {
          if (context.security.name !== context.metaSecurity.firewall) {
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
          if (token) {
            if (!token.isAuthenticated()) {
              this.deleteSessionToken(context, session);
              return null;
            }
          }
          context.user = token.user;
          context.token = token;
          return token;
        } else {
          this.deleteSessionToken(context, session);
          return null;
        }
      }
    }
    return null;
  }

  deleteSessionToken(context, session) {
    if (session) {
      session.setMetaBag("security", "");
      context.token = null;
      context.user = null;
    }
  }

  handleCrossDomain(context) {
    let next = null;
    context.crossDomain = context.isCrossDomain();
    if (context.crossDomain) {
      if (context.security /*&& this.kernel.domainCheck*/ ) {
        next = context.security.handleCrossDomain(context);
        switch (next) {
          case 204:
            return 204;
          case 401:
            let error = new Error("CROSS DOMAIN Unauthorized REQUEST REFERER : " + context.originUrl.href);
            error.code = next;
            throw error;
          case 200:
            this.log("\x1b[34m CROSS DOMAIN  \x1b[0mREQUEST REFERER : " + context.originUrl.href, "DEBUG");
            return 200;
        }
      } else {
        if (this.kernel.domainCheck) {
          let error = new Error("CROSS DOMAIN Unauthorized REQUEST REFERER : " + context.originUrl.href);
          error.code = 401;
          throw error;
        } else {
          return 200;
        }
      }
    }
  }

  handle(context) {
    return new Promise((resolve, reject) => {
      try {
        /*try {
          if (this.handleCrossDomain(context) === 204) {
            return resolve();
          }
        } catch (error) {
          return reject(error);
        }*/
        if (context.type === "HTTP" && this.httpsReady) {
          if (context.security && context.security.redirect_Https) {
            return resolve(this.redirectHttps(context));
          }
        }
        if (context.security && context.security.stateLess) {
          if (context.sessionAutoStart || context.hasSession()) {
            context.sessionAutoStart = context.security.sessionContext;
            return this.sessionService.start(context, context.sessionAutoStart)
              .then((session) => {
                return this.handleStateLess(context)
                  .then((ctx) => {
                    if (ctx.isControlledAccess && (!ctx.checkLogin)) {
                      return resolve(this.authorizationService.handle(ctx));
                    } else {
                      return resolve(ctx);
                    }
                  })
                  .catch((error) => {
                    if (!error.code) {
                      error.code = 401;
                    }
                    session.invalidate();
                    return reject(error);
                  });
              })
              .catch((error) => {
                if (!error.code) {
                  error.code = 401;
                }
                return reject(error);
              });
          }
          return this.handleStateLess(context)
            .then((ctx) => {
              if (ctx.isControlledAccess && (!ctx.checkLogin)) {
                return resolve(this.authorizationService.handle(ctx));
              } else {
                return resolve(ctx);
              }
            })
            .catch((error) => {
              if (!error.code) {
                error.code = 401;
              }
              return reject(error);
            });
        }
        if (context.security) {
          context.sessionAutoStart = context.security.sessionContext;
        }
        return this.handleStateFull(context)
          .then((ctx) => {
            if (ctx.isControlledAccess && (!ctx.checkLogin)) {
              return resolve(this.authorizationService.handle(ctx));
            } else {
              return resolve(ctx);
            }
          })
          .catch((error) => {
            if (!error.code) {
              error.code = 401;
            }
            return reject(error);
          });
      } catch (error) {
        return reject(error);
      }
    });
  }

  handleStateLess(context) {
    return context.security.handle(context);
  }

  handleStateFull(context) {
    return this.sessionService.start(context, context.sessionAutoStart)
      .then((session) => {
        try {
          if (!(session instanceof nodefony.Session)) {
            throw new Error("SESSION START session storage ERROR");
          }
          let token = this.getSessionToken(context, session);
          if (token) {
            return context;
          } else {
            /*if (context.method === "WEBSOCKET") {
              if (context.security && context.security.factories.length && !context.security.anonymous) {
                let error = new Error("Unauthorized");
                error.code = 401;
                throw error;
              }
            }*/
            if (context.security) {
              return this.handleStateLess(context);
            }
            return context;
          }
        } catch (error) {
          if (!error.code) {
            error.code = 500;
          }
          throw error;
        }
      })
      .catch((error) => {
        throw error;
      });
  }

  logout(context) {
    context.request.request.headers.authorization = "";
    context.response.setHeader("authorization", "");
    if (context.token && context.token.factory) {
      let factory = null;
      if (context.security) {
        factory = context.security.getFactory(context.token.factory);
        if (factory) {
          this.log(`Logout factory : ${factory.name} token : ${context.token.name} `,"DEBUG");
          return factory.logout(context)
            .catch(e => {
              throw e;
            });
        }
      }
      factory = this.getFactory(context.token.factory);
      if (factory) {
        this.log(`Logout factory : ${factory.name}`,"DEBUG");
        return factory.logout(context)
          .catch(e => {
            throw e;
          });
      }
    }
    if (context.security) {
      return context.security.logout(context)
        .catch(e => {
          throw e;
        });
    }
    if (context.session) {
      return context.session.destroy(true)
        .then(() => {
          return context;
        }).catch(e => {
          throw e;
        });
    }
    return new Promise((resolve) => {
      return resolve(context);
    });
  }

  setSessionStrategy(strategy) {
    if (strategy in optionStrategy) {
      this.log("Set Session Strategy  : " + strategy, "DEBUG");
      return this.sessionStrategy = strategy;
    }
    throw new Error("sessionStrategy strategy not found");
  }

  nodeReader(obj) {
    obj = obj.security;
    for (let ele in obj) {
      switch (ele) {
        case "firewalls":
          for (let firewall in obj[ele]) {
            let param = obj[ele][firewall];
            let area = this.addSecuredArea(firewall);
            if (!area) {
              continue;
            }
            for (let config in param) {
              switch (config) {
                case "pattern":
                  area.setPattern(param[config]);
                  break;
                case "crossDomain":
                  area.setCors(param[config]);
                  break;
                case "form_login":
                  if (param[config].login_path) {
                    area.setFormLogin(param[config].login_path);
                  }
                  if (param[config].check_path) {
                    area.setCheckLogin(param[config].check_path);
                  }
                  if (param[config].default_target_path) {
                    area.setDefaultTarget(param[config].default_target_path);
                  }
                  if (param[config].always_use_default_target_path) {
                    area.setAlwaysUseDefaultTarget(param[config].always_use_default_target_path);
                  }
                  break;
                case "remember_me":
                  //TODO
                  break;
                case "logout":
                  //TODO
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
                  if (param[config]) {
                    this.once("onBoot", async () => {
                      area.setContextSession(param[config]);
                      this.sessionService.addContextSession(param[config]);
                    });
                  }
                  break;
                default:
                  this.once("onBoot", async () => {
                    if (config in nodefony.security.factories) {
                      area.setFactory(config, param[config]);
                    } else {
                      //area.factoryName = config;
                      this.log("FACTORY : " + config + " not found in nodefony namespace", "ERROR");
                    }
                  });
              }
            }
          }
          break;
        case "session_fixation_strategy":
          this.once("onBoot", async () => {
            this.setSessionStrategy(obj[ele]);
            this.sessionService.setSessionStrategy(this.sessionStrategy);
          });
          break;
        case "access_control":
          this.once("onBoot", async () => {
            this.authorizationService.setAccessControl(obj[ele]);
          });
          break;
        case "encoders":
          this.once("onBoot", async () => {
            this.orm.prependOnceListener("onOrmReady", () => {
              for (let entity in obj[ele]) {
                try {
                  if (entity in this.orm.entities) {
                    let myEntity = this.orm.entities[entity];
                    if (obj[ele][entity].algorithm) {
                      let algo = obj[ele][entity].algorithm;
                      if (algo in nodefony.encoders) {
                        delete obj[ele][entity].algorithm;
                        myEntity.setEncoder(new nodefony.encoders[algo](obj[ele][entity]));
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
          for (let name in obj[ele]) {
            this.log("DECLARE FIREWALL PROVIDER NAME " + name, "DEBUG");
            try {
              this.providerManager.addConfiguration(name, obj[ele][name]);
            } catch (e) {
              this.log(e, "ERROR");
            }
          }
          break;
      }
    }
  }

  addSecuredArea(name) {
    if (!this.securedAreas[name]) {
      this.securedAreas[name] = new nodefony.SecuredArea(name, this);
      this.log("ADD security context : " + name, "DEBUG");
      return this.securedAreas[name];
    } else {
      this.log("securedAreas :" + name + " already exist ", "WARNING");
    }
  }

  getSecuredArea(name) {
    if (name in this.securedAreas) {
      return this.securedAreas[name];
    }
    return null;
  }

  log(pci, severity, msgid, msg) {
    if (!msgid) {
      msgid = "\x1b[36mFIREWALL\x1b[0m";
    }
    return super.log(pci, severity, msgid, msg);
  }
};
