module.exports = nodefony.registerService("firewall", function () {

  const pluginReader = function () {

    let replaceKey = function (key) {
      let tab = ['firewall', 'user', 'encoder'];
      return (tab.indexOf(key) >= 0 ? key + 's' : key);
    };

    let arrayToObject = function (tab) {
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

    let importXmlConfig = function (xml, prefix, callback, parser) {
      if (parser) {
        xml = this.render(xml, parser.data, parser.options);
      }
      let config = {};
      this.xmlParser.parseString(xml, function (err, node) {
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

    let getObjectSecurityXML = function (file, callback, parser) {
      importXmlConfig.call(this, file, '', callback, parser);
    };

    let getObjectSecurityJSON = function (file, callback, parser) {
      if (parser) {
        file = this.render(file, parser.data, parser.options);
      }
      if (callback) {
        callback(JSON.parse(file));
      }
    };

    let getObjectSecurityYml = function (file, callback, parser) {
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

  // context security
  const securedArea = class securedArea extends nodefony.Service {

    constructor(name, firewall) {
      super(name, firewall.container, firewall.notificationsCenter);
      this.firewall = firewall;
      this.router = this.get("router");
      this.sessionContext = "default";
      this.cors = null;
      this.pattern = ".*";
      this.factory = null;
      this.provider = null;
      this.formLogin = null;
      this.checkLogin = null;
      this.redirect_Https = false;
      this.defaultTarget = "/";
      this.alwaysUseDefaultTarget = false;

      this.once(this, "onReady", () => {
        try {
          if (this.providerName in this.firewall.providers) {
            this.provider = this.firewall.providers[this.providerName].Class;
          }
          if (this.factory) {
            this.logger(" FACTORY : " + this.factory.name + " PROVIDER : " + this.provider.name + " PATTERN : " + this.pattern, "DEBUG");
          }
        } catch (e) {
          this.logger(this.name + "  " + e, "ERROR");
          throw e;
        }
      });
    }

    logger(pci, severity, msgid, msg) {
      if (!msgid) {
        msgid = "\x1b[36mCONTEXT SECURITY \x1b[31m" + this.name + " \x1b[0m";
      }
      return super.logger(pci, severity, msgid, msg);
    }

    handleCrossDomain(context) {
      if (context.crossDomain) {
        if (this.cors) {
          return this.cors.match(context);
        } else {
          return 401;
        }
      }
    }

    handleError(context, e) {
      let error = null;
      switch (context.type) {
      case "HTTP":
      case "HTTPS":
        if (this.formLogin) {
          if (e.message) {
            this.logger(e.message, "DEBUG");
          } else {
            this.logger(e, "DEBUG");
          }
          if (e && e.status) {
            context.response.setStatusCode(e.code, e.message);
          } else {
            context.response.setStatusCode(401);
          }
          if ((context.request.url.pathname !== this.formLogin) && (context.request.url.pathname !== this.checkLogin) && (!this.alwaysUseDefaultTarget)) {
            let target_path = null;
            let area = context.session.getMetaBag("area");
            if (area && area !== this.name) {
              context.session.clearFlashBag("default_target_path");
            } else {
              target_path = context.session.getFlashBag("default_target_path");
            }
            if (!target_path) {
              context.session.setFlashBag("default_target_path", context.request.url.pathname);
            } else {
              context.session.setFlashBag("default_target_path", target_path);
            }
            context.session.setMetaBag("area", this.name);
          }
          try {
            context.resolver = this.overrideURL(context, this.formLogin);
          } catch (e) {
            error = new Error("Form Login route : " + this.formLogin + " this route not exist. Check Security config file");
            error.code =  500;
            return context.fire("onError", context.container, error);
          }
          if (!context.resolver.resolve) {
            error = new Error("Form Login route : " + this.formLogin + " this route not exist. Check Security config file");
            error.code =  500;
            return context.fire("onError", context.container, error);
          }
          if (!context.isAjax) {
            if (e.message !== "Unauthorized") {
              context.session.setFlashBag("session", {
                error: e.message
              });
            }
          } else {
            context.isJson = true;
            context.setXjson(e);
            error = new Error(e.message);
            error.code = e.status;
            return context.fire("onError", context.container, error);
          }
          return context.fire("onRequest");
        } else {
          if (e.status) {
            error = new Error(e.message);
            error.code = e.status;
            context.fire("onError", context.container, error);
          } else {
            context.fire("onError", context.container, e);
          }
        }
        break;
      case "WEBSOCKET":
      case "WEBSOCKET SECURE":
        if (e.status) {
          error = new Error(e.message);
          error.code = e.status;
          context.fire("onError", context.container, error);
        } else {
          context.fire("onError", context.container, e);
        }
        break;
      }
      return e;
    }

    handle(context) {
      try {
        if (this.factory) {
          return this.factory.handle(context, (error, token) => {
            if (error) {
              return this.handleError(context, error);
            }
            this.token = token;
            context.session.migrate();
            let userFull = context.user.dataValues;
            delete userFull.password;

            context.session.setMetaBag("security", {
              firewall: this.name,
              user: context.user.username,
              userFull: userFull,
              factory: this.factory.name,
              tokenName: this.token.name
            });
            let target_path = context.session.getFlashBag("default_target_path");
            if (context.user.lang) {
              context.session.set("lang", context.user.lang);
            }
            let target = null;
            if (target_path) {
              target = target_path;
            } else {
              target = this.defaultTarget;
            }
            context.resolver = this.overrideURL(context, target);
            if (context.isAjax) {
              let obj = context.setXjson({
                message: "OK",
                status: 200,
              });
              context.isJson = true;
              context.fire("onRequest", obj);
              return context;
            } else {
              return this.redirect(context, target);
            }
          });
        } else {
          context.fire("onRequest");
          return context;
        }
      } catch (e) {
        this.handleError(context, e);
      }
    }

    // Factory
    setFactory(auth, options) {
      this.factoryName = auth;
      if (auth) {
        if (auth in nodefony.security.factory) {
          this.factory = new nodefony.security.factory[auth](this, options);
          this.logger("FACTORY " + auth + " registered ", "DEBUG");
        } else {
          this.logger("FACTORY :" + auth + "NOT registered ", "ERROR");
          throw new Error("FACTORY :" + auth + "NOT registered ");
        }
      }
    }

    getFactory() {
      return this.factory;
    }

    setProvider(provider, type) {
      this.providerName = provider;
      this.providerType = type;
    }

    overrideURL(context, myUrl) {
      context.method = "GET";
      context.request.url = url.parse(url.resolve(context.request.url, myUrl));
      return this.router.resolve(context);
    }

    redirectHttps(context) {
      // no cache
      return context.redirectHttps(301, true);
    }

    redirect(context, url) {
      if (url) {
        // no cache
        return context.redirect(url, 301, true);
      }
      return context.redirect(context.request.url, 301, true);
    }

    match(context) {
      let url = context.request.url ? context.request.url.pathname : (context.request.resourceURL ? context.request.resourceURL.pathname : null);
      return this.pattern.exec(url);
    }

    setPattern(pattern) {
      this.regPartten = pattern;
      this.pattern = new RegExp(pattern);
    }

    setCors(crossSettings) {
      this.cors = this.firewall.corsManager.createCors(crossSettings);
      return this.cors;
    }

    setFormLogin(route) {
      this.formLogin = route;
    }

    setCheckLogin(route) {
      this.checkLogin = route;
    }

    setDefaultTarget(route) {
      this.defaultTarget = route;
    }

    setAlwaysUseDefaultTarget(data) {
      this.alwaysUseDefaultTarget = data;
    }

    setContextSession(context) {
      this.sessionContext = context;
    }

    setRedirectHttps(value) {
      this.redirect_Https = value ||  false;
    }
  };

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

  const Firewall = class Firewall extends nodefony.Service {

    constructor(container, kernel, cors) {
      super("firewall", container, kernel.notificationsCenter);
      this.corsManager = cors;
      this.reader = function (context) {
        let func = context.get("reader").loadPlugin("security", pluginReader);
        return function (result) {
          try {
            return func(result, context.nodeReader.bind(context));
          } catch (e) {
            throw e;
          }
        };
      }(this);
      this.securedAreas = {};
      this.providers = {};
      this.sessionStrategy = "invalidate";
      // listen KERNEL EVENTS
      this.once(this, "onPreBoot", () => {
        this.sessionService = this.get("sessions");
        this.orm = this.get(this.kernel.settings.orm);
      });
      this.listen(this, "onSecurity", (context) => {
        switch (context.type) {
        case "HTTP":
        case "HTTPS":
          return this.handleHttp(context);
        case "WEBSOCKET":
        case "WEBSOCKET SECURE":
          return this.handleWebsoket(context);
        }
      });
    }

    isSecure(context) {
      for (let area in this.securedAreas) {
        if (this.securedAreas[area].match(context)) {
          //FIXME PRIORITY
          context.security = this.securedAreas[area];
          return true;
        }
      }
      return false;
    }

    handleHttp(context) {
      context.request.request.on('end', () => {
        try {
          if (this.isSecure(context)) {
            context.sessionAutoStart = "firewall";
            return this.sessionService.start(context, context.security.sessionContext).then((session) => {
              if (!(session instanceof nodefony.Session)) {
                throw new Error("SESSION START session storage ERROR");
              }
              if (context.type === "HTTP" && context.container.get("httpsServer").ready) {
                if (context.security.redirect_Https) {
                  return context.security.redirectHttps(context);
                }
              }
              return this.handle(context, session);
            }).catch((error) => {
              // break exception in promise catch !
              context.fire("onError", context.container, error);
              return error;
            });
          } else {
            if (context.sessionAutoStart === "autostart") {
              return this.sessionService.start(context, "default").then((session) => {
                if (!(session instanceof nodefony.Session)) {
                  throw new Error("SESSION START session storage ERROR");
                }
                return this.handle(context, session);
              }).catch((error) => {
                context.fire("onError", context.container, error);
                return error;
              });
            } else {
              if (context.cookieSession) {
                return this.sessionService.start(context, null).then((session) => {
                  if (!(session instanceof nodefony.Session)) {
                    throw new Error("SESSION START session storage ERROR");
                  }
                  try {
                    let meta = session.getMetaBag("security");
                    if (meta) {
                      context.user = meta.userFull;
                    }
                    context.fire("onRequest");
                    return context;
                  } catch (error) {
                    throw error;
                  }
                }).catch((error) => {
                  context.fire("onError", context.container, error);
                  return error;
                });
              } else {
                context.fire("onRequest");
                return context;
              }
            }
          }
        } catch (error) {
          context.fire("onError", context.container, error);
        }
      });
    }

    handleWebsoket(context) {
      try {
        if (this.isSecure(context)) {
          context.sessionAutoStart = "firewall";
          return this.sessionService.start(context, context.security.sessionContext).then((session) => {
            if (!(session instanceof nodefony.Session)) {
              throw new Error("SESSION START session storage ERROR");
            }
            return this.handle(context, session);
          }).catch((error) => {
            context.fire("onError", context.container, error);
            return error;
          });
        } else {
          if (context.sessionAutoStart === "autostart") {
            return this.sessionService.start(context, "default").then((session) => {
              if (!(session instanceof nodefony.Session)) {
                throw new Error("SESSION START session storage ERROR");
              }
              try {
                return this.handle(context, session);
              } catch (error) {
                throw error;
              }
            }).catch((error) => {
              context.fire("onError", context.container, error);
              return error;
            });
          } else {
            if (context.cookieSession) {
              return this.sessionService.start(context, null).then((session) => {
                if (!(session instanceof nodefony.Session)) {
                  throw new Error("SESSION START session storage ERROR");
                }
                try {
                  let meta = session.getMetaBag("security");
                  if (meta) {
                    context.user = meta.userFull;
                  }
                  context.fire("onRequest");
                  return context;
                } catch (error) {
                  throw error;
                }
              }).catch((error) => {
                context.fire("onError", context.container, error);
                return error;
              });
            } else {
              context.fire("onRequest");
              return context;
            }
          }
        }
      } catch (error) {
        context.fire("onError", context.container, error);
      }
    }

    handle(context, session) {
      try {
        let next = null;
        context.crossDomain = context.isCrossDomain();
        if (context.security && context.crossDomain) {
          next = context.security.handleCrossDomain(context);
          switch (next) {
          case 204:
            return 204;
          case 401:
            let error = new Error("CROSS DOMAIN Unauthorized REQUEST REFERER : " + context.originUrl.href);
            error.code = next;
            throw error;
          case 200:
            this.logger("\x1b[34m CROSS DOMAIN  \x1b[0mREQUEST REFERER : " + context.originUrl.href, "DEBUG");
            break;
          }
        }
        let meta = session.getMetaBag("security");
        if (meta) {
          context.user = meta.userFull;
        }
        if (context.security) {
          if (!meta) {
            try {
              if (context.method === "WEBSOCKET") {
                let error = new Error("Unauthorized");
                error.code = 401;
                throw error;
              }
              return context.security.handle(context);
            } catch (e) {
              context.security.handleError(context, e);
              return;
            }
          }
        }
        context.fire("onRequest");
        return context;
      } catch (e) {
        throw e;
      }
    }

    setSessionStrategy(strategy) {
      if (strategy in optionStrategy) {
        this.logger("Set Session Strategy  : " + strategy, "DEBUG");
        return this.sessionStrategy = strategy;
      }
      throw new Error("sessionStrategy strategy not found");
    }

    nodeReader(obj) {
      //console.log(obj.security.firewalls)
      obj = obj.security;
      for (let ele in obj) {
        switch (ele) {
        case "firewalls":
          for (let firewall in obj[ele]) {
            let param = obj[ele][firewall];
            let area = this.addSecuredArea(firewall);
            for (let config in param) {
              switch (config) {
              case "pattern":
                area.setPattern(param[config]);
                break;
              case "anonymous":
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
                //TODO
                break;
              case "redirectHttps":
                area.setRedirectHttps(param[config]);
                break;
              case "provider":
                area.setProvider(param[config]);
                break;
              case "context":
                if (param[config]) {
                  this.once(this, "onBoot", function (context, contextSecurity) {
                    contextSecurity.setContextSession(context);
                    this.sessionService.addContextSession(context);
                  }.bind(this, param[config], area));
                }
                break;
              default:
                if (config in nodefony.security.factory) {
                  area.setFactory(config, param[config]);
                } else {
                  area.factoryName = config;
                  this.logger("FACTORY : " + config + " not found in nodefony namespace", "ERROR");
                }
              }
            }
          }
          break;
        case "session_fixation_strategy":
          this.once(this, "onBoot", function (strategy) {
            this.setSessionStrategy(strategy);
            this.sessionService.setSessionStrategy(this.sessionStrategy);
          }.bind(this, obj[ele]));
          break;
        case "access_control":
          break;
        case "providers":
          for (let provider in obj[ele]) {
            this.providers[provider] = {
              name: null,
              Class: null,
              type: null
            };
            for (let pro in obj[ele][provider]) {
              let element = obj[ele][provider];
              switch (pro) {
              case "memory":
                for (let mapi in element[pro]) {
                  switch (mapi) {
                  case "users":
                    this.providers[provider] = {
                      name: provider,
                      Class: new nodefony.usersProvider(provider, element[pro][mapi]),
                      type: pro
                    };
                    this.logger(" Register Provider  : " + provider + " API " + this.providers[provider].name, "DEBUG");
                    break;
                  default:
                    this.logger("Provider API : " + mapi + " Not exist");
                  }
                }
                break;
              case "class":
                let myClass = null;
                let property = null;
                let manager_name = null;

                for (let api in element[pro]) {
                  switch (api) {
                  case "name":
                    myClass = nodefony[element[pro][api]];
                    break;
                  case "property":
                    property = element[pro][api];
                    break;
                  case "manager_name":
                    manager_name = element[pro][api];
                    break;
                  }
                }
                if (myClass) {
                  if (manager_name && manager_name !== "~") {
                    this.providers[manager_name] = {
                      name: manager_name,
                      Class: new myClass(property),
                      type: pro
                    };
                  } else {
                    this.providers[provider] = {
                      name: manager_name,
                      Class: new myClass(property),
                      type: pro
                    };
                  }
                }
                break;
              case "entity":
                this.once(this, "onPreBoot", () => {
                  this.orm.once(this, "onOrmReady", function () {
                    let ent = this.orm.getEntity(element[pro].name);
                    if (!ent) {
                      this.logger("ENTITY PROVIDER : " + provider + " not found", "ERROR");
                      return;
                    }
                    this.providers[provider] = {
                      name: provider,
                      Class: ent,
                      type: pro
                    };
                    this.logger(" Register Provider  : " + provider + " ENTITY " + element[pro].name, "DEBUG");
                  });
                });
                break;
              default:
                this.logger("Provider type :" + pro + " not define ");
              }
            }
          }
          break;
        }
      }
    }

    addSecuredArea(name) {
      if (!this.securedAreas[name]) {
        this.securedAreas[name] = new securedArea(name, this);
        this.logger("ADD security context : " + name, "DEBUG");
        return this.securedAreas[name];
      } else {
        this.logger("securedAreas :" + name + "already exist ");
      }
    }

    getSecuredArea(name) {
      if (name in this.securedAreas) {
        return this.securedAreas[name];
      }
      return null;
    }

    logger(pci, severity, msgid, msg) {
      if (!msgid) {
        msgid = "\x1b[36mSERVICE FIREWALL\x1b[0m";
      }
      return this.syslog.logger(pci, severity, msgid, msg);
    }
  };
  return Firewall;
});
