/*
 *
 *
 *
 *  CONTROLLER test unit
 *
 *
 *
 *
 */

class twigController extends nodefony.controller {

  constructor(container, context) {
    super(container, context);
  }

  renderAction() {
    var response = this.getResponse();
    var status = response.getStatus();
    let str = null;
    switch (this.query.type) {
    case "render":
      return this.render("testBundle:unitTest:rest.json.twig", {
        code: status.code,
        type: this.query.type,
        message: "",
        data: JSON.stringify(this.query)
      });
    case "renderSync":
      return this.renderSync("testBundle:unitTest:rest.json.twig", {
        code: status.code,
        type: this.query.type,
        message: "",
        data: JSON.stringify(this.query)
      });
    case "renderAsync":
      setTimeout(() => {
        this.renderAsync("testBundle:unitTest:rest.json.twig", {
          code: status.code,
          type: this.query.type,
          message: "",
          data: JSON.stringify(this.query)
        });
      }, 1000);
      return null;
    case "renderJson":
      str = {
        response: {
          code: status.code,
          reason: {
            type: this.query.type,
            message: ""
          },
          data: this.query
        }
      };
      return this.renderJson(str);
    case "renderJsonSync":
      str = {
        response: {
          code: status.code,
          reason: {
            type: this.query.type,
            message: ""
          },
          data: this.query
        }
      };
      return this.renderJsonSync(str);
    case "renderJsonAsync":
      str = {
        response: {
          code: status.code,
          reason: {
            type: this.query.type,
            message: ""
          },
          data: this.query
        }
      };
      setTimeout(() => {
        this.renderJsonAsync(str);
      }, 1000);
      break;
    case "renderJsonAsyncTimeOut":
      this.context.response.setTimeout(1000);
      str = {
        response: {
          code: status.code,
          reason: {
            type: this.query.type,
            message: ""
          },
          data: this.query
        }
      };
      setTimeout(() => {
        this.renderJsonAsync(str);
      }, 2000);
      break;
    case "renderOject":
      return this.query;
    default:
      this.context.response.setTimeout(1000);
    }
  }

  extendAction() {
    var response = this.getResponse();
    var status = response.getStatus();
    switch (this.query.type) {
    case "render":
      return this.render("testBundle:unitTest:render.json.twig", {
        code: status.code,
        type: this.query.type,
        message: "",
        data: JSON.stringify(this.query)
      });
    case "renderTorenderSync":
      this.query.type = "renderSync";
      return this.render("testBundle:unitTest:render.json.twig", {
        code: status.code,
        type: this.query.type,
        message: "",
        data: JSON.stringify(this.query)
      });
    case "renderSync":
      return this.renderSync("testBundle:unitTest:render.json.twig", {
        code: status.code,
        type: this.query.type,
        message: "",
        data: JSON.stringify(this.query)
      });
    case "renderSyncTorender":
      this.query.type = "render";
      return this.renderSync("testBundle:unitTest:render.json.twig", {
        code: status.code,
        type: this.query.type,
        message: "",
        data: JSON.stringify(this.query)
      });

    case "renderAsyncToSync":
      this.query.type = "renderSync";
      setTimeout(() => {
        this.renderAsync("testBundle:unitTest:render.json.twig", {
          code: status.code,
          type: this.query.type,
          message: "",
          data: JSON.stringify(this.query)
        });
      }, 1000);
      return null;
    case "renderAsyncToRender":
      this.query.type = "render";
      setTimeout(() => {
        this.renderAsync("testBundle:unitTest:render.json.twig", {
          code: status.code,
          type: this.query.type,
          message: "",
          data: JSON.stringify(this.query)
        });
      }, 1000);
      return null;
    case "renderSyncToAsync":
      this.query.type = "renderAsync";
      return this.renderSync("testBundle:unitTest:render.json.twig", {
        code: status.code,
        type: this.query.type,
        message: "",
        data: JSON.stringify(this.query)
      });
    case "renderToOject":
      this.query.type = "renderOject";
      return this.render("testBundle:unitTest:render.json.twig", {
        code: status.code,
        type: this.query.type,
        message: "",
        data: JSON.stringify(this.query)
      });
    default:
      throw new Error("extend twig not exist");
    }
  }

  websocketAction(message) {
    if (this.getMethod() === 'WEBSOCKET') {
      var obj = function (state, message, connection) {
        return {
          type: state,
          message: message,
          connection: connection
        };
      };
      let result = null;
      if (!message) {
        result = obj("START", "CONNECTED", this.context.connection.connected);
        this.context.send(JSON.stringify(result));
        return;
      } else {
        var res = null;
        try {
          if (message.utf8Data) {
            res = JSON.parse(message.utf8Data);
          } else {
            if (typeof message === "string") {
              res = JSON.parse(message);
            } else {
              res = message;
            }
          }
        } catch (e) {
          throw e;
        }
        switch (res.type) {
        case "START":
          result = obj("TWIG-RENDER", null, this.context.connection.connected);
          return this.renderJson(result);
        case "TWIG-RENDER":
          return this.render("testBundle:unitTest:websocket.json.twig", {
            code: this.context.connection.connected,
            type: "TWIG-RENDER",
            message: null,
            data: "null"
          }).then((result) => {
            var ret = JSON.parse(result);
            ret.type = 'STOP';
            return JSON.stringify(ret);
          });
        case "RENDER":
          return this.renderJson({
            type: "RENDER"
          });
        case "STOP":
          return this.context.connection.close();
        }
      }
    }
    throw new Error("HTTP context not defined WEBSOCKET  ");
  }
}

module.exports = twigController;
