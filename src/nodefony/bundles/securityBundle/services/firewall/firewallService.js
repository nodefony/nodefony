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
    this.once("onPreBoot", () => {
      this.sessionService = this.get("sessions");
      this.orm = this.get(this.kernel.settings.orm);

    });
    this.once("onPostRegister", () => {
      this.settings = this.kernel.getBundle("security").settings.headers;
    });

    this.bundleHttp = this.kernel.getBundles("http");
    this.bundleHttp.listen(this, "onServersReady", (type) => {
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

    this.listen(this, "onSecurity", (context) => {
      switch (context.type) {
      case "HTTPS":
      case "HTTP":
      case "HTTP2":
        context.response.setHeaders(this.settings[context.protocol]);
        context.once('onRequestEnd', () => {
          return this.handle(context);
        });
        break;
      case "WEBSOCKET SECURE":
      case "WEBSOCKET":
        return this.handle(context);
      }
    });
  }

  isSecure(context) {
    for (let area in this.securedAreas) {
      if (this.securedAreas[area].match(context)) {
        //FIXME PRIORITY
        context.security = this.securedAreas[area];
        this.logger("ENTER SECURE AREA : " + context.security.name, "DEBUG");
        return true;
      }
    }
    return false;
  }

  handleCrossDomain(context) {
    let next = null;
    context.crossDomain = context.isCrossDomain();
    if (context.crossDomain) {
      if (context.security) {
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
      } else {
        let error = new Error("CROSS DOMAIN Unauthorized REQUEST REFERER : " + context.originUrl.href);
        error.code = 401;
        throw error;
      }
    }
  }

  handle(context) {
    try {
      let sessionContext = null;
      this.isSecure(context);
      try {
        let cross = this.handleCrossDomain(context);
        if (cross === 204) {
          return;
        }
      } catch (error) {
        throw error;
      }
      if (context.security) {
        context.sessionAutoStart = context.security.sessionContext;
        sessionContext = context.security.sessionContext;
        if (context.type === "HTTP" && this.httpsReady) {
          if (context.security.redirect_Https) {
            return context.security.redirectHttps(context);
          }
        }
      } else {
        if (!context.cookieSession && !context.sessionAutoStart) {
          return context.fire("onRequest");
        } else {
          return this.sessionService.start(context, context.sessionAutoStart).then((session) => {
            if (!(session instanceof nodefony.Session)) {
              throw new Error("SESSION START session storage ERROR");
            }
            return context.fire("onRequest");
          }).catch((error) => {
            // break exception in promise catch !
            context.fire("onError", context.container, error);
            return error;
          });
        }
      }
      return this.sessionService.start(context, sessionContext).then((session) => {
        if (!(session instanceof nodefony.Session)) {
          throw new Error("SESSION START session storage ERROR");
        }
        return this.handleStateFull(context, session);
      }).catch((error) => {
        // break exception in promise catch !
        context.fire("onError", context.container, error);
        return error;
      });
    } catch (error) {
      context.fire("onError", context.container, error);
    }
  }

  handleStateFull(context, session) {
    try {
      let meta = session.getMetaBag("security");
      if (meta) {
        if (meta.user === "anonymous" && context.security && context.security.name !== meta.firewall) {
          if (!context.security.anonymous) {
            return context.security.handle(context);
          }
        }
        context.user = meta.userFull;
      } else {
        if (context.security) {
          try {
            if (context.method === "WEBSOCKET") {
              if (!context.security.anonymous && context.security.factory) {
                let error = new Error("Unauthorized");
                error.code = 401;
                throw error;
              }
            }
            return context.security.handle(context);
          } catch (e) {
            context.security.handleError(context, e);
            return context;
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
              area.setAnonymous(param[config]);
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
              area.setProvider(param[config]);
              break;
            case "context":
              if (param[config]) {
                this.once("onBoot", () => {
                  area.setContextSession(param[config]);
                  this.sessionService.addContextSession(param[config]);
                });
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
        this.once("onBoot", () => {
          this.setSessionStrategy(obj[ele]);
          this.sessionService.setSessionStrategy(this.sessionStrategy);
        });
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
              this.once("onPreBoot", () => {
                this.orm.once("onOrmReady", () => {
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
      this.securedAreas[name] = new nodefony.SecuredArea(name, this);
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
    return super.logger(pci, severity, msgid, msg);
  }
};
