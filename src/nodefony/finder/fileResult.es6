// const _ = require("lodash");
class FileResult extends nodefony.Result {
  constructor (res) {
    if (typeof res === "number") {
      super();
    } else {
      super(res);
    }
  }

  toString () {
    let txt = "";
    for (let index = 0; index < this.length; index++) {
      const info = this[index];
      txt += `${info.name}\n`;
    }
    return txt;
  }

  toJson (json = []) {
    try {
      for (let index = 0; index < this.length; index++) {
        const info = this[index];
        switch (info.type) {
        case "File":
          json.push(info.toJson());
          break;
        case "symbolicLink":
        case "Directory":
          const dir = info.toJson();
          if (info.children) {
            dir.children = info.children.toJson();
          }
          json.push(dir);
          break;
        }
      }
      return json;
    } catch (e) {
      throw e;
    }
  }

  uniq () {
    return this;
  }

  find (ele, result = new FileResult()) {
    try {
      for (let index = 0; index < this.length; index++) {
        const info = this[index];
        const match = info.matchName(ele);
        if (match) {
          result.push(info);
        }
        info.children.find(ele, result);
      }
      return result.uniq();
    } catch (e) {
      throw e;
    }
  }

  getDirectories (result = new FileResult()) {
    try {
      for (let index = 0; index < this.length; index++) {
        const info = this[index];
        switch (info.type) {
        case "Directory":
          result.push(info);
          info.children.getDirectories(result);
          break;
        case "symbolicLink":
          info.children.getDirectories(result);
          break;
        }
      }
      return result;
    } catch (e) {
      throw e;
    }
  }

  getFiles (result = new FileResult()) {
    try {
      for (let index = 0; index < this.length; index++) {
        const info = this[index];
        switch (info.type) {
        case "File":
          result.push(info);
          break;
        case "symbolicLink":
        case "Directory":
          info.children.getFiles(result);
          break;
        }
      }
      return result;
    } catch (e) {
      throw e;
    }
  }

  sortByName (result = new FileResult()) {
    const res = this.sort((a, b) => {
      if (a.name.toString() > b.name.toString()) {
        return 1;
      }
      if (a.name.toString() < b.name.toString()) {
        return -1;
      }
      return 0;
    });
    if (res) {
      return result.concat(res);
    }
    return this;
  }

  sortByType (result = new FileResult()) {
    const res = this.sort((a, b) => {
      if (a.type.toString() > b.type.toString()) {
        return 1;
      }
      if (a.type.toString() < b.type.toString()) {
        return -1;
      }
      return 0;
    });
    if (res) {
      return result.concat(res);
    }
    return this;
  }
}

nodefony.FileResult = FileResult;
module.exports = FileResult;
