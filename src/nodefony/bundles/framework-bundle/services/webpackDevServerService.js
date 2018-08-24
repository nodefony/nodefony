const wds = require("webpack-dev-server");

module.exports = class webpackDevServer extends nodefony.Service {

  constructor(container) {
    super("WDS", container);
    this.server = wds;
  }

  /*addCompiler(compiler, config = {}) {
    //this.server(compiler, config);
  }*/

};