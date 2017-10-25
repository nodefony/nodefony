module.exports = nodefony.registerService("upload", function () {

    /*const uploadedFile = class uploadedFile extends nodefony.fileClass {

        constructor(tmpName, myPath, dataFile, service) {

            super(myPath);
            this.serviceUpload = service;
            this.tmpName = tmpName;
            this.headers = dataFile.headers;
            this.mimeType = this.getMimeType(this.name);
            this.raw = dataFile.data;
            this.lenght = this.raw.length;
            this.name = this.headers.name;
            this.filename = this.headers.filename;
            this.error = null;
        }

        move(target) {
            let inst = null;
            try {
                if (fs.existsSync(target)) {
                    var newFile = new nodefony.fileClass(target);
                    if (newFile.isDirectory()) {
                        inst = super.move(target + "/" + this.headers.filename);
                        //delete this.serviceUpload[this.tmpName];
                        this.serviceUpload.logger("Move tmpFile : " + this.tmpName + " in path : " + target + "/" + this.headers.filename, "DEBUG");
                        return inst;
                    }
                }
                var dirname = path.dirname(target);
                if (fs.existsSync(dirname)) {
                    inst = super.move(target);
                    //delete this.serviceUpload[this.tmpName];
                    this.serviceUpload.logger("Move tmpFile : " + this.tmpName + " in path : " + target, "DEBUG");
                    return inst;
                } else {
                    throw fs.lstatSync(dirname);
                }
            } catch (e) {
                this.error = e;
                throw e;
            }
        }

        realName() {
            return this.headers.filename;
        }

        getMimeType() {
            if (this.headers) {
                return this.headers["Content-Type"];
            } else {
                return super.getMimeType(this.name);
            }
        }
    };*/


    const uploadedFile = class uploadedFile extends nodefony.fileClass {

        constructor(fomiFile, service) {
            super(fomiFile.path);
            this.fomiFile = fomiFile;
            this.serviceUpload = service;
            this.lenght = this.getSize();
            this.realName = this.realName();
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
                return this.fomiFile.type ||  super.getMimeType(this.realName);
            }
            return super.getMimeType();
        }

        move(target) {
            let inst = null;
            try {
                if (fs.existsSync(target)) {
                    let newFile = new nodefony.fileClass(target);
                    if (newFile.isDirectory()) {
                        let n = path.resolve(newFile.path, this.realName);
                        inst = super.move(n);
                        this.serviceUpload.logger("Move tmpFile : " + this.realName + " in path : " + n, "DEBUG");
                        return inst;
                    }
                }
                let dirname = path.dirname(target);
                if (fs.existsSync(dirname)) {
                    inst = super.move(target);
                    this.serviceUpload.logger("Move tmpFile : " + this.realName + " in path : " + target, "DEBUG");
                    return inst;
                } else {
                    throw fs.lstatSync(dirname);
                }
            } catch (e) {
                throw e;
            }
        }
    };

    const upload = class upload extends nodefony.Service {

        constructor(httpKernel) {

            super("upload", httpKernel.container, httpKernel.notificationsCenter);
            this.httpKernel = httpKernel;

            this.listen(this, "onBoot", () => {
                this.config = this.container.getParameters("bundles.http").upload;
                if (/^\//.test(this.config.tmp_dir)) {
                    this.path = this.config.tmp_dir;
                } else {
                    this.path = this.kernel.rootDir + "/" + this.config.tmp_dir;
                }
                let res = fs.existsSync(this.path);
                if (!res) {
                    // create directory
                    this.logger("create directory FOR UPLOAD FILE " + this.path, "DEBUG");
                    try {
                        res = fs.mkdirSync(this.path);
                    } catch (e) {
                        this.logger(e, "DEBUG");
                    }
                }
            });
        }

        createUploadFile(file) {
            try {
                return new uploadedFile(file, this);
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

    return upload;
});
