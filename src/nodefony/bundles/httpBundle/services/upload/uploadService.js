module.exports = class upload extends nodefony.Service {

  constructor(httpKernel) {

    super("upload", httpKernel.container, httpKernel.notificationsCenter);
    this.httpKernel = httpKernel;

    this.listen(this, "onBoot", () => {
      this.config = this.httpKernel.bundleSettings.request;
      let abs = path.isAbsolute(this.httpKernel.bundleSettings.request.uploadDir);
      if (abs) {
        this.path = this.httpKernel.bundleSettings.request.uploadDir;
      } else {
        this.path = path.resolve(this.kernel.rootDir + "/" + this.httpKernel.bundleSettings.request.uploadDir);
      }
      let res = fs.existsSync(this.path);
      if (!res) {
        // create directory
        this.logger("create directory FOR UPLOAD FILE " + this.path, "DEBUG");
        try {
          res = fs.mkdirSync(this.path);
        } catch (e) {
          this.path = "/tmp";
          this.httpKernel.bundleSettings.request.uploadDir = this.path;
          this.logger(e, "DEBUG");
        }
      }
    });
  }

  createUploadFile(file) {
    try {
      return new uploadedFile(file);
    } catch (error) {
      throw error;
    }
  }

  logger(pci, severity, msgid, msg) {
    if (!msgid) {
      msgid = "HTTP UPLOAD";
    }
    return this.syslog.logger(pci, severity, msgid, msg);
  }
};

const uploadedFile = class uploadedFile extends nodefony.fileClass {

  constructor(fomiFile) {
    super(fomiFile.path);
    this.fomiFile = fomiFile;
    this.size = this.getSize();
    this.prettySize = this.getPrettySize();
    this.filename = this.realName();
    this.mimeType = this.getMimeType();
  }

  getSize() {
    return this.fomiFile.size;
  }

  getPrettySize() {
    return nodefony.cli.niceBytes(this.fomiFile.size);
  }

  realName() {
    return this.fomiFile.name;
  }

  getMimeType() {
    if (this.fomiFile) {
      return this.fomiFile.type ||  super.getMimeType(this.filename);
    }
    return super.getMimeType();
  }

  move(target) {
    let inst = null;
    try {
      if (fs.existsSync(target)) {
        let newFile = new nodefony.fileClass(target);
        let name = this.filename || this.name;
        if (newFile.isDirectory()) {
          let n = path.resolve(newFile.path, name);
          inst = super.move(n);
          return new nodefony.fileClass(n);
        }
      }
      let dirname = path.dirname(target);

      if (fs.existsSync(dirname)) {
        if (target === dirname) {
          let name = path.resolve(target, "/", this.filename || this.name);
          inst = super.move(name);
        } else {
          inst = super.move(target);
        }
        return new nodefony.fileClass(target);
      } else {
        throw fs.lstatSync(dirname);
      }
    } catch (e) {
      throw e;
    }
  }
};
