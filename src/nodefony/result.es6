class Result extends Array {

  constructor(res) {
    if (res) {
      if (res instanceof Array) {
        super();
        for (let i = 0; i < res.length; i++) {
          this.push(res[i]);
        }
        if (res instanceof Result) {
          //this.concat(res);
          res.clean();
        }
      } else {
        throw new Error(`Result bad type must be an array ${res}`);
      }
    } else {
      super();
    }
  }

  toJson(json = []) {
    for (let index = 0; index < this.length; index++) {
      let ele = this[index];
      json.push(ele);
    }
    try {
      return JSON.stringify(json);
    } catch (e) {
      throw e;
    }
  }

  toString(json = []) {
    for (let index = 0; index < this.length; index++) {
      let ele = this[index];
      json.push(ele);
    }
    try {
      return JSON.stringify(json, null, "\n");
    } catch (e) {
      throw e;
    }
  }

  clean(callback) {
    if (callback) {
      Array.prototype.forEach.call(this, (ele) => {
        try {
          return callback(ele);
        } catch (e) {
          throw e;
        }
      });
    }
    this.length = 0;
  }

  query(query, logger = false, options = {}, sevrity = 'INFO', clean = false) {
    try {
      const res = new Result(this.filter((data) => {
        try {
          let res = data.query(query, logger, options, sevrity);
          if (res) {
            return data;
          }
          return null;
        } catch (e) {
          throw e;
        }
      }));
      if (clean) {
        this.clean();
      }
      return res;
    } catch (e) {
      throw e;
    }
  }

  queryGrep(query, grep, clean = false) {
    try {
      const res = new Result(this.filter((data) => {
        let res = data.queryGrep(query, grep);
        if (res) {
          return data;
        }
        return null;
      }));
      if (clean) {
        this.clean();
      }
      return res;
    } catch (e) {
      throw e;
    }
  }
}

nodefony.Result = Result;
module.exports = Result;