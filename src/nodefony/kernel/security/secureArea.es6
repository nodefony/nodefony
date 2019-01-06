module.exports = nodefony.register("SecuredArea", function () {

  // context security
  class securedArea extends nodefony.Service {

    constructor(name, firewall) {
      super(name, firewall.container, firewall.notificationsCenter);
      this.firewall = firewall;
      this.router = this.get("router");
      this.sessionContext = "default";
      this.cors = null;
      this.pattern = /.*/;
      this.factories = [];
      //this.factory = null;
      this.nbFactories = 0;
      this.provider = null;
      this.providerName = null;
      this.formLogin = null;
      this.checkLogin = null;
      this.redirect_Https = false;
      this.defaultTarget = null;
      this.alwaysUseDefaultTarget = false;
      this.stateLess = false;
      this.anonymous = false;
      this.prependOnceListener("onReady", () => {
        try {
          if (this.providerName) {
            if (this.providerName in this.firewall.providerManager.providers) {
              this.provider = this.firewall.providerManager.getProvider(this.providerName);
            } else {
              if (this.anonymous) {
                this.providerName = "anonymous";
                this.provider = this.firewall.providerManager.getProvider("anonymous");
              } else {
                throw new Error(`Provider : ${this.providerName} not found in firewall ${this.name}`);
              }
            }
          } else {
            if (this.anonymous) {
              this.providerName = "anonymous";
              this.provider = this.firewall.providerManager.getProvider("anonymous");
            } else {
              //this.providerName = null; //"nodefony";
              //this.provider = this.firewall.providerManager.getProvider("nodefony");
            }
          }
        } catch (e) {
          this.logger(this.name + "  " + e, "ERROR");
        }
      });
    }

    logger(pci, severity, msgid, msg) {
      if (!msgid) {
        msgid = "\x1b[36mSECURE AREA \x1b[31m" + this.name + " \x1b[0m";
      }
      return super.logger(pci, severity, msgid, msg);
    }

    handleCrossDomain(context) {
      let redirect = false;
      if (context.security.redirect_Https &&
        context.protocol === "https" &&
        context.originUrl.protocol === "http:") {
        redirect = "https";
      }
      if (context.crossDomain) {
        if (this.cors) {
          return this.cors.match(context, redirect);
        } else {
          if (redirect) {
            return null;
          }
          return 401;
        }
      }
    }

    handleError(context, e) {
      let securityError = null;
      switch (true) {
      case (e instanceof nodefony.securityError):
        securityError = e;
        break;
      default:
        securityError = new nodefony.securityError(e, null, this, context);
      }
      if (!securityError.code) {
        securityError.code = 401;
      }
      this.logger(securityError, "ERROR");
      switch (context.type) {
      case "HTTP":
      case "HTTPS":
      case "HTTP2":
        if (this.formLogin) {
          if (e && e.status) {
            context.response.setStatusCode(e.code, e.message);
          } else {
            context.response.setStatusCode(401);
          }
          if (context.session &&
            (context.request.url.pathname !== this.formLogin) &&
            (context.request.url.pathname !== this.checkLogin)
          ) {

            let area = context.session.getMetaBag("area");
            if (area && area !== this.name) {
              context.session.clearFlashBag("default_target_path");
            }
            let target_path = context.session.getFlashBag("default_target_path");
            if (!target_path) {
              context.session.setFlashBag("default_target_path", context.request.url.pathname);
            }
            context.session.setMetaBag("area", this.name);
          }
          try {
            //context.resolver = this.overrideURL(context, this.formLogin);
            if (context.session) {
              context.session.setFlashBag("error", securityError.message);
            }
            if (!context.isJson) {
              return this.redirect(context, this.formLogin);
            } else {
              return securityError;
            }
          } catch (e) {
            return new nodefony.securityError(e, 500, this, context);
          }
        } else {
          if (context.session) {
            context.session.setFlashBag("error", securityError.message);
          }
          return securityError;
        }
        break;
      case "WEBSOCKET":
      case "WEBSOCKET SECURE":
        return securityError;
      }
    }

    handleFactories(context, index = 1) {
      return new Promise((resolve, reject) => {
        if (this.nbFactories) {
          try {
            this.factories[index - 1].handle(context)
              .then((token) => {
                return resolve(token);
              })
              .catch((e) => {
                this.factories[index - 1].logger(e, "ERROR");
                if (index === this.nbFactories) {
                  return reject(e);
                }
                return resolve(this.handleFactories(context, ++index));
              });
          } catch (e) {
            return reject(e);
          }
        } else {
          return resolve(null);
        }
      });
    }

    handle(context) {
      return new Promise((resolve, reject) => {
        return this.handleFactories(context)
          .then((token) => {
            let target = this.defaultTarget;
            try {
              if (token) {
                context.user = token.user;
                context.token = token;
              } else {
                if (context.session) {
                  context.session.setMetaBag("security", {
                    firewall: this.name,
                    token: null
                  });
                  if (context.user && context.user.lang) {
                    context.session.set("lang", context.user.lang);
                  } else {
                    context.session.set("lang", context.translation.defaultLocale);
                  }
                }
                return resolve(context);
              }
              if (context.session) {
                context.session.migrate();
                context.session.setMetaBag("security", {
                  firewall: this.name,
                  token: token ? token.serialize() : null
                });
                if (context.user && context.user.lang) {
                  context.session.set("lang", context.user.lang);
                } else {
                  context.session.set("lang", context.translation.defaultLocale);
                }
                if (!this.alwaysUseDefaultTarget) {
                  target = context.session.getFlashBag("default_target_path") || this.defaultTarget;
                }
                context.session.clearFlashBag("default_target_path");
              }
            } catch (e) {
              let res = this.handleError(context, e);
              if (res instanceof Error) {
                return reject(res);
              }
              return resolve(res);
            }
            if (this.checkLogin) {
              try {
                delete context.resolver;
                context.checkLogin = true;
                context.resolver = this.overrideURL(context, this.checkLogin);
                //context.resolver = this.router.resolveName(context, this.checkLogin);
                return resolve(context);
              } catch (e) {
                throw e;
              }
            }
            if (!target) {
              return resolve(context);
            }

            if (context.isJson) {
              context.resolver = this.overrideURL(context, target);
              return resolve(context);
            } else {
              return resolve(this.redirect(context, target));
            }
            return resolve(context);
          })
          .catch((error) => {
            if (!error) {
              error = new Error("");
            }
            let res = this.handleError(context, error);
            if (res instanceof Error) {
              return reject(res);
            }
            return resolve(res);
          });
      });
    }

    logout(context) {
      if (context.session) {
        return context.session.destroy(true)
          .then(() => {
            if (this.formLogin) {
              return this.redirect(context, this.formLogin);
            }
            return context.redirect("/", null, true);
          }).catch(e => {
            this.logger(e, "ERROR");
            throw e;
          });
      }
      return new Promise((resolve) => {
        return resolve(true);
      });
    }

    // Factory
    setFactory(auth, options) {
      if (auth) {
        if (auth in nodefony.security.factories) {
          let index = null;
          if (auth === "anonymous") {
            this.anonymous = true;
            index = this.factories.push(new nodefony.security.factories[auth](this, options));
          } else {
            this.factories.unshift(new nodefony.security.factories[auth](this, options));
            index = 0;
          }
          this.nbFactories++;
          this.logger("FACTORY " + auth + " registered ", "DEBUG");
          return this.factories[index];
        } else {
          this.logger("FACTORY :" + auth + "NOT registered ", "ERROR");
          throw new Error("FACTORY :" + auth + "NOT registered ");
        }
      }
    }

    getFactory(name) {
      if (name) {
        let index = this.factories.findIndex((factory) => {
          return factory.name === name;
        });
        if (index >= 0) {
          return this.factories[index];
        }
        return null;
      }
      return null;
    }

    setProvider(provider) {
      this.providerName = provider;
    }

    getProvider() {
      return this.provider;
    }

    setStateLess(state) {
      if (state === null) {
        return this.stateLess = true;
      }
      return this.stateLess = state || false;
    }

    overrideURL(context, myUrl) {
      if (myUrl) {
        context.request.url = url.parse(url.resolve(context.request.url, myUrl));
      }
      return this.router.resolve(context);
    }

    redirectHttps(context) {
      // no cache
      context.redirectHttps(301);
      return context;
    }

    redirect(context, url) {
      if (url) {
        // no cache
        return context.redirect(url, 302, true);
        //return context;
      }
      return context.redirect(context.request.url, 302, true);
      //return context;
    }

    match(context) {
      let url = context.request.url ? context.request.url.pathname : (context.request.resourceURL ? context.request.resourceURL.pathname : null);
      return this.pattern.exec(url);
    }

    setPattern(pattern) {
      if (pattern instanceof RegExp) {
        this.pattern = pattern;
        this.stringPattern = pattern.toString();
      } else {
        this.stringPattern = pattern;
        this.pattern = new RegExp(pattern);
      }
      return this.pattern;
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
      this.redirect_Https = value || false;
    }
  }
  return securedArea;
});