/**
 *    The class is a **`api` CONTROLLER** .
 *    @module api
 *    @main api
 *    @class api
 *    @constructor
 *    @param {class} container
 *    @param {class} context
 *
 */
module.exports = class apiController extends nodefony.controller {

  constructor(container, context) {
    super(container, context);
    this.setContextJson();
  }

  renderRest(data, async) {

    let context = this.getContext();
    let type = context.request.queryGet.format || context.request.headers["X-FORMAT"] || "";

    let response = this.getResponse();
    if (data.code) {
      response.setStatusCode(data.code);
    }
    switch (type.toLowerCase()) {
    case "application/xml":
    case "text/xml":
    case "xml":
      response.setHeader('Content-Type', "application/xml");
      if (async) {
        return this.renderAsync('monitoringBundle:api:api.xml.twig', data);
      } else {
        return this.render('monitoringBundle:api:api.xml.twig', data);
      }
      break;
    default:
      response.setHeader('Content-Type', "application/json");
      if (async) {
        return this.renderAsync('monitoringBundle:api:api.json.twig', data);
      } else {
        return this.render('monitoringBundle:api:api.json.twig', data);
      }
    }
  }

  renderDatatable(data, async) {
    //var context = this.getContext() ;

    //var response = this.getResponse() ;
    //response.setHeader('Content-Type' , "application/json");

    if (async) {
      return this.renderJsonAsync(data);
      //return     this.getResponse( JSON.stringify(data) , data.code, {'Content-Type' : "application/json"})
    } else {
      return this.renderJson(data);

    }
  }

  /**
   *
   *    @method routesAction
   *
   */
  routesAction( /*name*/ ) {
    return this.renderRest({
      code: 200,
      type: "SUCCESS",
      message: "OK",
      data: JSON.stringify(this.get("router").routes)
    });
  }

  /**
   *
   *    @method servicesAction
   *
   */
  servicesAction( /*name*/ ) {
    let serviceParam = this.container.getParameters("services");
    let services = {};
    for (let service in serviceParam) {
      let ele = serviceParam[service];
      services[service] = {};
      services[service].name = service;
      if (ele) {
        /*let inject = "";
        let i = 0;
        for (let inj in ele.injections) {
          let esc = i === 0 ? "" : " , ";
          inject += esc + inj;
          i++;
        }*/
        services[service].run = "INJECTOR";
        services[service].scope = ele.scope === "container" ? "Default container" : ele.scope;
        services[service].calls = ele.calls;
        services[service].injections = ele.injections; //inject;
        services[service].properties = ele.properties;
        services[service].orderInjections = ele.orderArguments ? true : false;
      } else {
        services[service].run = "KERNEL";
        services[service].scope = "KERNEL container";
      }
    }

    return this.renderRest({
      code: 200,
      type: "SUCCESS",
      message: "OK",
      data: JSON.stringify(services)
    });
  }

  /**
   *
   *    @method syslogAction
   *
   */
  syslogAction(message) {
    switch (this.request.method) {

    case "WEBSOCKET":
      if (message) {
        // MESSAGES
        this.logger(message.utf8Data, "INFO");
      } else {
        let callback = function (pdu) {
          this.renderResponse(JSON.stringify(pdu));
        };
        this.kernel.syslog.listen(this, "onLog", callback);

        this.context.listen(this, "onClose", () => {
          this.kernel.syslog.unListen("onLog", callback);
        });
      }
      break;
    default:
      return this.renderRest({
        code: 200,
        type: "SUCCESS",
        message: "OK",
        data: JSON.stringify(this.get("syslog").ringStack)
      });
    }
  }

  /**
   *
   *    @method requestsAction
   *
   */
  requestsAction() {
    let bundle = this.get("kernel").getBundles("monitoring");
    let storageProfiling = bundle.settings.storage.requests;
    let ormName = this.kernel.getOrm();
    switch (storageProfiling) {
    case "syslog":
      let syslog = bundle.syslogContext;
      return this.renderRest({
        code: 200,
        type: "SUCCESS",
        message: "OK",
        data: JSON.stringify(syslog.ringStack)
      });
    case "orm":
      let requestEntity = bundle.requestEntity;
      switch (ormName) {
      case "sequelize":
        if (this.query.type && this.query.type === "dataTable") {
          let options = {
            offset: parseInt(this.query.start, 10),
            limit: parseInt(this.query.length, 10)
          };
          if (this.query.order.length) {
            options.order = [];
            for (var i = 0; i < this.query.order.length; i++) {
              var tab = [];
              tab.push(this.query.columns[parseInt(this.query.order[i].column, 10)].name);
              tab.push(this.query.order[i].dir);
              options.order.push(tab);
            }
          }
          if (this.query.search.value !== "") {
            options.where = {
              $or: [{
                username: {
                  $like: "%" + this.query.search.value + "%"
                }
              }, {
                url: {
                  $like: "%" + this.query.search.value + "%"
                }
              }, {
                route: {
                  $like: "%" + this.query.search.value + "%"
                }
              }, {
                method: {
                  $like: "%" + this.query.search.value + "%"
                }
              }, {
                state: {
                  $like: "%" + this.query.search.value + "%"
                }
              }, {
                protocole: {
                  $like: "%" + this.query.search.value + "%"
                }
              }]
            };
          }
          return requestEntity.findAndCountAll(options)
            .then((results) => {
              try {
                var dataTable = dataTableParsing.call(this, this.query, results);
                return dataTable;
              } catch (e) {
                throw e;
              }
            })
            .then((result) => {
              try {
                return this.renderDatatable(result);
              } catch (e) {
                throw e;
              }
            })
            .catch((error) => {
              if (error) {
                return this.renderRest({
                  code: 500,
                  type: "ERROR",
                  message: "internal error",
                  data: error
                }, true);
              }
            });
        } else {
          return requestEntity.findAll()
            .then((results) => {
              try {
                let ele = [];
                for (let i = 0; i < results.length; i++) {
                  let ret = {};
                  ret.uid = results[i].id;
                  ret.payload = JSON.parse(results[i].data);
                  ret.timeStamp = results[i].createdAt;
                  ele.push(ret);
                }
                return this.renderRest({
                  code: 200,
                  type: "SUCCESS",
                  message: "OK",
                  data: JSON.stringify(ele)
                }, true);
              } catch (e) {
                throw e;
              }
            })
            .catch((error) => {
              if (error) {
                return this.renderRest({
                  code: 500,
                  type: "ERROR",
                  message: "internal error",
                  data: error
                }, true);
              }
            });
        }
        break;
      case "mongoose":
        let requests = {
          rows: null,
          count: 0
        };
        let sort = {};
        if (this.query.order.length) {
          for (let i = 0; i < this.query.order.length; i++) {
            let name = this.query.columns[parseInt(this.query.order[i].column, 10)].name;
            let dir = this.query.order[i].dir;
            sort[name] = dir === "desc" ? -1 : 1;
          }
        } else {
          sort.createdAt = -1;
        }
        let options = null;
        if (this.query.search.value !== "") {
          options = {
            $or: [{
              username: {
                $regex: this.query.search.value
              }
            }, {
              url: {
                $regex: this.query.search.value
              }
            }, {
              route: {
                $regex: this.query.search.value
              }
            }, {
              method: {
                $regex: this.query.search.value
              }
            }, {
              state: {
                $regex: this.query.search.value
              }
            }, {
              protocole: {
                $regex: this.query.search.value
              }
            }]
          };
        }
        return requestEntity.find(options)
          .sort(sort)
          .skip(parseInt(this.query.start, 10))
          .limit(parseInt(this.query.length, 10))
          .then((result) => {
            requests.rows = result;
            return requestEntity.count();
          }).then((result) => {
            requests.count = result;
            let dataTable = dataTableParsing.call(this, this.query, requests);
            return this.renderDatatable(dataTable);
          })
          .catch(e => {
            throw e;
          });
      default:
        return this.renderRest({
          code: 500,
          type: "ERROR",
          message: "Orm not defined :" + ormName,
        }, true);
      }
      break;
    default:
      return this.renderRest({
        code: 500,
        type: "ERROR",
        message: "not found",
        data: "Storage request monitoring not found"
      });
    }
  }

  /**
   *
   *    @method requestAction
   *
   */
  requestAction(uid) {
    let bundle = this.get("kernel").getBundles("monitoring");
    let storageProfiling = bundle.settings.storage.requests;
    let ormName = this.kernel.getOrm();
    switch (storageProfiling) {
    case "syslog":
      let syslog = bundle.syslogContext;
      let pdu = null;
      for (let i = 0; i < syslog.ringStack.length; i++) {
        if (uid === syslog.ringStack[i].uid) {
          pdu = syslog.ringStack[i];
          break;
        }
      }
      if (pdu === null) {
        return this.renderRest({
          code: 404,
          type: "ERROR",
          message: "not found",
          data: JSON.stringify(null)
        });
      }
      return this.renderRest({
        code: 200,
        type: "SUCCESS",
        message: "OK",
        data: JSON.stringify(pdu)
      });
    case "orm":
      let requestEntity = bundle.requestEntity;
      switch (ormName) {
      case "sequelize":
        return requestEntity.findOne({
            where: {
              id: uid
            }
          })
          .then((result) => {
            if (result) {
              let ret = {};
              ret.uid = result.id;
              ret.payload = JSON.parse(result.data);
              ret.timeStamp = result.createdAt;
              return this.renderRest({
                code: 200,
                type: "SUCCESS",
                message: "OK",
                data: JSON.stringify(ret)
              });
            } else {
              return this.renderRest({
                code: 404,
                type: "ERROR",
                message: "not found",
                data: JSON.stringify(null)
              });
            }
          })
          .catch((error) => {
            if (error) {
              return this.renderRest({
                code: 500,
                type: "ERROR",
                message: "internal error",
                data: error
              });
            }
          });
      case "mongoose":
        return requestEntity.findOne({
            _id: uid
          })
          .then((result) => {
            if (result) {
              let ret = {};
              ret.uid = result.id;
              ret.payload = JSON.parse(result.data);
              ret.timeStamp = result.createdAt;
              return this.renderRest({
                code: 200,
                type: "SUCCESS",
                message: "OK",
                data: JSON.stringify(ret)
              });
            } else {
              return this.renderRest({
                code: 404,
                type: "ERROR",
                message: "not found",
                data: JSON.stringify(null)
              });
            }
          })
          .catch((error) => {
            if (error) {
              return this.renderRest({
                code: 500,
                type: "ERROR",
                message: "internal error",
                data: error
              });
            }
          });
      }
      break;
    default:
      return this.renderRest({
        code: 500,
        type: "ERROR",
        message: "not found",
        data: "Storage request monitoring not found"
      }, true);
    }
  }

  /**
   *
   *    @method requestsAction
   *
   */
  configAction() {
    let http = this.get("httpServer");
    let httpConfig = null;
    let httpsConfig = null;
    if (http && http.ready) {
      httpConfig = {
        port: http.port,
        ready: http.ready,
        domain: http.domain,
        config: http.settings
      };
    }

    let https = this.get("httpsServer");
    if (https && https.ready) {
      httpsConfig = {
        port: https.port,
        ready: https.ready,
        domain: https.domain,
        config: https.settings
      };
    }

    let websocket = this.get("websocketServer");
    let websocketConfig = null;
    if (websocket && websocket.ready) {
      let config = nodefony.extend({}, websocket.websocketServer.config);
      delete config.httpServer;
      websocketConfig = {
        port: websocket.port,
        domain: websocket.domain,
        ready: websocket.ready,
        config: config
      };
    }

    let websockets = this.get("websocketServerSecure");
    let websocketSecureConfig = null;
    if (websockets && websockets.ready) {
      let configs = nodefony.extend({}, websockets.websocketServer.config);
      delete configs.httpServer;
      websocketSecureConfig = {
        port: websockets.port,
        ready: websockets.ready,
        domain: websockets.domain,
        config: configs

      };
    }

    //console.log(util.inspect(websocket.websocketServer, {depth:1}) )
    //console.log(util.inspect( this.bundle, {depth:1}) )
    let bundleApp = this.kernel.getBundles("App");


    return this.renderRest({
      code: 200,
      type: "SUCCESS",
      message: "OK",
      data: JSON.stringify({
        kernel: this.kernel.settings,
        debug: this.kernel.debug,
        node_start: this.kernel.node_start,
        App: bundleApp.settings,
        nodejs: process.versions,
        events: this.bundle.infoKernel.events,
        bundles: this.bundle.infoBundles,
        servers: {
          http: httpConfig,
          https: httpsConfig,
          websocket: websocketConfig,
          websoketSecure: websocketSecureConfig
        }
      })
    });
  }

  /**
   *
   *    @method requestsAction
   *
   */
  bundleAction(bundleName) {
    //var config = this.getParameters( "bundles."+bundleName );
    let bundle = this.get("kernel").getBundle(bundleName);
    //console.log(bundle)
    let router = this.get("router");
    //console.log(router)
    let routing = [];
    for (let i = 0; i < router.routes.length; i++) {
      if (router.routes[i].bundle === bundleName) {
        routing.push(router.routes[i]);
      }
    }
    let views = {};
    for (let view in bundle.views) {
      views[view] = {};
      for (let view2 in bundle.views[view]) {
        views[view][view2] = {
          file: bundle.views[view][view2].file
        };
      }
    }

    //let security  = this.get("security");
    return this.renderRest({
      code: 200,
      type: "SUCCESS",
      message: "OK",
      data: JSON.stringify({
        config: bundle.settings,
        routing: routing,
        services: null,
        security: null,
        bundleName: bundle.name,
        views: views,
        entities: bundle.entities,
        fixtures: bundle.fixtures,
        controllers: bundle.controllers,
        events: bundle.notificationsCenter._events,
        waitBundleReady: bundle.waitBundleReady,
        locale: bundle.locale,
        files: bundle.resourcesFiles.files
      })
    });
  }

  /**
   *
   *    @method realTimeAction
   *
   */
  realtimeAction(name) {
    let service = this.get("realTime");
    if (!service) {
      return this.renderRest({
        code: 404,
        type: "ERROR",
        message: "Service realtime not found",
      });
    }
    switch (name) {
    case "connections":
      let obj = {
        connections: {}
      };
      for (let connect in service.connections.connections) {
        let conn = service.connections.connections[connect];
        obj.connections[connect] = {
          remote: conn.remote,
          nbClients: Object.keys(conn.clients).length
        };
      }
      try {
        return this.renderRest({
          code: 200,
          type: "SUCCESS",
          message: "Operation Réussi",
          data: JSON.stringify(obj) //JSON.stringify(service.connections)
        });

      } catch (e) {
        this.logger(e, "ERROR");
        this.realtimeAction("error");
      }

      break;
    case "error":
      return this.renderRest({
        code: 404,
        type: "ERROR",
        message: "not found",
      });
    default:
      return this.renderRest({
        code: 404,
        type: "ERROR",
        message: "not found",
      });
    }

  }

  /**
   *
   *    @method usersAction
   *
   */
  usersAction() {
    let orm = this.getORM();
    let nameOrm = this.kernel.getOrm();
    switch (nameOrm) {
    case "sequelize":
      let nodefonyDb = orm.getConnection("nodefony");
      //var users = null ;
      return nodefonyDb.query('SELECT username,name,surname,lang,provider FROM users')
        .then((result) => {
          return this.renderRest({
            code: 200,
            type: "SUCCESS",
            message: "OK",
            data: JSON.stringify(result[0])
          });
        });
    case "mongoose":
      let users = orm.getEntity("user");
      return users.find({}, {
        username: 1,
        name: 1,
        surname: 1,
        lang: 1,
        provider: 1
      }).then((result) => {
        return this.renderRest({
          code: 200,
          type: "SUCCESS",
          message: "OK",
          data: JSON.stringify(result)
        });
      }).catch((e) => {
        throw e;
      });

    }
    return this.renderRest({
      code: 500,
      type: "ERROR",
      message: "orm not implemented"
    });
  }

  sessionsAction() {
    // timeout
    //this.getResponse().setTimeout(5000);
    let sessionServices = this.get("sessions");
    let storage = sessionServices.settings.handler;
    switch (storage) {
    case "files":
      let myResults = {
        count: 0,
        rows: [],
        options: {}
      };
      myResults.options.offset = parseInt(this.query.start, 10);
      myResults.options.limit = parseInt(this.query.length, 10);
      if (this.query.order.length) {
        myResults.options.order = [];
        for (let i = 0; i < this.query.order.length; i++) {
          let tab = [];
          tab.push(this.query.columns[parseInt(this.query.order[i].column, 10)].name);
          tab.push(this.query.order[i].dir);
          myResults.options.order.push(tab);
        }
      }
      finderSession(sessionServices.settings.save_path, myResults, (error /*, result*/ ) => {
        if (error) {
          return this.renderRest({
            code: 500,
            type: "ERROR",
            message: "internal error",
            data: error
          }, true);
        }
        let dataTable = dataTableSessionParsing.call(this, this.query, myResults);
        return this.renderDatatable(dataTable, true);
      });
      break;
    case "orm":
      let orm = this.getORM();
      let ormName = this.kernel.getOrm();
      let sessionEntity = orm.getEntity("session");
      let userEntity = orm.getEntity("user");
      switch (ormName) {
      case "sequelize":
        if (this.query.type && this.query.type === "dataTable") {
          let options = {
            offset: parseInt(this.query.start, 10),
            limit: parseInt(this.query.length, 10),
            include: [{
              model: userEntity
            }]
          };
          if (this.query.order.length) {
            options.order = [];
            for (let i = 0; i < this.query.order.length; i++) {
              let tab = [];
              tab.push(this.query.columns[parseInt(this.query.order[i].column, 10)].name);
              tab.push(this.query.order[i].dir);
              options.order.push(tab);
            }
          }
          return sessionEntity.findAndCountAll(options)
            .then((results) => {
              let dataTable = null;
              try {
                dataTable = dataTableSessionParsing.call(this, this.query, results);
                //var res = JSON.stringify(dataTable);
              } catch (e) {
                return this.renderRest({
                  code: 500,
                  type: "ERROR",
                  message: "internal error",
                  data: e
                }, true);
              }
              return this.renderDatatable(dataTable);
            })
            .catch((error) => {
              if (error) {
                return this.renderRest({
                  code: 500,
                  type: "ERROR",
                  message: "internal error",
                  data: error
                }, true);
              }
            });
        } else {
          return sessionEntity.findAndCountAll()
            .then((results) => {
              let pdu = new nodefony.PDU({
                code: 200,
                data: JSON.stringify(results)
              });
              return this.renderJsonAsync(pdu);
            })
            .catch((error) => {
              if (error) {
                return this.renderRest({
                  code: 500,
                  type: "ERROR",
                  message: "internal error",
                  data: error
                }, true);
              }
            });
        }
        break;
      case "mongoose":
        let sessions = {
          rows: null,
          count: 0
        };
        let sort = {};
        if (this.query.order.length) {
          for (let i = 0; i < this.query.order.length; i++) {
            let name = this.query.columns[parseInt(this.query.order[i].column, 10)].name;
            let dir = this.query.order[i].dir;
            sort[name] = dir === "desc" ? -1 : 1;
          }
        } else {
          sort.createdAt = -1;
        }
        return sessionEntity.find({}, {})
          .populate('user_id', "username")
          .sort(sort)
          .skip(parseInt(this.query.start, 10))
          .limit(parseInt(this.query.length, 10))
          .then((result) => {
            sessions.rows = result;
            return sessionEntity.count();
          }).then((result) => {
            sessions.count = result;
            let dataTable = dataTableSessionParsing.call(this, this.query, sessions);
            return this.renderDatatable(dataTable);
          })
          .catch(e => {
            throw e;
          });
      }
      break;
    case "memcached":
      return this.renderRest({
        code: 500,
        type: "ERROR",
        message: "session.storage.memcached webservice not implemented",
        data: ""
      });
    }
  }

  pm2Action() {
    switch (this.kernel.node_start) {
    case "PM2":
      let pm2 = require("pm2");
      let name = this.getParameters("bundles.App.App.projectName") || "nodefony";
      pm2.connect(true, () => {
        this.logger("CONNECT PM2", "DEBUG");
        pm2.describe(name, (err, list) => {
          this.renderRest({
            code: 200,
            type: "SUCCESS",
            message: "OK",
            data: JSON.stringify(list)
          }, true);
        });
      });
      break;
    case "NODEFONY_DEV":
      let monitoring = this.get("monitoring");
      let ele = {
        monit: {
          memory: 0,
          cpu: 0
        },
        name: monitoring.name,
        pid: this.kernel.processId,
        pm_id: "",
        pm2_env: {
          exec_mode: "development",
          restart_time: 0,
          pm_uptime: this.kernel.uptime,
          status: "online"
        }
      };
      return this.renderRest({
        code: 200,
        type: "SUCCESS",
        message: "OK",
        data: JSON.stringify([ele])
      }, true);
    default:
      return this.renderRest({
        code: 200,
        type: "SUCCESS",
        message: "OK",
        data: JSON.stringify([])
      }, true);
    }
  }

  securityAction() {
    let service = this.get("security");
    if (!service) {
      return this.renderRest({
        code: 404,
        type: "ERROR",
        message: "Service security not found"
      });
    }
    let ele = {
      securedAreas: {},
      sessionStrategy: service.sessionStrategy,
      providers: [],
      factories: []
    };
    for (let factory in nodefony.security.factory) {
      ele.factories.push(factory);
    }

    for (let provider in service.providers) {
      ele.providers.push({
        name: service.providers[provider].name,
        type: service.providers[provider].type
      });
    }
    for (let area in service.securedAreas) {
      ele.securedAreas[area] = {
        name: area,
        regPartten: service.securedAreas[area].regPartten,
        redirect_Https: service.securedAreas[area].redirect_Https,
        sessionContext: service.securedAreas[area].sessionContext,
        provider: service.securedAreas[area].providerName,
        formLogin: service.securedAreas[area].formLogin,
        checkLogin: service.securedAreas[area].checkLogin,
        defaultTarget: service.securedAreas[area].defaultTarget,
        factory: null
      };
      if (service.securedAreas[area].factory) {
        ele.securedAreas[area].factory = service.securedAreas[area].factory.name;
      }
    }
    return this.renderRest({
      code: 200,
      type: "SUCCESS",
      message: "OK",
      data: JSON.stringify(ele)
    });
  }
};

