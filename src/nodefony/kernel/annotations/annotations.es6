const Comments = require('parse-comments');
const regController = /^(.+)Controller$/;
module.exports = nodefony.register("Annotations", function () {

  //const regSpace = new RegExp("^[\\s]*(@.*)[\\s]*$");
  const regClass = new RegExp("^.*class(.*)Controller[\\s]+extends[\\s]+nodefony.controller.*$");
  const regAction = new RegExp("^(.*)Action[\\s]?\(.*\)$");
  //const regRoute = new RegExp("^@Route[\\s]*\\((.*)\\)");
  //const regMethod = new RegExp("^@Method[\\s]*\\({(.*)}\\)");
  const regKeyValue = new RegExp("^[\\s]*([^=]*)[\\s]*=[\\s]*(([{]?).*[}]?)[\\s]*$");
  const regRouteBlock = new RegExp("^.*@Route[\\s]*\\(([^()]*)\\).*");
  const regMethodBlock = new RegExp("^.*@Method[\\s]*\\(([^()]*)\\).*");
  const regHostBlock = new RegExp("^.*@Host[\\s]*\\(([^()]*)\\).*");

  const parseKeyValue = function (tab, obj) {
    for (let i = 0; i < tab.length; i++) {
      let res = regKeyValue.exec(tab[i]);
      let key = res[1].replace(/["' ]/g, "");
      let value = res[2].replace(/["']/g, "");
      let tmp = null;
      tmp = parseInt(value, 10);
      if (tmp) {
        value = tmp;
      }
      if (res) {
        if (res[3] === "{") {
          value = value.replace(/^[{]/, "").replace(/[}]$/, "");
          let mytab = value.split(",");
          parseKeyValue(mytab, obj[key] = {});
          continue;
        }
        obj[key] = value;
      }
    }
    return obj;
  };

  class annotationRouting {

    constructor(annotation, bundle, pathFile) {
      this.annotation = annotation;
      this.router = this.annotation.router;
      this.path = pathFile;
      this.routings = [];
      this.bundle = bundle;
      this.bundleName = this.bundle.bundleName;
      this.bundleShortName = this.bundle.name;
      this.patternController = this.setPatternController(pathFile);
      this.obj = {};
      this.host = null;
      this.prefix = null;
    }

    setPatternController(file) {
      let myClass = null;
      let nameController = null;
      try {
        myClass = require(file);
        let res = regController.exec(myClass.name);
        if (res) {
          nameController = res[1];
        } else {
          throw new Error("Bad controller name annotation");
        }
      } catch (e) {
        throw e;
      }
      return this.bundleName + ":" + nameController + ":";
    }

    parse(comments) {
      if (comments) {
        try {
          for (let i = 0; i < comments.length; i++) {
            for (let comment in comments[i]) {
              let ele = {
                type: null,
                comment: "",
                bundle: this.bundleName,
                defaultNameAction: null,
                patternController: "" + this.patternController
              };
              switch (comment) {
              case "comment":
                let res = null;
                switch (true) {
                case regClass.test(comments[i][comment].code):
                  ele.type = "Class";
                  if (comments[i][comment].content) {
                    ele.comment = comments[i][comment].content;
                  }
                  res = regClass.exec(comments[i][comment].code);
                  this.defaultNameController = res[1].replace(/\s/, "");
                  //this.patternController += this.defaultNameController + ":";
                  break;
                case regAction.test(comments[i][comment].code):
                  ele.type = "Action";
                  ele.comment = comments[i][comment].content;
                  res = regAction.exec(comments[i][comment].code);
                  ele.defaultNameAction = res[1];
                  ele.patternController += res[1];
                  break;
                }
                break;
              }
              if (ele.type) {
                this.routings.push(ele);
              }
            }
          }
          return this.parseRouting();
        } catch (e) {
          throw e;
        }
      }
    }

    /**
     *
     *    example parsing
     *
     *    @Route ("/", name="annotation", defaults={"id" = 1},requirements={"id" = "\\d+"})\n
     *    @Method ({"GET", "POST"})
     *
     */
    parseRouting() {
      for (let i = 0; i < this.routings.length; i++) {
        let obj = {};
        switch (this.routings[i].type) {
        case "Class":
          let myobj = {};
          this.parseBlock(this.routings[i], myobj);
          this.prefix = myobj.pattern;
          this.host = myobj.host;
          break;
        case "Action":
          let name = null;
          this.parseBlock(this.routings[i], obj);
          if (Object.keys(obj).length) {
            if (!obj.name) {
              name = this.bundleShortName + "_" + this.defaultNameController + "_" + this.routings[i].defaultNameAction;
            } else {
              name = obj.name;
            }
            if (obj.defaults) {
              obj.defaults.controller = this.routings[i].patternController;
            } else {
              obj.defaults = {};
              obj.defaults.controller = this.routings[i].patternController;
            }
            if (obj.method) {
              if (obj.requirements) {
                obj.requirements.method = obj.method;
              } else {
                obj.requirements = {};
                obj.requirements.method = obj.method;
              }
            }
            obj.prefix = this.prefix || "";
            obj.host = this.host || "";
            delete obj.name;
            delete obj.method;
            this.obj[name] = obj;
          }
          break;
        }
      }
      return this.obj;
    }

    parseBlock(annotation, obj) {
      if (annotation && annotation.comment) {
        try {
          let res = null;
          let cleanBlock = annotation.comment.replace(/\r?\n?/g, "");
          switch (true) {
          case regRouteBlock.test(cleanBlock):
            res = regRouteBlock.exec(cleanBlock);
            if (res) {
              this.parseRoute(res[1], obj);
            }
          case regMethodBlock.test(cleanBlock):
            res = regMethodBlock.exec(cleanBlock);
            if (res) {
              this.parseMethod(res[1], obj);
            }
          case regHostBlock.test(cleanBlock):
            res = regHostBlock.exec(cleanBlock);
            if (res) {
              this.parseHost(res[1], obj);
            }
            break;
          default:
          }
        } catch (e) {
          throw e;
        }
      }
    }

    parseRoute(route, obj) {
      let tab = route.replace(/[ ]/g, "").split(",");
      let parser = Array.prototype.shift.call(tab).replace(/["' ]/g, "");
      obj.pattern = parser;
      parseKeyValue(tab, obj);
    }

    parseMethod(method, obj) {
      obj.method = method.replace(/["'{} ]/g, "").split(",");
    }

    parseHost(host, obj) {
      obj.host = host.replace(/["'{} ]/g, "");
    }

    toString() {
      return JSON.stringify(this.obj);
    }
  }

  class Annotation extends nodefony.Service {

    constructor(container) {
      super("Annotations", container);
      this.router = this.get("router");
      this.engine = require("twig");
    }

    parseComments(fileContent) {
      return new Promise((resolve, reject) => {
        try {
          return resolve(new Comments(fileContent))
            .catch((e) => {
              reject(e);
            });
        } catch (e) {
          return reject(e);
        }
      });
    }

    parseController(fileContent, bundle, file) {
      return new Promise((resolve, reject) => {
        try {
          return this.parseComments(fileContent)
            .then((obj) => {
              return resolve(this.parseAnnotationsRouting(obj, bundle, file));
            })
            .catch((e) => {
              reject(e);
            });
        } catch (e) {
          return reject(e);
        }
      });
    }

    parseAnnotationsRouting(comments, bundle, file) {
      try {
        let annotations = new annotationRouting(this, this.kernel.getBundle(bundle), file);
        annotations.parse(comments);
        if (Object.keys(annotations.obj).length) {
          this.logger("Bundle " + bundle + " Parse Controller Annotation : " + file, "DEBUG");
          /*console.log(annotations.toString())
          console.dir(annotations.obj, {
            depth: 3
          })*/
        }
        return annotations.obj;
      } catch (e) {
        throw e;
      }
    }
  }
  return Annotation;
});