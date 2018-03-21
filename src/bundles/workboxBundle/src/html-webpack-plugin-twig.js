class twigPlugin {
  // Configure your plugin with options...
  constructor(options) {
    this.options = options;
  }

  apply(compiler) {
    compiler.plugin('compilation', (compilation) => {
      console.log('The compiler is starting a new compilation...');

      compilation.plugin(
        'html-webpack-plugin-twig',
        (data, cb) => {
          //console.log(data);
          cb(null, data);
        }
      );
    });
  }
}



module.exports = twigPlugin;