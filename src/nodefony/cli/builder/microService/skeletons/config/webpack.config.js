const webpack = require('webpack');
const path = require('path');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { merge } = require('webpack-merge');
const precss = require('precss');
const autoprefixer = require('autoprefixer');

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
    App: path.resolve(__dirname, "..", "src", "browser", "index.js")
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
      test: new RegExp("\\.es6$|\\.js$|\\.es7$"),
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
         MiniCssExtractPlugin.loader,
        {
          loader: "css-loader",
          options: {
            sourceMap: true
          }
         }, {
          loader: 'resolve-url-loader',
          options: {}
         }, {
           loader: 'postcss-loader', // Run post css actions
           options: {
             postcssOptions: {
               plugins: [autoprefixer({}), precss({})]
             }
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
      use: [{
        loader: 'file-loader',
        options: {
          name: '[name].[ext]',
          outputPath: 'fonts/', // where the fonts will go
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
});
