class jsonTree extends nodefony.fileClass {
  constructor(path, parent) {
    super(path);
    this.parent = parent;
    if (this.parent !== null && this.parent.children) {
      this.parent.children.push(this);
    }
    this.children = [];
  }
}


const findExist = function (tab, file) {
  let exist = false;
  tab.map((ele) => {
    if (ele.path === file.path) {
      exist = true;
    }
  });
  return exist;
};

/*
 *  CLASS Result
 *
 */
class Result {

  constructor(res) {
    if (res && nodefony.typeOf(res) === "array") {
      this.files = res;
    } else {
      this.files = [];
    }
    this.json = {};
  }

  push(file) {
    this.files.push(file);
  }

  length() {
    return this.files.length;
  }

  slice(offset, limit) {
    return new Result(Array.prototype.slice.call(this.files, offset, limit));
  }

  sort(callback) {
    return new Result(Array.prototype.sort.call(this.files, callback));
  }

  sortByName() {
    let res = this.files.sort(function (a, b) {
      if (a.name.toString() > b.name.toString()) {
        return 1;
      }
      if (a.name.toString() < b.name.toString()) {
        return -1;
      }
      return 0;
    });
    if (res) {
      return new Result(res);
    }
    return this;
  }

  sortByType() {
    let res = this.files.sort(function (a, b) {
      if (a.type.toString() > b.type.toString()) {
        return 1;
      }
      if (a.type.toString() < b.type.toString()) {
        return -1;
      }
      return 0;
    });
    if (res) {
      return new Result(res);
    }
    return this;
  }

  findByNode(nodeName, tab, Path) {
    let i = null;
    if (!Path) {
      Path = [];
    }
    if (!tab) {
      tab = [];
      for (i = 0; i < this.files.length; i++) {
        if (this.files[i].name === nodeName) {
          if (this.files[i].isDirectory()) {
            Path.push(this.files[i].path);
          }
        }
      }
    }
    if (Path.length) {
      for (i = 0; i < this.files.length; i++) {
        if (Path.indexOf(this.files[i].dirName) !== -1) {
          if (!findExist(tab, this.files[i])) {
            tab.push(this.files[i]);
          }
          if (this.files[i].isDirectory()) {
            this.findByNode(this.files[i].name, tab, [this.files[i].path]);
          }
        }
      }
    }
    return new Result(tab);
  }

  getDirectories() {
    let tab = [];
    for (let i = 0; i < this.files.length; i++) {
      if (this.files[i].type === "Directory") {
        tab.push(this.files[i]);
      }
    }
    return new Result(tab);
  }

  getFiles() {
    let tab = [];
    for (let i = 0; i < this.files.length; i++) {
      switch (this.files[i].type) {
      case "File":
        tab.push(this.files[i]);
        break;
      case "symbolicLink":
        let path = fs.readlinkSync(this.files[i].path);
        let file = this.files[i].dirName + "/" + path;
        if (fs.lstatSync(file).isFile()) {
          tab.push(this.files[i]);
        }
        break;
      }
    }
    return new Result(tab);
  }

  getFile(name, casse) {
    let reg = null;
    for (let i = 0; i < this.files.length; i++) {
      switch (this.files[i].type) {
      case "File":
        if (casse) {
          reg = new RegExp("^" + name + "$", "i");
          if (reg.test(this.files[i].name)) {
            return this.files[i];
          }
        } else {
          if (this.files[i].name === name) {
            return this.files[i];
          }
        }
        break;
      case "symbolicLink":
        try {
          let path = fs.readlinkSync(this.files[i].path);
          let file = this.files[i].dirName + "/" + path;
          if (fs.lstatSync(file).isFile()) {
            if (casse) {
              reg = new RegExp("^" + name + "$", "i");
              if (reg.test(this.files[i].name)) {
                return this.files[i];
              }
            } else {
              if (this.files[i].name === name) {
                return this.files[i];
              }
            }
          }
        } catch (e) {
          continue;
        }
        break;
      }
    }
    return null;
  }

  forEach(callback) {
    return this.files.forEach(callback);
  }

  match(reg) {
    let tab = [];
    for (let i = 0; i < this.files.length; i++) {
      let res = this.files[i].matchName(reg);
      if (res) {
        tab.push(this.files[i]);
      }
    }
    return new Result(tab);
  }
}


/*
 *  CLASS Finder
 *
 */
const checkMatch = function (file, settings) {
  if (settings.match) {
    if (file.matchName(settings.match)) {
      return true;
    } else {
      if (file.matchType(settings.match)) {
        return settings.match;
      }
      return false;
    }
  }
  return true;
};


const checkExclude = function (file, settings) {
  if (file.matchName(settings.exclude)) {
    return true;
  }
  if (file.matchType(settings.exclude)) {
    return true;
  }
  return false;
};

