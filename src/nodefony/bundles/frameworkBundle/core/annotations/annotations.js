const comments = require('parse-comments');
const commentParser = require("comment-parser"); //JSDoc-like

module.exports = nodefony.register("Annotations", function () {

  const regSpace = new RegExp("^[\\s]*(@.*)[\\s]*$");
  const regClass = new RegExp("^.*class(.*)Controller[\\s]+extends[\\s]+nodefony.controller.*$");
  const regAction = new RegExp("^(.*)Action[\\s]?\(.*\)$");
  const regRoute = new RegExp("^@Route[\\s]*\\((.*)\\)");
  const regMethod = new RegExp("^@Method[\\s]*\\({(.*)}\\)");


  const regKeyValue = new RegExp("^[\\s]*([^=]*)[\\s]*=[\\s]*(([{]?).*[}]?)[\\s]*$");
  /**
   *
   *    example parsing
   *
   *    @Route ("/", name="annotation", defaults={"id" = 1},requirements={"id" = "\\d+"})\n   @Method ({"GET", "POST"})\n'
   *    @Method ({"GET", "POST"})
   *
   */
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

  const annotationRouting = class annotationRouting {

    constructor(router, bundle) {
      this.router = router;
      this.routings = [];
      this.bundleShortName = bundle;
      this.bundleName = bundle + "Bundle";
      this.patternController = this.bundleName + ":";
      this.obj = {};
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
                  this.patternController += this.defaultNameController + ":";
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
     *    @Route ("/", name="annotation", defaults={"id" = 1},requirements={"id" = "\\d+"})\n   @Method ({"GET", "POST"})\n'
     *    @Method ({"GET", "POST"})
     *
     */
    parseRouting() {
      for (let i = 0; i < this.routings.length; i++) {
        let obj = {};
        switch (this.routings[i].type) {
        case "Class":
          let myobj = {};
          this.parseClass(this.routings[i], myobj);
          obj.prefix = myobj.pattern;
          break;
        case "Action":
          let name = null;
          this.parseAction(this.routings[i], obj);
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
            delete obj.name;
            delete obj.method;
            this.obj[name] = obj;
          }
          break;
        }

      }

      return this.obj;
    }

    parseLine(line, obj) {
      let res = regSpace.exec(line);
      if (res && res[1]) {
        line = res[1];
        switch (true) {
        case regRoute.test(line):
          res = regRoute.exec(line);
          if (res) {
            this.parseRoute(res[1], obj);
          }
          break;
        case regMethod.test(line):
          res = regMethod.exec(line);
          if (res) {
            this.parseMethod(res[1], obj);
          }
          break;
        default:
        }
      }
    }

    parseClass(annotation, obj) {
      try {
        if (annotation && annotation.comment) {
          let tab = annotation.comment.split("\n");
          for (let i = 0; i < tab.length; i++) {
            this.parseLine(tab[i], obj);
          }
          return obj;
        }
      } catch (e) {
        throw e;
      }
    }
    parseAction(annotation, obj) {
      try {
        if (annotation && annotation.comment) {
          let tab = annotation.comment.split("\n");
          for (let i = 0; i < tab.length; i++) {
            this.parseLine(tab[i], obj);
          }
          return obj;
        }
      } catch (e) {
        throw e;
      }
    }

    parseRoute(route, obj) {
      let tab = route.replace(/[ ]/g, "").split(",");
      let parser = Array.prototype.shift.call(tab).replace(/["' ]/g, "");
      obj.pattern = parser;
      parseKeyValue(tab, obj);
    }

    parseMethod(method, obj) {
      obj.method = method.replace(/["' ]/g, "").split(",");
    }

    toJson() {
      return JSON.stringify(this.obj);
    }
  };


  const Annotation = class Annotation extends nodefony.Service {

    constructor(container) {
      super("Annotations", container);
      this.router = this.get("router");
    }

    // https://github.com/yavorskiy/comment-parser
    jsDocParser(fileContent) {
      return new Promise((resolve, reject) => {
        try {
          return resolve(commentParser(fileContent));
        } catch (e) {
          this.logger(e, "ERROR");
          return reject(e);
        }
      });
    }

    parseComments(fileContent) {
      return new Promise((resolve, reject) => {
        try {
          return resolve(comments(fileContent))
            .catch((e) => {
              reject(e);
            });
        } catch (e) {
          return reject(e);
        }
      });
    }

    parseController(fileContent, bundle, file) {
      this.logger("Bundle " + bundle + " Parse Controller Annotation : " + file, "DEBUG");
      return new Promise((resolve, reject) => {
        try {
          return this.parseComments(fileContent)
            .then((obj) => {
              return resolve(this.parseAnnotationsRouting(obj, bundle));
            })
            .catch((e) => {
              reject(e);
            });
        } catch (e) {
          return reject(e);
        }
      });
    }


    parseAnnotationsRouting(comments, bundle) {
      try {
        let annotations = new annotationRouting(this.router, bundle);
        annotations.parse(comments);
        return annotations.obj;
      } catch (e) {
        throw e;
      }
    }

  };

  return Annotation;
});
