const decode = function (str) {
  try {
    return decodeURIComponent(str);
  } catch (err) {
    return str;
  }
};
let crypto;
try {
  crypto = require("node:crypto");
} catch (err) {
  crypto = require("crypto");
  // console.log('crypto support is disabled!', err);
}
const {createHash} = crypto;

/*
 *	CLASS ROUTE
 *
 */

/*
/(\/)? - matches an optional forward slash (/) at the beginning of the route.

(\.)? - matches an optional dot (.) after the optional forward slash.

\{([^}]+)\} - matches a string enclosed in curly braces ({}), capturing the string inside the braces as a group.

(?:\(([^)]*)\))? - matches an optional string enclosed in parentheses (()), capturing the string inside the parentheses as a group.

(\?)? - matches an optional question mark (?) at the end of the route.

The g flag at the end of the expression makes the pattern match all occurrences in the input string, rather than just the first one.
*/
const regRoute = /(\/)?(\.)?\{([^}]+)\}(?:\(([^)]*)\))?(\?)?/g;

class Route {
  constructor (name, obj) {
    this.name = name;
    this.path = "";
    this.host = null;
    this.defaults = {};
    this.requirements = {};
    this.variables = [];
    this.pattern = null;
    this.bypassFirewall = false;
    this.defaultLang = null;
    this.hash = null;
    this.prefix = "";

    // TODO
    this.options = {};
    // TODO http | websocket
    this.schemes = null;
    if (obj) {
      this.setName(obj.id);
      this.setPrefix(obj.prefix);
      this.setPattern(obj.pattern);
      this.setHostname(obj.host);
      this.setDefaults(obj.defaults);
      this.compile();
    }
  }

  setDefaults (arg) {
    if (arg) {
      for (const ob in arg) {
        this.addDefault(ob, arg[ob]);
      }
    }
  }

  toString () {
    return JSON.stringify({
      name: this.name,
      path: this.path,
      prefix: this.prefix,
      host: this.host,
      controller: this.defaults.controller,
      filePath: this.filePath,
      schemes: this.schemes,
      bypassFirewall: this.bypassFirewall
    }, null, " ");
  }

  generateId () {
    this.hash = createHash("md5").update(JSON.stringify(this))
      .digest("hex");
    return this.hash;
  }

  setName (name) {
    if (name) {
      this.name = name;
    }
  }

  setPattern (pattern) {
    if (pattern) {
      this.path = this.prefix + pattern;
    } else if (this.prefix) {
      if (this.path) {
        this.path = this.prefix + this.path;
      } else {
        this.path = this.prefix;
      }
    }
    return this.path;
  }

  setHostname (hostname) {
    this.host = hostname || null;
  }

  setPrefix (prefix) {
    if (prefix === "/") {
      this.prefix = "";
    } else {
      this.prefix = prefix;
    }
    this.setPattern();
  }

  addDefault (key, value) {
    this.defaults[key] = value;
  }

  addRequirement (key, value) {
    this.requirements[key] = value;
  }

  getRequirement (key) {
    return this.requirements[key];
  }

  hasRequirements () {
    return Object.keys(this.requirements).length;
  }

  addOptions (key, value) {
    this.options[key] = value;
  }

  checkDefaultParameters (variable) {
    for (const def in this.defaults) {
      switch (def) {
      case "controller":
        continue;
      default:
        if (def === variable) {
          return true;
        }
      }
    }
    return false;
  }

  hydrateDefaultParameters (res) {
    if (this.variables.length) {
      for (let i = 0; i < this.variables.length; i++) {
        if (this.defaults[this.variables[i]]) {
          if (res[i + 1] === "") {
            res[i + 1] = this.defaults[this.variables[i]];
          }
        }
      }
    } else {
      for (const def in this.defaults) {
        switch (def) {
        case "controller":
          continue;
        default:
          res.push(this.defaults[def]);
        }
      }
    }
  }