const checkHidden = function (file, settings) {
  if (!settings.seeHidden) {
    if (file.isHidden()) {
      return true;
    }
  }
  return false;
};

const findStatic = function (file, result, depth, settings, parent) {
  let res = null;
  try {
    try {
      res = fs.readdirSync(file.path);
    } catch (e) {
      if (file.type === "symbolicLink" && settings.followSymLink && depth - 1 !== 0) {
        res = fs.readlinkSync(file.path);
      } else {
        throw e;
      }
    }

    if (res && res.length) {
      let ret = regSlash.exec(file.path);
      let filePath = null;
      if (ret) {
        filePath = ret[1] + "/";
      } else {
        filePath = file.path + "/";
      }
      for (let i = 0; i < res.length; i++) {
        let match = true;
        let File = filePath + res[i];
        let info = new this.wrapper(File, parent);
        if (!settings.seeHidden) {
          if (checkHidden.call(this, info, settings)) {
            if (parent && parent.children) {
              parent.children.pop();
            }
            continue;
          }
        }
        if (settings.exclude) {
          if (checkExclude.call(this, info, settings)) {
            if (parent && parent.children) {
              parent.children.pop();
            }
            continue;
          }
        }
        if (settings.match) {
          match = checkMatch.call(this, info, settings);
        }
        if (match) {
          result.push(info);
          this.notificationsCenter.fire("on" + info.type, info, this);
        } else {
          if (parent && parent.children) {
            parent.children.pop();
          }
        }
        switch (info.type) {
        case "Directory":
          if (settings.recurse && depth - 1 !== 0) {
            arguments.callee.call(this, info, result, --depth, settings, info);
            depth++;
          }
          break;
        case "symbolicLink":
          if (settings.followSymLink && depth - 1 !== 0) {
            let obj = new this.wrapper(info.path, info);
            if (obj.isDirectory()) {
              arguments.callee.call(this, obj, result, settings.depth, settings, parent);
            }
          }
          break;
        }
      }
    }
    return result;
  } catch (e) {
    this.notificationsCenter.fire("onError", e);
    this.errorParse.push(e);
    //console.log(e);
    //this.notificationsCenter.fire("onFinish",e,null);
    throw e;
  }
};


const defaultSettings = {
  path: null,
  sync: true,
  recurse: true,
  depth: -1,
  //onFinish: null,
  //onFile: null,
  seeHidden: false,
  match: null,
  exclude: null,
  followSymLink: false,
  json: false
};


const regSlash = /^(.*)\/$/g;
class Finder {

  constructor(settings) {
      this.path = [];
      this.errorParse = [];
      this.settings = nodefony.extend({}, defaultSettings, settings);
      if (this.settings.path) {
        this.result = this.find();
      } else {
        this.tree = this.settings.json;
        if (this.tree) {
          this.wrapper = jsonTree;
        } else {
          this.wrapper = nodefony.fileClass;
        }
      }
    }

    in (Path) {
      this.typePath = nodefony.typeOf(Path);
      switch (true) {
      case this.typePath === "string":
        try {
          this.path.push(new this.wrapper(Path, null));
          return this;
        } catch (e) {
          throw e;
        }
        break;
      case this.typePath === "array":
        for (let i = 0; i < Path.length; i++) {
          try {
            this.path.push(new this.wrapper(Path[i], null));
          } catch (e) {
            throw e;
          }
        }
        return this;
      case Path instanceof nodefony.fileClass:
        try {
          this.path.push(new this.wrapper(Path.path, null));
          return this;
        } catch (e) {
          throw e;
        }
        break;
        //default:
        //  throw new Error(`Finder bad path type`);
      }
    }

  files() {
    return this.find({
      match: "File"
    });
  }

  directories() {
    return this.find({
      match: "Directory"
    });
  }

  find(settings) {
    let result = new Result();
    let extend = null;
    if (!settings) {
      extend = this.settings;
    } else {
      extend = nodefony.extend({}, defaultSettings, settings);
    }

    if (extend.json) {
      this.wrapper = jsonTree;
    } else {
      this.wrapper = nodefony.fileClass;
    }

    this.in(extend.path);
    this.notificationsCenter = nodefony.notificationsCenter.create(extend);
    try {
      for (let i = 0; i < this.path.length; i++) {
        if (extend.json) {
          result.json[this.path[i].name] = this.path[i];
          findStatic.call(this, this.path[i], result, extend.depth, extend, this.path[i]);
        } else {
          findStatic.call(this, this.path[i], result, extend.depth, extend, null);
        }
      }
    } catch (e) {
      this.notificationsCenter.fire("onFinish", e, null);
      throw e;
    }
    this.notificationsCenter.fire("onFinish", null, result);
    return result;
  }
}

nodefony.finder = Finder;
module.exports = Finder;