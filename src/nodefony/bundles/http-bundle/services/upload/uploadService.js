module.exports = class upload extends nodefony.Service {

  constructor(httpKernel) {

    super("upload", httpKernel.container, httpKernel.notificationsCenter);
    this.httpKernel = httpKernel;

    this.once("onBoot", async () => {
      this.config = this.httpKernel.settings.request;
      let abs = path.isAbsolute(this.httpKernel.settings.request.uploadDir);
      if (abs) {
        this.path = this.httpKernel.settings.request.uploadDir;
      } else {
        this.path = path.resolve(this.kernel.rootDir + "/" + this.httpKernel.settings.request.uploadDir);
      }
      let res = fs.existsSync(this.path);
      if (!res) {
        // create directory
        this.log("create directory FOR UPLOAD FILE " + this.path, "DEBUG");
        try {
          res = fs.mkdirSync(this.path);
        } catch (e) {
          this.path = "/tmp";
          this.httpKernel.settings.request.uploadDir = this.path;
          this.log(e, "DEBUG");
        }
      }
    });
  }

  createUploadFile(file, name) {
    try {
      return new uploadedFile(file, name);
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

  constructor(fomiFile, name) {
    super(fomiFile.filepath);
    this.fomiFile = fomiFile;
    this.size = this.getSize();
    this.prettySize = this.getPrettySize();
    this.filename = this.realName(name);
    this.mimeType = this.getMimeType();
    this.lastModifiedDate = this.fomiFile.lastModifiedDate;
    this.hashAlgorithm = this.fomiFile.hashAlgorithm;
    this.hash = this.fomiFile.hash;
  }

  getSize() {
    return this.fomiFile.size;
  }

  getPrettySize() {
    return nodefony.cli.niceBytes(this.fomiFile.size);
  }

  realName(name= null) {
    return this.fomiFile.originalFilename || name || this.fomiFile.newFilename ;
  }

  getMimeType() {
    if (this.fomiFile) {
      return this.fomiFile.mimetype || super.getMimeType(this.filename);
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
