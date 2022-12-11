/*
 *
 *  CONTROLLER test unit
 *
 */
const querystring = require('querystring');

module.exports = class controllerTestController extends nodefony.controller {

  constructor(container, context) {
    super(container, context);
    this.orm = this.getORM();
    this.ormName = this.kernel.getOrm();
  }

  /**
   *
   *  redirectAction
   *
   */
  redirectAction(status) {
    var url = "/";
    var headers = {};
    if (this.queryPost.status) {
      status = this.queryPost.status;
    }
    if (this.queryPost.url) {
      var size = Object.keys(this.queryGet).length;
      if (size) {
        url = this.queryPost.url + "?" + querystring.stringify(this.queryGet);
      } else {
        url = this.queryPost.url;
      }
    }
    if (this.queryPost.headers) {
      headers = this.queryPost.url;
    }
    if (status === "route") {
      url = this.query.url;
      return this.redirectToRoute(url);
    }
    return this.redirect(url, status, headers);
  }

  /**
   *
   *  requestAction
   *
   */
  requestAction() {
    return this.renderJson({
      method: this.getMethod(),
      query: this.query,
      queryPost: this.queryPost,
      queryGet: this.queryGet,
    });
  }

  /**
   *
   *  promiseAction
   *
   */
  promiseAction(action) {
    switch (action) {
    case "promise":
      return this.forward("testBundle:controllerTest:promise1");
    case "promise1":
      return this.promise1Action();
    case "promise2":
      return this.promise2();
    case "promise3":
      return this.promise3();
    case "promise4":
      return this.promise4();
    case "promise5":
      return this.promise5();
    case "promise6":
      return this.promise6();
    case "promise7":
      return this.promise7();
    case "promise8":
      return this.promise8();
    case "promise88":
      return this.promise88();
    case "promise9":
      return this.promise9();
    case "promise10":
      return this.promise10();
    case "promise11":
      return this.promise11();
    case "promise12":
      return this.promise12();
    case "promise13":
      return this.promise13();
    default:
      return this.createNotFoundException("Promise action not found");
    }
  }

  /**
   *
   *  promise  sync chain
   *
   */

  promise1Action() {
    var data = null;
    var myFunc2 = () => {
      return new Promise((resolve /*, reject*/ ) => {
        setTimeout(() => {
          resolve({
            status: 200,
            data: data
          });
        }, 500);
      });
    };
    new Promise((resolve /*, reject*/ ) => {
      setTimeout(() => {
        data = {
          foo: "bar"
        };
        resolve(myFunc2());
      }, 500);
    }).then((...args) => {
      return this.renderJsonAsync(...args);
    });
  }

  /**
   *
   *  promise
   *
   */
  promise2() {
    new Promise((resolve /*, reject*/ ) => {
      setTimeout(() => {
        resolve({
          foo: "bar"
        });
      }, 500);
    }).then((ele) => {
      return new Promise((resolve /*, reject*/ ) => {
        setTimeout(() => {
          resolve({
            status: 200,
            data: ele
          });
        }, 500);
      });
    }).then((ele) => {
      return this.renderJsonAsync(ele);
    });
  }

  /**
   *
   *  promise json
   *
   */
  promise3() {
    var myFunc = () => {
      return new Promise((resolve /*, reject*/ ) => {
        setTimeout(() => {
          resolve({
            status: 200,
            time: "200"
          });
        }, 200);
      });
    };

    var myFunc2 = () => {
      return new Promise((resolve /*, reject*/ ) => {
        setTimeout(() => {
          resolve({
            status: 200,
            time: "500"
          });
        }, 500);
      });
    };

    return Promise.all([myFunc(), myFunc2()]).then((data) => {
      return this.renderJson(data);
    });
  }


  /**
   *
   *  promise json
   *
   */
  promise4() {

    var myFunc = () => {
      return new Promise((resolve /*, reject*/ ) => {
        setTimeout(() => {
          resolve({
            status: 200,
            time: "200"
          });
        }, 200);
      });
    };

    var myFunc2 = () => {
      return new Promise((resolve /*, reject*/ ) => {
        setTimeout(() => {
          resolve({
            status: 200,
            time: "500"
          });
        }, 500);
      });
    };

    return Promise.all([myFunc(), myFunc2()]).then((data) => {
      return this.renderJson(data);
      /*return this.renderResponse( JSON.stringify( data ) , 200 , {
        'Content-Type': "text/json ; charset="+ this.context.response.encoding
      } ) ;*/
    });
  }

  /**
   *
   *  promise reject
   *
   */
  promise5() {

    var myFunc = () => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          reject({
            status: 500,
            promise: "1"
          });
        }, 200);
      });
    };

    var myFunc2 = () => {
      return new Promise((resolve /*, reject*/ ) => {
        setTimeout(() => {
          resolve({
            status: 200,
            promise: "2"
          });
        }, 500);
      });
    };

    return Promise.all([myFunc(), myFunc2()]).then((data) => {
      return this.renderJson(data);
      /*return this.renderResponse( JSON.stringify( data ) , 200 , {
        'Content-Type': "text/json ; charset="+ this.context.response.encoding
      } ) ;*/
    }).catch((data) => {
      this.getResponse().setStatusCode(data.status);
      return this.renderJson(data);
    });
  }

  /**
   *
   *  promise reject
   *
   */
  promise6() {
    var myFunc = () => {
      return new Promise((resolve /*, reject*/ ) => {
        setTimeout(() => {
          resolve({
            status: 200,
            promise: "1"
          });
        }, 200);
      });
    };
    var myFunc2 = () => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          reject({
            status: 404,
            promise: "2"
          });
        }, 500);
      });
    };
    return Promise.all([myFunc(), myFunc2()]).then((data) => {
      return this.renderJson(data);
    }).catch((data) => {
      this.getResponse().setStatusCode(data.status);
      return this.renderJson(data);
    });
  }

  /**
   *
   *  promise reject
   *
   */
  promise7() {

    return new Promise((resolve /*, reject*/ ) => {
        setTimeout(() => {
          resolve({
            foo: "bar"
          });
        }, 500);
      }).then((ele) => {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            reject({
              status: 500,
              data: ele
            });
          }, 500);
        });
      }).then((ele) => {
        return this.renderJson(ele);
      })
      .catch((data) => {
        this.getResponse().setStatusCode(data.status);
        return this.renderJson(data);
      });
  }

  /**
   *
   *  promise throw
   *
   */
  promise8() {
    return new Promise((resolve /*, reject*/ ) => {
        setTimeout(() => {
          resolve({
            status: 500,
            data: {
              foo: "bar"
            }
          });
        }, 500);
      }).then((ele) => {
        throw ele;
      }).then((ele) => {
        return this.renderJson(ele);
      })
      .catch((data) => {
        this.getResponse().setStatusCode(data.status);
        return this.renderJson(data);
      });
  }
  /**
   *
   *  promise throw
   *
   */
  promise88() {
    return new Promise((resolve /*, reject*/ ) => {
        setTimeout(() => {
          resolve({
            status: 500,
            data: {
              foo: "bar"
            }
          });
        }, 500);
      }).then(() => {
        notDefinded;
      }).then((ele) => {
        return this.renderJson(ele);
      })
      .catch((data) => {
        this.getResponse().setStatusCode(500);
        return this.renderJson({
          status: 500,
          data: data.message
        });
      });
  }

  /**
   *
   *  promise sequelise
   *
   */
  promise9() {
    //var orm = this.getORM();
    var userEntity = this.orm.getEntity("user");
    let query = null;
    switch (this.ormName) {
    case "sequelize":
      query = {
        where: {
          username: "admin"
        }
      };
      break;
    case "mongoose":
      query = {
        username: "admin"
      };
      break;
    }
    return userEntity.findOne(query)
      .then((ele) => {
        return this.renderJson({
          status: 200,
          data: ele
        });
      })
      .catch((data) => {
        this.getResponse().setStatusCode(500);
        return this.renderJson({
          status: 500,
          data: data.message
        });
      });
  }

  /**
   *
   *  promise sequelise
   *
   */
  async promise10() {
    //var orm = this.getORM();
    var userEntity = this.orm.getEntity("user");
    var sessionEntity = this.orm.getEntity("session");
    let query = null;
    let query2 = null;
    let session = await this.startSession()
    switch (this.ormName) {
    case "sequelize":
      query = {
        where: {
          username: "anonymous"
        }
      };
      query2 = {
        where: {
          //user_id: ele[0].id
          session_id: this.getSession() ? this.getSession().id : "0"
        }
      };
      break;
    case "mongoose":
      query = {
        username: "anonymous"
      };
      query2 = {
        //user_id: ele[0].id
        session_id: this.getSession() ? this.getSession().id : "0"
      };
      break;
    }
    return userEntity.findOne(query)
      .then(() => {
        return sessionEntity.findOne(query2);
      })
      .then((ele) => {
        return this.renderJson(ele);
      })
      .catch((data) => {
        this.getResponse().setStatusCode(500);
        return this.renderJson({
          status: 500,
          data: data.message
        });
      });
  }

  /**
   *
   *  promise sequelise
   *
   */
  promise11() {
    //var orm = this.getORM();
    var userEntity = this.orm.getEntity("user");
    //var sessionEntity = orm.getEntity("session") ;
    let query = null;
    switch (this.ormName) {
    case "sequelize":
      query = {
        where: {
          username: "admin"
        }
      };
      break;
    case "mongoose":
      query = {
        username: "admin"
      };
      break;
    }
    return userEntity.findOne(query)
      .then((ele) => {
        return ele;
      })
      .then((ele) => {
        return this.renderJson({
          status: 200,
          data: ele
        });
      })
      .catch((data) => {
        this.getResponse().setStatusCode(500);
        return this.renderJson({
          status: 500,
          data: data.message
        });
      });
  }
  /**
   *
   *  promise sequelise
   *
   */
  promise12() {
    //var orm = this.getORM();
    var userEntity = this.orm.getEntity("user");
    //var sessionEntity = orm.getEntity("session") ;
    let query = null;
    switch (this.ormName) {
    case "sequelize":
      query = {
        where: {
          username: "admin"
        }
      };
      break;
    case "mongoose":
      query = {
        username: "admin"
      };
      break;
    }
    return userEntity.findOne(query)
      .then((ele) => {
        throw ele;
      })
      .then((ele) => {
        return this.renderJson({
          status: 200,
          data: ele
        });
      })
      .catch((data) => {
        this.getResponse().setStatusCode(500);
        return this.renderJson({
          status: 500,
          data: data
        });
      });
  }
  /**
   *
   *  promise sequelise
   *
   */
  promise13() {
    var orm = this.getORM();
    var userEntity = orm.getEntity("user");
    //var sessionEntity = orm.getEntity("session") ;
    let query = null;
    switch (this.ormName) {
    case "sequelize":
      query = {
        where: {
          username: "admin"
        }
      };
      break;
    case "mongoose":
      query = {
        username: "admin"
      };
      break;
    }
    return userEntity.findOne(query)
      .then(() => {
        notDefinded;
      })
      .then((ele) => {
        return this.renderJson({
          status: 200,
          data: ele
        });
      })
      .catch((data) => {
        this.getResponse().setStatusCode(500);
        return this.renderJson({
          status: 500,
          data: data.message
        });
      });
  }

  /**
   *
   *  promiseAction
   *
   */
  exceptionAction(action) {
    switch (action) {
    case "500":
      return this.createException(new Error("My create Exception"));
    case "401":
      return this.createUnauthorizedException("My Unauthorized Exception");
    case "404":
      return this.createNotFoundException("My not found Exception");
    case "408":
      this.getResponse().setStatusCode(408);
      throw new Error("My Timeout Exception");
    case "error":
      varNotExit.defined.value;
      break;
    case "notDefined":
      throw null;
      //return this.notificationsCenter.fire("onError", this.container, null);
    case "fire":
      return new Error("My Fire Exception");
      //return this.notificationsCenter.fire("onError", this.container, new Error("My Fire Exception"));
    case "timeout":
      this.response.setTimeout(1000);
      return;
    default:
      throw new Error("Action not found");
    }
  }
};
