class File extends nodefony.fileClass {
  constructor(path, parent = null) {
    super(path);
    this.parent = parent;
    this.children = new nodefony.FileResult();
  }
  get length() {
    return this.children.length;
  }

  toJson() {
    let obj = {
      path: this.path,
      name: this.name,
      ext: this.ext,
      shortName: this.shortName,
      type: this.type,
      stats: this.stats,
      dirName: this.dirName,
      parse: this.parse
    };
    if (this.type === "File") {
      obj.encoding = this.encoding;
      obj.mimeType = this.mimeType;
      obj.extention = this.extention;
    }
    obj.children = this.children.toJson();
    return obj;
  }
}

module.exports = File;
