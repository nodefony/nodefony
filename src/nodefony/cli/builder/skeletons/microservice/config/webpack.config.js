const webpack = require('webpack');
const path = require('path');

module.exports = {
  /*
   * The entry point
   *
   * See: http://webpack.github.io/docs/configuration.html#entry
   */
  mode: 'development',
  entry: {
    App: path.resolve(__dirname, "..", "src", "browser", "index.js")
  },
  target: 'web',
  //watch: true,
  devtool: 'source-map',
  output: {
    path: path.resolve(__dirname, "../dist"),
    library: "[name]",
    libraryExport: "default"
  },
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
    modules: ["node_modules"]
  },
  /*
   * Options affecting the normal modules.
   *
   * See: http://webpack.github.io/docs/configuration.html#module
   */
  module: {
    rules: [{
      // BABEL TRANSCODE
      test: new RegExp("\.es6$|\.js$|\.es7$"),
      exclude: new RegExp("node_modules"),
      use: [{
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env']
        }
       }]
     }]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify(process.env.NODE_ENV),
        'NODE_DEBUG': JSON.stringify(process.env.NODE_DEBUG),
      }
    })
  ]
};
