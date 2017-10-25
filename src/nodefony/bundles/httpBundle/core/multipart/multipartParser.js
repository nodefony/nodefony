nodefony.register.call(nodefony.io, "MultipartParser", function () {

    // PHP LIKE
    //var reg = /(.*)[\[][\]]$/;
    const regHeaders = / |"/g;

    const multiPartParser = class multiPartParser {

        constructor(request) {
            this.post = {};
            this.file = {};
            this.error = null;
            this.parse(request);
        }

        parse(request) {

            if (!request.rawContentType.boundary) {
                throw new Error('multiPartParser  : Bad content-type header, no multipart boundary');
            }
            let boundary = '\r\n--' + request.rawContentType.boundary.replace('"', "");
            // copy
            let buf = Buffer.from(request.body);
            let buf2 = Buffer.from(request.body);
            let bin = buf.toString("binary");
            let str = buf2.toString("utf8");

            //str = bin;
            str = '\r\n' + str;
            bin = '\r\n' + str;
            //console.log(str);
            //console.log(bin);
            let parts = str.split(new RegExp(boundary));
            let partsBin = bin.split(new RegExp(boundary));
            // loop boundaries
            for (let i = 1; i < parts.length - 1; i++) {
                let obj = this.parseBoundary(parts[i], partsBin[i], request);
                if (obj.headers.filename) {
                    //console.log(obj);
                    this.file[obj.headers.filename] = obj;
                } else {
                    this.post[obj.headers.name] = obj.data;
                }
            }
        }

        parseBoundary(boundary, boundaryBin, request) {
            let subparts = boundary.split('\r\n\r\n');
            let subpartsBin = boundaryBin.split('\r\n\r\n');
            //console.log(subpartsBin)
            let obj = {
                headers: {},
                data: null,
                contentType: null,
                charset: request.charset
            };
            //HEADERS
            let header = subparts[0];
            let headers = header.split('\r\n');
            for (let i = 0; i < headers.length; i++) {
                if (headers[i]) {
                    let res = headers[i].split(";");
                    for (let j = 0; j < res.length; j++) {
                        let ret = res[j].split(/:|=/);
                        if (ret) {
                            //console.log(QS.parse(ret[1]))
                            let key = ret[0].replace(regHeaders, "");
                            let val = ret[1].replace(regHeaders, "");
                            obj.headers[key] = val;
                            switch (key) {
                            case "Content-Type":
                                let tab = val.split(";");
                                obj.contentType = tab[0].replace(" ", "");
                                if (tab.length > 1) {
                                    for (let i = 1; i < tab.length; i++) {
                                        if (typeof tab[i] === "string") {
                                            let ele = tab[i].split("=");
                                            if (ele.length) {
                                                let value = ele[0].replace(" ", "").toLowerCase();
                                                obj[value] = ele[1];
                                            }
                                        } else {
                                            continue;
                                        }
                                    }
                                }
                                break;
                            }
                        }
                    }
                }
            }
            //DATA
            if (obj.headers.filename) {
                console.log("PASS")
                //console.log(subpartsBin);
                obj.data = subpartsBin[1]; // Buffer.from(subpartsBin[1], "binary").toString("binary");
                obj.charset = "binary";
            } else {
                obj.data = Buffer.from(subparts[1], obj.charset).toString(obj.charset);
            }
            return obj;
        }
    };
    return multiPartParser;
});
