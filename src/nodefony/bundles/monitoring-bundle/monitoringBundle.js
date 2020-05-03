let useragent = null;
try {
  useragent = require('useragent');
} catch (e) {}
/**
 *	The class is a **`monitoring` BUNDLE** .
 *	@module NODEFONY
 *	@main NODEFONY
 *	@class monitoring
 *	@constructor
 *	@param {class} kernel
 *	@param {class} container
 *
 */
module.exports = class monitoringBundle extends nodefony.Bundle {

  constructor(name, kernel, container) {

    super(name, kernel, container);
    if (this.kernel.type === "CONSOLE") {
      return;
    }
    this.infoKernel = {};
    this.infoBundles = {};
    this.httpKernel = this.container.get("httpKernel");
    this.webpackService = this.get("webpack");
    let ORM = null;
    let mail = null;
    let ormName = this.kernel.settings.orm;
    // MANAGE GIT
    this.gitInfo = {
      currentBranch: null
    };
    try {
      this.kernel.git.branch((err, BranchSummary) => {
        if (err) {
          this.logger(err, "WARNING");
          return;
        }
        this.gitInfo.currentBranch = BranchSummary.current;
      });
    } catch (e) {
      this.logger(e, "WARNING");
    }

    this.kernel.once("onPreBoot", async (kernel) => {
      this.templating = this.get("templating");
      this.infoKernel.events = {};

      for (let event in kernel.notificationsCenter._events) {
        switch (event) {
          case "onPreBoot":
            this.infoKernel.events[event] = {
              fire: kernel.preboot,
              nb: 1,
              listeners: kernel.notificationsCenter._events[event].length
            };
            break;
          default:
            this.infoKernel.events[event] = {
              fire: false,
              nb: 0,
              listeners: kernel.notificationsCenter._events[event].length
            };
            kernel.on(event, () => {
              this.infoKernel.events[event].fire = true;
              this.infoKernel.events[event].nb = ++this.infoKernel.events[event].nb;
            });
        }
      }
    });

    this.kernel.once("onBoot", async () => {
      this.mailer = this.get("mailer");
      this.orm = this.get(ormName);

      if (this.orm) {
        ORM = {
          name: this.orm.name,
          version: this.orm.engine.version,
          connections: {}
        };
      }
      this.orm.once("onOrmReady", () => {
        switch (ORM.name) {
          case "sequelize":
            for (let connection in this.orm.connections) {
              ORM.connections[connection] = {
                state: this.orm.connections[connection].state,
                name: this.orm.connections[connection].name,
                type: this.orm.connections[connection].type,
                db: {}
              };
              if (this.orm.connections[connection].db) {
                ORM.connections[connection].db = {
                  config: this.orm.connections[connection].db.config,
                  options: this.orm.connections[connection].db.options,
                  models: {}
                };
                for (let model in this.orm.connections[connection].db.models) {
                  ORM.connections[connection].db.models[model] = {
                    name: model
                  };
                }
              }
            }
            break;
          case "mongoose":
            for (let connection in this.orm.connections) {
              ORM.connections[connection] = {
                state: this.orm.connections[connection].states[this.orm.connections[connection]._readyState],
                name: this.orm.connections[connection].name,
                type: "mongodb",
                db: {}
              };
              let options = {
                host: this.orm.connections[connection].host + ":" + this.orm.connections[connection].port
              };

              if (this.orm.connections[connection]) {
                ORM.connections[connection].db = {
                  config: this.orm.connections[connection].config,
                  options: options,
                  models: {}
                };
                for (let model in this.orm.connections[connection].models) {
                  ORM.connections[connection].db.models[model] = {
                    name: model
                  };
                }
              }
            }
            break;
        }
      });

    });

    this.kernel.once("onReady", async () => {

      if (this.mailer && this.mailer.config.transporters) {
        mail = {
          transporters: this.mailer.config.transporters,
          default: this.mailer.config.default
        };
      }
    });

    this.kernel.once("onPostReady", async (kernel) => {
      //this.debugView = this.httpKernel.getTemplate("monitoringBundle::debugBar.html.twig");
      if (this.settings.profiler.active) {
        this.storageProfiling = this.settings.profiler.storage;
      } else {
        this.storageProfiling = null;
      }

      this.requestEntity = this.orm.getEntity("requests");

      this.kernelSetting = nodefony.extend(true, {}, this.kernel.settings, {
        templating: this.kernel.settings.templating + " " + this.templating.version,
        orm: this.orm ? this.kernel.settings.orm + " " + this.orm.engine.version : "",
        CDN: this.kernel.settings.CDN ? true : false,
        node_start: this.kernel.node_start
      });
      this.cdn = this.kernel.settings.CDN;
      delete this.kernelSetting.system.PM2;
      delete this.kernelSetting.system.bundles;
      this.kernelSetting.servers = {
        http: this.kernelSetting.system.servers.http,
        https: this.kernelSetting.system.servers.https,
        ws: this.kernelSetting.system.servers.ws,
        wss: this.kernelSetting.system.servers.wss
      };
      delete this.kernelSetting.system.servers;

      for (let bund in kernel.bundles) {
        this.infoBundles[bund] = {};
        this.infoBundles[bund].waitBundleReady = kernel.bundles[bund].waitBundleReady;
        this.infoBundles[bund].version = kernel.bundles[bund].version;
      }
      //console.log(this.infoBundles);
      for (let event in this.kernel.notificationsCenter._events) {
        switch (event) {
          case "onReady":
            this.infoKernel.events[event] = {
              fire: kernel.ready,
              nb: 0,
              listeners: this.kernel.notificationsCenter._events[event].length
            };
            break;
          default:
            this.infoKernel.events[event] = nodefony.extend(true, this.infoKernel.events[event], {
              listeners: this.kernel.notificationsCenter._events[event].length
            });
        }
      }

      if (this.settings.debugBar) {
        this.logger("ADD DEBUG BAR MONITORING", "INFO");
        this.bundles = function() {
          let obj = {};
          for (let bundle in this.kernel.bundles) {
            let version = null;
            let title = null;
            if (this.kernel.bundles[bundle].loader === "package") {
              version = `${this.kernel.bundles[bundle].package.name}@${this.kernel.bundles[bundle].package.version}`;
              title = this.kernel.bundles[bundle].package.description;
            } else {
              version = `file: ${this.kernel.bundles[bundle].bundleName}@${this.kernel.bundles[bundle].version}`;
              title = this.kernel.bundles[bundle].path;
            }
            obj[bundle] = {
              name: this.kernel.bundles[bundle].name,
              version: version,
              title: title,
              loader: this.kernel.bundles[bundle].loader
            };
          }
          return obj;
        }.call(this);
        this.syslogContext = new nodefony.syslog({
          moduleName: "CONTEXT",
          maxStack: 50,
          defaultSeverity: "INFO"
        });
        this.env = this.kernel.environment;
        this.app = this.getParameters("bundles.app").App;
        this.node = process.versions;
        this.upload = this.container.get("upload");
        this.translation = this.container.get("translation");
        this.sessionService = this.container.get("sessions");
        this.domain = this.translation.defaultDomain;
        this.nbServices = Object.keys(nodefony.services).length;

        // TEMPLATING
        let templating = {};
        if (this.templating) {
          templating = {
            name: this.templating.name,
            version: this.templating.version
          };
        }

        this.service = {
          upload: {
            tmp_dir: this.upload.config.uploadDir,
            max_size: nodefony.cli.niceBytes(this.upload.config.maxFileSize)
          },
          translation: {
            defaultLocale: this.translation.defaultLocale,
            defaultDomain: this.domain
          },
          session: {
            storage: this.sessionService.settings.handler,
            path: this.sessionService.settings.save_path
          },
          ORM: ORM,
          templating: templating,
          mail: mail
        };
        this.security = function() {
          let obj = {};
          let firewall = this.container.get("security");
          if (firewall) {
            for (let area in firewall.securedAreas) {
              //console.log(firewall.securedAreas[area])
              let myfactory = firewall.securedAreas[area].factories.length ? firewall.securedAreas[area].factories : null;
              let factory = null;
              if (myfactory) {
                factory = myfactory.map((fac) => {
                  return fac.name;
                }).join();
              } else {
                factory = "none";
              }
              obj[area] = {};
              obj[area].pattern = firewall.securedAreas[area].stringPattern;
              obj[area].factory = factory;
              obj[area].provider = firewall.securedAreas[area].provider ? firewall.securedAreas[area].providerName : null;
              obj[area].context = firewall.securedAreas[area].sessionContext;
              obj[area].state = firewall.securedAreas[area].stateLess ? "stateless" : "statefull";
            }
          }
          return obj;
        }.call(this);
      }
    });

    this.kernel.on("onServerRequest", (request /*, response, logString, d*/ ) => {
      request.nodefony_time = new Date().getTime();
    });

    this.kernel.on("onRequest", this.onRequest.bind(this));
  }

  onRequest(context /*, resolver*/ ) {
    if (this.kernel.environment === "prod" && !this.settings.forceDebugBarProd && !context.profiler) {
      return;
    }
    let agent = null;
    let tmp = null;
    let myUserAgent = null;
    context.profiler = this.canMonitoring(context);

    try {
      if (context.request.headers) {
        agent = useragent.parse(context.request.headers['user-agent']);
        tmp = useragent.is(context.request.headers['user-agent']);
      } else {
        agent = useragent.parse(context.request.httpRequest.headers['user-agent']);
        tmp = useragent.is(context.request.httpRequest.headers['user-agent']);
      }

      let client = {};
      for (let ele in tmp) {
        if (tmp[ele] === true) {
          client[ele] = tmp[ele];
        }
        if (ele === "version") {
          client[ele] = tmp[ele];
        }
      }
      myUserAgent = {
        agent: agent.toAgent(),
        toString: agent.toString(),
        version: agent.toVersion(),
        os: agent.os.toJSON(),
        is: client
      };
    } catch (e) {
      myUserAgent = {
        agent: null,
        toString: null,
        version: null,
        os: null,
        is: null
      };
    }

    let trans = context.get("translation");
    let route = null;
    let varialblesName = null;
    let variables = [];
    context.resolver.variables
      .map((ele) => {
        if (typeof ele === "string") {
          variables.push(ele);
        }
      });
    if (context.resolver.route) {
      route = {
        name: context.resolver.route.name,
        uri: context.resolver.route.path,
        variables: variables,
        /*util.inspect(context.resolver.variables, {
          depth: 2
        }),*/
        pattern: context.resolver.route.pattern.toString(),
        defaultView: context.resolver.defaultView
      };
      varialblesName = context.resolver.route.variables;
    } else {
      route = {
        name: "undefined",
        uri: "undefined",
        variables: util.inspect(context.resolver.variables, {
          depth: 2
        }),
        pattern: "undefined",
        defaultView: context.resolver.defaultView
      };
    }
    context.profiling = {
      id: null,
      bundle: context.resolver.bundle ? context.resolver.bundle.name : "undefined",
      bundles: this.bundles,
      cdn: this.cdn,
      pwd: process.env.PWD,
      env: process.env,
      node: this.node,
      services: this.service,
      git: this.gitInfo,
      nbServices: this.nbServices,
      security: this.security,
      route: route,
      varialblesName: varialblesName,
      kernelSettings: this.kernelSetting,
      environment: this.env,
      debug: this.kernel.debug,
      appSettings: this.app,
      projectName: this.kernel.projectName,
      queryPost: context.request.queryPost,
      queryGet: context.request.queryGet,
      protocole: context.scheme,
      cookies: context.cookies,
      events: {},
      twig: [],
      locale: {
        default: trans.defaultLocale,
        domain: trans.defaultDomain
      },
      userAgent: myUserAgent
    };
    for (let event in context.notificationsCenter._events) {
      if (event === "onRequest") {
        context.profiling.events[event] = {
          fire: true,
          nb: 1,
          listeners: context.notificationsCenter._events[event].length
        };
      } else {
        context.profiling.events[event] = {
          fire: false,
          nb: 0,
          listeners: context.notificationsCenter._events[event].length
        };
      }
      context.on(event, () => {
        if (context.profiling) {
          //var ele = arguments[0];
          context.profiling.events[event].fire = true;
          context.profiling.events[event].nb = ++context.profiling.events[event].nb;
        }
      });
    }
    let secu = context.session ? context.session.getMetaBag("security") : null;
    let token = null;
    let tokenRoles = null;
    if (context.token) {
      tokenRoles = context.token.roles.map((tok) => {
        return tok.role;
      }).join(" ");
      token = {
        name: context.token.name,
        user: context.token.user,
        authenticated: context.token.authenticated,
        factory: context.token.factory,
        roles: tokenRoles,
        provider: context.token.provider ? context.token.provider.name : false
      };
    }
    if (context.security) {
      context.profiling.context_secure = {
        name: context.security.name,
        provider: context.security.providerName,
        token: token,
        user: context.user,
        firewall: context.security.name,
        state: context.security.stateLess ? "stateless" : "statefull",
        context: context.security.sessionContext,
        tokenRoles: tokenRoles
      };
    } else {
      if (secu) {
        context.profiling.context_secure = {
          name: "OFF",
          token: secu.token,
          user: context.user,
          firewall: secu.firewall,
          tokenRoles: tokenRoles
        };
      } else {
        if (token) {
          context.profiling.context_secure = {
            name: "OFF",
            token: token,
            user: context.user,
            tokenRoles: tokenRoles
          };
        } else {
          context.profiling.context_secure = null;
        }
      }
    }
    if (context.resolver.route && context.resolver.route.defaults) {
      let tab = context.resolver.route.defaults.controller.split(":");
      let contr = (tab[1] ? tab[1] : "default");
      let filePath = "dynamic";
      if (context.resolver.route.filePath) {
        filePath = path.basename(path.resolve(context.resolver.route.filePath));
      }
      context.profiling.routeur = {
        bundle: context.resolver.bundle.name,
        action: tab[2] + "Action",
        pattern: context.resolver.route.defaults.controller,
        Controller: contr + "Controller",
        file: filePath
      };
    } else {
      context.profiling.routeur = {
        bundle: context.resolver.bundle ? context.resolver.bundle.name : null,
        action: context.resolver.actionName,
        Controller: context.resolver.controller ? context.resolver.controller.name : null
      };
    }

    if (context.proxy) {
      context.profiling.proxy = context.proxy;
    } else {
      context.profiling.proxy = null;
    }

    if (context.session) {
      context.on("onSaveSession", ()=>{
        context.profiling.session = {
          name: context.session.name,
          id: context.session.id,
          metas: context.session.metaBag(),
          attributes: context.session.attributes(),
          flashes: context.session.flashBags(),
          context: context.session.contextSession
        };
      });
    }

    if (context.request.queryFile) {
      context.profiling.queryFile = {};
      for (let ele in context.request.queryFile) {
        context.profiling.queryFile[ele] = {
          path: context.request.queryFile[ele].path,
          mimetype: context.request.queryFile[ele].mimeType,
          length: context.request.queryFile[ele].lenght,
          fileName: context.request.queryFile[ele].fileName
        };
      }
    }
    let settings2 = this.get("httpsServer").defaultSetting2;
    let accessControlList = [];
    let accessControl = null;
    if (context.accessControl) {
      accessControl = {
        pattern: context.accessControl.pattern,
        roles: context.accessControl.roles,
        allowRoles: context.accessControl.allowRoles,
        ip: context.accessControl.ip,
        allowIp: context.accessControl.allowIp,
        hosts: context.accessControl.hosts,
        requires_channel: context.accessControl.requires_channel,
        methods: context.accessControl.methods,
        actived: context.accessControl.actived
      };
      accessControlList.push(context.accessControl.map((access) => {
        let obj = [];
        for (let i = 0; i < access.roles.length; i++) {
          obj.push(access.roles[i].role);
        }
        return obj;
      }));
    }
    context.profiling.context = {
      type: context.type,
      pushAllowed: context.pushAllowed,
      pushAllow: settings2 ? settings2.enablePush : false,
      isAjax: context.isAjax,
      secureArea: context.secureArea,
      domain: context.domain,
      url: context.url,
      remoteAddress: context.remoteAddress,
      crossDomain: context.crossDomain,
      protocol: context.protocol,
      isControlledAccess: context.isControlledAccess,
      accessControl: accessControl,
      accessControlList: tokenRoles
    };
    switch (context.type) {
      case "HTTP":
      case "HTTPS":
      case "HTTP2":
        this.httpRequest(context);
        break;
      case "WEBSOCKET":
      case "WEBSOCKET SECURE":
        this.websocketRequest(context);
        break;
    }
    context.on("onView", this.onView.bind(this));
  }

  httpRequest(context) {
    if (context.request.request) {
      context.profiling.timeStamp = context.request.request.nodefony_time;
    } else {
      context.profiling.timeStamp = 0;
    }
    let content = null;
    switch (context.request.contentType) {
      case "multipart/form-data":
        try {
          content = JSON.stringfy(context.request.queryFile);
        } catch (e) {
          content = null;
        }
        break;
      case "application/xml":
      case "text/xml":
      case "application/json":
      case "text/json":
      case "application/x-www-form-urlencoded":
        content = context.request.data.toString(context.request.charset);
        //content = context.request.query.toString();
        break;
      default:
        content = null;
    }
    context.profiling.request = {
      url: context.url,
      method: context.request.method,
      protocol: context.scheme,
      remoteAddress: context.request.remoteAddress,
      queryPost: context.request.queryPost,
      queryGet: context.request.queryGet,
      headers: context.request.headers,
      crossDomain: context.crossDomain,
      dataSize: context.request.dataSize,
      content: content,
      "content-type": context.request.contentType
    };
    context.on("onSendMonitoring", this.onSendMonitoring.bind(this));
  }

  websocketRequest(context) {
    context.profiling.timeStamp = context.request.nodefony_time;
    let conf = null;
    let configServer = {};
    for (conf in context.request.serverConfig) {
      if (conf === "httpServer") {
        continue;
      }
      configServer[conf] = context.request.serverConfig[conf];
    }

    //console.log(context.request.remoteAddress)
    //console.log(context.profiling["context"].remoteAddress)
    if (context.request.httpRequest) {
      context.profiling.request = {
        url: context.url,
        headers: context.request.httpRequest.headers,
        method: context.request.httpRequest.method,
        protocol: context.scheme,
        remoteAddress: context.request.remoteAddress,
        serverConfig: configServer,
      };
    } else {
      context.profiling.request = {
        url: context.url,
        headers: "",
        method: "",
        protocol: context.scheme,
        remoteAddress: context.request.remoteAddress,
        serverConfig: null,
      };
    }
    let config = {};
    for (conf in context.response.config) {
      if (conf === "httpServer") {
        continue;
      }
      config[conf] = context.response.config[conf];
    }
    context.profiling.response = {
      statusCode: context.response.statusCode,
      connection: "WEBSOCKET",
      config: config,
      webSocketVersion: context.response.webSocketVersion,
      message: [],
    };
    if (context.profiler) {
      context.on("onMessage", (message, Context, direction) => {
        let ele = {
          date: new Date().toTimeString(),
          data: message,
          direction: direction
        };
        try {
          //console.log(context.profiling)
          if (JSON.stringify(context.profiling.response).length < 60000) {
            if (message && context.profiling) {
              context.profiling.response.message.push(ele);
            }
          } else {
            context.profiling.response.message.length = 0;
            context.profiling.response.message.push(ele);
          }
        } catch (e) {
          this.logger(e, "WARNING");
        }
        this.updateProfile(context, (error /*, result*/ ) => {
          if (error) {
            this.kernel.logger(error);
          }
        });
      });
    }

    context.on("onFinish", ( /*Context, reasonCode, description*/ ) => {
      if (context.profiling) {
        context.profiling.response.statusCode = context.connection.state;
      }
      if (context.profiler) {
        this.updateProfile(context, (error /*, result*/ ) => {
          if (error) {
            this.kernel.logger(error);
          }
          if (context) {
            delete context.profiling;
          }
        });
      }
    });

    if (context.profiler) {
      this.saveProfile(context)
        .catch(e => {
          this.logger(e, "ERROR");
        });
    }
  }

  onSendMonitoring(response, context) {
    context.profiling.timeRequest = (new Date().getTime()) - (context.request.request.nodefony_time) + " ms";
    let headers = response.getHeaders();
    context.profiling.response = {
      statusCode: response.statusCode,
      message: response.response.statusMessage,
      size: response.body ? nodefony.cli.niceBytes(response.body.length) : null,
      encoding: response.encoding,
      "content-type": headers['content-type'] || headers['Content-Type'],
      headers: headers
    };
    if (context.profiler) {
      /*return this.saveProfile(context, (error , res ) => {
          if (error) {
            this.kernel.logger(error, "ERROR");
          }
          if (context && context.response) {
            context.sended = true;
            context.response.send();
            // END REQUEST
            return context.close();
          }
          if (error) {
            throw new Error("MONITORING CAN SAVE REQUEST");
          }
          if ((!context) || (!context.response)) {
            throw new Error("MONITORING REQUEST ALREADY SENDED !!! ");
          }
        });*/
      return this.saveProfile(context)
        .then((ctx) => {
          if (ctx && ctx.response) {
            ctx.sended = true;
            ctx.response.send();
            // END REQUEST
            return ctx.close();
          }
        }).catch((error) => {
          if (error) {
            this.kernel.logger(error, "ERROR");
          }
          throw error;
        });
    }
  }

  onView(result, context, view, viewParam) {
    try {
      JSON.stringify(viewParam);
    } catch (e) {
      viewParam = "view param can't be parse";
    }
    if (context.profiling && context.profiling.twig) {
      context.profiling.twig.push({
        file: view,
        //param:viewParam
      });
    }
  }

  canMonitoring(context) {
    /*if (!context.resolver.route) {
      return false;
    }*/
    if (context.resolver && context.resolver.route && context.resolver.route.name.match(/^monitoring-/)) {
      return false;
    }
    /*if (!context.resolver.resolve) {
      return false;
    }*/
    return this.settings.profiler.active;
  }

  updateProfile(context, callback) {
    if (context.profiling) {
      let id = context.profiling.id;
      switch (this.storageProfiling) {
        case "syslog":
          context.profilingObject.payload = context.profiling;
          return;
        case "orm":
          try {
            this.requestEntity.update({
              data: JSON.stringify(context.profiling),
              state: context.profiling.response.statusCode
            }, {
              where: {
                id: id,
              }
            }).then((result) => {
              this.kernel.logger("ORM REQUEST UPDATE ID : " + id, "DEBUG");
              callback(null, result);
            }).catch((error) => {
              this.kernel.logger(error);
              callback(error, null);
            });
          } catch (e) {
            throw e;
          }
          break;
        default:
          callback(new Error("No PROFILING"), null);
      }
    }
  }

  saveProfile(context) {
    if (context.profiling) {
      switch (this.storageProfiling) {
        case "syslog":
          return new Promise((resolve, reject) => {
            try {
              this.syslogContext.logger(context.profiling);
              let logProfile = this.syslogContext.getLogStack();
              context.profiling.id = logProfile.uid;
            } catch (e) {
              return reject(e);
            }
            return resolve(context);
          });
        case "orm":
          let user = null;
          let data = null;
          // DATABASE ENTITY
          if (context.profiling.context_secure) {
            user = context.profiling.context_secure.user ? context.profiling.context_secure.user.username : "";
          } else {
            user = "";
          }
          try {
            /*console.log(require('util').inspect(context.profiling, {
              depth: 100
            }));*/
            data = JSON.stringify(context.profiling);
          } catch (e) {
            throw e;
          }
          switch (this.kernel.getOrm()) {
            case "sequelize":
              return this.requestEntity.create({
                  id: null,
                  remoteAddress: context.profiling.context.remoteAddress,
                  userAgent: context.profiling.userAgent.toString,
                  url: context.profiling.request.url,
                  route: context.profiling.route.name,
                  method: context.profiling.request.method,
                  state: context.profiling.response.statusCode,
                  protocole: context.profiling.context.scheme,
                  username: user,
                  data: data
                }, {
                  isNewRecord: true
                })
                .then((request) => {
                  this.kernel.logger("ORM REQUEST SAVE ID :" + request.id, "DEBUG");
                  if (context && context.profiling) {
                    context.profiling.id = request.id;
                  }
                  return context;
                }).catch((error) => {
                  throw error;
                });
            case "mongoose":
              return this.requestEntity.create({
                  id: null,
                  remoteAddress: context.profiling.context.remoteAddress,
                  userAgent: context.profiling.userAgent.toString,
                  url: context.profiling.request.url,
                  route: context.profiling.route.name,
                  method: context.profiling.request.method,
                  state: context.profiling.response.statusCode,
                  protocole: context.profiling.context.scheme,
                  username: user,
                  data: data
                })
                .then((request) => {
                  this.kernel.logger("ORM REQUEST SAVE ID :" + request._id, "DEBUG");
                  if (context && context.profiling) {
                    context.profiling.id = request.id;
                  }
                  return context;
                })
                .catch((error) => {
                  throw error;
                });
          }
          break;
        default:
          throw new Error("No PROFILING driver");
      }
    }
    return Promise.resolve(context);
  }
};