const dataTableParsing = function (query, results) {
  let dataTable = {
    draw: parseInt(query.draw, 10),
    recordsTotal: results.count,
    recordsFiltered: (query.search.value !== "" ? results.rows.length : results.count),
    data: []
  };
  for (var i = 0; i < results.rows.length; i++) {
    var payload = {};
    payload.uid = results.rows[i].id;
    payload.payload = JSON.parse(results.rows[i].data);
    payload.timeStamp = results.rows[i].createdAt;
    payload.username = results.rows[i].username;
    payload.url = results.rows[i].url;
    payload.route = results.rows[i].route;
    payload.method = results.rows[i].method;
    payload.state = results.rows[i].state;
    payload.protocole = results.rows[i].protocole;
    payload.remoteAddress = results.rows[i].remoteAddress;
    payload.userAgent = results.rows[i].userAgent;
    dataTable.data.push(payload);
  }
  return dataTable;
};

const dataTableSessionParsing = function (query, results) {
  let dataTable = {
    draw: parseInt(query.draw, 10),
    recordsTotal: results.recordsTotal ||  results.count,
    recordsFiltered: results.count,
    data: []
  };
  let ormName = this.kernel.getOrm();
  for (let i = 0; i < results.rows.length; i++) {
    let payload = {};
    let user = null;
    switch (ormName) {
    case "sequelize":
      user = results.rows[i].user ? results.rows[i].user : {
        username: ""
      };
      break;
    case "mongoose":
      user = results.rows[i].user_id ? results.rows[i].user_id : {
        username: ""
      };
      break;
    }
    payload.session_id = results.rows[i].session_id;
    payload.context = results.rows[i].context;
    payload.createdAt = results.rows[i].createdAt;
    payload.updatedAt = results.rows[i].updatedAt;
    payload.user = user;
    payload.user_id = results.rows[i].user_id;
    payload.Attributes = results.rows[i].Attributes;
    payload.flashBag = results.rows[i].flashBag;
    payload.metaBag = results.rows[i].metaBag;
    dataTable.data.push(payload);
  }
  return dataTable;
};

