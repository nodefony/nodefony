const webpack = require('webpack');
const path = require('path');

module.exports = function () {
  //var isProd = options.env === 'production';
  return {

    /*
     * The entry point
     *
     * See: http://webpack.github.io/docs/configuration.html#entry
     */
    entry: {
      main: path.resolve(__dirname, "..", "entry.es6")
    },
    target: 'web',
    //watch: true,
    devtool: 'source-map',
    output: {
      path: path.resolve(__dirname, "../dist"),
      library: 'nodefony',
      libraryTarget: 'umd'
    },

    node: {
      fs: 'empty'
    },
    externals: {},
    /*
     * Options affecting the resolving of modules.
     *
     * See: http://webpack.github.io/docs/configuration.html#resolve
     */
    resolve: {
      /*
       * An array of extensions that should be used to resolve modules.
       *
       * See: http://webpack.github.io/docs/configuration.html#resolve-extensions
       */
      extensions: ['.js', '.es6'],

      // An array of directory names to be resolved to the current directory
      modules: [path.resolve(__dirname, "..", "..", "node_modules")]
    },

    /*
     * Options affecting the normal modules.
     *
     * See: http://webpack.github.io/docs/configuration.html#module
     */
    module: {
      rules: []
    },
    /*
     * Add additional plugins to the compiler.
     *
     * See: http://webpack.github.io/docs/configuration.html#plugins
     */
    plugins: [
      new webpack.DefinePlugin({
        'process.env': {
          'NODE_ENV': JSON.stringify(process.env.WEBPACK_ENV)
        }
      })
    ]
  };
};