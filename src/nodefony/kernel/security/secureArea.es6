/* eslint-disable max-lines-per-function */
module.exports = nodefony.register("SecuredArea", () => {
  // context security
  class securedArea extends nodefony.Service {
    constructor (name, firewall) {
      super(name, firewall.container, firewall.notificationsCenter);
      this.firewall = firewall;
      this.router = this.get("router");
      this.sessionContext = "default";
      this.cors = null;
      this.pattern = /.*/u;
      this.factories = [];
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
            } else if (this.anonymous) {
              this.providerName = "anonymous";
              this.provider = this.firewall.providerManager.getProvider("anonymous");
            } else {
              throw new Error(`Provider : ${this.providerName} not found in firewall ${this.name}`);
            }
          } else if (this.anonymous) {
            this.providerName = "anonymous";
            this.provider = this.firewall.providerManager.getProvider("anonymous");
          } else {
            // this.providerName = null; //"nodefony";
            // this.provider = this.firewall.providerManager.getProvider("nodefony");
          }
        } catch (e) {
          this.log(`${this.name}  ${e}`, "ERROR");
        }
      });
    }

    log (pci, severity, msgid, msg) {
      if (!msgid) {
        msgid = `\x1b[36mSECURE AREA \x1b[31m${this.name} \x1b[0m`;
      }
      return super.log(pci, severity, msgid, msg);
    }

    handleCrossDomain (context) {
      let redirect = false;
      if (context.security.redirect_Https &&
        context.protocol === "https" &&
        context.originUrl.protocol === "http:") {
        redirect = "https";
      }
      if (context.crossDomain) {
        if (this.cors) {
          return this.cors.match(context, redirect);
        }
        if (redirect) {
          return null;
        }
        if (context.originUrl.href === "*") {
          return 200;
        }
        return 401;
      }
    }

    // eslint-disable-next-line complexity
    handleError (context, e) {
      let securityError = null;
      switch (true) {
      case e instanceof nodefony.securityError:
        securityError = e;
        break;
      default:
        securityError = new nodefony.securityError(e, e ? e.code : null, this, context);
      }
      if (!securityError.code) {
        securityError.code = 401;
      }
      if (this.kernel.debug) {
        // this.log(securityError, "ERROR");
      }
      switch (context.type) {
      case "HTTP":
      case "HTTPS":
      case "HTTP2":
        if (e && e.status) {
          context.response.setStatusCode(e.code, e.message);
        } else {
          context.response.setStatusCode(401);
        }
        if (this.formLogin) {
          if (context.session) {
            const area = context.session.getMetaBag("area");
            if (area && area !== this.name) {
              context.session.clearFlashBag("default_target_path");
            }
            context.session.setMetaBag("area", this.name);
            const target_path = context.session.getFlashBag("default_target_path");
            if (!target_path && context.method === "GET") {
              context.session.setFlashBag("default_target_path", context.request.url.pathname);
            }
            if (context.method !== "GET") {
              context.session.setFlashBag("error", securityError.message);
            }
          }

          /* if (context.session &&
            (context.request.url.pathname !== this.formLogin) &&
            (context.request.url.pathname !== this.checkLogin)
          ) {
            console.log("PASSAS no form login", this.formLogin, context.request.url.pathname, securityError.message, context.method)
            let area = context.session.getMetaBag("area");
            if (area && area !== this.name) {
              context.session.clearFlashBag("default_target_path");
            }
            let target_path = context.session.getFlashBag("default_target_path");
            if (!target_path) {
              context.session.setFlashBag("default_target_path", context.request.url.pathname);
            }
            context.session.setMetaBag("area", this.name);
          } else {
            console.log("PASSAS formLogin ok", this.formLogin, context.request.url.pathname, securityError.message, context.method)
            if (context.session) {
              if (this.formLogin === context.request.url.pathname && context.method !== "GET") {
                context.session.setFlashBag("error", securityError.message);
              }
            }
          }*/
          try {
            if (context.isJson) {
              return securityError;
            }
            // return this.redirect(context, this.formLogin);
            context.resolver = this.overrideURL(context, this.formLogin);
            return context;
          } catch (e) {
            // eslint-disable-next-line new-cap
            return new nodefony.securityError(e, 500, this, context);
          }
        } else {
          if (context.session) {
            context.session.setFlashBag("error", securityError.message);
          }
          return securityError;
        }
      case "WEBSOCKET":
      case "WEBSOCKET SECURE":
        return securityError;
      default:
      }
    }

    handleFactories (context, index = 1) {
      return new Promise((resolve, reject) => {
        if (this.nbFactories) {
          try {
            this.log(`Try Authentication Factory ${this.factories[index - 1].name}`, "DEBUG");
            return this.factories[index - 1].handle(context)
              .then((token) => resolve(token))
              .catch((e) => {
                this.factories[index - 1].log(e, "DEBUG");
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

    handle (context) {
      // eslint-disable-next-line no-promise-executor-return
      return new Promise((resolve, reject) => this.handleFactories(context)
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
                } else if (!context.session.get("lang")) {
                  context.session.set("lang", context.translation.defaultLocale);
                }
              }
              return resolve(context);
            }
            if (context.session) {
              // context.session.migrate();
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
              } else {
                target = this.defaultTarget;
              }
              context.session.clearFlashBag("default_target_path");
            }
          } catch (e) {
            const res = this.handleError(context, e);
            if (res instanceof Error) {
              return reject(res);
            }
            return resolve(res);
          }
          if (this.checkLogin) {
            try {
              delete context.resolver;
              context.checkLogin = true;
              context.resolver = this.overrideURL(context, this.checkLogin, target);
              // context.resolver = this.router.resolveName(context, this.checkLogin);
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
          }
          return resolve(this.redirect(context, target));
          // return resolve(context);
        })
        .catch((error) => {
          if (!error) {
            error = new Error("");
          }
          const res = this.handleError(context, error);
          if (res instanceof Error) {
            return reject(res);
          }
          return resolve(res);
        }));
    }

    logout (context) {
      return new Promise(async (resolve, reject) => {
        const res = [];
        this.log("Logout factories", "DEBUG");
        for await (const factorie of this.factories) {
          this.log(`Logout factory : ${factorie}`, "DEBUG");
          res.push(await factorie.logout(context));
        }
        if (context.session) {
          this.log(`Invalidate session Security : ${context.session.id}`, "DEBUG");
          return context.session.invalidate()
            .then(() => {
              if (this.formLogin) {
                return resolve(this.redirect(context, this.formLogin));
              }
              return resolve(context);
            })
            .catch((e) => {
              this.log(e, "ERROR");
              return reject(e);
            });
        }
        return resolve(res);
      });
    }

    // Factory
    setFactory (auth, options) {
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
          this.log(`FACTORY ${auth} registered `, "DEBUG");
          return this.factories[index];
        }
        this.log(`FACTORY :${auth}NOT registered `, "ERROR");
        throw new Error(`FACTORY :${auth} NOT registered `);
      }
      throw new Error(`FACTORY :${auth} bad args`);
    }

    getFactory (name) {
      if (name) {
        const index = this.factories.findIndex((factory) => factory.name === name);
        if (index >= 0) {
          return this.factories[index];
        }
        return null;
      }
      return null;
    }

    setProvider (provider) {
      if (provider) {
        this.provider = provider;
        this.providerName = provider.name;
      }
    }

    setProviderName (name) {
      this.providerName = name;
    }

    getProvider () {
      return this.provider;
    }

    setStateLess (state) {
      if (state === null) {
        this.stateLess = true;
        return true;
      }
      this.stateLess = state || false;
      return state || false;
    }

    overrideURL (context, myUrl, target = null) {
      try {
        if (myUrl) {
          context.request.url = url.parse(url.resolve(context.request.url, myUrl));
        }
        const resolver = this.router.resolve(context);
        if (target) {
          resolver.variables.push(target);
        }
        return resolver;
      } catch (e) {
        if (e instanceof nodefony.Resolver) {
          if (e.exception) {
            throw e.exception;
          }
        }
        throw e;
      }
    }

    redirectHttps (context) {
      // no cache
      context.redirectHttps(301);
      return context;
    }

    redirect (context, url) {
      if (url) {
        // no cache
        return context.redirect(url, 302, true);
        // return context;
      }
      return context.redirect(context.request.url, 302, true);
      // return context;
    }

    match (context) {
      const url = context.request.url ? context.request.url.pathname : context.request.resourceURL ? context.request.resourceURL.pathname : null;
      return this.pattern.exec(url);
    }

    setPattern (pattern) {
      if (pattern instanceof RegExp) {
        this.pattern = pattern;
        this.stringPattern = pattern.toString();
      } else {
        this.stringPattern = pattern;
        this.pattern = new RegExp(pattern);
      }
      return this.pattern;
    }

    setCors (crossSettings) {
      this.cors = this.firewall.corsManager.createCors(crossSettings);
      return this.cors;
    }

    setFormLogin (route) {
      this.formLogin = route;
    }

    setCheckLogin (route) {
      this.checkLogin = route;
    }

    setDefaultTarget (route) {
      this.defaultTarget = route;
    }

    setAlwaysUseDefaultTarget (data) {
      this.alwaysUseDefaultTarget = data;
    }

    setContextSession (context) {
      this.sessionContext = context;
    }

    setRedirectHttps (value) {
      this.redirect_Https = value || false;
    }
  }
  return securedArea;
});
