const webpack = require('webpack');
const path = require('path');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const htmlPlugin = require('html-webpack-plugin');
const { merge } = require('webpack-merge');

let conf = null;
if (process.env.NODE_ENV === "development") {
  conf = require(path.resolve("config", "webpack", "webpack.config.dev.js"));
} else {
  conf = require(path.resolve("config", "webpack", "webpack.config.prod.js"));
}

module.exports = merge(conf, {
  /*
   * The entry point
   *
   * See: http://webpack.github.io/docs/configuration.html#entry
   */
  entry: {
    app: path.resolve(__dirname, "..", "src", "browser", "index.js"),
    socket: path.resolve(__dirname, "..", "src", "browser", "socketio.js")
  },
  target: 'web',
  //watch: true,
  output: {
    path: path.resolve("dist"),
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
    extensions: ['.js'],

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
      test: new RegExp("\.js$"),
      exclude: new RegExp("node_modules"),
      use: [{
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env']
        }
      }]
     }, {
       test: /\.(sa|sc|c)ss$/,
       use: [
         //'css-hot-loader',
         MiniCssExtractPlugin.loader,
         {
           loader: "css-loader",
           options: {
             sourceMap: true
           }
         }, {
           loader: "sass-loader",
           options: {
             sourceMap: true
           }
         }
       ]
     }, {
       test: /.(ttf|otf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
       type: 'asset/inline'
     },{
        test: /\.html$/,
        loader: 'html-loader'
      }]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "./css/[name].css"
    }),
    new htmlPlugin({
      filename: path.resolve("dist", "index.ejs"),
      template: path.resolve("src", "templates", "base.html"),
      title: conf.name,
      //cache: !dev,
      chunks: ['app'],
      templateParameters: conf
    }),
    new htmlPlugin({
      filename: path.resolve("dist", "socketio.ejs"),
      template: path.resolve("src", "templates", "socket.html"),
      title: conf.name,
      chunks: ['socket'],
      templateParameters: conf
    }),
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify(process.env.NODE_ENV),
        'NODE_DEBUG': JSON.stringify(process.env.NODE_DEBUG),
      }
    })
  ]
});