/**
 *
 *    @method finderSession
 *
 */
const finderSession = function (Path, Result, finish) {
  let finder = new nodefony.finder({
    path: Path,
    onFinish: function (error, result) {
      let files = result.getFiles();
      let nbTotal = files.length();
      Result.recordsTotal = nbTotal;

      // sort
      let resTmp = files;
      let obj1 = null;
      let obj2 = null;
      for (let i = 0; i < Result.options.order.length; i++) {
        let callback = null;
        let colonm = Result.options.order[i][0];
        let direction = Result.options.order[i][1];
        switch (colonm) {
        case "updatedAt":
          let mtimea = null;
          let mtimeb = null;
          if (direction === "desc") {
            callback = function (a, b) {
              mtimea = new Date(a.stats.mtime).getTime();
              mtimeb = new Date(b.stats.mtime).getTime();
              if (mtimea > mtimeb) {
                return 1;
              }
              if (mtimea < mtimeb) {
                return -1;
              }
              return 0;
            };
          } else {
            callback = function (a, b) {
              mtimea = new Date(a.stats.mtime).getTime();
              mtimeb = new Date(b.stats.mtime).getTime();
              if (mtimea < mtimeb) {
                return 1;
              }
              if (mtimea > mtimeb) {
                return -1;
              }
              return 0;
            };
          }
          break;
        case "username":

          if (direction === "desc") {
            callback = function (a, b) {
              obj1 = JSON.parse(a.content());
              obj2 = JSON.parse(b.content());
              return parseInt(obj2.user_id, 10) - parseInt(obj1.user_id, 10);
            };
          } else {
            callback = function (a, b) {
              obj1 = JSON.parse(a.content());
              obj2 = JSON.parse(b.content());
              return parseInt(obj1.user_id, 10) - parseInt(obj2.user_id, 10);
            };
          }
          break;
        default:
          if (direction === "desc") {
            callback = function (a, b) {
              obj1 = JSON.parse(a.content());
              obj2 = JSON.parse(b.content());
              if (obj1[colonm].toString() > obj2[colonm].toString()) {
                return 1;
              }
              if (obj1[colonm].toString() < obj2[colonm].toString()) {
                return -1;
              }
              return 0;
            };
          } else {
            callback = function (a, b) {
              obj1 = JSON.parse(a.content());
              obj2 = JSON.parse(b.content());
              if (obj1[colonm].toString() < obj2[colonm].toString()) {
                return 1;
              }
              if (obj1[colonm].toString() > obj2[colonm].toString()) {
                return -1;
              }
              return 0;
            };
          }

        }
        resTmp = files.sort(callback);
      }
      let res = resTmp.slice(Result.options.offset, Result.options.limit + Result.options.offset);
      res.forEach(function (file) {
        //console.log(file.content())
        let content = JSON.parse(file.content());
        let mtime = new Date(file.stats.mtime);
        content.updatedAt = mtime;
        content.session_id = file.name;
        content.context = path.basename(file.dirname());
        Result.rows.push(content);
      });
      Result.count = nbTotal;
      finish(error, Result);
    }
  });
  return finder;
};