  compile () {
    if (!this.path) {
      return;
    }
    const pathPrefix = this.path.replace("//", "/");
    let pattern = pathPrefix.replace(regRoute, (match, slash, dot, key, capture, opt, offset) => {
      const incl = (pathPrefix[match.length + offset] || "/") === "/";
      this.variables.push(key);
      if (this.checkDefaultParameters(key)) {
        return `${(incl ? "(?:" : "") + (slash ? `${slash}?` : "") + (incl ? "" : "(?:") + (dot || "")}(${capture || "[^/]*"}))${opt || ""}`;
      }
      return `${(incl ? "(?:" : "") + (slash || "") + (incl ? "" : "(?:") + (dot || "")}(${capture || "[^/]+"}))${opt || ""}`;
    });
    if (pattern[pattern.length - 1] === "*") {
      pattern = pattern.replace(/([\/.])/g, "\\$1").replace(/\*/g, "(.*)\/?");
    } else {
      pattern = pattern.replace(/([\/.])/g, "\\$1");
    }
    this.pattern = new RegExp(`^${pattern}[/]?$`, "i");
    // this.pattern = new RegExp('^' + pattern +'$' , 'i');
    return this.pattern;
  }

  match (context) {
    const res = context.request.url.pathname.match(this.pattern);
    if (!res) {
      return res;
    }
    try {
      this.hydrateDefaultParameters(res);
    } catch (e) {
      throw e;
    }
    // check requierments
    try {
      this.matchRequirements(context);
    } catch (e) {
      throw e;
    }
    // check Hostname
    try {
      this.matchHostname(context);
    } catch (e) {
      throw e;
    }
    let map = [];
    try {
      res.slice(1).forEach((param, i) => {
        const k = this.variables[i] || "wildcard";
        param &&= decode(param);
        const req = this.getRequirement(k);
        let result = null;
        if (req) {
          switch (nodefony.typeOf(req)) {
          case "RegExp":
            result = req.test(param);
            break;
          case "string":
            result = new RegExp(req).test(param);
            break;
          default:
            throw {
              BreakException: `Requirement Routing config Exception variable : ${k} must be RegExp or string : ${nodefony.typeOf(req)}`
            };
          }
          if (!result) {
            map = false;
            throw {
              BreakException: `Requirement Exception variable : ${k} ==> ${param} doesn't match with ${req}`
            };
          }
        }
        const index = map.push(param);
        map[k] = map[index - 1];
      });
    } catch (e) {
      if (e.BreakException) {
        throw e.BreakException;
      }
      throw e;
    }
    if (map && map.wildcard) {
      map["*"] = map.wildcard;
    }
    return map;
  }

  setFirewallConfigRoute (obj) {
    if (!obj) {
      return;
    }
    if (obj.bypass) {
      this.bypassFirewall = true;
    }
  }

  matchHostname (context) {
    if (this.host) {
      if (this.host === context.domain) {
        return true;
      }
      const error = new Error(`Domain ${context.domain} Unauthorized`);
      error.code = 401;
      error.type = "domain";
      throw error;
    }
    return true;
  }

  matchRequirements (context) {
    if (this.hasRequirements()) {
      for (const i in this.requirements) {
        switch (i) {
        case "method":
          switch (typeof this.requirements[i]) {
          case "string":
            const req = this.requirements[i].replace(/\s/g, "").toUpperCase();
            if (req.split(",").lastIndexOf(context.method) < 0) {
              const error = new Error(`Method ${context.method} Unauthorized`);
              error.code = 405;
              error.type = "method";
              throw error;
            }
            break;
          case "object":
            if (this.requirements[i].indexOf(context.method) < 0) {
              if (this.requirements[i].indexOf(context.method.toLowerCase()) < 0) {
                const error = new Error(`Method ${context.method} Unauthorized`);
                error.code = 405;
                error.type = "method";
                throw error;
              }
            }
            break;
          default:
            throw new Error(`Bad config route method : ${this.requirements[i]}`);
          }
          break;
        case "domain":
          if (context.domain !== this.requirements[i]) {
            const error = new Error(`Domain ${context.domain} Unauthorized`);
            error.code = 403;
            error.type = "domain";
            throw error;
          }
          break;
        case "protocol":
          switch (context.method) {
          case "WEBSOCKET":
            // console.log("this.requirements[i]" +this.requirements[i]);
            if (context.acceptedProtocol !== this.requirements[i]) {
              const error = new Error(`Protocol ${context.acceptedProtocol} Unauthorized`);
              error.code = 1002;
              error.type = "protocol";
              throw error;
            }
            break;
          }
          break;
        }
      }
    }
    return true;
  }
}

nodefony.Route = Route;
module.exports = Route;
