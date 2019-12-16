//const regSpace = new RegExp("^[\\s]*(@.*)[\\s]*$");
const regKeyValue = new RegExp("^[\\s]*([^=]*)[\\s]*=[\\s]*(([{]?).*[}]?)[\\s]*$");
const regRouteBlock = new RegExp("^.*@Route[\\s]*\\(([^()]*)\\).*");
const regMethodBlock = new RegExp("^.*@Method[\\s]*\\(([^()]*)\\).*");
const regHostBlock = new RegExp("^.*@Host[\\s]*\\(([^()]*)\\).*");
const regFirewallBlock = new RegExp("^.*@Firewall[\\s]*\\(([^()]*)\\).*");

const parseKeyValue = function (tab, obj) {
  for (let i = 0; i < tab.length; i++) {
    if (!tab[i]) {
      continue;
    }
    let str = tab[i].replace(/(.*)\*$/, "$1");
    let res = regKeyValue.exec(str);
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
    this.obj = {};
    this.host = null;
    this.prefix = null;
  }

  setPatternController(name) {
    return this.bundleName + ":" + name + ":";
  }

  parse(comments) {
    if (comments.program && comments.program.class && comments.program.class.length) {
      try {
        if (comments.program.class && comments.program.class.length) {
          //console.log(comments.program.class);
          for (let myClass in comments.program.class) {
            let pattern = this.setPatternController(comments.program.class[myClass].name);
            let defaultNameController = comments.program.class[myClass].name;
            let eleClass = {
              type: "Class",
              comment: "",
              bundle: this.bundleName,
              defaultNameAction: null,
              patternController: pattern,
              defaultNameController: defaultNameController
            };
            if (comments.program.class[myClass].comments && comments.program.class[myClass].comments.length) {
              comments.program.class[myClass].comments.map((ele) => {
                eleClass.comment += ele.value;
              });
            }
            if (comments.program.comments && comments.program.comments.length) {
              comments.program.comments.map((ele) => {
                eleClass.comment += ele;
              });
            }
            this.routings.push(eleClass);
            if (comments.program.class[myClass].actions && comments.program.class[myClass].actions.length) {
              for (let action in comments.program.class[myClass].actions) {
                let defaultNameAction = null;
                let patternController = `${pattern}`;
                if (comments.program.class[myClass].actions[action].name) {
                  defaultNameAction = comments.program.class[myClass].actions[action].name;
                  patternController += defaultNameAction;
                } else {
                  continue;
                }
                let eleAction = {
                  type: "Action",
                  comment: "",
                  bundle: this.bundleName,
                  defaultNameAction: defaultNameAction,
                  patternController: patternController,
                  defaultNameController: defaultNameController
                };
                if (comments.program.class[myClass].actions[action].comments && comments.program.class[myClass].actions[action].comments.length) {
                  comments.program.class[myClass].actions[action].comments.map((ele) => {
                    eleAction.comment += ele;
                  });
                }
                this.routings.push(eleAction);
              }
            }
          }
          return this.parseRouting();
        }
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
            name = `${this.bundleShortName}_${this.routings[i].defaultNameController}_${this.routings[i].defaultNameAction}`;
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
    //console.log(this.obj)
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
        case regFirewallBlock.test(cleanBlock):
          res = regFirewallBlock.exec(cleanBlock);
          if (res) {
            this.parseFirewall(res[1], obj);
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
    //let tab = route.replace(/[ ]|[\s]?\*[\s]?/g, "").split(",");
    route = route.replace(/[ ]|[\s]?/g, "");
    let tab = route.split(",");
    tab.map((ele, index) => {
      let res = ele.replace(/^\*([\s]?)/g, "$1");
      tab[index] = res;
      return res;
    });
    let parser = Array.prototype.shift.call(tab).replace(/["' ]/g, "");
    if (regKeyValue.test(parser)) {
      obj.pattern = "";
      tab.unshift(parser);
    } else {
      obj.pattern = parser;
      parseKeyValue(tab, obj);
    }
  }

  parseMethod(method, obj) {
    obj.method = method.replace(/["'{} ]|[\s]?\*[\s]?/g, "").split(",");
  }

  parseHost(host, obj) {
    obj.host = host.replace(/["'{} ]|[\s]?\*[\s]?/g, "");
  }

  parseFirewall(firewall, obj) {
    let fw = {};
    let rep = firewall.replace(/["'{} ]|[\s]?\*[\s]?/g, "").split(",");
    for (let i = 0; i < rep.length; i++) {
      let spl = rep[i].split(":");
      if (spl.length) {
        let value = spl[1];
        if (spl[1] === "true") {
          value = true;
        }
        if (spl[1] === "false") {
          value = false;
        }
        fw[spl[0]] = value;
      }
    }
    obj.firewalls = fw;
  }

  toString() {
    return JSON.stringify(this.obj);
  }
}

class Annotation extends nodefony.Service {

  constructor(container) {
    super("Annotations", container);
    this.router = this.get("router");
    this.engine = nodefony.babylon;
  }

  parseController(fileContent, bundle, file) {
    return this.engine.parseController(fileContent)
      .then((comments) => {
        try {
          let annotations = new annotationRouting(this, this.kernel.getBundle(bundle), file);
          annotations.parse(comments);
          if (Object.keys(annotations.obj).length) {
            this.logger("Bundle " + bundle + " Parse Controller Annotation : " + file, "DEBUG");
          }
          return annotations.obj;
        } catch (e) {
          throw e;
        }
      })
      .catch((e) => {
        throw e;
      });
  }
}

nodefony.Annotations = Annotation;
module.exports = Annotation;